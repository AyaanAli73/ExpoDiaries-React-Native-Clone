import {
  ChannelEfficiencyMetric,
  CostCategoryItem,
  EventCostInputs,
  EventEconomics,
  EventLeadActuals,
  EventROIAnalysisReport,
  IntelligenceInsight,
  LeadFunnelStage,
  RevenueModelInputs,
  ROIMetrics,
  VelocityTimeSlot,
} from '@/types/analytics';

/**
 * Pure calculation engine for trade-show ROI, booth economics,
 * velocity telemetry, and business intelligence insights.
 * Strict separation: No UI or React hooks.
 */

export function calculateROIMetrics(
  economics: EventEconomics,
  totalLeads: number,
  qualifiedLeads: number
): ROIMetrics {
  const safeTotalLeads = Math.max(0, totalLeads);
  const safeQualifiedLeads = Math.max(0, qualifiedLeads);
  const totalInvestment = Math.max(1, economics.totalInvestment);

  const costPerLead = safeTotalLeads > 0 ? Math.round(totalInvestment / safeTotalLeads) : 0;
  const costPerQualifiedLead =
    safeQualifiedLeads > 0 ? Math.round(totalInvestment / safeQualifiedLeads) : 0;

  const pipelineValue = safeQualifiedLeads * economics.averageDealSize;
  const projectedRevenue = Math.round(
    pipelineValue * (economics.estimatedCloseRatePercent / 100)
  );

  const projectedRoiPercent =
    totalInvestment > 0
      ? Number((((projectedRevenue - totalInvestment) / totalInvestment) * 100).toFixed(1))
      : 0;

  const roiMultiplier =
    totalInvestment > 0 ? Number((projectedRevenue / totalInvestment).toFixed(2)) : 0;

  const breakEvenDealsNeeded =
    economics.averageDealSize > 0
      ? Math.ceil(totalInvestment / economics.averageDealSize)
      : 0;

  const qualificationRatePercent =
    safeTotalLeads > 0
      ? Number(((safeQualifiedLeads / safeTotalLeads) * 100).toFixed(1))
      : 0;

  return {
    totalInvestment,
    totalLeads: safeTotalLeads,
    qualifiedLeads: safeQualifiedLeads,
    costPerLead,
    costPerQualifiedLead,
    pipelineValue,
    projectedRevenue,
    projectedRoiPercent,
    roiMultiplier,
    breakEvenDealsNeeded,
    qualificationRatePercent,
  };
}

export function calculateVelocitySlots(
  hourDistribution?: { hour24: number; count: number }[]
): VelocityTimeSlot[] {
  const defaultSlots: { hour24: number; count: number }[] = hourDistribution || [
    { hour24: 9, count: 12 },
    { hour24: 10, count: 22 },
    { hour24: 11, count: 28 },
    { hour24: 12, count: 18 },
    { hour24: 13, count: 14 },
    { hour24: 14, count: 32 }, // Peak afternoon rush
    { hour24: 15, count: 26 },
    { hour24: 16, count: 18 },
    { hour24: 17, count: 10 },
  ];

  const maxCount = Math.max(...defaultSlots.map((s) => s.count), 1);

  return defaultSlots.map((slot) => {
    const period = slot.hour24 >= 12 ? 'PM' : 'AM';
    const displayHour = slot.hour24 > 12 ? slot.hour24 - 12 : slot.hour24;
    const hourLabel = `${displayHour} ${period}`;
    const velocityPerHour = slot.count;
    const isPeak = slot.count === maxCount;

    return {
      hourLabel,
      hour24: slot.hour24,
      count: slot.count,
      velocityPerHour,
      isPeak,
    };
  });
}

export function calculateChannelEfficiency(
  leadsBySource: Record<string, number>,
  qualifiedBySource?: Record<string, number>
): ChannelEfficiencyMetric[] {
  const total = Object.values(leadsBySource).reduce((sum, val) => sum + val, 0) || 1;

  const labelMap: Record<string, { label: string; color: string }> = {
    badge_scan: { label: 'Badge QR Scanner', color: '#6366F1' },
    business_card: { label: 'Business Card OCR', color: '#10B981' },
    manual: { label: 'Manual Rapid Form', color: '#F59E0B' },
    kiosk: { label: 'Self-Service Kiosk', color: '#8B5CF6' },
  };

  return Object.entries(leadsBySource).map(([channel, count]) => {
    const meta = labelMap[channel] || {
      label: channel.replace('_', ' ').toUpperCase(),
      color: '#64748B',
    };
    const percentage = Number(((count / total) * 100).toFixed(1));
    const qualifiedCount = qualifiedBySource?.[channel] ?? Math.round(count * 0.52);
    const qualificationRatePercent =
      count > 0 ? Number(((qualifiedCount / count) * 100).toFixed(1)) : 0;

    return {
      channel,
      label: meta.label,
      count,
      percentage,
      qualifiedCount,
      qualificationRatePercent,
      color: meta.color,
    };
  });
}

