import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { analyticsService } from '@/services/analytics.service';
import {
  EventCostInputs,
  RevenueModelInputs,
  TimeFilter,
} from '@/types/analytics';

export const analyticsQueryKeys = queryKeys.analytics;

export function useAnalyticsMetrics(companyId?: string, eventId?: string) {
  return useQuery({
    queryKey: queryKeys.analytics.metrics(companyId, eventId),
    queryFn: () => analyticsService.getMetrics(companyId, eventId),
  });
}

export function useEventAnalytics(eventId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(eventId),
    queryFn: () => analyticsService.getEventSummary(eventId),
    enabled: Boolean(eventId),
  });
}

export function useStaffPerformance(eventId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.staff(eventId),
    queryFn: () => analyticsService.getStaffPerformance(eventId),
    enabled: Boolean(eventId),
  });
}

export function useLeadGoalProgress(eventId: string) {
  return useQuery({
    queryKey: [...queryKeys.analytics.summary(eventId), 'goal-progress'],
    queryFn: () => analyticsService.getLeadGoalProgress(eventId),
    enabled: Boolean(eventId),
  });
}

export function useEventRoiReport(eventId: string, dealSizeOverride?: number) {
  return useQuery({
    queryKey: queryKeys.analytics.roiReport(eventId, dealSizeOverride),
    queryFn: () => analyticsService.getEventROIReport(eventId, dealSizeOverride),
    enabled: Boolean(eventId),
  });
}

export function useEventEconomics(eventId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.economics(eventId),
    queryFn: () => analyticsService.getEventEconomics(eventId),
    enabled: Boolean(eventId),
  });
}

export function useIntelligenceInsights(eventId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.insights(eventId),
    queryFn: () => analyticsService.getIntelligenceInsights(eventId),
    enabled: Boolean(eventId),
  });
}

export function useAnalyticsDashboard(filter: TimeFilter = 'event', eventId?: string) {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(filter, eventId),
    queryFn: () => analyticsService.getAnalyticsDashboard(filter, eventId),
  });
}

export function useEventROIAnalysis(
  eventId: string,
  costOverrides?: Partial<EventCostInputs>,
  revenueOverrides?: Partial<RevenueModelInputs>
) {
  return useQuery({
    queryKey: queryKeys.analytics.roiAnalysis(eventId, costOverrides, revenueOverrides),
    queryFn: () =>
      analyticsService.getEventROIAnalysis(eventId, costOverrides, revenueOverrides),
    enabled: Boolean(eventId),
  });
}

