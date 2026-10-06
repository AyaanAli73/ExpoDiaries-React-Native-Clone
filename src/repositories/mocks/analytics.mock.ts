import { AnalyticsMetric, EventAnalyticsSummary, StaffPerformance } from '@/types/analytics';

export const mockAnalyticsMetrics: AnalyticsMetric[] = [
  {
    id: 'met-1',
    eventId: 'evt-2026-ces',
    companyId: 'comp-acme-1',
    metricKey: 'total_leads',
    label: 'Total Leads Captured',
    value: 164,
    delta: '+24.5%',
    deltaType: 'increase',
    deltaPeriod: 'vs yesterday',
    category: 'leads',
    timestamp: '2026-10-16T17:00:00.000Z',
  },
  {
    id: 'met-2',
    eventId: 'evt-2026-ces',
    companyId: 'comp-acme-1',
    metricKey: 'qualified_leads',
    label: 'Qualified Prospects',
    value: 86,
    delta: '+18.2%',
    deltaType: 'increase',
    deltaPeriod: '52.4% qualification rate',
    category: 'leads',
    timestamp: '2026-10-16T17:00:00.000Z',
  },
  {
    id: 'met-3',
    eventId: 'evt-2026-ces',
    companyId: 'comp-acme-1',
    metricKey: 'hourly_velocity',
    label: 'Hourly Capture Velocity',
    value: '14.2 / hr',
    delta: '+3.1 / hr',
    deltaType: 'increase',
    deltaPeriod: 'peak at 14:00',
    category: 'engagement',
    timestamp: '2026-10-16T17:00:00.000Z',
  },
  {
    id: 'met-4',
    eventId: 'evt-2026-ces',
    companyId: 'comp-acme-1',
    metricKey: 'target_progress',
    label: 'Lead Goal Progress',
    value: '65.6%',
    delta: '164 of 250 goal',
    deltaType: 'neutral',
    deltaPeriod: '2 days remaining',
    category: 'conversion',
    timestamp: '2026-10-16T17:00:00.000Z',
  },
];

export const mockEventSummary: EventAnalyticsSummary = {
  eventId: 'evt-2026-ces',
  totalLeads: 164,
  targetGoal: 250,
  goalProgressPercent: 65.6,
  qualifiedLeads: 86,
  hourlyCaptureVelocity: 14.2,
  topTags: [
    { tag: 'Enterprise', count: 48 },
    { tag: 'Decision Maker', count: 36 },
    { tag: 'CTO', count: 29 },
    { tag: 'Q1 Timeline', count: 24 },
    { tag: 'VIP', count: 18 },
  ],
  leadsBySource: {
    badge_scan: 98,
    business_card: 42,
    manual: 24,
  },
};

export const mockStaffPerformance: StaffPerformance[] = [
  { staffId: 'usr-alex-1', staffName: 'Alex Mercer', leadsCaptured: 68, qualifiedCount: 38, averageScore: 84 },
  { staffId: 'usr-elena-2', staffName: 'Elena Rostova', leadsCaptured: 54, qualifiedCount: 29, averageScore: 78 },
  { staffId: 'usr-david-3', staffName: 'David Chen', leadsCaptured: 42, qualifiedCount: 19, averageScore: 72 },
];
