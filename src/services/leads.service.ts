import { analyticsRepository } from '@/repositories/analytics.repository';
import { ILeadsRepository, leadsRepository } from '@/repositories/leads.repository';
import { Attachment, CreateAttachmentInput } from '@/types/attachment';
import { PaginatedResult, PaginationParams } from '@/types/common';
import { CreateFollowUpInput, FollowUp } from '@/types/follow-up';
import { CreateLeadInput, Lead, LeadFilter, UpdateLeadInput } from '@/types/lead';
import { CreateLeadActivityInput, LeadActivity } from '@/types/lead-activity';
import { CreateLeadNoteInput, LeadNote } from '@/types/lead-note';

export class LeadsService {
  constructor(private repo: ILeadsRepository = leadsRepository) {}

  async getLeads(filter?: LeadFilter, pagination?: PaginationParams): Promise<PaginatedResult<Lead>> {
    return this.repo.getLeads(filter, pagination);
  }

  // Compatibility aliases
  async listLeads(filter?: LeadFilter, pagination?: PaginationParams): Promise<PaginatedResult<Lead>> {
    return this.getLeads(filter, pagination);
  }

  async getLeadById(id: string): Promise<Lead | null> {
    return this.repo.getLeadById(id);
  }

  async getLead(id: string): Promise<Lead | null> {
    return this.getLeadById(id);
  }

  async captureLead(input: CreateLeadInput): Promise<Lead> {
    return this.createLead(input);
  }

  async updateLeadStatus(id: string, status: Lead['status']): Promise<Lead> {
    return this.updateLead(id, { status });
  }

  async exportLeadsCsv(eventId?: string): Promise<string> {
    return this.exportLeadsData({ eventId, format: 'csv', scope: 'all' });
  }

  async exportLeadsData(options: {
    eventId?: string;
    scope?: 'all' | 'hot' | 'qualified';
    format?: 'csv' | 'json' | 'tsv';
    selectedFields?: string[];
  }): Promise<string> {
    const { eventId, scope = 'all', format = 'csv', selectedFields } = options;
    const result = await this.getLeads({ eventId }, { page: 1, pageSize: 500 });
    let items = result.items;

    if (scope === 'hot') {
      items = items.filter((l) => l.temperature === 'hot' || l.priority === 'urgent');
    } else if (scope === 'qualified') {
      items = items.filter(
        (l) => l.status === 'qualified' || l.temperature === 'hot' || l.temperature === 'warm'
      );
    }

    if (format === 'json') {
      const sanitized = items.map((l) => {
        if (!selectedFields || selectedFields.length === 0) return l;
        const res: Record<string, unknown> = { id: l.id };
        if (selectedFields.includes('name')) {
          res.firstName = l.firstName;
          res.lastName = l.lastName;
        }
        if (selectedFields.includes('contact')) {
          res.email = l.email;
          res.phone = l.phone;
        }
        if (selectedFields.includes('company')) {
          res.company = l.company;
          res.title = l.title;
        }
        if (selectedFields.includes('qualification')) {
          res.temperature = l.temperature;
          res.priority = l.priority;
          res.score = l.score;
          res.status = l.status;
        }
        if (selectedFields.includes('attribution')) {
          res.booth = l.booth;
          res.assignedToName = l.assignedToName;
          res.createdAt = l.createdAt;
        }
        return res;
      });
      return JSON.stringify(sanitized, null, 2);
    }

    // Delimited formats (CSV or TSV)
    const delimiter = format === 'tsv' ? '\t' : ',';
    const allHeaders = [
      { key: 'name', label: 'First Name', val: (l: typeof items[0]) => l.firstName },
      { key: 'name', label: 'Last Name', val: (l: typeof items[0]) => l.lastName },
      { key: 'contact', label: 'Email', val: (l: typeof items[0]) => l.email || '' },
      { key: 'contact', label: 'Phone', val: (l: typeof items[0]) => l.phone || '' },
      { key: 'company', label: 'Company', val: (l: typeof items[0]) => l.company || '' },
      { key: 'company', label: 'Title', val: (l: typeof items[0]) => l.title || '' },
      { key: 'qualification', label: 'Temperature', val: (l: typeof items[0]) => (l.temperature || 'warm').toUpperCase() },
      { key: 'qualification', label: 'Priority', val: (l: typeof items[0]) => l.priority.toUpperCase() },
      { key: 'qualification', label: 'Score', val: (l: typeof items[0]) => l.score.toString() },
      { key: 'qualification', label: 'Status', val: (l: typeof items[0]) => l.status.toUpperCase() },
      { key: 'attribution', label: 'Booth Station', val: (l: typeof items[0]) => l.booth || 'Main Booth' },
      { key: 'attribution', label: 'Assigned AE', val: (l: typeof items[0]) => l.assignedToName || 'Unassigned' },
      { key: 'attribution', label: 'Captured At', val: (l: typeof items[0]) => l.createdAt },
    ];

    const activeCols =
      selectedFields && selectedFields.length > 0
        ? allHeaders.filter((h) => selectedFields.includes(h.key))
        : allHeaders;

    const headerRow = activeCols.map((c) => c.label).join(delimiter);
    const rows = items.map((l) =>
      activeCols
        .map((c) => {
          const str = String(c.val(l));
          return format === 'tsv' ? str : `"${str.replace(/"/g, '""')}"`;
        })
        .join(delimiter)
    );

    return [headerRow, ...rows].join('\n');
  }

