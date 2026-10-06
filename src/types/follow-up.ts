import { z } from 'zod';

export const FollowUpTypeSchema = z.enum(['email', 'call', 'meeting', 'demo', 'task']);
export type FollowUpType = z.infer<typeof FollowUpTypeSchema>;

export const FollowUpStatusSchema = z.enum(['pending', 'completed', 'cancelled', 'overdue']);
export type FollowUpStatus = z.infer<typeof FollowUpStatusSchema>;

export const FollowUpPrioritySchema = z.enum(['low', 'medium', 'high']);
export type FollowUpPriority = z.infer<typeof FollowUpPrioritySchema>;

export const FollowUpSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  leadName: z.string(),
  eventId: z.string(),
  assignedToId: z.string(),
  type: FollowUpTypeSchema.default('email'),
  dueDate: z.string(),
  status: FollowUpStatusSchema.default('pending'),
  priority: FollowUpPrioritySchema.default('medium'),
  notes: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
});
export type FollowUp = z.infer<typeof FollowUpSchema>;

export const CreateFollowUpInputSchema = FollowUpSchema.omit({
  id: true,
  createdAt: true,
});
export type CreateFollowUpInput = z.infer<typeof CreateFollowUpInputSchema>;
