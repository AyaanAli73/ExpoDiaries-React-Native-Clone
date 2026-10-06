import { z } from 'zod';

export const ItineraryCategorySchema = z.enum([
  'session',
  'keynote',
  'booth_duty',
  'booth_visit',
  'meeting',
  'break',
  'networking',
]);
export type ItineraryCategory = z.infer<typeof ItineraryCategorySchema>;

export const ItineraryItemSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  category: ItineraryCategorySchema.default('session'),
  company: z.string().optional(),
  booth: z.string().optional(),
  hall: z.string().optional(),
  notes: z.string().optional(),
  speakerName: z.string().optional(),
  speakerTitle: z.string().optional(),
  isBookmarked: z.boolean().default(false),
  remindersEnabled: z.boolean().default(false),
  isCompleted: z.boolean().default(false).optional(),
  capacity: z.number().optional(),
  registeredCount: z.number().default(0).optional(),
  order: z.number().optional(),
  createdAt: z.string(),
});
export type ItineraryItem = z.infer<typeof ItineraryItemSchema>;

export const CreateItineraryItemInputSchema = ItineraryItemSchema.omit({
  id: true,
  createdAt: true,
}).extend({
  id: z.string().optional(),
  isBookmarked: z.boolean().default(true).optional(),
  location: z.string().default('Trade Show Floor').optional(),
});
export type CreateItineraryItemInput = z.infer<typeof CreateItineraryItemInputSchema>;

export const UpdateItineraryItemInputSchema = CreateItineraryItemInputSchema.partial();
export type UpdateItineraryItemInput = z.infer<typeof UpdateItineraryItemInputSchema>;

/**
 * Detects schedule overlaps between itinerary items.
 * Two items conflict if their start and end time ranges overlap on the same date.
 */
export function detectItineraryConflicts(items: ItineraryItem[]): Map<string, ItineraryItem[]> {
  const conflictMap = new Map<string, ItineraryItem[]>();

  for (let i = 0; i < items.length; i++) {
    const itemA = items[i];
    const startA = new Date(itemA.startTime).getTime();
    const endA = new Date(itemA.endTime).getTime();

    if (isNaN(startA) || isNaN(endA) || startA >= endA) continue;

    for (let j = i + 1; j < items.length; j++) {
      const itemB = items[j];
      const startB = new Date(itemB.startTime).getTime();
      const endB = new Date(itemB.endTime).getTime();

      if (isNaN(startB) || isNaN(endB) || startB >= endB) continue;

      // Check overlap condition: startA < endB && endA > startB
      if (startA < endB && endA > startB) {
        const listA = conflictMap.get(itemA.id) || [];
        listA.push(itemB);
        conflictMap.set(itemA.id, listA);

        const listB = conflictMap.get(itemB.id) || [];
        listB.push(itemA);
        conflictMap.set(itemB.id, listB);
      }
    }
  }

  return conflictMap;
}

/**
 * Checks if a candidate time range conflicts with any existing items.
 */
export function checkPotentialConflict(
  candidate: { id?: string; startTime: string; endTime: string },
  items: ItineraryItem[]
): ItineraryItem[] {
  const startC = new Date(candidate.startTime).getTime();
  const endC = new Date(candidate.endTime).getTime();

  if (isNaN(startC) || isNaN(endC) || startC >= endC) return [];

  return items.filter((item) => {
    if (candidate.id && item.id === candidate.id) return false;
    const startI = new Date(item.startTime).getTime();
    const endI = new Date(item.endTime).getTime();
    if (isNaN(startI) || isNaN(endI)) return false;

    return startC < endI && endC > startI;
  });
}
