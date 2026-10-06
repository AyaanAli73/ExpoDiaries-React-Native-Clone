import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { ResponsiveGrid } from '@/components/layout/responsive-grid';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Divider,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  type IconName,
  Skeleton,
  StatCard,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useActiveEvent,
  useEvents,
  useItinerary,
} from '@/hooks/use-events';
import { useFollowUps, useLeads } from '@/hooks/use-leads';
import { useResponsive } from '@/hooks/use-responsive';
import { useAppStore } from '@/stores/use-app-store';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { Event } from '@/types/event';
import { Lead } from '@/types/lead';

type PipelineFilter = 'all' | 'hot' | 'warm' | 'cold';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: IconName;
  type: 'lead' | 'event' | 'meeting' | 'sync';
  read: boolean;
}

const DASHBOARD_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'dnotif-1',
    title: 'Hot Lead Captured',
    message: 'Marcus Vance reached qualification score 92 (CTO, SolarDrive Tech).',
    time: '5m ago',
    icon: 'Flame',
    type: 'lead',
    read: false,
  },
  {
    id: 'dnotif-2',
    title: 'Booth Shift Live',
    message: 'Shift 2 at North Hall #N-408 is active with 4 staff members on duty.',
    time: '20m ago',
    icon: 'Clock',
    type: 'event',
    read: false,
  },
  {
    id: 'dnotif-3',
    title: 'Upcoming Meeting',
    message: 'Executive Roundtable in LVCC Executive Lounge Suite 4 begins at 12:30.',
    time: '45m ago',
    icon: 'Calendar',
    type: 'meeting',
    read: false,
  },
  {
    id: 'dnotif-4',
    title: 'Offline Sync Success',
    message: 'All 164 attendee badge records are synchronized with enterprise cloud.',
    time: '1h ago',
    icon: 'CheckCircle2',
    type: 'sync',
    read: true,
  },
];

