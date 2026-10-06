import { z } from 'zod';

export const AttachmentTypeSchema = z.enum([
  'image',
  'audio',
  'document',
  'vcard',
  'badge_scan',
]);
export type AttachmentType = z.infer<typeof AttachmentTypeSchema>;

export const AttachmentSchema = z.object({
  id: z.string(),
  leadId: z.string().default(''),
  eventId: z.string().optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileType: AttachmentTypeSchema,
  fileUri: z.string().min(1, 'File URI is required'),
  fileSize: z.number().default(0), // in bytes
  mimeType: z.string().default('application/octet-stream'),
  uploadedBy: z.string().default('Sales Representative'),
  uploadedAt: z.string(),
  // Audio specific metadata
  durationSeconds: z.number().optional(),
  waveform: z.array(z.number()).optional(),
  transcript: z.string().optional(),
  // Photo & Visual metadata
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  source: z.enum(['camera', 'gallery', 'microphone', 'scanner', 'manual']).optional(),
  isLocalFile: z.boolean().optional(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const CreateAttachmentInputSchema = AttachmentSchema.omit({
  id: true,
  uploadedAt: true,
}).partial({
  leadId: true,
  fileSize: true,
  mimeType: true,
  uploadedBy: true,
  isLocalFile: true,
});
export type CreateAttachmentInput = z.infer<typeof CreateAttachmentInputSchema>;

