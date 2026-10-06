import React, { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { ExpoFloorVisualizer } from '@/components/events/expo-floor-visualizer';
import { PersonalItineraryTimeline } from '@/components/events/personal-itinerary-timeline';
import { ResponsiveGrid } from '@/components/layout/responsive-grid';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Chip,
  Divider,
  EmptyState,
  Icon,
  IconButton,
  Input,
  Skeleton,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useEvent,
  useExhibitors,
  useItinerary,
  useToggleBookmarkEvent,
  useToggleBookmarkExhibitor,
  useToggleBookmarkItinerary,
  useToggleExhibitorItinerary,
} from '@/hooks/use-events';
import { useResponsive } from '@/hooks/use-responsive';
import { Colors, Radius, Spacing } from '@/theme';
import { Exhibitor } from '@/types/exhibitor';
import { ItineraryCategory, ItineraryItem } from '@/types/itinerary';

type TabKey =
  | 'overview'
  | 'exhibitors'
  | 'schedule'
  | 'saved_exhibitors'
  | 'itinerary'
  | 'floor';

const TABS: { value: TabKey; label: string; icon: string }[] = [
  { value: 'overview', label: 'Overview', icon: 'Info' },
  { value: 'exhibitors', label: 'Exhibitors', icon: 'Building2' },
  { value: 'schedule', label: 'Schedule', icon: 'Calendar' },
  { value: 'saved_exhibitors', label: 'Saved Exhibitors', icon: 'Bookmark' },
  { value: 'itinerary', label: 'Itinerary', icon: 'Clock' },
  { value: 'floor', label: 'Floor Plan', icon: 'Map' },
];

