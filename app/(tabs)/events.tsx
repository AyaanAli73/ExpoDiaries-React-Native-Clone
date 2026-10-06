import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { EventFilterSheet } from '@/components/events';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  Chip,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  Input,
  Skeleton,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  SORT_OPTIONS,
  useEventFilters,
} from '@/hooks/use-event-filters';
import {
  useEvents,
  useToggleBookmarkEvent,
  useToggleJoinEvent,
} from '@/hooks/use-events';
import { useResponsive } from '@/hooks/use-responsive';
import { Colors, Radius, Spacing } from '@/theme';
import { Event } from '@/types/event';

type FeedTab = 'all' | 'featured' | 'upcoming' | 'nearby' | 'saved';

const FEED_TABS: { id: FeedTab; label: string; icon: string }[] = [
  { id: 'all', label: 'All Expos', icon: 'Compass' },
  { id: 'featured', label: 'Featured', icon: 'Sparkles' },
  { id: 'upcoming', label: 'Upcoming', icon: 'Calendar' },
  { id: 'nearby', label: 'Nearby', icon: 'MapPin' },
  { id: 'saved', label: 'Saved', icon: 'Bookmark' },
];

const INDUSTRY_CATEGORIES = [
  'All',
  'AI & Hardware',
  'Enterprise SaaS',
  'Cloud Infrastructure',
  'Cybersecurity',
  'Fintech',
  'Healthcare & BioTech',
  'Telecom & Edge',
  'Startups & VCs',
];

function EventCardSkeleton({ cardWidth }: { cardWidth?: number | string }) {
  return (
    <Card
      density="comfortable"
      style={[
        styles.eventCard,
        cardWidth ? { width: cardWidth as any } : undefined,
      ]}>
      <Skeleton width="100%" height={165} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
      <CardContent style={styles.cardContent}>
        <View style={styles.metricsBar}>
          <Skeleton width={140} height={16} />
          <Skeleton width={100} height={16} />
        </View>
        <View style={styles.actionRow}>
          <Skeleton width="48%" height={36} borderRadius={Radius.medium} />
          <Skeleton width="48%" height={36} borderRadius={Radius.medium} />
        </View>
      </CardContent>
    </Card>
  );
}

interface EventCardProps {
  event: Event;
  onBookmark: (event: Event) => void;
  onToggleJoin: (event: Event) => void;
  cardWidth?: number | string;
}

