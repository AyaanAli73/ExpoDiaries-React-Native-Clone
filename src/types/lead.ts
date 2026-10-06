import { z } from 'zod';

export const LeadStatusSchema = z.enum(['new', 'contacted', 'qualified', 'disqualified', 'customer']);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const LeadPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type LeadPriority = z.infer<typeof LeadPrioritySchema>;

export const LeadCaptureSourceSchema = z.enum(['badge_scan', 'business_card', 'manual', 'qr', 'nfc']);
export type LeadCaptureSource = z.infer<typeof LeadCaptureSourceSchema>;

export const LeadIntentSchema = z.enum([
  'buying',
  'partnership',
  'information',
  'follow_up',
  'other',
]);
export type LeadIntent = z.infer<typeof LeadIntentSchema>;

export const LeadSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  eventName: z.string().optional(),
  boothNumber: z.string().optional(),
  hall: z.string().optional(),
  avatarUrl: z.string().optional(),
  companyId: z.string().default('comp-acme-1'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: LeadStatusSchema.default('new'),
  score: z.number().min(0).max(100).default(50),
  priority: LeadPrioritySchema.default('medium'),
  temperature: z.enum(['hot', 'warm', 'cold']).default('warm').optional(),
  intent: LeadIntentSchema.default('buying').optional(),
  followUpStatus: z.enum(['none', 'pending', 'scheduled', 'completed']).default('none').optional(),
  followUpDueDate: z.string().optional(),
  budgetRange: z.enum(['under_25k', '25k_100k', '100k_500k', 'over_500k']).optional(),
  decisionRole: z.enum(['decision_maker', 'influencer', 'evaluator', 'end_user']).optional(),
  purchaseTimeline: z.enum(['immediate', 'quarter', 'year', 'exploring']).optional(),
  tags: z.array(z.string()).default([]),
  captureSource: LeadCaptureSourceSchema.default('manual'),
  capturedByStaffId: z.string(),
  assignedToId: z.string().optional(),
  assignedToName: z.string().optional(),
  assignedAt: z.string().optional(),
  badgeRawData: z.string().optional(),
  cardImageUri: z.string().optional(),
  cardBackImageUri: z.string().optional(),
  ocrConfidence: z.number().optional(),
  ocrRawText: z.string().optional(),
  audioNoteUri: z.string().optional(),
  voiceNoteUri: z.string().optional(),
  voiceNoteDurationSeconds: z.number().optional(),
  voiceNoteTranscript: z.string().optional(),
  synced: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const CreateLeadInputSchema = LeadSchema.omit({
  id: true,
  synced: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  companyId: z.string().default('comp-acme-1').optional(),
  priority: LeadPrioritySchema.default('medium').optional(),
  additionalPhotoUris: z.array(z.string()).optional(),
});
export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;

export const UpdateLeadInputSchema = LeadSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type UpdateLeadInput = z.infer<typeof UpdateLeadInputSchema>;

export const LeadFilterSchema = z.object({
  eventId: z.string().optional(),
  status: LeadStatusSchema.optional(),
  priority: LeadPrioritySchema.optional(),
  temperature: z.enum(['hot', 'warm', 'cold']).optional(),
  intent: LeadIntentSchema.optional(),
  company: z.string().optional(),
  query: z.string().optional(),
  tag: z.string().optional(),
  assignedToId: z.string().optional(),
  followUpStatus: z.enum(['none', 'pending', 'scheduled', 'completed']).optional(),
  dateRange: z.enum(['all', 'today', 'yesterday', 'week', 'month']).optional(),
  sortBy: z.enum(['createdAt', 'score', 'company', 'name', 'priority', 'temperature']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
export type LeadFilter = z.infer<typeof LeadFilterSchema>;
