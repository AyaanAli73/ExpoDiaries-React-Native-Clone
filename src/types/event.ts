import { z } from 'zod';

export const EventStatusSchema = z.enum(['draft', 'upcoming', 'active', 'completed', 'archived']);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const JoinedStateSchema = z.enum(['joined', 'not_joined', 'pending']);
export type JoinedState = z.infer<typeof JoinedStateSchema>;

export const EventSchema = z.object({
  id: z.string(),
  companyId: z.string().default('comp-acme-1'),
  organizationId: z.string().default('org-acme'),
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  location: z.string(),
  city: z.string().default('Las Vegas').optional(),
  country: z.string().default('United States').optional(),
  venue: z.string().optional(),
  boothNumber: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  status: EventStatusSchema.default('active'),
  leadGoal: z.number().default(100),
  totalLeadsCaptured: z.number().default(0),
  activeStaffCount: z.number().default(1),
  bannerUrl: z.string().optional(),
  website: z.string().optional(),
  category: z.string().default('Enterprise Tech').optional(),
  industry: z.string().default('Enterprise Tech').optional(),
  isBookmarked: z.boolean().default(false).optional(),
  isJoined: z.boolean().default(false).optional(),
  joinedState: JoinedStateSchema.default('not_joined').optional(),
  isFeatured: z.boolean().default(false).optional(),
  isNearby: z.boolean().default(false).optional(),
  distanceMiles: z.number().optional(),
  totalExhibitorsCount: z.number().default(48).optional(),
  exhibitorCount: z.number().default(48).optional(),
  totalSessionsCount: z.number().default(16).optional(),
  floorPlanZone: z.string().default('North Hall').optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Event = z.infer<typeof EventSchema>;

// Backward-compatibility alias
export const ExpoEventSchema = EventSchema;
export type ExpoEvent = Event;

export const CreateEventInputSchema = EventSchema.omit({
  id: true,
  totalLeadsCaptured: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  companyId: z.string().default('comp-acme-1').optional(),
  organizationId: z.string().default('org-acme').optional(),
  city: z.string().default('Las Vegas').optional(),
  country: z.string().default('United States').optional(),
  status: EventStatusSchema.default('active').optional(),
  leadGoal: z.number().default(100).optional(),
  activeStaffCount: z.number().default(1).optional(),
});
export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;

export const UpdateEventInputSchema = EventSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type UpdateEventInput = z.infer<typeof UpdateEventInputSchema>;
