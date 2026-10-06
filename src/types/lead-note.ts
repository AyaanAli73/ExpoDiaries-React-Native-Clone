import { z } from 'zod';

export const LeadNoteSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  content: z.string().min(1, 'Note content cannot be empty'),
  isPrivate: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LeadNote = z.infer<typeof LeadNoteSchema>;

export const CreateLeadNoteInputSchema = LeadNoteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateLeadNoteInput = z.infer<typeof CreateLeadNoteInputSchema>;
