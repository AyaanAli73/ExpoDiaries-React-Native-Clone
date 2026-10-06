import { z } from 'zod';

export const BoothStatusSchema = z.enum(['occupied', 'reserved', 'available', 'host']);
export type BoothStatus = z.infer<typeof BoothStatusSchema>;

export const BoothSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  boothNumber: z.string(),
  zone: z.string(),
  hall: z.string(),
  aisle: z.string().optional(),
  row: z.number(),
  col: z.number(),
  dimensions: z.string().default('20x20 ft'),
  status: BoothStatusSchema.default('occupied'),
  isHostBooth: z.boolean().default(false),
  exhibitorId: z.string().optional(),
  exhibitorName: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  website: z.string().optional(),
  capturedLeadsCount: z.number().default(0).optional(),
  hotLeadsCount: z.number().default(0).optional(),
  isTaggedLocation: z.boolean().default(false).optional(),
});

export type Booth = z.infer<typeof BoothSchema>;