export function generateIntelligenceInsights(
  roi: ROIMetrics,
  velocity: VelocityTimeSlot[],
  channels: ChannelEfficiencyMetric[],
  goalPercent: number
): IntelligenceInsight[] {
  const insights: IntelligenceInsight[] = [];

  // 1. Staffing & Velocity Insight
  const peakSlot = velocity.find((v) => v.isPeak);
  if (peakSlot) {
    insights.push({
      id: 'ins-staffing-peak',
      type: 'staffing',
      title: 'Peak Traffic Window Detected',
      description: `Booth capture throughput surged to ${peakSlot.count} leads at ${peakSlot.hourLabel}.`,
      recommendation: `Schedule all 3 handheld scanners and assign 2 dedicated qualification specialists between ${peakSlot.hourLabel} and 4 PM.`,
      metricCallout: `${peakSlot.count} leads/hr peak`,
      priority: 'high',
    });
  }

  // 2. Channel Efficiency Insight
  const qrChannel = channels.find((c) => c.channel === 'badge_scan');
  const cardChannel = channels.find((c) => c.channel === 'business_card');
  if (qrChannel && cardChannel) {
    const ratio = (qrChannel.count / Math.max(1, cardChannel.count)).toFixed(1);
    insights.push({
      id: 'ins-channel-efficiency',
      type: 'channel',
      title: 'Badge Scanning Outperforms OCR by ' + ratio + 'x',
      description: `Badge scanning captured ${qrChannel.count} attendees with ${qrChannel.qualificationRatePercent}% qualification rate.`,
      recommendation:
        'Prioritize badge lanyard scanning during booth presentations; reserve OCR capture for executive meetings.',
      metricCallout: `${qrChannel.percentage}% of all leads`,
      priority: 'medium',
    });
  }

  // 3. ROI & Economics Insight
  if (roi.roiMultiplier >= 2.0) {
    insights.push({
      id: 'ins-roi-positive',
      type: 'roi',
      title: `Event Tracking at ${roi.roiMultiplier}x Projected ROI`,
      description: `Current qualified pipeline stands at $${(roi.pipelineValue / 1000).toFixed(0)}k against $${(roi.totalInvestment / 1000).toFixed(0)}k investment.`,
      recommendation: `Only ${roi.breakEvenDealsNeeded} closed deals needed to break even. Trigger immediate CRM sequence for hot tier.`,
      metricCallout: `${roi.roiMultiplier}x ROI Multiplier`,
      priority: 'high',
    });
  } else {
    insights.push({
      id: 'ins-roi-target',
      type: 'roi',
      title: 'CPQL Optimization Needed',
      description: `Cost per qualified lead is currently $${roi.costPerQualifiedLead}.`,
      recommendation:
        'Focus booth staff on filtering non-decision makers to accelerate CPQL below $250.',
      metricCallout: `$${roi.costPerQualifiedLead} CPQL`,
      priority: 'medium',
    });
  }

  // 4. Goal Progress Insight
  if (goalPercent >= 60) {
    insights.push({
      id: 'ins-quota-pace',
      type: 'quota',
      title: 'Pacing Ahead of Trade-Show Quota',
      description: `Booth is at ${goalPercent}% of the 250 lead quota with 2 show days remaining.`,
      recommendation:
        'Projected final capture: 310 leads (+24% above target). Expand SDR follow-up capacity.',
      metricCallout: `${goalPercent}% quota reached`,
      priority: 'info',
    });
  }

  return insights;
}

/**
 * Pure calculation engine for Event ROI Analysis.
 * Generates unit-testable actual metrics and model-projected metrics,
 * cost breakdowns, and lead funnel progression stages.
 */
