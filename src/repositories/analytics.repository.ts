import { apiClient } from '@/lib/api-client';
import {
  mockAnalyticsMetrics,
  mockEventSummary,
  mockStaffPerformance,
} from '@/repositories/mocks/analytics.mock';
import { AnalyticsMetric, EventAnalyticsSummary, StaffPerformance } from '@/types/analytics';
import { Lead } from '@/types/lead';

export interface IAnalyticsRepository {
  getMetrics(companyId?: string, eventId?: string): Promise<AnalyticsMetric[]>;
  getEventSummary(eventId: string): Promise<EventAnalyticsSummary>;
  getStaffPerformance(eventId: string): Promise<StaffPerformance[]>;
  recordLeadCaptured(lead: Lead): Promise<void>;
}

class AnalyticsRepository implements IAnalyticsRepository {
  private metrics: AnalyticsMetric[] = [...mockAnalyticsMetrics];

  async getMetrics(companyId?: string, eventId?: string): Promise<AnalyticsMetric[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);
      let result = [...this.metrics];
      if (companyId) result = result.filter((m) => m.companyId === companyId);
      if (eventId) result = result.filter((m) => m.eventId === eventId);
      return result;
    }
    return apiClient.request<AnalyticsMetric[]>('/analytics/metrics');
  }

  async getEventSummary(eventId: string): Promise<EventAnalyticsSummary> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);
      return {
        ...mockEventSummary,
        eventId,
      };
    }
    return apiClient.request<EventAnalyticsSummary>(`/analytics/events/${eventId}/summary`);
  }

  async getStaffPerformance(eventId: string): Promise<StaffPerformance[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      return [...mockStaffPerformance];
    }
    return apiClient.request<StaffPerformance[]>(`/analytics/events/${eventId}/staff`);
  }

  async recordLeadCaptured(lead: Lead): Promise<void> {
    if (apiClient.isMock) {
      // 1. Update total leads metric
      const totalMetric = this.metrics.find((m) => m.metricKey === 'total_leads');
      if (totalMetric && typeof totalMetric.value === 'number') {
        totalMetric.value += 1;
      }

      // 2. Update qualified leads metric if hot or warm
      if (lead.temperature === 'hot' || lead.temperature === 'warm') {
        const qualifiedMetric = this.metrics.find((m) => m.metricKey === 'qualified_leads');
        if (qualifiedMetric && typeof qualifiedMetric.value === 'number') {
          qualifiedMetric.value += 1;
        }
      }

      // 3. Update event summary
      mockEventSummary.totalLeads += 1;
      if (lead.temperature === 'hot' || lead.temperature === 'warm') {
        mockEventSummary.qualifiedLeads += 1;
      }
      mockEventSummary.goalProgressPercent = Math.min(
        100,
        Math.round((mockEventSummary.totalLeads / mockEventSummary.targetGoal) * 100)
      );

      // 4. Update leads by source
      const src = lead.captureSource || 'business_card';
      mockEventSummary.leadsBySource[src] = (mockEventSummary.leadsBySource[src] || 0) + 1;

      // 5. Update target progress metric
      const targetMetric = this.metrics.find((m) => m.metricKey === 'target_progress');
      if (targetMetric) {
        targetMetric.value = `${mockEventSummary.goalProgressPercent}%`;
        targetMetric.delta = `${mockEventSummary.totalLeads} of ${mockEventSummary.targetGoal} goal`;
      }
      return;
    }
    return apiClient.request<void>('/analytics/record-lead', {
      method: 'POST',
      body: JSON.stringify({ leadId: lead.id, eventId: lead.eventId }),
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