const EventCardItem = React.memo(function EventCardItem({
  event,
  onBookmark,
  onToggleJoin,
  cardWidth,
}: EventCardProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const isSaved = Boolean(event.isBookmarked);
  const isJoined = Boolean(event.isJoined);
  const isActiveBooth = event.status === 'active';

  const formattedDate = useMemo(() => {
    try {
      const s = new Date(event.startDate);
      const e = new Date(event.endDate);
      const sFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(s);
      const eFmt = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(e);
      return `${sFmt} – ${eFmt}`;
    } catch {
      return `${event.startDate} – ${event.endDate}`;
    }
  }, [event.startDate, event.endDate]);

  const displayCity = event.city || event.location.split(',')[0] || 'Las Vegas';
  const displayCountry = event.country || 'United States';
  const displayIndustry = event.industry || event.category || 'Enterprise Tech';
  const displayExhibitorCount = event.exhibitorCount || event.totalExhibitorsCount || 48;

  return (
    <Card
      interactive
      density="comfortable"
      onPress={() => router.push(`/events/${event.id}`)}
      style={[
        styles.eventCard,
        cardWidth ? { width: cardWidth as any } : undefined,
      ]}>
      {/* 1. Image Container with Scrim */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              event.bannerUrl ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
          }}
          style={styles.bannerImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.imageScrim} />

        {/* Top Badges & Bookmark Button */}
        <View style={styles.imageTopRow}>
          <View style={styles.badgeCluster}>
            {/* 6. Industry Category */}
            <Badge label={displayIndustry} variant="primary" size="sm" />

            {/* 9. Joined State Indicator */}
            {isJoined ? (
              <Badge label="JOINED" variant="success" size="sm" showDot />
            ) : (
              <Badge label="NOT JOINED" variant="outline" size="sm" />
            )}

            {isActiveBooth && <Badge label="ACTIVE BOOTH" variant="success" size="sm" />}
          </View>

          {/* 8. Bookmark Button */}
          <IconButton
            icon={
              <Icon
                name={isSaved ? 'BookmarkCheck' : 'Bookmark'}
                size={16}
                color={isSaved ? theme.primary : '#FFFFFF'}
              />
            }
            size="sm"
            variant="ghost"
            accessibilityLabel={isSaved ? `Remove bookmark for ${event.name}` : `Bookmark ${event.name}`}
            onPress={(e) => {
              e.stopPropagation();
              onBookmark(event);
            }}
            style={[
              styles.bookmarkBtn,
              {
                backgroundColor: isSaved ? theme.surface : 'rgba(15, 23, 42, 0.65)',
              },
            ]}
          />
        </View>

        {/* Bottom Title on Banner */}
        <View style={styles.imageBottomText}>
          {/* 2. Event Name */}
          <AppText weight="bold" style={styles.bannerTitle} numberOfLines={1}>
            {event.name}
          </AppText>

          {/* 3. City & 4. Country */}
          <View style={styles.locationRow}>
            <Icon name="MapPin" size={13} color="#E2E8F0" />
            <AppText variant="caption" style={styles.bannerLocationText} numberOfLines={1}>
              {displayCity}, {displayCountry}
            </AppText>
          </View>
        </View>
      </View>

      {/* Card Body */}
      <CardContent style={styles.cardContent}>
        {/* 5. Dates & 7. Exhibitor Count Row */}
        <View style={styles.metricsBar}>
          <View style={styles.metricItem}>
            <Icon name="Calendar" size={14} color={theme.primary} />
            <AppText variant="caption" weight="medium" tabular>
              {formattedDate}
            </AppText>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Icon name="Building2" size={14} color={theme.primary} />
            <AppText variant="caption" weight="bold" tabular>
              {displayExhibitorCount} Exhibitors
            </AppText>
          </View>
        </View>

        {/* Action Row: Joined Toggle & View Details */}
        <View style={styles.actionRow}>
          <Button
            label={isJoined ? 'Joined Team' : 'Join Show'}
            variant={isJoined ? 'subtle' : 'outline'}
            size="sm"
            leftIcon={isJoined ? 'Check' : 'UserPlus'}
            onPress={(e) => {
              e.stopPropagation();
              onToggleJoin(event);
            }}
            style={styles.joinBtn}
          />

          <Button
            label="Floor & Details"
            variant="ghost"
            size="sm"
            rightIcon="ChevronRight"
            onPress={() => router.push(`/events/${event.id}`)}
          />
        </View>
      </CardContent>
    </Card>
  );
});

