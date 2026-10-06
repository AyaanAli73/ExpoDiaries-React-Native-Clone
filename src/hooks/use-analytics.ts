import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { analyticsService } from '@/services/analytics.service';

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
