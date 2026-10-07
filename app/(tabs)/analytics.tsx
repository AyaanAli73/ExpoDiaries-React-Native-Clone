import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  BoothBarChart,
  IndustryBarChart,
  LeadVolumeChart,
  TeamActivityChart,
  TemperatureDonutChart,
} from '@/components/charts';
import { AppHeader } from '@/components/layout/app-header';
import { ResponsiveGrid } from '@/components/layout/responsive-grid';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  Icon,
  Skeleton,
} from '@/components/ui';
import { useAnalyticsDashboard } from '@/hooks/use-analytics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/use-responsive';
import { useAppStore } from '@/stores/use-app-store';
import { Colors, Radius, Spacing } from '@/theme';
import { TimeFilter } from '@/types/analytics';

type AnalyticsSection = 'overview' | 'event' | 'team' | 'lead';

const TIME_FILTER_OPTIONS: { key: TimeFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7days', label: '7 Days' },
  { key: 'event', label: 'Event' },
  { key: 'all_events', label: 'All Events' },
];

const SECTIONS: { key: AnalyticsSection; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: 'BarChart2' },
  { key: 'event', label: 'Event Analytics', icon: 'MapPin' },
  { key: 'team', label: 'Team Performance', icon: 'Users' },
  { key: 'lead', label: 'Lead Performance', icon: 'Target' },
];

