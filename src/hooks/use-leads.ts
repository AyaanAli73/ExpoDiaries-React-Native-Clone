import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { leadsService } from '@/services/leads.service';
import { CreateAttachmentInput } from '@/types/attachment';
import { PaginationParams } from '@/types/common';
import { CreateFollowUpInput, FollowUp } from '@/types/follow-up';
import { CreateLeadInput, Lead, LeadFilter, UpdateLeadInput } from '@/types/lead';
import { CreateLeadActivityInput } from '@/types/lead-activity';
import { CreateLeadNoteInput } from '@/types/lead-note';

export const leadQueryKeys = queryKeys.leads;

export function useLeads(filter?: LeadFilter, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.leads.list({ filter, pagination } as Record<string, unknown>),
    queryFn: () => leadsService.getLeads(filter, pagination),
  });
}

export function useInfiniteLeads(filter?: LeadFilter, pageSize = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.leads.list({ filter, type: 'infinite', pageSize } as Record<string, unknown>),
    queryFn: ({ pageParam = 1 }) => leadsService.getLeads(filter, { page: pageParam as number, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => leadsService.getLeadById(id),
    enabled: Boolean(id),
  });
}

export function useCaptureLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLeadInput) => leadsService.createLead(input),
    onSuccess: (newLead) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(newLead.eventId) });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateLeadInput }) =>
      leadsService.updateLead(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Lead['status'] }) =>
      leadsService.updateLeadStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useUpdateLeadTemperature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, temperature }: { id: string; temperature: 'hot' | 'warm' | 'cold' }) =>
      leadsService.updateLeadTemperature(id, temperature),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useUpdateLeadFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      followUpStatus,
      dueDate,
    }: {
      id: string;
      followUpStatus: 'none' | 'pending' | 'scheduled' | 'completed';
      dueDate?: string;
    }) => leadsService.updateLeadFollowUp(id, followUpStatus, dueDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(variables.id) });
    },
  });
}

export function useAssignLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      assigneeId,
      assigneeName,
      note,
    }: {
      id: string;
      assigneeId: string;
      assigneeName: string;
      note?: string;
    }) => leadsService.assignLead(id, assigneeId, assigneeName, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(variables.id) });
    },
  });
}

export function useAddVoiceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      voiceNoteUri,
      durationSeconds,
      transcript,
    }: {
      id: string;
      voiceNoteUri: string;
      durationSeconds: number;
      transcript?: string;
    }) => leadsService.addVoiceNote(id, voiceNoteUri, durationSeconds, transcript),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(variables.id) });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useLeadNotes(leadId: string) {
  return useQuery({
    queryKey: queryKeys.leads.notes(leadId),
    queryFn: () => leadsService.getLeadNotes(leadId),
    enabled: Boolean(leadId),
  });
}

export function useAddLeadNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLeadNoteInput) => leadsService.addLeadNote(input),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.notes(newNote.leadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(newNote.leadId) });
    },
  });
}

export function useLeadActivities(leadId: string) {
  return useQuery({
    queryKey: queryKeys.leads.activities(leadId),
    queryFn: () => leadsService.getLeadActivities(leadId),
    enabled: Boolean(leadId),
  });
}

export function useAddLeadActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLeadActivityInput) => leadsService.addLeadActivity(input),
    onSuccess: (newActivity) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(newActivity.leadId) });
    },
  });
}

export function useLeadAttachments(leadId: string) {
  return useQuery({
    queryKey: queryKeys.leads.attachments(leadId),
    queryFn: () => leadsService.getAttachments(leadId),
    enabled: Boolean(leadId),
  });
}

export function useAddLeadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAttachmentInput) => leadsService.addAttachment(input),
    onSuccess: (att) => {
      if (att.leadId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.attachments(att.leadId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(att.leadId) });
      }
    },
  });
}

export function useDeleteLeadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attachmentId }: { attachmentId: string; leadId: string }) =>
      leadsService.deleteAttachment(attachmentId),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.attachments(leadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(leadId) });
    },
  });
}

export function useFollowUps(leadId?: string) {
  return useQuery({
    queryKey: queryKeys.leads.followUps(leadId),
    queryFn: () => leadsService.getFollowUps(leadId),
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFollowUpInput) => leadsService.createFollowUp(input),
    onSuccess: (fup) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.followUps(fup.leadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.followUps() });
    },
  });
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<FollowUp> }) =>
      leadsService.updateFollowUp(id, updates),
    onSuccess: (fup) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.followUps(fup.leadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.followUps() });
    },
  });
}
