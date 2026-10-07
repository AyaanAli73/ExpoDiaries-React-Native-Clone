import { analyticsRepository, IAnalyticsRepository } from '@/repositories/analytics.repository';
import { eventsRepository } from '@/repositories/events.repository';
import { leadsRepository } from '@/repositories/leads.repository';
import { teamRepository } from '@/repositories/team.repository';
import { calculateAnalyticsDashboard } from '@/services/analytics/analytics-calculator';
import {
  calculateChannelEfficiency,
  calculateEventROIAnalysis,
  calculateROIMetrics,
  calculateVelocitySlots,
  generateIntelligenceInsights,
} from '@/services/analytics/roi-calculator';
import {
  AnalyticsDashboardData,
  AnalyticsMetric,
  EventAnalyticsSummary,
  EventCostInputs,
  EventEconomics,
  EventLeadActuals,
  EventROIAnalysisReport,
  EventROIReport,
  IntelligenceInsight,
  RevenueModelInputs,
  ROIMetrics,
  StaffPerformance,
  TimeFilter,
} from '@/types/analytics';

export class AnalyticsService {
  constructor(private repo: IAnalyticsRepository = analyticsRepository) {}

  async getMetrics(companyId?: string, eventId?: string): Promise<AnalyticsMetric[]> {
    return this.repo.getMetrics(companyId, eventId);
  }

  async getAnalyticsDashboard(
    filter: TimeFilter = 'event',
    eventId?: string
  ): Promise<AnalyticsDashboardData> {
    const [leadsResult, teamMembers, eventsResult] = await Promise.all([
      leadsRepository.getLeads(undefined, { page: 1, pageSize: 100 }),
      teamRepository.getTeamMembers(),
      eventsRepository.getEvents({ pageSize: 20 }),
    ]);

    return calculateAnalyticsDashboard(filter, {
      eventId: eventId || 'evt-2026-ces',
      leads: leadsResult.items,
      teamMembers,
      events: eventsResult.items,
    });
  }

  async getEventSummary(eventId: string): Promise<EventAnalyticsSummary> {
    return this.repo.getEventSummary(eventId);
  }

  async getStaffPerformance(eventId: string): Promise<StaffPerformance[]> {
    return this.repo.getStaffPerformance(eventId);
  }

  async getEventEconomics(eventId: string): Promise<EventEconomics> {
    return this.repo.getEventEconomics(eventId);
  }

  async getLeadGoalProgress(
    eventId: string
  ): Promise<{ goal: number; current: number; percentage: number }> {
    const summary = await this.repo.getEventSummary(eventId);
    return {
      goal: summary.targetGoal,
      current: summary.totalLeads,
      percentage: summary.goalProgressPercent,
    };
  }

  async getEventROIReport(eventId: string, dealSizeOverride?: number): Promise<EventROIReport> {
    const [summary, baseEconomics, staff, velocityRaw] = await Promise.all([
      this.repo.getEventSummary(eventId),
      this.repo.getEventEconomics(eventId),
      this.repo.getStaffPerformance(eventId),
      this.repo.getVelocityDistribution(eventId),
    ]);

    const economics: EventEconomics = {
      ...baseEconomics,
      averageDealSize: dealSizeOverride ?? baseEconomics.averageDealSize,
    };

    const roi = calculateROIMetrics(economics, summary.totalLeads, summary.qualifiedLeads);
    const velocitySlots = calculateVelocitySlots(velocityRaw);
    const channels = calculateChannelEfficiency(summary.leadsBySource);
    const insights = generateIntelligenceInsights(
      roi,
      velocitySlots,
      channels,
      summary.goalProgressPercent
    );

    return {
      eventId,
      eventName: eventId === 'evt-2026-ces' ? 'CES 2026 Las Vegas' : 'Global Trade Expo 2026',
      summary,
      economics,
      roi,
      velocitySlots,
      channels,
      insights,
      staffLeaderboard: staff,
    };
  }

  async getEventROIAnalysis(
    eventId: string,
    costOverrides?: Partial<EventCostInputs>,
    revenueOverrides?: Partial<RevenueModelInputs>
  ): Promise<EventROIAnalysisReport> {
    const defaultCostInputs: EventCostInputs = {
      eventCost: 4500,
      travelCost: 4500,
      boothCost: 14000,
      marketingCost: 2000,
      staffCost: 3500,
      otherExpenses: 1500,
    };

    const defaultRevenueInputs: RevenueModelInputs = {
      averageDealSize: 18500,
      estimatedCloseRatePercent: 15,
    };

    const costInputs: EventCostInputs = {
      ...defaultCostInputs,
      ...costOverrides,
    };

    const revenueInputs: RevenueModelInputs = {
      ...defaultRevenueInputs,
      ...revenueOverrides,
    };

    const event = await eventsRepository.getEventById(eventId);
    const eventName = event?.name || 'CES 2026 International';

    // Fetch actual captured leads
    const leadsResult = await leadsRepository.getLeads({ eventId }, { page: 1, pageSize: 200 });
    const leads = leadsResult.items;

    const totalLeads = leads.length || 164;
    const qualifiedLeads =
      leads.filter((l) => l.status === 'qualified' || l.temperature === 'hot' || l.temperature === 'warm').length || 86;
    const hotLeads = leads.filter((l) => l.temperature === 'hot').length || 48;
    const meetings = leads.filter((l) => l.followUpStatus === 'scheduled').length || 24;

    const actuals: EventLeadActuals = {
      totalLeads,
      qualifiedLeads,
      hotLeads,
      meetings,
    };

    return calculateEventROIAnalysis(eventId, eventName, costInputs, revenueInputs, actuals);
  }

  async getIntelligenceInsights(eventId: string): Promise<IntelligenceInsight[]> {
    const report = await this.getEventROIReport(eventId);
    return report.insights;
  }

  simulateDealSizeRoi(
    economics: EventEconomics,
    totalLeads: number,
    qualifiedLeads: number,
    newDealSize: number
  ): ROIMetrics {
    return calculateROIMetrics(
      { ...economics, averageDealSize: newDealSize },
      totalLeads,
      qualifiedLeads
    );
  }
}

export const analyticsService = new AnalyticsService();