export default function AnalyticsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { isTablet, isDesktop } = useResponsive();
  const activeEventId = useAppStore((state) => state.activeEventId);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('event');
  const [activeSection, setActiveSection] = useState<AnalyticsSection>('overview');

  // All aggregations and calculations are executed in AnalyticsService
  const { data: dashboard, isLoading } = useAnalyticsDashboard(
    timeFilter,
    activeEventId || 'evt-2026-ces'
  );

  if (isLoading || !dashboard) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Analytics & Intelligence"
            subtitle="Transforming trade-show interactions into business intelligence"
          />
        }>
        <View style={{ gap: Spacing.sm }}>
          <Skeleton width="100%" height={50} style={{ borderRadius: Radius.medium }} />
          <Skeleton width="100%" height={120} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={240} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={200} style={{ borderRadius: Radius.large }} />
        </View>
      </ScreenContainer>
    );
  }

  const {
    eventName,
    kpis,
    volumeOverTime,
    temperatureDistribution,
    leadsByIndustry,
    leadsByBooth,
    teamActivity,
    leaderboard,
  } = dashboard;

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Analytics & Intelligence"
          subtitle={`${eventName} • Real-time booth telemetry`}
          action={
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Button
                label="ROI"
                variant="outline"
                size="sm"
                leftIcon="DollarSign"
                onPress={() => router.push('/analytics/roi' as any)}
              />
              <Button
                label="Reports"
                variant="outline"
                size="sm"
                rightIcon="ChevronRight"
                onPress={() => router.push('/analytics/reports' as any)}
              />
            </View>
          }
        />
      }>
      {/* 1. Time Filters Row */}
      <View style={styles.timeFiltersRow}>
        <View style={styles.filterLabelCol}>
          <Icon name="Calendar" size={14} color={theme.textMuted} />
          <AppText variant="caption" color="secondary" weight="medium">
            Time Range:
          </AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeChipsScroll}>
          {TIME_FILTER_OPTIONS.map((opt) => (
            <Chip
              key={opt.key}
              label={opt.label}
              selected={timeFilter === opt.key}
              onPress={() => setTimeFilter(opt.key)}
              size="sm"
            />
          ))}
        </ScrollView>
      </View>

      {/* 2. Section Navigation Tabs */}
      <View style={styles.tabBar}>
        {SECTIONS.map((section) => (
          <Pressable
            key={section.key}
            accessibilityRole="tab"
            accessibilityLabel={section.label}
            onPress={() => setActiveSection(section.key)}
            style={[
              styles.tabItem,
              activeSection === section.key && {
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}>
            <Icon
              name={section.icon}
              size={15}
              color={activeSection === section.key ? theme.primary : theme.textMuted}
            />
            <AppText
              variant="caption"
              weight={activeSection === section.key ? 'bold' : 'medium'}
              color={activeSection === section.key ? 'primary' : 'secondary'}
              numberOfLines={1}>
              {section.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ============================================================ */}
        {/* SECTION 1: ANALYTICS OVERVIEW                                */}
        {/* ============================================================ */}
        {activeSection === 'overview' && (
          <Animated.View entering={FadeInDown.duration(260)} style={styles.sectionContainer}>
            {/* Primary 7 KPIs Grid */}
            <ResponsiveGrid gap={10} columns={isTablet || isDesktop ? 4 : 2}>
              {/* 1. Total Leads */}
              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Total Leads
                  </AppText>
                  <AppText variant="title" weight="bold" tabular>
                    {kpis.totalLeads}
                  </AppText>
                  <Badge label={kpis.totalLeadsDelta || '+18% vs benchmark'} variant="primary" size="sm" />
                </CardContent>
              </Card>

              {/* 2. Hot Leads */}
              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Hot Leads
                  </AppText>
                  <AppText variant="title" weight="bold" color="primary" tabular>
                    {kpis.hotLeads}
                  </AppText>
                  <Badge label={kpis.hotLeadsDelta || 'High Intent'} variant="danger" size="sm" />
                </CardContent>
              </Card>

              {/* 3. Warm Leads */}
              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Warm Leads
                  </AppText>
                  <AppText variant="title" weight="bold" tabular>
                    {kpis.warmLeads}
                  </AppText>
                  <Badge label={`${Math.round((kpis.warmLeads / (kpis.totalLeads || 1)) * 100)}% of total`} variant="warning" size="sm" />
                </CardContent>
              </Card>

              {/* 4. Cold Leads */}
              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Cold Leads
                  </AppText>
                  <AppText variant="title" weight="bold" tabular>
                    {kpis.coldLeads}
                  </AppText>
                  <Badge label={`${Math.round((kpis.coldLeads / (kpis.totalLeads || 1)) * 100)}% informational`} variant="outline" size="sm" />
                </CardContent>
              </Card>

              {/* 5. Meetings */}
              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Meetings
                  </AppText>
                  <AppText variant="title" weight="bold" color="success" tabular>
                    {kpis.meetings}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    Scheduled on show floor
                  </AppText>
                </CardContent>
              </Card>

              {/* 6. Follow-ups */}
              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Follow-ups
                  </AppText>
                  <AppText variant="title" weight="bold" tabular>
                    {kpis.followUps}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    Pending SLA deadlines
                  </AppText>
                </CardContent>
              </Card>

              {/* 7. Conversion Rate */}
              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Conversion Rate
                  </AppText>
                  <AppText variant="title" weight="bold" color="primary" tabular>
                    {kpis.conversionRate}%
                  </AppText>
                  <Badge label={kpis.conversionRateDelta || 'High Velocity'} variant="success" size="sm" />
                </CardContent>
              </Card>
            </ResponsiveGrid>

            {/* Chart 1: Lead Volume Over Time */}
            <Card density="comfortable">
              <CardHeader>
                <View style={styles.cardHeaderFlex}>
                  <View style={{ gap: 2 }}>
                    <CardTitle level={2}>Lead Volume Over Time</CardTitle>
                    <AppText variant="caption" color="secondary">
                      Capture velocity & throughput across {timeFilter.replace('_', ' ')}
                    </AppText>
                  </View>
                  <Badge label="HOURLY & DAILY" variant="primary" size="sm" />
                </View>
              </CardHeader>
              <CardContent>
                <LeadVolumeChart data={volumeOverTime} />
              </CardContent>
            </Card>

            {/* Chart 2: Temperature Distribution */}
            <Card density="comfortable">
              <CardHeader>
                <View style={styles.cardHeaderFlex}>
                  <View style={{ gap: 2 }}>
                    <CardTitle level={2}>Temperature Distribution</CardTitle>
                    <AppText variant="caption" color="secondary">
                      Lead pipeline qualification & buying readiness
                    </AppText>
                  </View>
                  <Badge label="PIPELINE QUALIFICATION" variant="outline" size="sm" />
                </View>
              </CardHeader>
              <CardContent>
                <TemperatureDonutChart distribution={temperatureDistribution} />
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {/* ============================================================ */}
        {/* SECTION 2: EVENT ANALYTICS                                   */}
        {/* ============================================================ */}
        {activeSection === 'event' && (
          <Animated.View entering={FadeInDown.duration(260)} style={styles.sectionContainer}>
            {/* Event Summary Banner */}
            <Card
              density="comfortable"
              style={[
                styles.eventBannerCard,
                { backgroundColor: theme.primarySubtle, borderColor: theme.primary },
              ]}>
              <CardContent style={styles.eventBannerContent}>
                <View style={styles.eventBannerTop}>
                  <View style={{ gap: 2 }}>
                    <AppText variant="caption" color="secondary" weight="semibold">
                      ACTIVE EVENT TELEMETRY
                    </AppText>
                    <CardTitle level={2}>{eventName}</CardTitle>
                  </View>
                  <Badge label="IN PROGRESS" variant="success" size="sm" showDot />
                </View>

                <View style={styles.goalSection}>
                  <View style={styles.goalLabels}>
                    <AppText variant="caption" color="secondary">
                      Target Lead Goal ({kpis.totalLeads} of 250 leads)
                    </AppText>
                    <AppText variant="caption" weight="bold" tabular>
                      {Math.min(100, Math.round((kpis.totalLeads / 250) * 100))}%
                    </AppText>
                  </View>
                  <View style={[styles.goalTrack, { backgroundColor: theme.surface }]}>
                    <View
                      style={[
                        styles.goalFill,
                        {
                          width: `${Math.min(100, Math.round((kpis.totalLeads / 250) * 100))}%`,
                          backgroundColor: theme.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Chart 4: Leads by Booth Station */}
            <Card density="comfortable">
              <CardHeader>
                <View style={styles.cardHeaderFlex}>
                  <View style={{ gap: 2 }}>
                    <CardTitle level={2}>Leads by Booth Station</CardTitle>
                    <AppText variant="caption" color="secondary">
                      Traffic & scanner engagement across stations & demo pods
                    </AppText>
                  </View>
                  <Badge label="STATION TELEMETRY" variant="primary" size="sm" />
                </View>
              </CardHeader>
              <CardContent>
                <BoothBarChart data={leadsByBooth} />
              </CardContent>
            </Card>

            {/* Volume Trend in Event Context */}
            <Card density="comfortable">
              <CardHeader>
                <CardTitle level={2}>Event Throughput Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadVolumeChart data={volumeOverTime} />
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {/* ============================================================ */}
        {/* SECTION 3: TEAM PERFORMANCE                                 */}
        {/* ============================================================ */}
        {activeSection === 'team' && (
          <Animated.View entering={FadeInDown.duration(260)} style={styles.sectionContainer}>
            {/* Team Summary Row */}
            <ResponsiveGrid gap={10} columns={3}>
              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Active Staff
                  </AppText>
                  <AppText variant="title" weight="bold" tabular>
                    {teamActivity.length}
                  </AppText>
                  <Badge label="ON ROSTER" variant="primary" size="sm" />
                </CardContent>
              </Card>

              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Avg. Scans / Rep
                  </AppText>
                  <AppText variant="title" weight="bold" tabular>
                    {Math.round(kpis.totalLeads / (teamActivity.length || 1))}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    Throughput
                  </AppText>
                </CardContent>
              </Card>

              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Top Producer
                  </AppText>
                  <AppText variant="body" weight="bold" numberOfLines={1}>
                    {leaderboard[0]?.staffName || 'Alex Mercer'}
                  </AppText>
                  <Badge label="#1 RANK" variant="success" size="sm" showDot />
                </CardContent>
              </Card>
            </ResponsiveGrid>

            {/* Chart 5: Team Activity Chart */}
            <Card density="comfortable">
              <CardHeader>
                <View style={styles.cardHeaderFlex}>
                  <View style={{ gap: 2 }}>
                    <CardTitle level={2}>Team Activity & Throughput</CardTitle>
                    <AppText variant="caption" color="secondary">
                      Scans, meetings booked, and follow-ups by booth representative
                    </AppText>
                  </View>
                  <Badge label="ACTIVITY MULTI-METRIC" variant="primary" size="sm" />
                </View>
              </CardHeader>
              <CardContent>
                <TeamActivityChart data={teamActivity} />
              </CardContent>
            </Card>

            {/* Representative Leaderboard Table */}
            <Card density="comfortable">
              <CardHeader>
                <CardTitle level={2}>Representative Leaderboard</CardTitle>
              </CardHeader>
              <CardContent style={styles.leaderboardList}>
                {leaderboard.map((member, index) => (
                  <View key={member.staffId} style={styles.leaderRow}>
                    <View style={styles.leaderLeft}>
                      <Badge
                        label={`#${index + 1}`}
                        variant={index === 0 ? 'primary' : 'outline'}
                        size="sm"
                      />
                      <Avatar name={member.staffName} size="sm" />
                      <View style={{ gap: 2 }}>
                        <AppText weight="bold" variant="body">
                          {member.staffName}
                        </AppText>
                        <AppText variant="caption" color="secondary">
                          {member.qualifiedCount} qualified ({member.conversionRate}% rate)
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.leaderRight}>
                      <AppText weight="bold" variant="body" tabular>
                        {member.leadsCaptured}
                      </AppText>
                      <AppText variant="caption" color="muted">
                        leads
                      </AppText>
                    </View>
                  </View>
                ))}
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {/* ============================================================ */}
        {/* SECTION 4: LEAD PERFORMANCE                                  */}
        {/* ============================================================ */}
        {activeSection === 'lead' && (
          <Animated.View entering={FadeInDown.duration(260)} style={styles.sectionContainer}>
            {/* Lead Quality KPI Summary */}
            <ResponsiveGrid gap={10} columns={3}>
              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Conversion Rate
                  </AppText>
                  <AppText variant="title" weight="bold" color="primary" tabular>
                    {kpis.conversionRate}%
                  </AppText>
                  <Badge label="QUALIFIED RATIO" variant="success" size="sm" />
                </CardContent>
              </Card>

              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Hot Prospects
                  </AppText>
                  <AppText variant="title" weight="bold" color="primary" tabular>
                    {kpis.hotLeads}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    Immediate pipeline
                  </AppText>
                </CardContent>
              </Card>

              <Card density="compact">
                <CardContent style={styles.kpiCard}>
                  <AppText variant="caption" color="secondary">
                    Scheduled Follow-ups
                  </AppText>
                  <AppText variant="title" weight="bold" tabular>
                    {kpis.followUps}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    Actions pending
                  </AppText>
                </CardContent>
              </Card>
            </ResponsiveGrid>

            {/* Chart 3: Leads by Industry */}
            <Card density="comfortable">
              <CardHeader>
                <View style={styles.cardHeaderFlex}>
                  <View style={{ gap: 2 }}>
                    <CardTitle level={2}>Leads by Industry & Vertical</CardTitle>
                    <AppText variant="caption" color="secondary">
                      Attendee domain concentration and target market interest
                    </AppText>
                  </View>
                  <Badge label="VERTICAL SEGMENTATION" variant="primary" size="sm" />
                </View>
              </CardHeader>
              <CardContent>
                <IndustryBarChart data={leadsByIndustry} />
              </CardContent>
            </Card>

            {/* Temperature Distribution Deep-Dive */}
            <Card density="comfortable">
              <CardHeader>
                <CardTitle level={2}>Lead Qualification Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <TemperatureDonutChart distribution={temperatureDistribution} />
              </CardContent>
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  timeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: Spacing.xs,
  },
  filterLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeChipsScroll: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    paddingRight: Spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  sectionContainer: {
    gap: Spacing.sm,
  },
  kpiCard: {
    gap: 4,
    alignItems: 'flex-start',
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  eventBannerCard: {
    borderWidth: 1.5,
  },
  eventBannerContent: {
    gap: Spacing.sm,
  },
  eventBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalSection: {
    gap: 6,
  },
  goalLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 4,
  },
  leaderboardList: {
    gap: Spacing.xs + 4,
  },
  leaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  leaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  leaderRight: {
    alignItems: 'flex-end',
  },
});