export default function MainDashboardScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { isTablet, isDesktop } = useResponsive();
  const isLarge = isTablet || isDesktop;

  const user = useAuthStore((state) => state.user);
  const activeWorkspace = useAppStore((state) => state.activeWorkspace);

  // Data Queries
  const {
    data: activeEvent,
    isLoading: loadingEvent,
    isError: errorEvent,
    refetch: refetchEvent,
  } = useActiveEvent();

  const {
    data: leadsData,
    isLoading: loadingLeads,
    isError: errorLeads,
    refetch: refetchLeads,
  } = useLeads(activeEvent ? { eventId: activeEvent.id } : undefined);

  const {
    data: itineraryData,
    isLoading: loadingItinerary,
    refetch: refetchItinerary,
  } = useItinerary(activeEvent?.id || 'evt-2026-ces');

  const {
    data: followUpsData,
    isLoading: loadingFollowUps,
    refetch: refetchFollowUps,
  } = useFollowUps();

  const {
    data: eventsData,
    isLoading: loadingEvents,
    refetch: refetchEvents,
  } = useEvents();

  // Local State
  const [refreshing, setRefreshing] = useState(false);
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DASHBOARD_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchEvent(),
      refetchLeads(),
      refetchItinerary(),
      refetchFollowUps(),
      refetchEvents(),
    ]);
    setRefreshing(false);
    setToastMessage('Dashboard metrics synchronized');
  };

  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Formatted Greeting and Date
  const { greeting, formattedDate } = useMemo(() => {
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const name = user?.name ? user.name.split(' ')[0] : 'Alex';

    const dateStr = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());

    return {
      greeting: `${greet}, ${name}`,
      formattedDate: dateStr,
    };
  }, [user]);

  // Lead Pipeline Calculations
  const leads = useMemo(() => leadsData?.items || [], [leadsData]);

  const {
    hotLeads,
    warmLeads,
    coldLeads,
    hotPct,
    warmPct,
    coldPct,
    totalLeadsCount,
  } = useMemo(() => {
    const hot = leads.filter(
      (l) => l.score >= 75 || l.priority === 'urgent' || l.priority === 'high'
    );
    const warm = leads.filter((l) => l.score >= 40 && l.score < 75 && l.priority !== 'urgent');
    const cold = leads.filter((l) => l.score < 40);

    const total = leads.length || 1;
    const hPct = Math.round((hot.length / total) * 100);
    const wPct = Math.round((warm.length / total) * 100);
    const cPct = Math.max(0, 100 - hPct - wPct);

    return {
      hotLeads: hot,
      warmLeads: warm,
      coldLeads: cold,
      hotPct: hPct,
      warmPct: wPct,
      coldPct: cPct,
      totalLeadsCount: leads.length,
    };
  }, [leads]);

  // Filtered Leads by Selected Pipeline
  const displayedLeads = useMemo(() => {
    if (pipelineFilter === 'hot') return hotLeads;
    if (pipelineFilter === 'warm') return warmLeads;
    if (pipelineFilter === 'cold') return coldLeads;
    return leads;
  }, [pipelineFilter, hotLeads, warmLeads, coldLeads, leads]);

  // Event calculations
  const totalCaptured = activeEvent?.totalLeadsCaptured ?? 164;
  const leadGoal = activeEvent?.leadGoal ?? 250;
  const goalPercent = Math.min(100, Math.round((totalCaptured / leadGoal) * 100));

  // Days remaining calculation
  const { daysRemainingText, dayOfShowText, formattedEventDates } = useMemo(() => {
    if (!activeEvent) {
      return {
        daysRemainingText: '2 Days Remaining',
        dayOfShowText: 'Day 2 of 4',
        formattedEventDates: 'Oct 4 – Oct 8, 2026',
      };
    }

    const start = new Date(activeEvent.startDate);
    const end = new Date(activeEvent.endDate);
    const now = new Date();

    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.max(1, Math.min(totalDays, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
    const remaining = Math.max(0, totalDays - elapsedDays);

    const dateRangeStr = `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(start)} – ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(end)}`;

    return {
      daysRemainingText: remaining > 0 ? `${remaining} Days Remaining` : 'Final Day',
      dayOfShowText: `Day ${elapsedDays} of ${totalDays}`,
      formattedEventDates: dateRangeStr,
    };
  }, [activeEvent]);

  // Scheduled Meetings & Pending Follow-ups
  const scheduledMeetings = useMemo(() => {
    return (itineraryData || []).filter(
      (i) => i.category === 'meeting' || i.category === 'keynote' || i.category === 'booth_duty'
    );
  }, [itineraryData]);

  const pendingFollowUps = useMemo(() => {
    return (followUpsData || []).filter((f) => f.status !== 'completed');
  }, [followUpsData]);

  // Upcoming Expos (Excluding Active)
  const upcomingExpos = useMemo(() => {
    return (eventsData?.items || []).filter(
      (e) => e.id !== activeEvent?.id && e.status !== 'completed'
    );
  }, [eventsData, activeEvent]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Toast Feedback */}
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        duration={3000}
        onDismiss={() => setToastMessage(null)}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingHorizontal: isLarge ? Spacing.xl : Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }>
        {/* ============================================================ */}
        {/* 1. HEADER (Greeting, Date, Avatar, Notifications)            */}
        {/* ============================================================ */}
        <Animated.View
          entering={FadeInDown.duration(300).springify().damping(18)}
          style={[styles.heroHeader, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.heroTextCol}>
            <View style={styles.heroMetaRow}>
              <Badge label="BOOTH SHIFT LIVE" variant="success" size="sm" showDot />
              <AppText variant="caption" color="secondary" tabular>
                {activeEvent?.boothNumber || 'North Hall #N-408'}
              </AppText>
            </View>
            <AppText weight="bold" variant="title" style={styles.greetingTitle}>
              {greeting}
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.dateSubtitle}>
              {formattedDate} • {activeWorkspace.name}
            </AppText>
          </View>

          <View style={styles.heroActionCol}>
            {/* Notifications Button */}
            <View style={styles.notifWrapper}>
              <IconButton
                icon="Bell"
                size="sm"
                variant="outline"
                accessibilityLabel={`Notifications (${unreadNotifCount} unread)`}
                onPress={() => setShowNotifications(true)}
              />
              {unreadNotifCount > 0 && (
                <View style={[styles.notifBadge, { backgroundColor: theme.danger }]}>
                  <AppText weight="bold" style={styles.notifBadgeText}>
                    {unreadNotifCount}
                  </AppText>
                </View>
              )}
            </View>

            {/* User Avatar */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`User profile: ${user?.name || 'Alex Mercer'}`}
              onPress={() => router.push('/(tabs)/profile')}
              style={({ pressed }) => [
                styles.avatarPressable,
                { opacity: pressed ? 0.8 : 1 },
              ]}>
              <Avatar
                name={user?.name || 'Alex Mercer'}
                source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined}
                size="md"
              />
              <View
                style={[
                  styles.avatarOnlineDot,
                  { backgroundColor: theme.success, borderColor: theme.surface },
                ]}
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* Global Sync Error Warning if any */}
        {(errorEvent || errorLeads) && (
          <Animated.View entering={FadeIn.duration(250)} style={styles.sectionMargin}>
            <ErrorState
              variant="banner"
              title="Telemetry Warning"
              message="Some field metrics could not be fetched. Check connectivity."
              onRetry={handleRefresh}
              retryLabel="Retry Sync"
            />
          </Animated.View>
        )}

        {/* ============================================================ */}
        {/* 2. ACTIVE EVENT CARD                                         */}
        {/* ============================================================ */}
        <Animated.View
          entering={FadeInDown.duration(320).delay(60).springify().damping(18)}
          style={styles.sectionMargin}>
          {loadingEvent ? (
            <Card variant="elevated">
              <CardContent style={{ gap: Spacing.sm, padding: Spacing.md }}>
                <Skeleton width="100%" height={160} style={{ borderRadius: Radius.medium }} />
                <Skeleton width={180} height={24} style={{ marginTop: Spacing.sm }} />
                <Skeleton width={260} height={16} />
                <Skeleton width="100%" height={10} style={{ marginTop: Spacing.sm }} />
              </CardContent>
            </Card>
          ) : activeEvent ? (
            <Card variant="elevated" style={styles.activeEventCard}>
              {/* Event Image Banner with Scrim Overlay */}
              <View style={styles.eventImageContainer}>
                <Image
                  source={{
                    uri:
                      activeEvent.bannerUrl ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
                  }}
                  style={styles.eventImage}
                  contentFit="cover"
                  transition={300}
                />
                <View style={styles.imageOverlayGradient} />

                {/* Overlaid Badges Row */}
                <View style={styles.overlaidBadges}>
                  <Badge label="ACTIVE BOOTH" variant="success" size="sm" showDot />
                  <Badge label={daysRemainingText} variant="primary" size="sm" />
                  <Badge label={dayOfShowText} variant="outline" size="sm" />
                </View>

                {/* Overlaid Bottom Title */}
                <View style={styles.overlaidTextContainer}>
                  <AppText weight="bold" style={styles.overlaidEventTitle} numberOfLines={1}>
                    {activeEvent.name}
                  </AppText>
                  <View style={styles.overlaidVenueRow}>
                    <Icon name="MapPin" size={13} color="#FFFFFF" />
                    <AppText variant="caption" style={styles.overlaidVenueText} numberOfLines={1}>
                      {activeEvent.venue || activeEvent.location} • {activeEvent.location}
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Card Body: Details & Lead Goal Progress */}
              <CardContent style={styles.eventCardBody}>
                {/* Meta details bar */}
                <View style={styles.eventDetailsRow}>
                  <View style={styles.eventDetailItem}>
                    <Icon name="Calendar" size={14} color={theme.primary} />
                    <AppText variant="caption" weight="medium">
                      {formattedEventDates}
                    </AppText>
                  </View>
                  <View style={styles.eventDetailDivider} />
                  <View style={styles.eventDetailItem}>
                    <Icon name="MapPin" size={14} color={theme.primary} />
                    <AppText variant="caption" weight="bold">
                      {activeEvent.boothNumber || 'Booth Assigned'}
                    </AppText>
                  </View>
                  <View style={styles.eventDetailDivider} />
                  <View style={styles.eventDetailItem}>
                    <Icon name="Users" size={14} color={theme.primary} />
                    <AppText variant="caption" weight="medium">
                      {activeEvent.activeStaffCount} Staff on Duty
                    </AppText>
                  </View>
                </View>

                {/* Lead Goal Progress Track */}
                <View style={styles.goalSection}>
                  <View style={styles.goalHeaderRow}>
                    <AppText variant="caption" weight="bold" color="secondary">
                      BOOTH LEAD CAPTURE TARGET
                    </AppText>
                    <AppText variant="caption" weight="bold" tabular style={{ color: theme.primary }}>
                      {totalCaptured} / {leadGoal} ({goalPercent}%)
                    </AppText>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: theme.secondary }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${goalPercent}%`,
                          backgroundColor: theme.primary,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.goalFooterRow}>
                    <AppText variant="caption" color="muted">
                      {Math.max(0, leadGoal - totalCaptured)} leads needed to reach quota
                    </AppText>
                    <View style={styles.paceBadge}>
                      <Icon name="Zap" size={12} color={theme.success} />
                      <AppText variant="caption" weight="bold" tabular color="primary">
                        14.2 leads / hr pace
                      </AppText>
                    </View>
                  </View>
                </View>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon="CalendarX"
              title="No Active Event Booth"
              description="Connect an exhibition or trade show booth to monitor lead activity."
              actionLabel="Browse Events"
              onAction={() => router.push('/(tabs)/events')}
            />
          )}
        </Animated.View>

        {/* ============================================================ */}
        {/* 3. QUICK ACTIONS                                             */}
        {/* ============================================================ */}
        <Animated.View
          entering={FadeInDown.duration(320).delay(100).springify().damping(18)}
          style={styles.sectionMargin}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Icon name="Sparkles" size={18} color={theme.primary} />
              <CardTitle level={2}>Field Quick Actions</CardTitle>
            </View>
            <Badge label="RAPID WORKFLOW" variant="outline" size="sm" />
          </View>

          <View style={styles.quickActionsGrid}>
            {/* Action 1: Scan Business Card */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Scan Business Card"
              onPress={() => router.push('/(tabs)/capture')}
              style={({ pressed }) => [
                styles.quickActionCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
                Shadows.subtle,
              ]}>
              <View style={[styles.quickActionIconBox, { backgroundColor: theme.primarySubtle }]}>
                <Icon name="Camera" size={20} color={theme.primary} />
              </View>
              <View style={styles.quickActionTextCol}>
                <AppText weight="bold" variant="body" style={styles.quickActionTitle}>
                  Scan Card
                </AppText>
                <AppText variant="caption" color="secondary">
                  OCR Business Card
                </AppText>
              </View>
            </Pressable>

            {/* Action 2: Add Lead */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add Lead manually"
              onPress={() => router.push('/capture/manual')}
              style={({ pressed }) => [
                styles.quickActionCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
                Shadows.subtle,
              ]}>
              <View style={[styles.quickActionIconBox, { backgroundColor: theme.primarySubtle }]}>
                <Icon name="UserPlus" size={20} color={theme.primary} />
              </View>
              <View style={styles.quickActionTextCol}>
                <AppText weight="bold" variant="body" style={styles.quickActionTitle}>
                  Add Lead
                </AppText>
                <AppText variant="caption" color="secondary">
                  Manual Entry Form
                </AppText>
              </View>
            </Pressable>

            {/* Action 3: Events */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View All Events"
              onPress={() => router.push('/(tabs)/events')}
              style={({ pressed }) => [
                styles.quickActionCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
                Shadows.subtle,
              ]}>
              <View style={[styles.quickActionIconBox, { backgroundColor: theme.secondary }]}>
                <Icon name="Calendar" size={20} color={theme.textPrimary} />
              </View>
              <View style={styles.quickActionTextCol}>
                <AppText weight="bold" variant="body" style={styles.quickActionTitle}>
                  Events
                </AppText>
                <AppText variant="caption" color="secondary">
                  Expos & Booths
                </AppText>
              </View>
            </Pressable>

            {/* Action 4: Analytics */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View Analytics"
              onPress={() => router.push('/analytics')}
              style={({ pressed }) => [
                styles.quickActionCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
                Shadows.subtle,
              ]}>
              <View style={[styles.quickActionIconBox, { backgroundColor: theme.secondary }]}>
                <Icon name="BarChart3" size={20} color={theme.textPrimary} />
              </View>
              <View style={styles.quickActionTextCol}>
                <AppText weight="bold" variant="body" style={styles.quickActionTitle}>
                  Analytics
                </AppText>
                <AppText variant="caption" color="secondary">
                  Traffic & ROI
                </AppText>
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* ============================================================ */}
        {/* 4. KPI SECTION (Total Leads, Hot Leads, Meetings, Follow-ups)*/}
        {/* ============================================================ */}
        <Animated.View
          entering={FadeInDown.duration(320).delay(140).springify().damping(18)}
          style={styles.sectionMargin}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Icon name="Activity" size={18} color={theme.primary} />
              <CardTitle level={2}>Operational Metrics</CardTitle>
            </View>
            <AppText variant="caption" color="muted">
              Live Trade-Show Telemetry
            </AppText>
          </View>

          <ResponsiveGrid gap={12} columns={isLarge ? 4 : 2}>
            {/* Total Leads */}
            <StatCard
              title="Total Leads"
              value={totalCaptured}
              delta="+24.5%"
              deltaType="increase"
              deltaPeriod="vs yesterday"
              icon="Users"
              loading={loadingEvent || loadingLeads}
              interactive
              onPress={() => router.push('/(tabs)/leads')}
            />

            {/* Hot Leads */}
            <StatCard
              title="Hot Leads"
              value={hotLeads.length || 28}
              delta="+12 today"
              deltaType="increase"
              deltaPeriod="Score ≥ 75"
              icon="Flame"
              loading={loadingLeads}
              interactive
              onPress={() => {
                setPipelineFilter('hot');
              }}
            />

            {/* Meetings */}
            <StatCard
              title="Meetings"
              value={scheduledMeetings.length || 8}
              delta="3 completed"
              deltaType="neutral"
              deltaPeriod="5 pending today"
              icon="CalendarCheck"
              loading={loadingItinerary}
              interactive
              onPress={() => setToastMessage('Navigating to daily meeting itinerary')}
            />

            {/* Follow-ups */}
            <StatCard
              title="Follow-ups"
              value={pendingFollowUps.length || 14}
              delta="4 due today"
              deltaType="decrease"
              deltaPeriod="actionable tasks"
              icon="CheckSquare"
              loading={loadingFollowUps}
              interactive
              onPress={() => setToastMessage('Pending trade-show follow-ups active')}
            />
          </ResponsiveGrid>
        </Animated.View>

        {/* ============================================================ */}
        {/* 5. LEAD PIPELINE (Hot, Warm, Cold)                           */}
        {/* ============================================================ */}
        <Animated.View
          entering={FadeInDown.duration(320).delay(180).springify().damping(18)}
          style={styles.sectionMargin}>
          <Card variant="elevated" style={styles.pipelineCard}>
            <CardHeader style={styles.pipelineHeader}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleWithIcon}>
                  <Icon name="Filter" size={18} color={theme.primary} />
                  <CardTitle level={2}>Lead Qualification Pipeline</CardTitle>
                </View>
                <Badge label={`${totalLeadsCount} INGESTED`} variant="outline" />
              </View>
              <CardDescription>
                Live attendee segmentation categorized by automated trade-show scoring.
              </CardDescription>
            </CardHeader>

            <CardContent style={styles.pipelineContent}>
              {/* Segmented Pipeline Bar */}
              <View style={styles.pipelineBarContainer}>
                <View style={styles.pipelineBarTrack}>
                  <View style={[styles.pipelineSegment, { width: `${hotPct}%`, backgroundColor: theme.danger }]} />
                  <View style={[styles.pipelineSegment, { width: `${warmPct}%`, backgroundColor: theme.warning }]} />
                  <View style={[styles.pipelineSegment, { width: `${coldPct}%`, backgroundColor: theme.info }]} />
                </View>

                {/* Percentage Labels */}
                <View style={styles.pipelineLegendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.danger }]} />
                    <AppText variant="caption" weight="bold">
                      Hot: {hotLeads.length} ({hotPct}%)
                    </AppText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.warning }]} />
                    <AppText variant="caption" weight="bold">
                      Warm: {warmLeads.length} ({warmPct}%)
                    </AppText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.info }]} />
                    <AppText variant="caption" weight="bold">
                      Cold: {coldLeads.length} ({coldPct}%)
                    </AppText>
                  </View>
                </View>
              </View>

              <Divider style={{ marginVertical: Spacing.xs }} />

              {/* Pipeline Interactive Tabs */}
              <View style={styles.pipelineFilterRow}>
                <Button
                  label={`All (${totalLeadsCount})`}
                  variant={pipelineFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setPipelineFilter('all')}
                  style={styles.filterBtn}
                />
                <Button
                  label={`Hot (${hotLeads.length})`}
                  variant={pipelineFilter === 'hot' ? 'primary' : 'outline'}
                  size="sm"
                  leftIcon="Flame"
                  onPress={() => setPipelineFilter('hot')}
                  style={styles.filterBtn}
                />
                <Button
                  label={`Warm (${warmLeads.length})`}
                  variant={pipelineFilter === 'warm' ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setPipelineFilter('warm')}
                  style={styles.filterBtn}
                />
                <Button
                  label={`Cold (${coldLeads.length})`}
                  variant={pipelineFilter === 'cold' ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setPipelineFilter('cold')}
                  style={styles.filterBtn}
                />
              </View>

              {/* Selected Stage Detail Insight */}
              <View
                style={[
                  styles.stageInsightCard,
                  {
                    backgroundColor: theme.secondary,
                    borderColor: theme.border,
                  },
                ]}>
                <View style={styles.stageInsightHeader}>
                  <Icon
                    name={pipelineFilter === 'hot' ? 'Flame' : pipelineFilter === 'warm' ? 'Sparkles' : 'Inbox'}
                    size={16}
                    color={pipelineFilter === 'hot' ? theme.danger : theme.primary}
                  />
                  <AppText variant="caption" weight="bold">
                    {pipelineFilter === 'hot'
                      ? 'High purchase intent • C-Level & VP decision makers requiring immediate handoff'
                      : pipelineFilter === 'warm'
                        ? 'Product evaluation • Requested whitepapers & post-conference demo webinars'
                        : pipelineFilter === 'cold'
                          ? 'General attendee drop-in • Long-term educational newsletter nurture'
                          : 'Complete booth attendee roster sorted by capture timestamp'}
                  </AppText>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* 6. RECENT LEADS                                              */}
        {/* ============================================================ */}
        <Animated.View
          entering={FadeInDown.duration(320).delay(220).springify().damping(18)}
          style={styles.sectionMargin}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Icon name="Users" size={18} color={theme.primary} />
              <CardTitle level={2}>Recent Leads</CardTitle>
              <Badge label={`${displayedLeads.length} Available`} variant="outline" />
            </View>
            <Button
              label="View All Leads"
              variant="ghost"
              size="sm"
              rightIcon="ChevronRight"
              onPress={() => router.push('/(tabs)/leads')}
            />
          </View>

          {loadingLeads ? (
            <View style={{ gap: Spacing.sm }}>
              <Skeleton width="100%" height={92} style={{ borderRadius: Radius.medium }} />
              <Skeleton width="100%" height={92} style={{ borderRadius: Radius.medium }} />
            </View>
          ) : displayedLeads.length === 0 ? (
            <EmptyState
              icon="Users"
              title="No Leads in This Stage"
              description="Ingest new attendee badges via QR scan or business card OCR to populate this view."
              actionLabel="Scan Badge"
              onAction={() => router.push('/(tabs)/capture')}
            />
          ) : (
            <View style={styles.recentList}>
              {displayedLeads.slice(0, 4).map((lead: Lead) => {
                const isHot = lead.score >= 75;
                const scoreVariant = isHot ? 'success' : lead.score >= 40 ? 'warning' : 'outline';

                return (
                  <Card
                    key={lead.id}
                    interactive
                    onPress={() => router.push(`/leads/${lead.id}` as never)}
                    style={styles.leadCard}>
                    <CardContent style={styles.leadCardContent}>
                      <View style={styles.leadTopRow}>
                        <View style={styles.leadInfoCol}>
                          <Avatar name={`${lead.firstName} ${lead.lastName}`} size="md" />
                          <View style={styles.leadTextCol}>
                            <View style={styles.leadNameBadgeRow}>
                              <AppText weight="bold" variant="body">
                                {lead.firstName} {lead.lastName}
                              </AppText>
                              <Badge
                                label={`SCORE ${lead.score}`}
                                variant={scoreVariant}
                                size="sm"
                              />
                            </View>
                            <AppText variant="caption" color="secondary" numberOfLines={1}>
                              {lead.title} • {lead.company}
                            </AppText>
                          </View>
                        </View>

                        <Badge
                          label={lead.priority.toUpperCase()}
                          variant={lead.priority === 'urgent' ? 'danger' : lead.priority === 'high' ? 'warning' : 'outline'}
                          size="sm"
                        />
                      </View>

                      {lead.notes && (
                        <AppText
                          variant="caption"
                          color="secondary"
                          numberOfLines={2}
                          style={styles.leadNotesQuote}>
                          “{lead.notes}”
                        </AppText>
                      )}

                      <View style={styles.leadMetaStrip}>
                        <View style={styles.leadMetaItem}>
                          <Icon name="QrCode" size={12} color={theme.textMuted} />
                          <AppText variant="caption" color="muted">
                            {lead.captureSource.replace('_', ' ')}
                          </AppText>
                        </View>
                        <View style={styles.leadMetaItem}>
                          <Icon name="Tag" size={12} color={theme.textMuted} />
                          <AppText variant="caption" color="muted" numberOfLines={1}>
                            {lead.tags.slice(0, 2).join(', ')}
                          </AppText>
                        </View>
                        <View style={styles.leadMetaItem}>
                          <Icon name="Clock" size={12} color={theme.textMuted} />
                          <AppText variant="caption" color="muted">
                            Today
                          </AppText>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* ============================================================ */}
        {/* 7. UPCOMING EVENTS                                           */}
        {/* ============================================================ */}
        <Animated.View
          entering={FadeInDown.duration(320).delay(260).springify().damping(18)}
          style={styles.sectionMargin}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Icon name="Compass" size={18} color={theme.primary} />
              <CardTitle level={2}>Upcoming Expos & Conferences</CardTitle>
            </View>
            <Button
              label="Explore All"
              variant="ghost"
              size="sm"
              rightIcon="ChevronRight"
              onPress={() => router.push('/(tabs)/events')}
            />
          </View>

          {loadingEvents ? (
            <Skeleton width="100%" height={94} style={{ borderRadius: Radius.medium }} />
          ) : upcomingExpos.length === 0 ? (
            <EmptyState
              icon="CalendarPlus"
              title="No Upcoming Events"
              description="Schedule upcoming trade show participations to organize staff logistics."
              actionLabel="Add Event"
              onAction={() => router.push('/events/new')}
            />
          ) : (
            <View style={styles.recentList}>
              {upcomingExpos.map((evt: Event) => (
                <Card
                  key={evt.id}
                  interactive
                  onPress={() => router.push(`/events/${evt.id}` as never)}
                  style={styles.upcomingEventCard}>
                  <CardContent style={styles.upcomingContentRow}>
                    <View style={styles.upcomingImageWrapper}>
                      <Image
                        source={{
                          uri:
                            evt.bannerUrl ||
                            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
                        }}
                        style={styles.upcomingThumb}
                        contentFit="cover"
                        transition={200}
                      />
                    </View>

                    <View style={styles.upcomingTextCol}>
                      <View style={styles.upcomingBadgeRow}>
                        <Badge label="UPCOMING" variant="primary" size="sm" />
                        <AppText variant="caption" color="muted" tabular>
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                          }).format(new Date(evt.startDate))}
                        </AppText>
                      </View>
                      <AppText weight="bold" variant="body" numberOfLines={1}>
                        {evt.name}
                      </AppText>
                      <AppText variant="caption" color="secondary" numberOfLines={1}>
                        {evt.venue || evt.location} • {evt.location}
                      </AppText>
                    </View>

                    <View style={styles.upcomingChevron}>
                      <Badge label={`GOAL: ${evt.leadGoal}`} variant="outline" size="sm" />
                      <Icon name="ChevronRight" size={16} color={theme.textMuted} />
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ============================================================ */}
      {/* NOTIFICATIONS MODAL                                          */}
      {/* ============================================================ */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowNotifications(false)}>
          <Pressable
            style={[
              styles.notifModalCard,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
              Shadows.elevated,
            ]}
            onPress={(e) => e.stopPropagation()}>
            <CardHeader style={styles.notifHeader}>
              <View style={styles.notifHeaderRow}>
                <View style={styles.notifTitleRow}>
                  <Icon name="Bell" size={18} color={theme.primary} />
                  <CardTitle level={3}>Shift Notifications</CardTitle>
                </View>
                {unreadNotifCount > 0 && (
                  <Button
                    label="Mark All Read"
                    variant="ghost"
                    size="sm"
                    onPress={markAllNotifsRead}
                  />
                )}
              </View>
            </CardHeader>

            <Divider />

            <CardContent style={styles.notifModalList}>
              {notifications.map((item) => {
                const iconColor =
                  item.type === 'lead'
                    ? theme.danger
                    : item.type === 'event'
                      ? theme.warning
                      : item.type === 'meeting'
                        ? theme.primary
                        : theme.success;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.notifModalItem,
                      {
                        backgroundColor: item.read ? 'transparent' : theme.primarySubtle,
                        borderColor: theme.border,
                      },
                    ]}>
                    <View style={[styles.notifIconContainer, { backgroundColor: theme.secondary }]}>
                      <Icon name={item.icon} size={16} color={iconColor} />
                    </View>
                    <View style={styles.notifItemDetails}>
                      <View style={styles.notifItemTopRow}>
                        <AppText weight="bold" variant="caption" numberOfLines={1}>
                          {item.title}
                        </AppText>
                        <AppText variant="caption" color="muted">
                          {item.time}
                        </AppText>
                      </View>
                      <AppText variant="caption" color="secondary" numberOfLines={2}>
                        {item.message}
                      </AppText>
                    </View>
                  </View>
                );
              })}
            </CardContent>

            <Divider />

            <View style={styles.notifModalFooter}>
              <Button
                label="Dismiss"
                variant="outline"
                size="sm"
                onPress={() => setShowNotifications(false)}
                style={{ width: '100%' }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  sectionMargin: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  // 1. HERO HEADER
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.large,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  heroTextCol: {
    flex: 1,
    gap: 3,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  greetingTitle: {
    letterSpacing: -0.4,
    fontSize: 19,
  },
  dateSubtitle: {
    lineHeight: 16,
  },
  heroActionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifWrapper: {
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
  },
  avatarPressable: {
    position: 'relative',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },

  // 2. ACTIVE EVENT CARD
  activeEventCard: {
    overflow: 'hidden',
    padding: 0,
  },
  eventImageContainer: {
    width: '100%',
    height: 175,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  overlaidBadges: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  overlaidTextContainer: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.md,
    right: Spacing.md,
    gap: 2,
  },
  overlaidEventTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  overlaidVenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overlaidVenueText: {
    color: '#E2E8F0',
  },
  eventCardBody: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#94A3B840',
  },
  goalSection: {
    gap: 6,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  goalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  paceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // 3. QUICK ACTIONS
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm + 2,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  quickActionIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTextCol: {
    flex: 1,
    gap: 2,
  },
  quickActionTitle: {
    fontSize: 13,
  },

  // 5. LEAD PIPELINE
  pipelineCard: {
    gap: Spacing.xs,
  },
  pipelineHeader: {
    paddingBottom: Spacing.xs,
  },
  pipelineContent: {
    gap: Spacing.sm,
  },
  pipelineBarContainer: {
    gap: Spacing.xs,
  },
  pipelineBarTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  pipelineSegment: {
    height: '100%',
  },
  pipelineLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pipelineFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterBtn: {
    flex: 1,
    minWidth: 70,
  },
  stageInsightCard: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  stageInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  // 6. RECENT LEADS
  recentList: {
    gap: Spacing.sm,
  },
  leadCard: {
    borderRadius: Radius.medium,
  },
  leadCardContent: {
    padding: Spacing.md,
    gap: Spacing.xs + 2,
  },
  leadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leadInfoCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  leadTextCol: {
    flex: 1,
    gap: 2,
  },
  leadNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  leadNotesQuote: {
    fontStyle: 'italic',
    lineHeight: 16,
  },
  leadMetaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: 2,
  },
  leadMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // 7. UPCOMING EVENTS
  upcomingEventCard: {
    borderRadius: Radius.medium,
  },
  upcomingContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  upcomingImageWrapper: {
    width: 54,
    height: 54,
    borderRadius: Radius.small,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  upcomingThumb: {
    width: '100%',
    height: '100%',
  },
  upcomingTextCol: {
    flex: 1,
    gap: 2,
  },
  upcomingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upcomingChevron: {
    alignItems: 'flex-end',
    gap: 6,
  },

  // NOTIFICATIONS MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  notifModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radius.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notifHeader: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  notifModalList: {
    padding: Spacing.xs,
    gap: 4,
  },
  notifModalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.medium,
  },
  notifIconContainer: {
    width: 28,
    height: 28,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifItemDetails: {
    flex: 1,
    gap: 2,
  },
  notifItemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifModalFooter: {
    padding: Spacing.sm,
  },
});