  async createLead(input: CreateLeadInput): Promise<Lead> {
    // Calculate initial lead score based on captured data points
    let initialScore = input.score ?? 50;
    if (input.email && input.phone) initialScore += 15;
    if (input.title && (input.title.toLowerCase().includes('director') || input.title.toLowerCase().includes('vp') || input.title.toLowerCase().includes('c-level') || input.title.toLowerCase().includes('cto') || input.title.toLowerCase().includes('ceo'))) {
      initialScore += 20;
    }
    initialScore = Math.min(100, Math.max(0, initialScore));

    const created = await this.repo.createLead({
      ...input,
      score: initialScore,
    });

    try {
      await analyticsRepository.recordLeadCaptured(created);
    } catch {
      // Non-fatal if analytics sync is delayed
    }

    return created;
  }

  async updateLead(id: string, updates: UpdateLeadInput): Promise<Lead> {
    return this.repo.updateLead(id, updates);
  }

  async assignLead(
    id: string,
    assigneeId: string,
    assigneeName: string,
    note?: string
  ): Promise<Lead> {
    const updated = await this.repo.updateLead(id, {
      assignedToId: assigneeId,
      assignedToName: assigneeName,
      assignedAt: new Date().toISOString(),
    });

    await this.repo.addLeadActivity({
      leadId: id,
      actorId: 'usr-current',
      actorName: 'Alex Mercer',
      type: 'assigned',
      description: note
        ? `Lead assigned to ${assigneeName}: "${note}"`
        : `Lead assigned to representative ${assigneeName}`,
      metadata: { assigneeId, assigneeName, note },
    });

    return updated;
  }

  async updateLeadTemperature(id: string, temperature: 'hot' | 'warm' | 'cold'): Promise<Lead> {
    return this.repo.updateLead(id, { temperature });
  }

  async updateLeadFollowUp(id: string, followUpStatus: 'none' | 'pending' | 'scheduled' | 'completed', followUpDueDate?: string): Promise<Lead> {
    return this.repo.updateLead(id, { followUpStatus, followUpDueDate });
  }

  async addVoiceNote(
    id: string,
    voiceNoteUri: string,
    durationSeconds: number,
    transcript?: string
  ): Promise<Lead> {
    return this.repo.updateLead(id, {
      voiceNoteUri,
      voiceNoteDurationSeconds: durationSeconds,
      voiceNoteTranscript: transcript,
    });
  }

  async deleteLead(id: string): Promise<boolean> {
    return this.repo.deleteLead(id);
  }

  async getLeadNotes(leadId: string): Promise<LeadNote[]> {
    return this.repo.getLeadNotes(leadId);
  }

  async addLeadNote(input: CreateLeadNoteInput): Promise<LeadNote> {
    return this.repo.addLeadNote(input);
  }

  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    return this.repo.getLeadActivities(leadId);
  }

  async addLeadActivity(input: CreateLeadActivityInput): Promise<LeadActivity> {
    return this.repo.addLeadActivity(input);
  }

  async getAttachments(leadId: string): Promise<Attachment[]> {
    return this.repo.getAttachments(leadId);
  }

  async addAttachment(input: CreateAttachmentInput): Promise<Attachment> {
    return this.repo.addAttachment(input);
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    return this.repo.deleteAttachment(attachmentId);
  }

  async getFollowUps(leadId?: string): Promise<FollowUp[]> {
    return this.repo.getFollowUps(leadId);
  }

  async createFollowUp(input: CreateFollowUpInput): Promise<FollowUp> {
    return this.repo.createFollowUp(input);
  }

  async updateFollowUp(id: string, updates: Partial<FollowUp>): Promise<FollowUp> {
    return this.repo.updateFollowUp(id, updates);
  }

  async syncOfflineQueue(leads: CreateLeadInput[]): Promise<Lead[]> {
    return this.repo.syncOfflineQueue(leads);
  }
}

export const leadsService = new LeadsService();
