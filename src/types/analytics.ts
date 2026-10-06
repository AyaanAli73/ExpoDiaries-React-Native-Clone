import { z } from 'zod';

export const DeltaTypeSchema = z.enum(['increase', 'decrease', 'neutral']);
export type DeltaType = z.infer<typeof DeltaTypeSchema>;

export const MetricCategorySchema = z.enum(['leads', 'engagement', 'team', 'conversion']);
export type MetricCategory = z.infer<typeof MetricCategorySchema>;

export const AnalyticsMetricSchema = z.object({
  id: z.string(),
  eventId: z.string().optional(),
  companyId: z.string(),
  metricKey: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  delta: z.union([z.string(), z.number()]).optional(),
  deltaType: DeltaTypeSchema.default('neutral'),
  deltaPeriod: z.string().optional(),
  category: MetricCategorySchema.default('leads'),
  timestamp: z.string(),
});
export type AnalyticsMetric = z.infer<typeof AnalyticsMetricSchema>;

export const EventAnalyticsSummarySchema = z.object({
  eventId: z.string(),
  totalLeads: z.number(),
  targetGoal: z.number(),
  goalProgressPercent: z.number(),
  qualifiedLeads: z.number(),
  hourlyCaptureVelocity: z.number(),
  topTags: z.array(z.object({ tag: z.string(), count: z.number() })),
  leadsBySource: z.record(z.string(), z.number()),
});
export type EventAnalyticsSummary = z.infer<typeof EventAnalyticsSummarySchema>;

export const StaffPerformanceSchema = z.object({
  staffId: z.string(),
  staffName: z.string(),
  leadsCaptured: z.number(),
  qualifiedCount: z.number(),
  averageScore: z.number(),
});
export type StaffPerformance = z.infer<typeof StaffPerformanceSchema>;
