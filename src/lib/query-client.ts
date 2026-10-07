import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error) => {
        // Do not retry on 404s or 401s
        if (error instanceof Error && (error.message.includes('404') || error.message.includes('401'))) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Standardized Query Key Factory
 * Single source of truth for all cache keys across the application
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.events.lists(), { params }] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
    active: () => [...queryKeys.events.all, 'active'] as const,
    exhibitors: (eventId: string) => [...queryKeys.events.detail(eventId), 'exhibitors'] as const,
    exhibitorDetail: (eventId: string, exhibitorId: string) =>
      [...queryKeys.events.exhibitors(eventId), exhibitorId] as const,
    itinerary: (eventId: string) => [...queryKeys.events.detail(eventId), 'itinerary'] as const,
    booths: (eventId: string) => [...queryKeys.events.detail(eventId), 'booths'] as const,
  },
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.leads.lists(), { filters }] as const,
    details: () => [...queryKeys.leads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.leads.details(), id] as const,
    notes: (leadId: string) => [...queryKeys.leads.detail(leadId), 'notes'] as const,
    activities: (leadId: string) => [...queryKeys.leads.detail(leadId), 'activities'] as const,
    attachments: (leadId: string) => [...queryKeys.leads.detail(leadId), 'attachments'] as const,
    followUps: (leadId?: string) =>
      leadId ? [...queryKeys.leads.detail(leadId), 'follow-ups'] as const : ['follow-ups'] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    metrics: (companyId?: string, eventId?: string) =>
      [...queryKeys.analytics.all, 'metrics', { companyId, eventId }] as const,
    summary: (eventId: string) => [...queryKeys.analytics.all, 'summary', eventId] as const,
    staff: (eventId: string) => [...queryKeys.analytics.all, 'staff', eventId] as const,
    roiReport: (eventId: string, dealSizeOverride?: number) =>
      [...queryKeys.analytics.all, 'roi-report', eventId, { dealSizeOverride }] as const,
    economics: (eventId: string) => [...queryKeys.analytics.all, 'economics', eventId] as const,
    insights: (eventId: string) => [...queryKeys.analytics.all, 'insights', eventId] as const,
    dashboard: (filter: string, eventId?: string) =>
      [...queryKeys.analytics.all, 'dashboard', { filter, eventId }] as const,
    roiAnalysis: (eventId: string, costOverrides?: unknown, revenueOverrides?: unknown) =>
      [...queryKeys.analytics.all, 'roi-analysis', eventId, { costOverrides, revenueOverrides }] as const,
  },
  team: {
    all: ['team'] as const,
    list: (companyId?: string) => [...queryKeys.team.all, 'list', { companyId }] as const,
    detail: (id: string) => [...queryKeys.team.all, 'detail', id] as const,
  },
  company: {
    all: ['company'] as const,
    detail: (id?: string) => [...queryKeys.company.all, id || 'current'] as const,
  },
} as const;