export default function EventsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { isTablet, isDesktop } = useResponsive();

  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dedicated Filter State Management (separated from repository logic)
  const {
    filters,
    setSearchQuery,
    setCountry,
    setCity,
    setIndustry,
    setDateRange,
    setStatus,
    setSortBy,
    resetFilters,
    activeFilterCount,
    hasActiveFilters,
    filterChips,
    filterAndSortEvents,
  } = useEventFilters();

  const toggleBookmarkMutation = useToggleBookmarkEvent();
  const toggleJoinMutation = useToggleJoinEvent();

  // Load all repository data once; fast, instant search & filter operates in-memory
  const {
    data: eventsData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useEvents();

  const allEvents = useMemo(() => eventsData?.items || [], [eventsData]);

  // Dynamic available options for bottom sheet filters
  const availableIndustries = useMemo(() => {
    return INDUSTRY_CATEGORIES.filter((c) => c !== 'All');
  }, []);

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((e) => {
      if (e.country) set.add(e.country);
    });
    return Array.from(set).length > 0 ? Array.from(set) : ['United States', 'Spain', 'Finland'];
  }, [allEvents]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((e) => {
      const c = e.city || e.location.split(',')[0]?.trim();
      if (c) set.add(c);
    });
    return Array.from(set).length > 0
      ? Array.from(set)
      : ['Las Vegas', 'San Francisco', 'San Mateo', 'New York', 'Boston', 'Barcelona', 'Helsinki'];
  }, [allEvents]);

  // Section divisions for curated home feed
  const featuredEvents = useMemo(() => {
    return allEvents.filter((e) => e.isFeatured || e.status === 'active');
  }, [allEvents]);

  const upcomingEvents = useMemo(() => {
    return allEvents.filter((e) => e.status === 'upcoming');
  }, [allEvents]);

  const nearbyEvents = useMemo(() => {
    return allEvents.filter((e) => e.isNearby || (e.distanceMiles && e.distanceMiles <= 50));
  }, [allEvents]);

  const savedEvents = useMemo(() => {
    return allEvents.filter((e) => e.isBookmarked);
  }, [allEvents]);

  // Instant filtered list
  const displayedFilteredList = useMemo(() => {
    let list = filterAndSortEvents(allEvents);

    if (activeTab === 'featured') {
      list = list.filter((e) => e.isFeatured || e.status === 'active');
    } else if (activeTab === 'upcoming') {
      list = list.filter((e) => e.status === 'upcoming');
    } else if (activeTab === 'nearby') {
      list = list.filter((e) => e.isNearby || (e.distanceMiles && e.distanceMiles <= 50));
    } else if (activeTab === 'saved') {
      list = list.filter((e) => e.isBookmarked);
    }

    return list;
  }, [allEvents, filterAndSortEvents, activeTab]);

  const isFeedMode = !hasActiveFilters && activeTab === 'all';

  const currentSortLabel = useMemo(() => {
    const match = SORT_OPTIONS.find((s) => s.id === filters.sortBy);
    return match ? match.label : 'Sort';
  }, [filters.sortBy]);

  const handleBookmark = useCallback(
    async (event: Event) => {
      try {
        await toggleBookmarkMutation.mutateAsync(event.id);
        setToastMessage(
          event.isBookmarked
            ? `Removed “${event.name}” from saved bookmarks`
            : `Saved “${event.name}” to your conference bookmarks`
        );
      } catch {
        setToastMessage('Failed to update bookmark');
      }
    },
    [toggleBookmarkMutation]
  );

  const handleToggleJoin = useCallback(
    async (event: Event) => {
      try {
        await toggleJoinMutation.mutateAsync(event.id);
        setToastMessage(
          event.isJoined
            ? `Cancelled attendance for “${event.name}”`
            : `Joined attendance roster for “${event.name}”`
        );
      } catch {
        setToastMessage('Failed to update attendance');
      }
    },
    [toggleJoinMutation]
  );

  const renderEventItem = useCallback(
    ({ item }: { item: Event }) => (
      <View style={styles.verticalListItem}>
        <EventCardItem
          event={item}
          onBookmark={handleBookmark}
          onToggleJoin={handleToggleJoin}
        />
      </View>
    ),
    [handleBookmark, handleToggleJoin]
  );

  const keyExtractor = useCallback((item: Event) => item.id, []);

  return (
    <ScreenContainer
      safeAreaEdges={['left', 'right']}
      onRefresh={async () => {
        await refetch();
      }}
      refreshing={isRefetching}>
      {/* Toast Alert */}
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        duration={2500}
        onDismiss={() => setToastMessage(null)}
      />

      {/* Header Search & Filtering Section */}
      <Animated.View
        entering={FadeInDown.duration(280).springify().damping(18)}
        style={styles.headerSection}>
        {/* Search Bar Row with Instant Filter Trigger */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Input
              placeholder="Search by event name, city, country, or industry…"
              value={filters.searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              leftAccessory={<Icon name="Search" size={16} color={theme.textMuted} />}
              rightAccessory={
                filters.searchQuery ? (
                  <IconButton
                    icon={<Icon name="X" size={14} color={theme.textMuted} />}
                    size="xs"
                    variant="ghost"
                    accessibilityLabel="Clear search keyword"
                    onPress={() => setSearchQuery('')}
                  />
                ) : undefined
              }
            />
          </View>

          {/* Filter Bottom Sheet Trigger Button with Active Count Badge */}
          <IconButton
            icon={
              <View style={styles.filterIconWrapper}>
                <Icon
                  name="SlidersHorizontal"
                  size={18}
                  color={activeFilterCount > 0 ? theme.primary : theme.text}
                />
                {activeFilterCount > 0 && (
                  <View style={[styles.filterBadgeIndicator, { backgroundColor: theme.primary }]}>
                    <AppText style={styles.filterBadgeText}>
                      {activeFilterCount}
                    </AppText>
                  </View>
                )}
              </View>
            }
            size="md"
            variant={activeFilterCount > 0 ? 'secondary' : 'outline'}
            accessibilityLabel={
              activeFilterCount > 0
                ? `Open event filters. ${activeFilterCount} active filters.`
                : 'Open event filters sheet'
            }
            onPress={() => setIsFilterSheetOpen(true)}
            style={styles.filterBtn}
          />

          <Button
            label="Add Show"
            variant="primary"
            size="sm"
            leftIcon="Plus"
            onPress={() => router.push('/events/new')}
          />
        </View>

        {/* Navigation Feed Tabs */}
        <View style={styles.feedTabsRow}>
          {FEED_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                label={tab.label}
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setActiveTab(tab.id)}
                style={styles.feedTabBtn}
              />
            );
          })}
        </View>

        {/* Selected Filter Chips Rail (When Filters/Search are Active) */}
        {filterChips.length > 0 && (
          <View style={styles.activeChipsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeChipsRail}>
              {filterChips.map((chip) => (
                <Chip
                  key={chip.id}
                  label={`${chip.label} ✕`}
                  selected
                  onPress={chip.onRemove}
                  size="sm"
                  accessibilityLabel={`Remove filter: ${chip.label}`}
                />
              ))}
              <Button
                label="Clear all"
                variant="ghost"
                size="sm"
                onPress={resetFilters}
                style={styles.clearAllInlineBtn}
              />
            </ScrollView>
          </View>
        )}

        {/* Industry Categories Rail */}
        <View style={styles.categoryRailWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRail}>
            {INDUSTRY_CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                selected={
                  cat === 'All'
                    ? filters.industry === 'All'
                    : filters.industry.toLowerCase() === cat.toLowerCase()
                }
                onPress={() => setIndustry(cat)}
                size="sm"
              />
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      {/* Main Content Body */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <ErrorState
            title="Unable to Load Exhibitions"
            message="Could not retrieve live event repository data. Check connectivity."
            onRetry={() => refetch()}
            retryLabel="Retry Sync"
          />
        </View>
      ) : !isFeedMode ? (
        /* Filtered / Search Mode: Virtualized FlatList for High Performance */
        <View style={styles.listContainer}>
          {/* Result Count and Sort Controls */}
          <View style={styles.filterResultHeader}>
            <View style={styles.resultCountGroup}>
              <AppText weight="bold" variant="body" tabular>
                {displayedFilteredList.length}{' '}
                {displayedFilteredList.length === 1 ? 'Exhibition' : 'Exhibitions'}
              </AppText>
              <AppText variant="caption" color="muted" tabular>
                of {allEvents.length} total
              </AppText>
            </View>

            <View style={styles.sortActionGroup}>
              <Button
                label={currentSortLabel}
                variant="ghost"
                size="sm"
                leftIcon="ArrowDownUp"
                onPress={() => setIsFilterSheetOpen(true)}
                accessibilityLabel={`Sort by: ${currentSortLabel}. Click to change.`}
              />
              {hasActiveFilters && (
                <Button
                  label="Clear"
                  variant="ghost"
                  size="sm"
                  onPress={resetFilters}
                />
              )}
            </View>
          </View>

          {displayedFilteredList.length === 0 ? (
            <EmptyState
              icon="CalendarX"
              title="No Exhibitions Found"
              description="No trade shows or conferences match your search keywords or filter selection."
              actionLabel="Clear Filters"
              onAction={resetFilters}
            />
          ) : (
            <FlatList
              data={displayedFilteredList}
              renderItem={renderEventItem}
              keyExtractor={keyExtractor}
              initialNumToRender={5}
              maxToRenderPerBatch={8}
              windowSize={7}
              removeClippedSubviews={Platform.OS === 'android'}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      ) : (
        /* Curated Home Feed Mode: Featured, Nearby, Upcoming, Saved Sections */
        <ScrollView
          style={styles.feedScrollView}
          contentContainerStyle={styles.feedScrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Quick Header Summary with Filter & Sort trigger */}
          <View style={styles.feedStatusHeader}>
            <AppText variant="caption" color="muted" tabular>
              Showing all {allEvents.length} scheduled expos
            </AppText>
            <Button
              label={currentSortLabel}
              variant="ghost"
              size="sm"
              leftIcon="ArrowDownUp"
              onPress={() => setIsFilterSheetOpen(true)}
            />
          </View>

          {/* ============================================================ */}
          {/* 1. FEATURED EVENTS CAROUSEL                                  */}
          {/* ============================================================ */}
          {featuredEvents.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Icon name="Sparkles" size={18} color={theme.primary} />
                  <AppText weight="bold" variant="title">
                    Featured Exhibitions
                  </AppText>
                </View>
                <Badge label="PREMIER SHOWS" variant="primary" size="sm" />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalCarousel}>
                {featuredEvents.map((evt) => (
                  <EventCardItem
                    key={evt.id}
                    event={evt}
                    onBookmark={handleBookmark}
                    onToggleJoin={handleToggleJoin}
                    cardWidth={isTablet || isDesktop ? 380 : 310}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ============================================================ */}
          {/* 2. NEARBY & RECOMMENDED EVENTS                               */}
          {/* ============================================================ */}
          {nearbyEvents.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Icon name="Compass" size={18} color={theme.primary} />
                  <AppText weight="bold" variant="title">
                    Nearby & Recommended
                  </AppText>
                </View>
                <Badge label="IN YOUR REGION" variant="success" size="sm" showDot />
              </View>

              <View style={styles.verticalSectionList}>
                {nearbyEvents.map((evt) => (
                  <EventCardItem
                    key={evt.id}
                    event={evt}
                    onBookmark={handleBookmark}
                    onToggleJoin={handleToggleJoin}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* 3. UPCOMING EVENTS                                           */}
          {/* ============================================================ */}
          {upcomingEvents.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Icon name="Calendar" size={18} color={theme.primary} />
                  <AppText weight="bold" variant="title">
                    Upcoming Conferences
                  </AppText>
                </View>
                <Badge label={`${upcomingEvents.length} SCHEDULED`} variant="outline" size="sm" />
              </View>

              <View style={styles.verticalSectionList}>
                {upcomingEvents.map((evt) => (
                  <EventCardItem
                    key={evt.id}
                    event={evt}
                    onBookmark={handleBookmark}
                    onToggleJoin={handleToggleJoin}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* 4. SAVED / BOOKMARKED EVENTS                                 */}
          {/* ============================================================ */}
          {savedEvents.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <Icon name="Bookmark" size={18} color={theme.primary} />
                  <AppText weight="bold" variant="title">
                    Saved Expos
                  </AppText>
                </View>
                <Badge label={`${savedEvents.length} SAVED`} variant="primary" size="sm" />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalCarousel}>
                {savedEvents.map((evt) => (
                  <EventCardItem
                    key={evt.id}
                    event={evt}
                    onBookmark={handleBookmark}
                    onToggleJoin={handleToggleJoin}
                    cardWidth={isTablet || isDesktop ? 380 : 310}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      )}

      {/* Filter Bottom Sheet */}
      <EventFilterSheet
        visible={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => {
          setIndustry(newFilters.industry);
          setCountry(newFilters.country);
          setCity(newFilters.city);
          setDateRange(newFilters.dateRange);
          setStatus(newFilters.status);
          setSortBy(newFilters.sortBy);
        }}
        onResetFilters={resetFilters}
        totalFilteredCount={displayedFilteredList.length}
        availableIndustries={availableIndustries}
        availableCountries={availableCountries}
        availableCities={availableCities}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
  },
  filterBtn: {
    minWidth: 42,
    height: 42,
  },
  filterIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
  },
  filterBadgeIndicator: {
    position: 'absolute',
    top: -5,
    right: -7,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
  activeChipsWrapper: {
    paddingVertical: 2,
  },
  activeChipsRail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearAllInlineBtn: {
    paddingHorizontal: 8,
  },
  feedTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  feedTabBtn: {
    flex: 1,
    minWidth: 70,
  },
  categoryRailWrapper: {
    paddingTop: 2,
  },
  categoryRail: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  skeletonContainer: {
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  errorContainer: {
    paddingVertical: Spacing.xl,
  },
  listContainer: {
    flex: 1,
    paddingTop: Spacing.xs,
  },
  filterResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  resultCountGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  sortActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  feedStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  flatListContent: {
    paddingBottom: Spacing.xl + 20,
    gap: Spacing.md,
  },
  verticalListItem: {
    marginBottom: Spacing.md,
  },
  feedScrollView: {
    flex: 1,
  },
  feedScrollContent: {
    paddingBottom: Spacing.xl + 30,
    gap: Spacing.lg,
  },
  sectionBlock: {
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  horizontalCarousel: {
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  verticalSectionList: {
    gap: Spacing.md,
  },

  // Event Card Styles
  eventCard: {
    overflow: 'hidden',
    padding: 0,
    borderRadius: Radius.large,
  },
  imageContainer: {
    width: '100%',
    height: 165,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imageScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
  },
  imageTopRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
    paddingRight: Spacing.xs,
  },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBottomText: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.md,
    right: Spacing.md,
    gap: 2,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerLocationText: {
    color: '#E2E8F0',
  },
  cardContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#94A3B830',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
    gap: Spacing.sm,
  },
  joinBtn: {
    flex: 1,
  },
});
