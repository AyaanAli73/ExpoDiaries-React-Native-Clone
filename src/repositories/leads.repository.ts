import { apiClient } from '@/lib/api-client';
import { analyticsRepository } from '@/repositories/analytics.repository';
import { mockAttachments } from '@/repositories/mocks/attachments.mock';
import { mockFollowUps } from '@/repositories/mocks/follow-ups.mock';
import { mockLeadActivities } from '@/repositories/mocks/lead-activities.mock';
import { mockLeadNotes } from '@/repositories/mocks/lead-notes.mock';
import { mockLeads } from '@/repositories/mocks/leads.mock';
import { Attachment, CreateAttachmentInput } from '@/types/attachment';
import { PaginatedResult, PaginationParams } from '@/types/common';
import { CreateFollowUpInput, FollowUp } from '@/types/follow-up';
import { CreateLeadInput, Lead, LeadFilter, UpdateLeadInput } from '@/types/lead';
import { CreateLeadActivityInput, LeadActivity } from '@/types/lead-activity';
import { CreateLeadNoteInput, LeadNote } from '@/types/lead-note';

export interface ILeadsRepository {
  getLeads(filter?: LeadFilter, pagination?: PaginationParams): Promise<PaginatedResult<Lead>>;
  getLeadById(id: string): Promise<Lead | null>;
  createLead(input: CreateLeadInput): Promise<Lead>;
  updateLead(id: string, updates: UpdateLeadInput): Promise<Lead>;
  deleteLead(id: string): Promise<boolean>;
  getLeadNotes(leadId: string): Promise<LeadNote[]>;
  addLeadNote(input: CreateLeadNoteInput): Promise<LeadNote>;
  getLeadActivities(leadId: string): Promise<LeadActivity[]>;
  addLeadActivity(input: CreateLeadActivityInput): Promise<LeadActivity>;
  getAttachments(leadId: string): Promise<Attachment[]>;
  addAttachment(input: CreateAttachmentInput): Promise<Attachment>;
  deleteAttachment(attachmentId: string): Promise<void>;
  getFollowUps(leadId?: string): Promise<FollowUp[]>;
  createFollowUp(input: CreateFollowUpInput): Promise<FollowUp>;
  updateFollowUp(id: string, updates: Partial<FollowUp>): Promise<FollowUp>;
  syncOfflineQueue(leads: CreateLeadInput[]): Promise<Lead[]>;
}

class LeadsRepository implements ILeadsRepository {
  private leads: Lead[] = [...mockLeads];
  private notes: LeadNote[] = [...mockLeadNotes];
  private activities: LeadActivity[] = [...mockLeadActivities];
  private attachments: Attachment[] = [...mockAttachments];
  private followUps: FollowUp[] = [...mockFollowUps];