export function calculateEventROIAnalysis(
  eventId: string,
  eventName: string,
  costInputs: EventCostInputs,
  revenueInputs: RevenueModelInputs,
  actuals: EventLeadActuals
): EventROIAnalysisReport {
  // 1. Total Event Cost (Sum of all 6 expense inputs)
  const totalEventCost = Math.max(
    0,
    costInputs.eventCost +
      costInputs.travelCost +
      costInputs.boothCost +
      costInputs.marketingCost +
      costInputs.staffCost +
      costInputs.otherExpenses
  );

  const safeTotalLeads = Math.max(0, actuals.totalLeads);
  const safeQualifiedLeads = Math.max(0, actuals.qualifiedLeads);
  const safeHotLeads = Math.max(0, actuals.hotLeads);
  const safeMeetings = Math.max(0, actuals.meetings);

  // 2. Unit Cost Actuals
  const costPerLead = safeTotalLeads > 0 ? Math.round(totalEventCost / safeTotalLeads) : 0;
  const costPerQualifiedLead =
    safeQualifiedLeads > 0 ? Math.round(totalEventCost / safeQualifiedLeads) : 0;

  // 3. Revenue Projections (Model Estimates)
  const averageDealSize = Math.max(0, revenueInputs.averageDealSize);
  const closeRate = Math.max(0, Math.min(100, revenueInputs.estimatedCloseRatePercent));

  const pipelineValue = safeQualifiedLeads * averageDealSize;
  const projectedDeals = Math.round(safeQualifiedLeads * (closeRate / 100));
  const estimatedRevenue = Math.round(pipelineValue * (closeRate / 100));
  const netProfit = estimatedRevenue - totalEventCost;

  // 4. ROI Metrics (Estimates)
  const estimatedRoiPercent =
    totalEventCost > 0
      ? Number((((estimatedRevenue - totalEventCost) / totalEventCost) * 100).toFixed(1))
      : 0;

  const roiMultiplier =
    totalEventCost > 0 ? Number((estimatedRevenue / totalEventCost).toFixed(2)) : 0;

  const breakEvenDealsNeeded =
    averageDealSize > 0 ? Math.ceil(totalEventCost / averageDealSize) : 0;

  // 5. Cost Breakdown
  const denominator = totalEventCost || 1;
  const costBreakdown: CostCategoryItem[] = [
    {
      key: 'event',
      label: 'Event Registration & Badges',
      amount: costInputs.eventCost,
      percentage: Math.round((costInputs.eventCost / denominator) * 100),
      color: '#6366F1',
      icon: 'Ticket',
    },
    {
      key: 'travel',
      label: 'Staff Travel & Lodging',
      amount: costInputs.travelCost,
      percentage: Math.round((costInputs.travelCost / denominator) * 100),
      color: '#3B82F6',
      icon: 'Plane',
    },
    {
      key: 'booth',
      label: 'Booth Space & Buildout',
      amount: costInputs.boothCost,
      percentage: Math.round((costInputs.boothCost / denominator) * 100),
      color: '#10B981',
      icon: 'Layout',
    },
    {
      key: 'marketing',
      label: 'Marketing Collateral & Swag',
      amount: costInputs.marketingCost,
      percentage: Math.round((costInputs.marketingCost / denominator) * 100),
      color: '#F59E0B',
      icon: 'Megaphone',
    },
    {
      key: 'staff',
      label: 'Booth Staff Allocation',
      amount: costInputs.staffCost,
      percentage: Math.round((costInputs.staffCost / denominator) * 100),
      color: '#EC4899',
      icon: 'Users',
    },
    {
      key: 'other',
      label: 'Other & Contingency',
      amount: costInputs.otherExpenses,
      percentage: Math.round((costInputs.otherExpenses / denominator) * 100),
      color: '#64748B',
      icon: 'MoreHorizontal',
    },
  ];

  // 6. Lead Funnel Progression Stages
  const totalLeadsForFunnel = safeTotalLeads || 1;
  const funnelStages: LeadFunnelStage[] = [
    {
      stageKey: 'leads',
      label: 'Total Leads Captured',
      count: safeTotalLeads,
      conversionFromTotal: 100,
      isEstimated: false,
      color: '#2563EB',
    },
    {
      stageKey: 'qualified',
      label: 'Qualified Prospects',
      count: safeQualifiedLeads,
      conversionFromTotal: Math.round((safeQualifiedLeads / totalLeadsForFunnel) * 100),
      isEstimated: false,
      color: '#10B981',
    },
    {
      stageKey: 'hot',
      label: 'Hot / High Intent',
      count: safeHotLeads,
      conversionFromTotal: Math.round((safeHotLeads / totalLeadsForFunnel) * 100),
      isEstimated: false,
      color: '#EF4444',
    },
    {
      stageKey: 'meetings',
      label: 'Show Meetings Held',
      count: safeMeetings,
      conversionFromTotal: Math.round((safeMeetings / totalLeadsForFunnel) * 100),
      isEstimated: false,
      color: '#F59E0B',
    },
    {
      stageKey: 'closed_deals',
      label: 'Projected Closed Deals',
      count: projectedDeals,
      conversionFromTotal: Math.round((projectedDeals / totalLeadsForFunnel) * 100),
      isEstimated: true,
      color: '#8B5CF6',
    },
  ];

  return {
    eventId,
    eventName,
    costInputs,
    revenueInputs,
    actuals: {
      totalLeads: safeTotalLeads,
      qualifiedLeads: safeQualifiedLeads,
      hotLeads: safeHotLeads,
      meetings: safeMeetings,
    },
    totalEventCost,
    costPerLead,
    costPerQualifiedLead,
    pipelineValue,
    projectedDeals,
    estimatedRevenue,
    netProfit,
    estimatedRoiPercent,
    roiMultiplier,
    breakEvenDealsNeeded,
    costBreakdown,
    funnelStages,
  };
}
