export const ROUTES = {
  auth: {
    login: '/(auth)/login' as const,
    register: '/(auth)/register' as const,
    forgotPassword: '/(auth)/forgot-password' as const,
  },
  tabs: {
    dashboard: '/(tabs)' as const,
    events: '/(tabs)/events' as const,
    leads: '/(tabs)/leads' as const,
    analytics: '/(tabs)/analytics' as const,
    profile: '/(tabs)/profile' as const,
  },
  events: {
    detail: (id: string) => `/events/${id}` as const,
    new: '/events/new' as const,
  },
  leads: {
    detail: (id: string) => `/leads/${id}` as const,
    export: '/leads/export' as const,
  },
  capture: {
    index: '/capture' as const,
    manual: '/capture/manual' as const,
  },
  analytics: {
    reports: '/analytics/reports' as const,
  },
  profile: {
    edit: '/profile/edit' as const,
    team: '/profile/team' as const,
    security: '/profile/security' as const,
  },
} as const;
