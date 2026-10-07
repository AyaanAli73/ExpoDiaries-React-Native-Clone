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
  conversionRate: z.number().optional(),
  hourlyVelocity: z.number().optional(),
});
export type StaffPerformance = z.infer<typeof StaffPerformanceSchema>;

export const EventEconomicsSchema = z.object({
  eventId: z.string(),
  boothSpaceCost: z.number(),
  travelAndLodgingCost: z.number(),
  collateralAndSwagCost: z.number(),
  sponsorshipFee: z.number(),
  totalInvestment: z.number(),
  averageDealSize: z.number(),
  estimatedCloseRatePercent: z.number(),
  currency: z.string().default('USD'),
});
export type EventEconomics = z.infer<typeof EventEconomicsSchema>;

export const ROIMetricsSchema = z.object({
  totalInvestment: z.number(),
  totalLeads: z.number(),
  qualifiedLeads: z.number(),
  costPerLead: z.number(),
  costPerQualifiedLead: z.number(),
  pipelineValue: z.number(),
  projectedRevenue: z.number(),
  projectedRoiPercent: z.number(),
  roiMultiplier: z.number(),
  breakEvenDealsNeeded: z.number(),
  qualificationRatePercent: z.number(),
});
export type ROIMetrics = z.infer<typeof ROIMetricsSchema>;

export const VelocityTimeSlotSchema = z.object({
  hourLabel: z.string(),
  hour24: z.number(),
  count: z.number(),
  velocityPerHour: z.number(),
  isPeak: z.boolean(),
});
export type VelocityTimeSlot = z.infer<typeof VelocityTimeSlotSchema>;

export const ChannelEfficiencyMetricSchema = z.object({
  channel: z.string(),
  label: z.string(),
  count: z.number(),
  percentage: z.number(),
  qualifiedCount: z.number(),
  qualificationRatePercent: z.number(),
  color: z.string().optional(),
});
export type ChannelEfficiencyMetric = z.infer<typeof ChannelEfficiencyMetricSchema>;

export const InsightTypeSchema = z.enum(['staffing', 'channel', 'roi', 'quota', 'conversion']);
export type InsightType = z.infer<typeof InsightTypeSchema>;

export const IntelligenceInsightSchema = z.object({
  id: z.string(),
  type: InsightTypeSchema,
  title: z.string(),
  description: z.string(),
  recommendation: z.string(),
  metricCallout: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'info']),
});
export type IntelligenceInsight = z.infer<typeof IntelligenceInsightSchema>;

export const EventROIReportSchema = z.object({
  eventId: z.string(),
  eventName: z.string(),
  summary: EventAnalyticsSummarySchema,
  economics: EventEconomicsSchema,
  roi: ROIMetricsSchema,
  velocitySlots: z.array(VelocityTimeSlotSchema),
  channels: z.array(ChannelEfficiencyMetricSchema),
  insights: z.array(IntelligenceInsightSchema),
  staffLeaderboard: z.array(StaffPerformanceSchema),
});
export type EventROIReport = z.infer<typeof EventROIReportSchema>;

export const TimeFilterSchema = z.enum(['today', '7days', 'event', 'all_events']);
export type TimeFilter = z.infer<typeof TimeFilterSchema>;

export const AnalyticsKpisSchema = z.object({
  totalLeads: z.number(),
  hotLeads: z.number(),
  warmLeads: z.number(),
  coldLeads: z.number(),
  meetings: z.number(),
  followUps: z.number(),
  conversionRate: z.number(),
  totalLeadsDelta: z.string().optional(),
  hotLeadsDelta: z.string().optional(),
  conversionRateDelta: z.string().optional(),
});
export type AnalyticsKpis = z.infer<typeof AnalyticsKpisSchema>;

export const VolumeDataPointSchema = z.object({
  label: z.string(),
  total: z.number(),
  hot: z.number(),
  timestamp: z.string().optional(),
});
export type VolumeDataPoint = z.infer<typeof VolumeDataPointSchema>;

export const TemperatureDistributionSliceSchema = z.object({
  count: z.number(),
  percentage: z.number(),
  color: z.string(),
});
export type TemperatureDistributionSlice = z.infer<typeof TemperatureDistributionSliceSchema>;