  async getLeads(filter?: LeadFilter, pagination: PaginationParams = { page: 1, pageSize: 20 }): Promise<PaginatedResult<Lead>> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);
      let filtered = [...this.leads];

      if (filter?.eventId) {
        filtered = filtered.filter((l) => l.eventId === filter.eventId);
      }
      if (filter?.status) {
        filtered = filtered.filter((l) => l.status === filter.status);
      }
      if (filter?.priority) {
        filtered = filtered.filter((l) => l.priority === filter.priority);
      }
      if (filter?.temperature) {
        filtered = filtered.filter((l) => l.temperature === filter.temperature);
      }
      if (filter?.intent) {
        filtered = filtered.filter((l) => l.intent === filter.intent);
      }
      if (filter?.company) {
        const comp = filter.company.toLowerCase();
        filtered = filtered.filter((l) => (l.company || '').toLowerCase().includes(comp));
      }
      if (filter?.assignedToId) {
        filtered = filtered.filter((l) => l.assignedToId === filter.assignedToId);
      }
      if (filter?.followUpStatus) {
        filtered = filtered.filter((l) => (l.followUpStatus || 'none') === filter.followUpStatus);
      }
      if (filter?.dateRange && filter.dateRange !== 'all') {
        const now = new Date().getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        filtered = filtered.filter((l) => {
          const leadTime = new Date(l.createdAt).getTime();
          const diff = now - leadTime;
          if (filter.dateRange === 'today') return diff <= oneDayMs;
          if (filter.dateRange === 'yesterday') return diff <= 2 * oneDayMs;
          if (filter.dateRange === 'week') return diff <= 7 * oneDayMs;
          if (filter.dateRange === 'month') return diff <= 30 * oneDayMs;
          return true;
        });
      }
      if (filter?.tag) {
        filtered = filtered.filter((l) => l.tags.includes(filter.tag!));
      }
      if (filter?.query) {
        const q = filter.query.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.firstName.toLowerCase().includes(q) ||
            l.lastName.toLowerCase().includes(q) ||
            (l.company && l.company.toLowerCase().includes(q)) ||
            (l.email && l.email.toLowerCase().includes(q)) ||
            (l.title && l.title.toLowerCase().includes(q)) ||
            (l.eventName && l.eventName.toLowerCase().includes(q)) ||
            (l.boothNumber && l.boothNumber.toLowerCase().includes(q))
        );
      }

      // Sort
      if (filter?.sortBy) {
        const factor = filter.sortOrder === 'asc' ? 1 : -1;
        filtered.sort((a, b) => {
          if (filter.sortBy === 'score') return (a.score - b.score) * factor;
          if (filter.sortBy === 'company') return (a.company || '').localeCompare(b.company || '') * factor;
          if (filter.sortBy === 'name') return a.lastName.localeCompare(b.lastName) * factor;
          if (filter.sortBy === 'temperature') {
            const tempOrder: Record<string, number> = { hot: 3, warm: 2, cold: 1 };
            return ((tempOrder[a.temperature || 'warm'] || 0) - (tempOrder[b.temperature || 'warm'] || 0)) * factor;
          }
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
        });
      }

      const start = (pagination.page - 1) * pagination.pageSize;
      const items = filtered.slice(start, start + pagination.pageSize);
      return {
        items,
        total: filtered.length,
        page: pagination.page,
        pageSize: pagination.pageSize,
        hasMore: start + pagination.pageSize < filtered.length,
      };
    }
    return apiClient.request<PaginatedResult<Lead>>('/leads');
  }

  async getLeadById(id: string): Promise<Lead | null> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      return this.leads.find((l) => l.id === id) || null;
    }
    return apiClient.request<Lead>(`/leads/${id}`);
  }

  async createLead(input: CreateLeadInput): Promise<Lead> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(300);
      const newLead: Lead = {
        companyId: input.companyId || 'comp-acme-1',
        eventId: input.eventId,
        eventName: input.eventName,
        boothNumber: input.boothNumber,
        avatarUrl: input.avatarUrl,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        company: input.company,
        title: input.title,
        notes: input.notes,
        status: input.status || 'new',
        score: input.score ?? 50,
        priority: input.priority || 'medium',
        temperature: input.temperature || (input.score && input.score >= 75 ? 'hot' : input.score && input.score >= 40 ? 'warm' : 'cold'),
        intent: input.intent || 'buying',
        hall: input.hall,
        followUpStatus: input.followUpStatus || 'none',
        followUpDueDate: input.followUpDueDate,
        budgetRange: input.budgetRange,
        decisionRole: input.decisionRole,
        purchaseTimeline: input.purchaseTimeline,
        tags: input.tags || [],
        captureSource: input.captureSource || 'manual',
        capturedByStaffId: input.capturedByStaffId,
        assignedToId: input.assignedToId,
        assignedToName: input.assignedToName,
        assignedAt: input.assignedAt,
        badgeRawData: input.badgeRawData,
        cardImageUri: input.cardImageUri,
        cardBackImageUri: input.cardBackImageUri,
        ocrConfidence: input.ocrConfidence,
        ocrRawText: input.ocrRawText,
        audioNoteUri: input.audioNoteUri,
        voiceNoteUri: input.voiceNoteUri,
        voiceNoteDurationSeconds: input.voiceNoteDurationSeconds,
        voiceNoteTranscript: input.voiceNoteTranscript,
        id: `lead-${Date.now()}`,
        synced: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.leads.unshift(newLead);

      // Record audit activity
      this.activities.unshift({
        id: `act-${Date.now()}`,
        leadId: newLead.id,
        actorId: newLead.capturedByStaffId,
        actorName: newLead.assignedToName || 'Current User',
        type: 'created',
        description: `Lead created & qualified (${newLead.temperature?.toUpperCase() || 'WARM'}, Intent: ${newLead.intent?.toUpperCase() || 'BUYING'}) via ${newLead.captureSource.replace('_', ' ')}`,
        timestamp: new Date().toISOString(),
      });

      // Save initial note if provided
      if (input.notes) {
        this.notes.unshift({
          id: `note-${Date.now()}`,
          leadId: newLead.id,
          authorId: newLead.capturedByStaffId,
          authorName: newLead.assignedToName || 'Sales Representative',
          content: input.notes,
          isPrivate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Register card scan attachment
      if (input.cardImageUri) {
        this.attachments.unshift({
          id: `att-card-${Date.now()}`,
          leadId: newLead.id,
          eventId: newLead.eventId,
          fileName: 'Business Card Scan (Front)',
          fileType: 'image',
          fileUri: input.cardImageUri,
          fileSize: 850000,
          mimeType: 'image/jpeg',
          uploadedBy: newLead.assignedToName || 'Sales Representative',
          uploadedAt: new Date().toISOString(),
          source: 'scanner',
          caption: 'Card OCR scan on exhibition floor',
        });
      }

      // Register voice note attachment if captured during review
      if (input.voiceNoteUri) {
        this.attachments.unshift({
          id: `att-voice-${Date.now()}`,
          leadId: newLead.id,
          eventId: newLead.eventId,
          fileName: 'Voice Memo (Capture)',
          fileType: 'audio',
          fileUri: input.voiceNoteUri,
          fileSize: Math.round((input.voiceNoteDurationSeconds || 12) * 32000),
          mimeType: 'audio/m4a',
          uploadedBy: newLead.assignedToName || 'Sales Representative',
          uploadedAt: new Date().toISOString(),
          durationSeconds: input.voiceNoteDurationSeconds || 12,
          transcript: input.voiceNoteTranscript,
          source: 'microphone',
        });
      }

      // Register any additional photo attachments captured during review
      if (input.additionalPhotoUris && input.additionalPhotoUris.length > 0) {
        input.additionalPhotoUris.forEach((photoUri, index) => {
          this.attachments.unshift({
            id: `att-photo-${Date.now()}-${index}`,
            leadId: newLead.id,
            eventId: newLead.eventId,
            fileName: `Attachment Photo #${index + 1}`,
            fileType: 'image',
            fileUri: photoUri,
            fileSize: 920000,
            mimeType: 'image/jpeg',
            uploadedBy: newLead.assignedToName || 'Sales Representative',
            uploadedAt: new Date().toISOString(),
            source: 'camera',
            caption: 'Trade-show booth / badge attachment',
          });
        });
      }

      // Update analytics KPIs
      try {
        await analyticsRepository.recordLeadCaptured(newLead);
      } catch {
        // Non-fatal if analytics sync is delayed
      }

      return newLead;
    }
    return apiClient.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateLead(id: string, updates: UpdateLeadInput): Promise<Lead> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(250);
      const index = this.leads.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Lead not found');

      const oldLead = this.leads[index];
      this.leads[index] = {
        ...oldLead,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (updates.status && updates.status !== oldLead.status) {
        this.activities.unshift({
          id: `act-${Date.now()}`,
          leadId: id,
          actorId: 'usr-current',
          actorName: 'Team Member',
          type: 'status_changed',
          description: `Status changed from ${oldLead.status} to ${updates.status}`,
          timestamp: new Date().toISOString(),
        });
      }

      if (updates.assignedToId && updates.assignedToId !== oldLead.assignedToId) {
        this.activities.unshift({
          id: `act-${Date.now() + 1}`,
          leadId: id,
          actorId: 'usr-current',
          actorName: 'Team Member',
          type: 'assigned',
          description: `Assigned lead to ${updates.assignedToName || 'team member'}`,
          metadata: { assigneeId: updates.assignedToId, assigneeName: updates.assignedToName },
          timestamp: new Date().toISOString(),
        });
      }

      if (updates.priority && updates.priority !== oldLead.priority) {
        this.activities.unshift({
          id: `act-${Date.now() + 2}`,
          leadId: id,
          actorId: 'usr-current',
          actorName: 'Team Member',
          type: 'priority_changed',
          description: `Priority updated to ${updates.priority.toUpperCase()}`,
          timestamp: new Date().toISOString(),
        });
      }

      if (updates.temperature && updates.temperature !== oldLead.temperature) {
        this.activities.unshift({
          id: `act-${Date.now() + 3}`,
          leadId: id,
          actorId: 'usr-current',
          actorName: 'Team Member',
          type: 'priority_changed',
          description: `Temperature updated to ${updates.temperature.toUpperCase()}`,
          timestamp: new Date().toISOString(),
        });
      }

      if (updates.followUpStatus && updates.followUpStatus !== oldLead.followUpStatus) {
        this.activities.unshift({
          id: `act-${Date.now() + 4}`,
          leadId: id,
          actorId: 'usr-current',
          actorName: 'Team Member',
          type: 'status_changed',
          description: `Follow-up status updated to ${updates.followUpStatus.toUpperCase()}`,
          timestamp: new Date().toISOString(),
        });
      }

      if (updates.voiceNoteUri && updates.voiceNoteUri !== oldLead.voiceNoteUri) {
        this.activities.unshift({
          id: `act-${Date.now() + 5}`,
          leadId: id,
          actorId: 'usr-current',
          actorName: 'Team Member',
          type: 'note_added',
          description: `Recorded audio memo (${updates.voiceNoteDurationSeconds || 0}s)${updates.voiceNoteTranscript ? ': "' + updates.voiceNoteTranscript.slice(0, 45) + '…"' : ''}`,
          timestamp: new Date().toISOString(),
        });
      }

      return this.leads[index];
    }
    return apiClient.request<Lead>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteLead(id: string): Promise<boolean> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);
      const index = this.leads.findIndex((l) => l.id === id);
      if (index === -1) return false;
      this.leads.splice(index, 1);
      return true;
    }
    return apiClient.request<boolean>(`/leads/${id}`, { method: 'DELETE' });
  }

  async getLeadNotes(leadId: string): Promise<LeadNote[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      return this.notes.filter((n) => n.leadId === leadId);
    }
    return apiClient.request<LeadNote[]>(`/leads/${leadId}/notes`);
  }

  async addLeadNote(input: CreateLeadNoteInput): Promise<LeadNote> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(250);
      const newNote: LeadNote = {
        ...input,
        id: `note-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.notes.unshift(newNote);
      this.activities.unshift({
        id: `act-${Date.now() + 1}`,
        leadId: input.leadId,
        actorId: input.authorId,
        actorName: input.authorName || 'Team Member',
        type: 'note_added',
        description: `Added note: "${input.content.slice(0, 45)}${input.content.length > 45 ? '…' : ''}"`,
        timestamp: new Date().toISOString(),
      });
      return newNote;
    }
    return apiClient.request<LeadNote>(`/leads/${input.leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      return this.activities.filter((a) => a.leadId === leadId);
    }
    return apiClient.request<LeadActivity[]>(`/leads/${leadId}/activities`);
  }

  async addLeadActivity(input: CreateLeadActivityInput): Promise<LeadActivity> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);
      const newActivity: LeadActivity = {
        ...input,
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      this.activities.unshift(newActivity);
      return newActivity;
    }
    return apiClient.request<LeadActivity>(`/leads/${input.leadId}/activities`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getAttachments(leadId: string): Promise<Attachment[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      return this.attachments.filter((att) => att.leadId === leadId);
    }
    return apiClient.request<Attachment[]>(`/leads/${leadId}/attachments`);
  }

  async addAttachment(input: CreateAttachmentInput): Promise<Attachment> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(250);
      const newAttachment: Attachment = {
        leadId: input.leadId || '',
        fileSize: input.fileSize || 0,
        mimeType: input.mimeType || (input.fileType === 'audio' ? 'audio/m4a' : 'image/jpeg'),
        uploadedBy: input.uploadedBy || 'Sales Representative',
        isLocalFile: input.isLocalFile ?? false,
        ...input,
        id: `att-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      this.attachments.unshift(newAttachment);
      if (input.leadId) {
        const desc =
          input.fileType === 'audio'
            ? `Recorded voice note memo (${input.durationSeconds ? Math.round(input.durationSeconds) + 's' : 'audio'})`
            : `Attached photo: ${input.fileName}`;
        this.activities.unshift({
          id: `act-${Date.now() + 2}`,
          leadId: input.leadId,
          actorId: input.uploadedBy || 'usr-1',
          actorName: input.uploadedBy || 'Sales Representative',
          type: 'note_added',
          description: desc,
          timestamp: new Date().toISOString(),
        });
      }
      return newAttachment;
    }
    return apiClient.request<Attachment>(`/leads/${input.leadId}/attachments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);
      const index = this.attachments.findIndex((att) => att.id === attachmentId);
      if (index !== -1) {
        const removed = this.attachments[index];
        this.attachments.splice(index, 1);
        if (removed.leadId) {
          this.activities.unshift({
            id: `act-${Date.now() + 3}`,
            leadId: removed.leadId,
            actorId: 'usr-1',
            actorName: 'Sales Representative',
            type: 'note_added',
            description: `Deleted attachment: ${removed.fileName}`,
            timestamp: new Date().toISOString(),
          });
        }
      }
      return;
    }
    return apiClient.request<void>(`/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  async getFollowUps(leadId?: string): Promise<FollowUp[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      if (leadId) return this.followUps.filter((f) => f.leadId === leadId);
      return this.followUps;
    }
    return apiClient.request<FollowUp[]>(leadId ? `/leads/${leadId}/follow-ups` : '/follow-ups');
  }

  async createFollowUp(input: CreateFollowUpInput): Promise<FollowUp> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(250);
      const newFollowUp: FollowUp = {
        ...input,
        id: `fup-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      this.followUps.unshift(newFollowUp);
      return newFollowUp;
    }
    return apiClient.request<FollowUp>('/follow-ups', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateFollowUp(id: string, updates: Partial<FollowUp>): Promise<FollowUp> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);
      const index = this.followUps.findIndex((f) => f.id === id);
      if (index === -1) throw new Error('Follow up not found');
      this.followUps[index] = { ...this.followUps[index], ...updates };
      return this.followUps[index];
    }
    return apiClient.request<FollowUp>(`/follow-ups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async syncOfflineQueue(leads: CreateLeadInput[]): Promise<Lead[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(500);
      const synced = leads.map((input, idx) => ({
        companyId: input.companyId || 'comp-acme-1',
        eventId: input.eventId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        company: input.company,
        title: input.title,
        notes: input.notes,
        status: input.status || 'new',
        score: input.score ?? 50,
        priority: input.priority || 'medium',
        tags: input.tags || [],
        captureSource: input.captureSource || 'manual',
        capturedByStaffId: input.capturedByStaffId,
        assignedToId: input.assignedToId,
        badgeRawData: input.badgeRawData,
        cardImageUri: input.cardImageUri,
        audioNoteUri: input.audioNoteUri,
        id: `lead-synced-${Date.now()}-${idx}`,
        synced: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      this.leads.unshift(...synced);
      return synced;
    }
    return apiClient.request<Lead[]>('/leads/sync', {
      method: 'POST',
      body: JSON.stringify({ leads }),
    });
  }
}

export const leadsRepository = new LeadsRepository();
