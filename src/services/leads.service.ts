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
    const result = await this.getLeads({ eventId }, { page: 1, pageSize: 500 });
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Title', 'Status', 'Score', 'Priority', 'Captured At'];
    const rows = result.items.map((lead) => [
      lead.id,
      lead.firstName,
      lead.lastName,
      lead.email || '',
      lead.phone || '',
      lead.company || '',
      lead.title || '',
      lead.status,
      lead.score.toString(),
      lead.priority,
      lead.createdAt,
    ]);

    return [headers.join(','), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
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

  async assignLead(id: string, assigneeId: string, assigneeName: string): Promise<Lead> {
    return this.repo.updateLead(id, {
      assignedToId: assigneeId,
      assignedToName: assigneeName,
      assignedAt: new Date().toISOString(),
    });
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