export const TemperatureDistributionSchema = z.object({
  hot: TemperatureDistributionSliceSchema,
  warm: TemperatureDistributionSliceSchema,
  cold: TemperatureDistributionSliceSchema,
  total: z.number(),
});
export type TemperatureDistribution = z.infer<typeof TemperatureDistributionSchema>;

export const IndustryDistributionItemSchema = z.object({
  industry: z.string(),
  count: z.number(),
  percentage: z.number(),
  color: z.string(),
});
export type IndustryDistributionItem = z.infer<typeof IndustryDistributionItemSchema>;

export const BoothDistributionItemSchema = z.object({
  booth: z.string(),
  stationName: z.string(),
  count: z.number(),
  percentage: z.number(),
  isTop: z.boolean().default(false),
});
export type BoothDistributionItem = z.infer<typeof BoothDistributionItemSchema>;

export const TeamActivityItemSchema = z.object({
  memberId: z.string(),
  name: z.string(),
  role: z.string(),
  scans: z.number(),
  meetings: z.number(),
  followUps: z.number(),
  totalActivity: z.number(),
});
export type TeamActivityItem = z.infer<typeof TeamActivityItemSchema>;

export const AnalyticsDashboardDataSchema = z.object({
  filter: TimeFilterSchema,
  eventName: z.string(),
  kpis: AnalyticsKpisSchema,
  volumeOverTime: z.array(VolumeDataPointSchema),
  temperatureDistribution: TemperatureDistributionSchema,
  leadsByIndustry: z.array(IndustryDistributionItemSchema),
  leadsByBooth: z.array(BoothDistributionItemSchema),
  teamActivity: z.array(TeamActivityItemSchema),
  leaderboard: z.array(StaffPerformanceSchema),
});
export type AnalyticsDashboardData = z.infer<typeof AnalyticsDashboardDataSchema>;

export const EventCostInputsSchema = z.object({
  eventCost: z.number(),
  travelCost: z.number(),
  boothCost: z.number(),
  marketingCost: z.number(),
  staffCost: z.number(),
  otherExpenses: z.number(),
});
export type EventCostInputs = z.infer<typeof EventCostInputsSchema>;

export const RevenueModelInputsSchema = z.object({
  averageDealSize: z.number(),
  estimatedCloseRatePercent: z.number(),
});
export type RevenueModelInputs = z.infer<typeof RevenueModelInputsSchema>;

export const EventLeadActualsSchema = z.object({
  totalLeads: z.number(),
  qualifiedLeads: z.number(),
  hotLeads: z.number(),
  meetings: z.number(),
});
export type EventLeadActuals = z.infer<typeof EventLeadActualsSchema>;

export const CostCategoryItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  amount: z.number(),
  percentage: z.number(),
  color: z.string(),
  icon: z.string(),
});
export type CostCategoryItem = z.infer<typeof CostCategoryItemSchema>;

export const LeadFunnelStageSchema = z.object({
  stageKey: z.string(),
  label: z.string(),
  count: z.number(),
  conversionFromTotal: z.number(),
  isEstimated: z.boolean(),
  color: z.string(),
});
export type LeadFunnelStage = z.infer<typeof LeadFunnelStageSchema>;

export const EventROIAnalysisReportSchema = z.object({
  eventId: z.string(),
  eventName: z.string(),
  costInputs: EventCostInputsSchema,
  revenueInputs: RevenueModelInputsSchema,
  actuals: EventLeadActualsSchema,
  totalEventCost: z.number(),
  costPerLead: z.number(),
  costPerQualifiedLead: z.number(),
  pipelineValue: z.number(),
  projectedDeals: z.number(),
  estimatedRevenue: z.number(),
  netProfit: z.number(),
  estimatedRoiPercent: z.number(),
  roiMultiplier: z.number(),
  breakEvenDealsNeeded: z.number(),
  costBreakdown: z.array(CostCategoryItemSchema),
  funnelStages: z.array(LeadFunnelStageSchema),
});
export type EventROIAnalysisReport = z.infer<typeof EventROIAnalysisReportSchema>;

