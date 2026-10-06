import { z } from 'zod';

export const ExhibitorSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string().min(1, 'Exhibitor name is required'),
  boothNumber: z.string(),
  boothId: z.string().optional(),
  hall: z.string().default('North Hall').optional(),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  category: z.string().default('Technology'),
  logoUrl: z.string().optional(),
  floorPlanLocation: z.string().optional(),
  featured: z.boolean().default(false),
  isBookmarked: z.boolean().default(false).optional(),
  isInItinerary: z.boolean().default(false).optional(),
  tags: z.array(z.string()).default([]),
  products: z.array(z.string()).default([]),
  headquarters: z.string().optional(),
  staffOnDutyCount: z.number().default(2).optional(),
  createdAt: z.string(),
});
export type Exhibitor = z.infer<typeof ExhibitorSchema>;

export const CreateExhibitorInputSchema = ExhibitorSchema.omit({
  id: true,
  createdAt: true,
});
export type CreateExhibitorInput = z.infer<typeof CreateExhibitorInputSchema>;
