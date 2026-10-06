import { z } from 'zod';

export const LeadActivityTypeSchema = z.enum([
  'created',
  'scanned',
  'status_changed',
  'note_added',
  'email_sent',
  'called',
  'meeting_scheduled',
  'assigned',
  'priority_changed',
]);
export type LeadActivityType = z.infer<typeof LeadActivityTypeSchema>;

export const LeadActivitySchema = z.object({
  id: z.string(),
  leadId: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  type: LeadActivityTypeSchema,
  description: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string(),
});
export type LeadActivity = z.infer<typeof LeadActivitySchema>;

export const CreateLeadActivityInputSchema = LeadActivitySchema.omit({
  id: true,
  timestamp: true,
});
export type CreateLeadActivityInput = z.infer<typeof CreateLeadActivityInputSchema>;
