import { analyticsRepository, IAnalyticsRepository } from '@/repositories/analytics.repository';
import { AnalyticsMetric, EventAnalyticsSummary, StaffPerformance } from '@/types/analytics';

export class AnalyticsService {
  constructor(private repo: IAnalyticsRepository = analyticsRepository) {}

  async getMetrics(companyId?: string, eventId?: string): Promise<AnalyticsMetric[]> {
    return this.repo.getMetrics(companyId, eventId);
  }

  async getEventSummary(eventId: string): Promise<EventAnalyticsSummary> {
    return this.repo.getEventSummary(eventId);
  }

  async getStaffPerformance(eventId: string): Promise<StaffPerformance[]> {
    return this.repo.getStaffPerformance(eventId);
  }

  async getLeadGoalProgress(eventId: string): Promise<{ goal: number; current: number; percentage: number }> {
    const summary = await this.repo.getEventSummary(eventId);
    return {
      goal: summary.targetGoal,
      current: summary.totalLeads,
      percentage: summary.goalProgressPercent,
    };
  }
}

export const analyticsService = new AnalyticsService();
