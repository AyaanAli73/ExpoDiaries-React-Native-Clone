import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ScreenContainer } from '@/components/layout/screen-container';
import {
  LeadCard,
  LeadFilterSheet,
  LeadFilterState,
} from '@/components/leads';
import {
  AppText,
  Button,
  Chip,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  Skeleton,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInfiniteLeads } from '@/hooks/use-leads';
import { useResponsive } from '@/hooks/use-responsive';
import { Colors, Radius, Spacing } from '@/theme';
import { Lead, LeadFilter } from '@/types/lead';

const QUICK_FILTERS: { id: string; label: string; patch: Partial<LeadFilterState> }[] = [
  { id: 'all', label: 'All Leads', patch: { temperature: undefined, followUpStatus: undefined } },
  { id: 'hot', label: '🔥 Hot', patch: { temperature: 'hot' } },
  { id: 'warm', label: '⚡ Warm', patch: { temperature: 'warm' } },
  { id: 'cold', label: '❄️ Cold', patch: { temperature: 'cold' } },
  { id: 'pending_fup', label: '⏳ Due Follow-up', patch: { followUpStatus: 'pending' } },
  { id: 'meetings', label: '🗓️ Meeting Set', patch: { followUpStatus: 'scheduled' } },
];

export default function LeadsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { isTablet, isDesktop } = useResponsive();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');

  const [filters, setFilters] = useState<LeadFilterState>({
    dateRange: 'all',
  });

  // Construct query filter
  const queryFilter = useMemo<LeadFilter>(() => {
    return {
      query: search.trim() || undefined,
      temperature: filters.temperature,
      eventId: filters.eventId,
      company: filters.company,
      assignedToId: filters.assignedToId,
      followUpStatus: filters.followUpStatus,
      dateRange: filters.dateRange,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc',
    };
  }, [search, filters]);

  // Paginated/Infinite Leads Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteLeads(queryFilter, 10);

  // Flatten paginated results
  const allLeads = useMemo<Lead[]>(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  const totalCount = data?.pages[0]?.total ?? allLeads.length;

  // Active filters count (excluding default dateRange: 'all')
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.temperature) count++;
    if (filters.eventId) count++;
    if (filters.company?.trim()) count++;
    if (filters.assignedToId) count++;
    if (filters.followUpStatus) count++;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    return count;
  }, [filters]);

  const handleApplyFilters = useCallback((newFilters: LeadFilterState) => {
    setFilters(newFilters);
    // Sync quick filter chip if temperature matches
    if (newFilters.temperature) {
      setActiveQuickFilter(newFilters.temperature);
    } else if (newFilters.followUpStatus === 'pending') {
      setActiveQuickFilter('pending_fup');
    } else if (newFilters.followUpStatus === 'scheduled') {
      setActiveQuickFilter('meetings');
    } else {
      setActiveQuickFilter('all');
    }
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ dateRange: 'all' });
    setActiveQuickFilter('all');
    setSearch('');
  }, []);

  const handleQuickFilterPress = (item: (typeof QUICK_FILTERS)[number]) => {
    setActiveQuickFilter(item.id);
    setFilters((prev) => ({
      ...prev,
      ...item.patch,
    }));
  };

  const handleRemoveFilter = (filterKey: keyof LeadFilterState) => {
    setFilters((prev) => {
      const updated = { ...prev };
      delete updated[filterKey];
      return updated;
    });
    if (filterKey === 'temperature' || filterKey === 'followUpStatus') {
      setActiveQuickFilter('all');
    }
  };

  // Render Lead Item for FlatList
  const renderItem = useCallback(
    ({ item, index }: { item: Lead; index: number }) => (
      <Animated.View
        entering={FadeInDown.duration(280).delay(Math.min(index * 35, 300)).springify().damping(18)}
        style={[
          styles.leadItemWrapper,
          isTablet || isDesktop ? styles.leadItemGrid : null,
        ]}>
        <LeadCard lead={item} />
      </Animated.View>
    ),
    [isTablet, isDesktop]
  );

  return (
    <ScreenContainer safeAreaEdges={['left', 'right']}>
      {/* Header Controls: Search, Filter Button, Export */}
      <Animated.View
        entering={FadeInDown.duration(280).springify().damping(18)}
        style={styles.headerControls}>
        <View style={styles.searchBar}>
          <Input
            placeholder="Search leads by name, company, booth…"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            leftAccessory={<Icon name="Search" size={16} color={theme.textMuted} />}
            clearButtonMode="while-editing"
            aria-label="Search leads"
          />
        </View>

        {/* Filter Sheet Trigger */}
        <Pressable
          style={[
            styles.filterTriggerButton,
            {
              backgroundColor: activeFiltersCount > 0 ? theme.primary : theme.surface,
              borderColor: activeFiltersCount > 0 ? theme.primary : theme.borderSubtle,
            },
          ]}
          onPress={() => setFilterSheetVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`Open lead filters, ${activeFiltersCount} filters active`}>
          <Icon
            name="Filter"
            size={18}
            color={activeFiltersCount > 0 ? '#FFFFFF' : theme.textPrimary}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadgeCircle}>
              <AppText variant="caption" weight="bold" style={styles.filterBadgeText}>
                {activeFiltersCount}
              </AppText>
            </View>
          )}
        </Pressable>

        <Button
          label="Export"
          variant="outline"
          size="md"
          leftIcon="Download"
          onPress={() => router.push('/leads/export')}
          aria-label="Export leads to CSV"
        />
      </Animated.View>

      {/* Quick Filter Horizontal Carousel */}
      <View style={styles.quickFilterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilterScroll}>
          {QUICK_FILTERS.map((item) => {
            const isSelected = activeQuickFilter === item.id;
            return (
              <Chip
                key={item.id}
                label={item.label}
                selected={isSelected}
                onPress={() => handleQuickFilterPress(item)}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Active Filter Chips Bar (if filters are active) */}
      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersScroll}>
            <AppText variant="caption" color="secondary" style={styles.activeFiltersLabel}>
              Filters:
            </AppText>

            {filters.temperature && (
              <Chip
                label={`Temp: ${filters.temperature.toUpperCase()} ✕`}
                selected
                size="sm"
                onPress={() => handleRemoveFilter('temperature')}
              />
            )}

            {filters.eventId && (
              <Chip
                label={`${filters.eventId === 'evt-2026-ces' ? 'CES 2026' : 'SaaStr 2026'} ✕`}
                selected
                size="sm"
                onPress={() => handleRemoveFilter('eventId')}
              />
            )}

            {Boolean(filters.company) && (
              <Chip
                label={`Company: ${filters.company} ✕`}
                selected
                size="sm"
                onPress={() => handleRemoveFilter('company')}
              />
            )}

            {Boolean(filters.assignedToId) && (
              <Chip
                label="Rep Assigned ✕"
                selected
                size="sm"
                onPress={() => handleRemoveFilter('assignedToId')}
              />
            )}

            {filters.followUpStatus && (
              <Chip
                label={`Follow-up: ${filters.followUpStatus} ✕`}
                selected
                size="sm"
                onPress={() => handleRemoveFilter('followUpStatus')}
              />
            )}

            {filters.dateRange && filters.dateRange !== 'all' && (
              <Chip
                label={`Date: ${filters.dateRange} ✕`}
                selected
                size="sm"
                onPress={() => handleRemoveFilter('dateRange')}
              />
            )}

            <Button
              label="Clear All"
              variant="ghost"
              size="sm"
              onPress={handleResetFilters}
            />
          </ScrollView>
        </View>
      )}

      {/* Results Header Count */}
      <View style={styles.resultsInfoRow}>
        <AppText variant="caption" color="secondary" weight="medium">
          Showing {allLeads.length} of {totalCount} leads
        </AppText>
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View style={styles.skeletonsContainer}>
          <Skeleton width="100%" height={140} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={140} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={140} style={{ borderRadius: Radius.large }} />
        </View>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Leads"
          message={error?.message || 'Unable to retrieve trade-show leads. Please check your connection and retry.'}
          retryLabel="Retry"
          onRetry={() => refetch()}
        />
      ) : allLeads.length === 0 ? (
        <EmptyState
          icon="Users"
          title="No Leads Found"
          description={
            search || activeFiltersCount > 0
              ? 'No lead matches your active filters and search term. Try resetting your criteria.'
              : 'Start capturing attendees on the trade-show floor by scanning badges or business cards.'
          }
          actionLabel={search || activeFiltersCount > 0 ? 'Clear Filters' : 'Scan Business Card'}
          onAction={
            search || activeFiltersCount > 0
              ? handleResetFilters
              : () => router.push('/(tabs)/capture')
          }
        />
      ) : (
        <FlatList
          data={allLeads}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={isTablet || isDesktop ? 2 : 1}
          key={isTablet || isDesktop ? 'grid-2' : 'list-1'}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            hasNextPage ? (
              <View style={styles.paginationFooter}>
                <Button
                  label={isFetchingNextPage ? 'Loading More Leads…' : 'Load More Leads'}
                  variant="outline"
                  size="sm"
                  onPress={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                />
              </View>
            ) : allLeads.length > 5 ? (
              <View style={styles.endOfListFooter}>
                <AppText variant="caption" color="muted">
                  ✓ All {allLeads.length} leads loaded
                </AppText>
              </View>
            ) : null
          }
        />
      )}

      {/* Comprehensive Lead Filter Sheet */}
      <LeadFilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        totalFilteredCount={totalCount}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  searchBar: {
    flex: 1,
  },
  filterTriggerButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadgeCircle: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
  },
  quickFilterSection: {
    paddingVertical: 4,
  },
  quickFilterScroll: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  activeFiltersRow: {
    paddingVertical: 4,
  },
  activeFiltersScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeFiltersLabel: {
    marginRight: 2,
    fontSize: 12,
  },
  resultsInfoRow: {
    paddingVertical: 4,
  },
  skeletonsContainer: {
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  listContent: {
    paddingBottom: Spacing['2xl'],
    paddingTop: Spacing.xs,
  },
  leadItemWrapper: {
    flex: 1,
  },
  leadItemGrid: {
    paddingHorizontal: 4,
  },
  paginationFooter: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  endOfListFooter: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
});