export default function EventDetailScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { isTablet, isDesktop } = useResponsive();

  const { id, initialTab } = useLocalSearchParams<{ id: string; initialTab?: TabKey }>();
  const eventId = id || 'evt-2026-ces';

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab || 'overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Queries
  const { data: event, isLoading: loadingEvent } = useEvent(eventId);
  const { data: exhibitors = [], isLoading: loadingExhibitors } = useExhibitors(eventId);
  const { data: itinerary = [], isLoading: loadingItinerary } = useItinerary(eventId);

  // Mutations
  const toggleBookmarkEventMutation = useToggleBookmarkEvent();
  const toggleBookmarkExhibitorMutation = useToggleBookmarkExhibitor();
  const toggleBookmarkItineraryMutation = useToggleBookmarkItinerary();
  const toggleExhibitorItineraryMutation = useToggleExhibitorItinerary();

  // Exhibitor Directory filter states
  const [exhibitorSearch, setExhibitorSearch] = useState('');
  const [selectedExhibitorCat, setSelectedExhibitorCat] = useState('All');
  const [exhibitorsSavedOnly, setExhibitorsSavedOnly] = useState(false);

  // Conference Schedule filter states
  const [scheduleDay, setScheduleDay] = useState<'day1' | 'day2'>('day1');
  const [selectedScheduleTrack, setSelectedScheduleTrack] = useState<string>('all');

  // Floor state
  const [selectedFloorBoothNumber, setSelectedFloorBoothNumber] = useState<string | undefined>(
    undefined
  );

  // Saved Exhibitors memo
  const savedExhibitors = useMemo(() => {
    return exhibitors.filter((ex) => ex.isBookmarked);
  }, [exhibitors]);

  // Personal itinerary items (bookmarked sessions + scheduled booth meetings + booth shift duties)
  const personalItinerary = useMemo(() => {
    return itinerary.filter(
      (item) => item.isBookmarked || item.category === 'meeting' || item.category === 'booth_duty'
    );
  }, [itinerary]);

  // Format dates
  const formattedDates = useMemo(() => {
    if (!event) return '';
    try {
      const s = new Date(event.startDate);
      const e = new Date(event.endDate);
      const sFormatted = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(s);
      const eFormatted = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(e);
      return `${sFormatted} – ${eFormatted}`;
    } catch {
      return `${event.startDate} – ${event.endDate}`;
    }
  }, [event]);

  // Filtered Exhibitors (Search by name, category, booth number, hall, or tags)
  const filteredExhibitors = useMemo(() => {
    return exhibitors.filter((ex) => {
      const query = exhibitorSearch.toLowerCase().trim();
      const matchSearch =
        !query ||
        ex.name.toLowerCase().includes(query) ||
        ex.category.toLowerCase().includes(query) ||
        ex.boothNumber.toLowerCase().includes(query) ||
        (ex.hall && ex.hall.toLowerCase().includes(query)) ||
        ex.tags.some((t) => t.toLowerCase().includes(query));

      const matchCat =
        selectedExhibitorCat === 'All' || ex.category.toLowerCase() === selectedExhibitorCat.toLowerCase();

      const matchSaved = !exhibitorsSavedOnly || ex.isBookmarked;

      return matchSearch && matchCat && matchSaved;
    });
  }, [exhibitors, exhibitorSearch, selectedExhibitorCat, exhibitorsSavedOnly]);

  const exhibitorCategories = useMemo(() => {
    const cats = new Set<string>();
    exhibitors.forEach((ex) => cats.add(ex.category));
    return ['All', ...Array.from(cats)];
  }, [exhibitors]);

  // Filtered Conference Schedule (All sessions for day & track)
  const filteredSchedule = useMemo(() => {
    return itinerary.filter((item) => {
      const isDay1 = item.startTime.includes('2026-10-04') || item.startTime.includes('2026-11-04');
      const isDay2 = item.startTime.includes('2026-10-05') || item.startTime.includes('2026-11-05');

      const matchDay = scheduleDay === 'day1' ? isDay1 : isDay2;
      const matchTrack = selectedScheduleTrack === 'all' || item.category === selectedScheduleTrack;

      return matchDay && matchTrack;
    });
  }, [itinerary, scheduleDay, selectedScheduleTrack]);


  // Handlers
  const handleToggleEventBookmark = async () => {
    if (!event) return;
    try {
      await toggleBookmarkEventMutation.mutateAsync(event.id);
      setToastMessage(
        event.isBookmarked ? 'Removed from saved expos' : 'Saved to conference bookmarks'
      );
    } catch {
      setToastMessage('Could not update bookmark');
    }
  };

  const handleToggleExhibitorBookmark = async (ex: Exhibitor) => {
    try {
      await toggleBookmarkExhibitorMutation.mutateAsync(ex.id);
      setToastMessage(
        ex.isBookmarked
          ? `Removed “${ex.name}” from target exhibitors`
          : `Saved “${ex.name}” to target exhibitors`
      );
    } catch {
      setToastMessage('Could not update exhibitor bookmark');
    }
  };

  const handleToggleExhibitorItinerary = async (ex: Exhibitor) => {
    try {
      const res = await toggleExhibitorItineraryMutation.mutateAsync({
        eventId: ex.eventId || eventId,
        exhibitorId: ex.id,
      });
      setToastMessage(
        res.inItinerary
          ? `Added ${ex.name} booth visit to your itinerary`
          : `Removed ${ex.name} from your itinerary`
      );
    } catch {
      setToastMessage('Could not update itinerary');
    }
  };

  const handleToggleItineraryBookmark = async (item: ItineraryItem) => {
    try {
      await toggleBookmarkItineraryMutation.mutateAsync(item.id);
      setToastMessage(
        item.isBookmarked
          ? `Removed “${item.title}” from your schedule`
          : `Bookmarked “${item.title}”`
      );
    } catch {
      setToastMessage('Could not update schedule bookmark');
    }
  };

  const handleOpenWebsite = () => {
    if (event?.website) {
      Linking.openURL(event.website).catch(() => {
        setToastMessage(`Unable to open ${event.website}`);
      });
    }
  };

  const isHostActive = event?.status === 'active';
  const goalPercent = event
    ? Math.min(100, Math.round((event.totalLeadsCaptured / (event.leadGoal || 1)) * 100))
    : 0;

  return (
    <ScreenContainer
      safeAreaEdges={['left', 'right']}
      header={
        <View
          style={[
            styles.headerBar,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}>
          <IconButton
            icon="ChevronLeft"
            size="sm"
            variant="ghost"
            accessibilityLabel="Go back to events"
            onPress={() => router.back()}
          />
          <View style={styles.headerTitleCol}>
            <AppText weight="bold" variant="body" numberOfLines={1}>
              {event?.name || 'Event Command'}
            </AppText>
            <AppText variant="caption" color="secondary" numberOfLines={1}>
              {event?.venue || event?.location}
            </AppText>
          </View>
          <View style={styles.headerRightActions}>
            {event?.website && (
              <IconButton
                icon="Globe"
                size="sm"
                variant="ghost"
                accessibilityLabel="Visit event website"
                onPress={handleOpenWebsite}
              />
            )}
            <IconButton
              icon={
                <Icon
                  name={event?.isBookmarked ? 'BookmarkCheck' : 'Bookmark'}
                  size={18}
                  color={event?.isBookmarked ? theme.primary : theme.textPrimary}
                />
              }
              size="sm"
              variant="ghost"
              accessibilityLabel={event?.isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
              onPress={handleToggleEventBookmark}
            />
            <IconButton
              icon="Share2"
              size="sm"
              variant="ghost"
              accessibilityLabel="Share event details"
              onPress={() => setToastMessage('Event details link copied to clipboard')}
            />
          </View>
        </View>
      }>
      {/* Toast Notification */}
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        duration={2500}
        onDismiss={() => setToastMessage(null)}
      />

      {loadingEvent ? (
        <View style={{ gap: Spacing.md, paddingVertical: Spacing.md }}>
          <Skeleton width="100%" height={180} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={50} style={{ borderRadius: Radius.medium }} />
          <Skeleton width="100%" height={240} style={{ borderRadius: Radius.large }} />
        </View>
      ) : !event ? (
        <EmptyState
          icon="CalendarX"
          title="Event Not Found"
          description="The requested conference or exhibition could not be loaded."
          actionLabel="Back to Events"
          onAction={() => router.back()}
        />
      ) : (
        <View style={styles.screenBody}>
          {/* ============================================================ */}
          {/* HERO BANNER CARD (Title, Dates, Location, Venue, Status, etc)*/}
          {/* ============================================================ */}
          <Animated.View
            entering={FadeInDown.duration(280).springify().damping(18)}
            style={styles.heroCardContainer}>
            <View style={styles.heroBanner}>
              <Image
                source={{
                  uri:
                    event.bannerUrl ||
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
                }}
                style={styles.heroImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.heroScrim} />

              {/* Status and Badges Top Row */}
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadgesLeft}>
                  <Badge
                    label={event.status.toUpperCase()}
                    variant={
                      event.status === 'active'
                        ? 'success'
                        : event.status === 'upcoming'
                          ? 'primary'
                          : 'outline'
                    }
                    showDot={isHostActive}
                    size="sm"
                  />
                  <Badge
                    label={event.boothNumber || 'Booth Assigned'}
                    variant="outline"
                    size="sm"
                  />
                </View>

                {event.website && (
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Open event website"
                    onPress={handleOpenWebsite}
                    style={styles.heroWebsitePill}>
                    <Icon name="Globe" size={12} color="#FFFFFF" />
                    <AppText
                      variant="caption"
                      weight="semibold"
                      style={styles.heroWebsiteText}>
                      Website
                    </AppText>
                    <Icon name="ExternalLink" size={10} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>

              {/* Title & Metadata Bottom Row */}
              <View style={styles.heroBottomRow}>
                <AppText weight="bold" style={styles.heroTitle}>
                  {event.name}
                </AppText>
                <View style={styles.heroMetaRow}>
                  <View style={styles.heroMetaItem}>
                    <Icon name="Calendar" size={13} color="#FFFFFF" />
                    <AppText variant="caption" style={styles.heroMetaText} tabular>
                      {formattedDates}
                    </AppText>
                  </View>
                  <AppText variant="caption" style={styles.heroMetaText}>
                    •
                  </AppText>
                  <View style={styles.heroMetaItem}>
                    <Icon name="MapPin" size={13} color="#FFFFFF" />
                    <AppText variant="caption" style={styles.heroMetaText} numberOfLines={1}>
                      {event.venue || event.location}
                    </AppText>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* ============================================================ */}
          {/* HORIZONTAL TAB NAVIGATION BAR                                 */}
          {/* ============================================================ */}
          <View style={styles.tabSelectorRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabRail}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.value;
                const badgeCount =
                  tab.value === 'exhibitors'
                    ? exhibitors.length
                    : tab.value === 'saved_exhibitors'
                      ? savedExhibitors.length
                      : tab.value === 'itinerary'
                        ? personalItinerary.length
                        : tab.value === 'schedule'
                          ? itinerary.length
                          : undefined;

                return (
                  <Pressable
                    key={tab.value}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`${tab.label}${badgeCount !== undefined ? ` (${badgeCount})` : ''}`}
                    onPress={() => setActiveTab(tab.value)}
                    style={({ pressed }) => [
                      styles.tabBtn,
                      {
                        backgroundColor: isActive ? theme.primary : theme.surface,
                        borderColor: isActive ? theme.primary : theme.border,
                      },
                      pressed && { opacity: 0.8 },
                    ]}>
                    <Icon
                      name={tab.icon as any}
                      size={14}
                      color={isActive ? '#FFFFFF' : theme.textMuted}
                    />
                    <AppText
                      weight={isActive ? 'bold' : 'medium'}
                      variant="caption"
                      style={{ color: isActive ? '#FFFFFF' : theme.textSecondary }}>
                      {tab.label}
                    </AppText>
                    {badgeCount !== undefined && badgeCount > 0 && (
                      <View
                        style={[
                          styles.tabBadge,
                          {
                            backgroundColor: isActive
                              ? 'rgba(255, 255, 255, 0.28)'
                              : theme.primarySubtle,
                          },
                        ]}>
                        <AppText
                          variant="caption"
                          weight="bold"
                          tabular
                          style={{
                            fontSize: 10,
                            color: isActive ? '#FFFFFF' : theme.primary,
                          }}>
                          {badgeCount}
                        </AppText>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ============================================================ */}
          {/* TAB 1: OVERVIEW & BOOTH SPECIFICATIONS                       */}
          {/* ============================================================ */}
          {activeTab === 'overview' && (
            <Animated.View entering={FadeIn.duration(240)} style={styles.tabContent}>
              <Card variant="elevated" density="comfortable">
                <CardHeader>
                  <View style={styles.sectionTitleRow}>
                    <Icon name="Sliders" size={18} color={theme.primary} />
                    <CardTitle level={2}>Booth Operations & Telemetry</CardTitle>
                  </View>
                  <CardDescription>
                    Assigned conference floor parameters and daily lead acquisition velocity.
                  </CardDescription>
                </CardHeader>

                <CardContent style={styles.overviewGrid}>
                  <View style={styles.specRow}>
                    <View style={styles.specItem}>
                      <AppText variant="caption" color="secondary">
                        Assigned Booth Space
                      </AppText>
                      <AppText weight="bold" variant="body">
                        {event.boothNumber || 'North Hall #N-408'}
                      </AppText>
                    </View>
                    <View style={styles.specItem}>
                      <AppText variant="caption" color="secondary">
                        Convention Zone
                      </AppText>
                      <AppText weight="bold" variant="body">
                        {event.floorPlanZone || 'North Hall - Level 1'}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.specRow}>
                    <View style={styles.specItem}>
                      <AppText variant="caption" color="secondary">
                        Active Staff Credentials
                      </AppText>
                      <AppText weight="bold" variant="body" tabular>
                        {event.activeStaffCount} Team Members On Duty
                      </AppText>
                    </View>
                    <View style={styles.specItem}>
                      <AppText variant="caption" color="secondary">
                        Target Lead Goal
                      </AppText>
                      <AppText weight="bold" variant="body" tabular style={{ color: theme.primary }}>
                        {event.leadGoal} Ingestions
                      </AppText>
                    </View>
                  </View>

                  {/* Quota Progress */}
                  <View style={styles.overviewQuotaBlock}>
                    <View style={styles.quotaHeader}>
                      <AppText variant="caption" weight="semibold">
                        Booth Capture Target Progress
                      </AppText>
                      <AppText variant="caption" weight="bold" tabular color="primary">
                        {event.totalLeadsCaptured} / {event.leadGoal} ({goalPercent}%)
                      </AppText>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: theme.secondary }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${goalPercent}%`,
                            backgroundColor:
                              goalPercent >= 100 ? theme.success : theme.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <Divider />

                  {/* Venue & Location Overview */}
                  <View style={styles.venueSection}>
                    <View style={styles.sectionTitleRow}>
                      <Icon name="MapPin" size={16} color={theme.primary} />
                      <AppText weight="semibold" variant="body">
                        Venue & Host City
                      </AppText>
                    </View>
                    <AppText variant="caption" color="secondary">
                      {event.venue || 'Convention Center Pavilion'}
                    </AppText>
                    <AppText variant="caption" color="muted">
                      {event.city}, {event.country}
                    </AppText>
                  </View>

                  <Divider />

                  {/* Event Description */}
                  <View style={styles.descSection}>
                    <AppText weight="semibold" variant="body">
                      About the Gathering
                    </AppText>
                    <AppText variant="caption" color="secondary" style={styles.descText}>
                      {event.description ||
                        'The premier global convention gathering enterprise innovators, sales organizations, and engineering teams.'}
                    </AppText>
                  </View>

                  {/* Official Website link */}
                  {event.website && (
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`Open event website: ${event.website}`}
                      onPress={handleOpenWebsite}
                      style={[
                        styles.websiteRowCard,
                        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                      ]}>
                      <View style={styles.websiteRowLeft}>
                        <Icon name="Globe" size={16} color={theme.primary} />
                        <View style={{ gap: 2 }}>
                          <AppText weight="semibold" variant="caption">
                            Official Event Portal
                          </AppText>
                          <AppText variant="caption" color="muted" numberOfLines={1}>
                            {event.website}
                          </AppText>
                        </View>
                      </View>
                      <Icon name="ExternalLink" size={14} color={theme.primary} />
                    </Pressable>
                  )}

                  {/* Quick CTAs */}
                  <View style={styles.overviewActions}>
                    <Button
                      label="View Exhibitors"
                      variant="primary"
                      size="md"
                      leftIcon="Building2"
                      onPress={() => setActiveTab('exhibitors')}
                      style={{ flex: 1 }}
                    />
                    <Button
                      label="Browse Schedule"
                      variant="outline"
                      size="md"
                      leftIcon="Calendar"
                      onPress={() => setActiveTab('schedule')}
                      style={{ flex: 1 }}
                    />
                  </View>
                </CardContent>
              </Card>
            </Animated.View>
          )}

          {/* ============================================================ */}
          {/* TAB 2: EXHIBITORS DIRECTORY                                  */}
          {/* ============================================================ */}
          {activeTab === 'exhibitors' && (
            <Animated.View entering={FadeIn.duration(240)} style={styles.tabContent}>
              {/* Exhibitor Search and Category Filters */}
              <View style={styles.exhibitorControls}>
                <Input
                  placeholder="Search company, booth number, or product tag…"
                  value={exhibitorSearch}
                  onChangeText={setExhibitorSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  leftAccessory={<Icon name="Search" size={16} color={theme.textMuted} />}
                  clearButtonMode="while-editing"
                />

                <View style={styles.exhibitorFilterRow}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScrollContainer}>
                    {exhibitorCategories.map((cat) => (
                      <Chip
                        key={cat}
                        label={cat}
                        selected={selectedExhibitorCat === cat}
                        onPress={() => setSelectedExhibitorCat(cat)}
                        size="sm"
                      />
                    ))}
                  </ScrollView>

                  <Button
                    label={exhibitorsSavedOnly ? 'Saved Only' : 'All'}
                    variant={exhibitorsSavedOnly ? 'primary' : 'outline'}
                    size="sm"
                    leftIcon="Bookmark"
                    onPress={() => setExhibitorsSavedOnly(!exhibitorsSavedOnly)}
                  />
                </View>
              </View>

              {loadingExhibitors ? (
                <View style={{ gap: Spacing.sm }}>
                  <Skeleton width="100%" height={120} style={{ borderRadius: Radius.medium }} />
                  <Skeleton width="100%" height={120} style={{ borderRadius: Radius.medium }} />
                </View>
              ) : filteredExhibitors.length === 0 ? (
                <EmptyState
                  icon="Building2"
                  title="No Exhibitors Found"
                  description={
                    exhibitorSearch || selectedExhibitorCat !== 'All'
                      ? 'No exhibitors match your filter query. Try adjusting keywords.'
                      : 'No exhibitors currently registered for this pavilion.'
                  }
                  actionLabel="Clear Filters"
                  onAction={() => {
                    setExhibitorSearch('');
                    setSelectedExhibitorCat('All');
                    setExhibitorsSavedOnly(false);
                  }}
                />
              ) : (
                <ResponsiveGrid gap={12} columns={isTablet || isDesktop ? 2 : 1}>
                  {filteredExhibitors.map((ex) => {
                    const isBookmarked = Boolean(ex.isBookmarked);
                    const isInItin = Boolean(ex.isInItinerary);

                    return (
                      <Card
                        key={ex.id}
                        interactive
                        density="comfortable"
                        onPress={() => router.push(`/events/exhibitor/${ex.id}` as never)}
                        style={styles.exhibitorCard}>
                        <CardHeader style={styles.exhibitorHeader}>
                          <View style={styles.exhibitorAvatarRow}>
                            {ex.logoUrl ? (
                              <Image
                                source={{ uri: ex.logoUrl }}
                                style={styles.exhibitorLogo}
                                contentFit="cover"
                              />
                            ) : (
                              <View
                                style={[
                                  styles.exhibitorLogoPlaceholder,
                                  { backgroundColor: theme.primarySubtle },
                                ]}>
                                <Icon name="Building2" size={20} color={theme.primary} />
                              </View>
                            )}
                            <View style={styles.exhibitorInfoCol}>
                              <CardTitle level={3} numberOfLines={1}>
                                {ex.name}
                              </CardTitle>
                              <AppText variant="caption" color="secondary">
                                {ex.category} • {ex.headquarters || 'Enterprise'}
                              </AppText>
                            </View>
                          </View>

                          <IconButton
                            icon={
                              <Icon
                                name={isBookmarked ? 'BookmarkCheck' : 'Bookmark'}
                                size={18}
                                color={isBookmarked ? theme.primary : theme.textMuted}
                              />
                            }
                            size="sm"
                            variant="ghost"
                            accessibilityLabel={
                              isBookmarked ? 'Remove saved exhibitor' : 'Save exhibitor'
                            }
                            onPress={() => handleToggleExhibitorBookmark(ex)}
                          />
                        </CardHeader>

                        {ex.description && (
                          <CardContent style={styles.exhibitorContent}>
                            <AppText variant="caption" color="secondary" numberOfLines={2}>
                              {ex.description}
                            </AppText>
                          </CardContent>
                        )}

                        {/* Booth and Hall Badges */}
                        <View style={styles.boothBadgesGroup}>
                          <Badge
                            label={`Booth: ${ex.boothNumber}`}
                            variant={ex.featured ? 'primary' : 'outline'}
                            size="sm"
                          />
                          <Badge
                            label={`Hall: ${ex.hall || 'North Hall'}`}
                            variant="outline"
                            size="sm"
                          />
                        </View>

                        {/* Action Row: Add to Itinerary + Locate */}
                        <View style={styles.exhibitorFooter}>
                          <Button
                            label={isInItin ? 'In Itinerary' : '+ Add to Itinerary'}
                            variant={isInItin ? 'secondary' : 'primary'}
                            size="sm"
                            leftIcon={isInItin ? 'Check' : 'CalendarPlus'}
                            onPress={() => handleToggleExhibitorItinerary(ex)}
                          />

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Locate ${ex.name} on floor plan`}
                            onPress={() => {
                              setSelectedFloorBoothNumber(ex.boothNumber);
                              setActiveTab('floor');
                            }}
                            style={styles.locateBtn}>
                            <Icon name="Compass" size={13} color={theme.primary} />
                            <AppText
                              variant="caption"
                              weight="semibold"
                              style={{ color: theme.primary }}>
                              Locate
                            </AppText>
                          </Pressable>
                        </View>
                      </Card>
                    );
                  })}
                </ResponsiveGrid>
              )}
            </Animated.View>
          )}

          {/* ============================================================ */}
          {/* TAB 3: CONFERENCE SCHEDULE / AGENDA                          */}
          {/* ============================================================ */}
          {activeTab === 'schedule' && (
            <Animated.View entering={FadeIn.duration(240)} style={styles.tabContent}>
              {/* Day & Track Switchers */}
              <View style={styles.itineraryControls}>
                <View style={styles.daySelectorRow}>
                  <Button
                    label="Day 1 • Oct 4"
                    variant={scheduleDay === 'day1' ? 'primary' : 'outline'}
                    size="sm"
                    onPress={() => setScheduleDay('day1')}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Day 2 • Today"
                    variant={scheduleDay === 'day2' ? 'primary' : 'outline'}
                    size="sm"
                    onPress={() => setScheduleDay('day2')}
                    style={{ flex: 1 }}
                  />
                </View>

                {/* Track Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.itineraryCategoryRow}>
                    {(['all', 'keynote', 'session', 'networking', 'booth_duty'] as (
                      | 'all'
                      | ItineraryCategory
                    )[]).map((track) => (
                      <Chip
                        key={track}
                        label={
                          track === 'all'
                            ? 'All Tracks'
                            : track === 'booth_duty'
                              ? 'Booth Duty'
                              : track.toUpperCase()
                        }
                        selected={selectedScheduleTrack === track}
                        onPress={() => setSelectedScheduleTrack(track)}
                        size="sm"
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {loadingItinerary ? (
                <View style={{ gap: Spacing.sm }}>
                  <Skeleton width="100%" height={100} style={{ borderRadius: Radius.medium }} />
                  <Skeleton width="100%" height={100} style={{ borderRadius: Radius.medium }} />
                </View>
              ) : filteredSchedule.length === 0 ? (
                <EmptyState
                  icon="CalendarCheck"
                  title="No Sessions in This Track"
                  description="Try selecting a different day or category filter to browse the schedule."
                  actionLabel="Show All Sessions"
                  onAction={() => setSelectedScheduleTrack('all')}
                />
              ) : (
                <View style={styles.itineraryList}>
                  {filteredSchedule.map((item) => {
                    const isBookmarked = Boolean(item.isBookmarked);
                    const isDuty = item.category === 'booth_duty';
                    const isKeynote = item.category === 'keynote';

                    const startTimeFormatted = new Intl.DateTimeFormat('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(new Date(item.startTime));

                    const endTimeFormatted = new Intl.DateTimeFormat('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(new Date(item.endTime));

                    return (
                      <Card
                        key={item.id}
                        density="comfortable"
                        style={[
                          styles.itineraryCard,
                          isDuty && { borderColor: theme.success, borderWidth: 1.5 },
                        ]}>
                        <CardHeader style={styles.itineraryCardHeader}>
                          <View style={styles.timeCategoryRow}>
                            <View style={styles.timeBadge}>
                              <Icon name="Clock" size={13} color={theme.primary} />
                              <AppText variant="caption" weight="bold" tabular>
                                {startTimeFormatted} – {endTimeFormatted}
                              </AppText>
                            </View>

                            <Badge
                              label={isDuty ? 'BOOTH SHIFT' : item.category.toUpperCase()}
                              variant={
                                isDuty
                                  ? 'success'
                                  : isKeynote
                                    ? 'primary'
                                    : item.category === 'meeting'
                                      ? 'warning'
                                      : 'outline'
                              }
                              showDot={isDuty}
                              size="sm"
                            />
                          </View>

                          <IconButton
                            icon={
                              <Icon
                                name={isBookmarked ? 'BookmarkCheck' : 'Bookmark'}
                                size={18}
                                color={isBookmarked ? theme.primary : theme.textMuted}
                              />
                            }
                            size="sm"
                            variant="ghost"
                            accessibilityLabel={
                              isBookmarked ? 'Remove session bookmark' : 'Bookmark session'
                            }
                            onPress={() => handleToggleItineraryBookmark(item)}
                          />
                        </CardHeader>

                        <CardContent style={styles.itineraryContent}>
                          <AppText weight="bold" variant="body">
                            {item.title}
                          </AppText>

                          {item.description && (
                            <AppText variant="caption" color="secondary" numberOfLines={2}>
                              {item.description}
                            </AppText>
                          )}

                          <View style={styles.itineraryMetaStrip}>
                            <View style={styles.itineraryMetaItem}>
                              <Icon name="MapPin" size={12} color={theme.textMuted} />
                              <AppText variant="caption" color="secondary">
                                {item.location}
                              </AppText>
                            </View>

                            {item.speakerName && (
                              <View style={styles.itineraryMetaItem}>
                                <Icon name="User" size={12} color={theme.textMuted} />
                                <AppText variant="caption" color="secondary" numberOfLines={1}>
                                  {item.speakerName}
                                </AppText>
                              </View>
                            )}
                          </View>
                        </CardContent>
                      </Card>
                    );
                  })}
                </View>
              )}
            </Animated.View>
          )}

          {/* ============================================================ */}
          {/* TAB 4: SAVED EXHIBITORS                                      */}
          {/* ============================================================ */}
          {activeTab === 'saved_exhibitors' && (
            <Animated.View entering={FadeIn.duration(240)} style={styles.tabContent}>
              <View style={styles.savedHeaderRow}>
                <View style={{ gap: 2 }}>
                  <CardTitle level={2}>Target Exhibitors</CardTitle>
                  <AppText variant="caption" color="secondary">
                    {savedExhibitors.length} companies bookmarked for on-site meetings and booth visits.
                  </AppText>
                </View>
              </View>

              {savedExhibitors.length === 0 ? (
                <EmptyState
                  icon="Bookmark"
                  title="No Saved Exhibitors Yet"
                  description="Bookmark target companies in the Exhibitor Directory to build your custom meeting list."
                  actionLabel="Browse Exhibitor Directory"
                  onAction={() => setActiveTab('exhibitors')}
                />
              ) : (
                <ResponsiveGrid gap={12} columns={isTablet || isDesktop ? 2 : 1}>
                  {savedExhibitors.map((ex) => {
                    const isInItin = Boolean(ex.isInItinerary);

                    return (
                      <Card
                        key={ex.id}
                        interactive
                        density="comfortable"
                        onPress={() => router.push(`/events/exhibitor/${ex.id}` as never)}
                        style={styles.exhibitorCard}>
                        <CardHeader style={styles.exhibitorHeader}>
                          <View style={styles.exhibitorAvatarRow}>
                            {ex.logoUrl ? (
                              <Image
                                source={{ uri: ex.logoUrl }}
                                style={styles.exhibitorLogo}
                                contentFit="cover"
                              />
                            ) : (
                              <View
                                style={[
                                  styles.exhibitorLogoPlaceholder,
                                  { backgroundColor: theme.primarySubtle },
                                ]}>
                                <Icon name="Building2" size={20} color={theme.primary} />
                              </View>
                            )}
                            <View style={styles.exhibitorInfoCol}>
                              <CardTitle level={3} numberOfLines={1}>
                                {ex.name}
                              </CardTitle>
                              <AppText variant="caption" color="secondary">
                                {ex.category} • {ex.headquarters || 'Enterprise'}
                              </AppText>
                            </View>
                          </View>

                          <IconButton
                            icon={
                              <Icon
                                name="BookmarkCheck"
                                size={18}
                                color={theme.primary}
                              />
                            }
                            size="sm"
                            variant="ghost"
                            accessibilityLabel="Remove from saved exhibitors"
                            onPress={() => handleToggleExhibitorBookmark(ex)}
                          />
                        </CardHeader>

                        {ex.description && (
                          <CardContent style={styles.exhibitorContent}>
                            <AppText variant="caption" color="secondary" numberOfLines={2}>
                              {ex.description}
                            </AppText>
                          </CardContent>
                        )}

                        <View style={styles.boothBadgesGroup}>
                          <Badge
                            label={`Booth: ${ex.boothNumber}`}
                            variant={ex.featured ? 'primary' : 'outline'}
                            size="sm"
                          />
                          <Badge
                            label={`Hall: ${ex.hall || 'North Hall'}`}
                            variant="outline"
                            size="sm"
                          />
                        </View>

                        <View style={styles.exhibitorFooter}>
                          <Button
                            label={isInItin ? 'In Itinerary' : '+ Add to Itinerary'}
                            variant={isInItin ? 'secondary' : 'primary'}
                            size="sm"
                            leftIcon={isInItin ? 'Check' : 'CalendarPlus'}
                            onPress={() => handleToggleExhibitorItinerary(ex)}
                          />

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Locate ${ex.name} on floor plan`}
                            onPress={() => {
                              setSelectedFloorBoothNumber(ex.boothNumber);
                              setActiveTab('floor');
                            }}
                            style={styles.locateBtn}>
                            <Icon name="Compass" size={13} color={theme.primary} />
                            <AppText
                              variant="caption"
                              weight="semibold"
                              style={{ color: theme.primary }}>
                              Locate
                            </AppText>
                          </Pressable>
                        </View>
                      </Card>
                    );
                  })}
                </ResponsiveGrid>
              )}
            </Animated.View>
          )}

          {/* ============================================================ */}
          {/* TAB 5: PERSONAL ITINERARY TIMELINE (Full Trade Show System)  */}
          {/* ============================================================ */}
          {activeTab === 'itinerary' && (
            <Animated.View entering={FadeIn.duration(240)} style={styles.tabContent}>
              <PersonalItineraryTimeline
                eventId={eventId}
                onLocateBooth={(boothNumber) => {
                  setSelectedFloorBoothNumber(boothNumber);
                  setActiveTab('floor');
                }}
                onFullScreenToggle={() => {
                  router.push(`/events/itinerary/${eventId}` as never);
                }}
                isFullScreen={false}
              />
            </Animated.View>
          )}

          {/* ============================================================ */}
          {/* TAB 6: INTERACTIVE FLOOR & BOOTH EXPERIENCE                  */}
          {/* ============================================================ */}
          {activeTab === 'floor' && (
            <Animated.View entering={FadeIn.duration(240)} style={styles.tabContent}>
              <ExpoFloorVisualizer
                eventId={eventId}
                initialBoothNumber={selectedFloorBoothNumber}
                onFullScreenToggle={() => {
                  router.push(`/events/floor/${eventId}` as never);
                }}
                isFullScreen={false}
              />
            </Animated.View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    gap: Spacing.xs,
  },
  headerTitleCol: {
    flex: 1,
    gap: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  screenBody: {
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  heroCardContainer: {
    marginTop: Spacing.xs,
  },
  heroBanner: {
    width: '100%',
    height: 190,
    borderRadius: Radius.large,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.64)',
  },
  heroTopRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadgesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroWebsitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  heroWebsiteText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  heroBottomRow: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    gap: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    color: '#E2E8F0',
  },
  tabSelectorRow: {
    marginVertical: Spacing.xs,
  },
  tabRail: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  tabContent: {
    gap: Spacing.md,
  },

  // Overview Tab
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  overviewGrid: {
    gap: Spacing.md,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  specItem: {
    flex: 1,
    gap: 2,
  },
  overviewQuotaBlock: {
    gap: 6,
    paddingTop: Spacing.xs,
  },
  quotaHeader: {
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
  venueSection: {
    gap: 4,
  },
  descSection: {
    gap: 4,
  },
  descText: {
    lineHeight: 18,
  },
  websiteRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  websiteRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  overviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },

  // Exhibitors Tab
  exhibitorControls: {
    gap: Spacing.xs,
  },
  exhibitorFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryScrollContainer: {
    gap: 6,
    paddingVertical: 2,
  },
  exhibitorCard: {
    borderRadius: Radius.medium,
  },
  exhibitorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exhibitorAvatarRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exhibitorLogo: {
    width: 36,
    height: 36,
    borderRadius: Radius.small,
  },
  exhibitorLogoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exhibitorInfoCol: {
    flex: 1,
    gap: 2,
  },
  exhibitorContent: {
    paddingTop: 2,
  },
  boothBadgesGroup: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
    paddingBottom: 2,
    flexWrap: 'wrap',
  },
  exhibitorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingTop: 6,
  },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // Saved Exhibitors Tab
  savedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },

  // Itinerary / Schedule Tab
  itineraryControls: {
    gap: Spacing.sm,
  },
  daySelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  itineraryCategoryRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 2,
  },
  itineraryList: {
    gap: Spacing.sm,
  },
  itineraryCard: {
    borderRadius: Radius.medium,
  },
  itineraryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 2,
  },
  timeCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itineraryContent: {
    gap: 6,
    paddingTop: 2,
  },
  itineraryMetaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: 2,
  },
  itineraryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },


});
