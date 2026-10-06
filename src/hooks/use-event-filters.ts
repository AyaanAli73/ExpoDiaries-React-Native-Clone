import { useCallback, useMemo, useState } from 'react';

import { Event } from '@/types/event';

export type EventSortOption =
  | 'date_asc'
  | 'date_desc'
  | 'name_asc'
  | 'exhibitor_desc'
  | 'distance_asc';

export type EventDateFilter =
  | 'all'
  | 'this_week'
  | 'this_month'
  | 'next_3_months'
  | 'upcoming';

export type EventStatusFilter = 'all' | 'active' | 'upcoming' | 'completed';

export interface EventFilterState {
  searchQuery: string;
  country: string;
  city: string;
  industry: string;
  dateRange: EventDateFilter;
  status: EventStatusFilter;
  sortBy: EventSortOption;
}

export interface FilterChipItem {
  id: string;
  key: keyof EventFilterState;
  label: string;
  onRemove: () => void;
}

export const SORT_OPTIONS: { id: EventSortOption; label: string; icon: string }[] = [
  { id: 'date_asc', label: 'Date: Soonest First', icon: 'Calendar' },
  { id: 'date_desc', label: 'Date: Latest First', icon: 'Calendar' },
  { id: 'name_asc', label: 'Name: A–Z', icon: 'ArrowDownAZ' },
  { id: 'exhibitor_desc', label: 'Most Exhibitors', icon: 'Building2' },
  { id: 'distance_asc', label: 'Closest Distance', icon: 'MapPin' },
];

export const DATE_FILTER_OPTIONS: { id: EventDateFilter; label: string }[] = [
  { id: 'all', label: 'Any Date' },
  { id: 'upcoming', label: 'Upcoming Shows' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'next_3_months', label: 'Next 3 Months' },
];

export const STATUS_FILTER_OPTIONS: { id: EventStatusFilter; label: string }[] = [
  { id: 'all', label: 'All Statuses' },
  { id: 'active', label: 'Active Now' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

export const INITIAL_FILTER_STATE: EventFilterState = {
  searchQuery: '',
  country: 'All',
  city: 'All',
  industry: 'All',
  dateRange: 'all',
  status: 'all',
  sortBy: 'date_asc',
};

export function useEventFilters(initialState?: Partial<EventFilterState>) {
  const [filters, setFilters] = useState<EventFilterState>({
    ...INITIAL_FILTER_STATE,
    ...initialState,
  });

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setCountry = useCallback((country: string) => {
    setFilters((prev) => ({ ...prev, country }));
  }, []);

  const setCity = useCallback((city: string) => {
    setFilters((prev) => ({ ...prev, city }));
  }, []);

  const setIndustry = useCallback((industry: string) => {
    setFilters((prev) => ({ ...prev, industry }));
  }, []);

  const setDateRange = useCallback((dateRange: EventDateFilter) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  }, []);

  const setStatus = useCallback((status: EventStatusFilter) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setSortBy = useCallback((sortBy: EventSortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
  }, []);

  const clearFilter = useCallback((key: keyof EventFilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: INITIAL_FILTER_STATE[key],
    }));
  }, []);

  // Filter count (excluding search query and default sort)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.country !== 'All') count++;
    if (filters.city !== 'All') count++;
    if (filters.industry !== 'All') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.sortBy !== 'date_asc') count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0 || Boolean(filters.searchQuery.trim());

  // Filter chips for UI display
  const filterChips = useMemo<FilterChipItem[]>(() => {
    const chips: FilterChipItem[] = [];

    if (filters.searchQuery.trim()) {
      chips.push({
        id: 'searchQuery',
        key: 'searchQuery',
        label: `“${filters.searchQuery.trim()}”`,
        onRemove: () => clearFilter('searchQuery'),
      });
    }

    if (filters.industry !== 'All') {
      chips.push({
        id: 'industry',
        key: 'industry',
        label: `Industry: ${filters.industry}`,
        onRemove: () => clearFilter('industry'),
      });
    }

    if (filters.city !== 'All') {
      chips.push({
        id: 'city',
        key: 'city',
        label: `City: ${filters.city}`,
        onRemove: () => clearFilter('city'),
      });
    }

    if (filters.country !== 'All') {
      chips.push({
        id: 'country',
        key: 'country',
        label: `Country: ${filters.country}`,
        onRemove: () => clearFilter('country'),
      });
    }

    if (filters.status !== 'all') {
      const match = STATUS_FILTER_OPTIONS.find((s) => s.id === filters.status);
      chips.push({
        id: 'status',
        key: 'status',
        label: `Status: ${match ? match.label : filters.status}`,
        onRemove: () => clearFilter('status'),
      });
    }

    if (filters.dateRange !== 'all') {
      const match = DATE_FILTER_OPTIONS.find((d) => d.id === filters.dateRange);
      chips.push({
        id: 'dateRange',
        key: 'dateRange',
        label: `Date: ${match ? match.label : filters.dateRange}`,
        onRemove: () => clearFilter('dateRange'),
      });
    }

    if (filters.sortBy !== 'date_asc') {
      const match = SORT_OPTIONS.find((s) => s.id === filters.sortBy);
      chips.push({
        id: 'sortBy',
        key: 'sortBy',
        label: `Sort: ${match ? match.label : filters.sortBy}`,
        onRemove: () => clearFilter('sortBy'),
      });
    }

    return chips;
  }, [filters, clearFilter]);

  // Pure filtering and sorting pipeline
  const filterAndSortEvents = useCallback(
    (events: Event[]): Event[] => {
      if (!events || events.length === 0) return [];

      const query = filters.searchQuery.trim().toLowerCase();
      const now = Date.now();

      // 1. Filter
      let result = events.filter((event) => {
        // Search by: event name, city, country, industry
        if (query) {
          const nameMatch = event.name.toLowerCase().includes(query);
          const cityMatch = (event.city || event.location || '').toLowerCase().includes(query);
          const countryMatch = (event.country || '').toLowerCase().includes(query);
          const industryMatch = (event.industry || event.category || '')
            .toLowerCase()
            .includes(query);
          const venueMatch = (event.venue || '').toLowerCase().includes(query);

          if (!nameMatch && !cityMatch && !countryMatch && !industryMatch && !venueMatch) {
            return false;
          }
        }

        // Country filter
        if (filters.country !== 'All') {
          const c = event.country || 'United States';
          if (c.toLowerCase() !== filters.country.toLowerCase()) {
            return false;
          }
        }

        // City filter
        if (filters.city !== 'All') {
          const c = event.city || event.location.split(',')[0]?.trim() || '';
          if (c.toLowerCase() !== filters.city.toLowerCase()) {
            return false;
          }
        }

        // Industry filter
        if (filters.industry !== 'All') {
          const ind = event.industry || event.category || '';
          if (ind.toLowerCase() !== filters.industry.toLowerCase()) {
            return false;
          }
        }

        // Event Status filter
        if (filters.status !== 'all') {
          if (event.status !== filters.status) {
            return false;
          }
        }

        // Date Range filter
        if (filters.dateRange !== 'all') {
          const startTime = new Date(event.startDate).getTime();
          const endTime = new Date(event.endDate).getTime();

          if (filters.dateRange === 'upcoming') {
            if (event.status !== 'upcoming' && startTime < now) {
              return false;
            }
          } else if (filters.dateRange === 'this_week') {
            const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
            // Either actively ongoing or starting within 7 days
            const isOngoing = startTime <= now && endTime >= now;
            const startsThisWeek = startTime >= now && startTime <= now + oneWeekMs;
            if (!isOngoing && !startsThisWeek) {
              return false;
            }
          } else if (filters.dateRange === 'this_month') {
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            const isOngoing = startTime <= now && endTime >= now;
            const startsThisMonth = startTime >= now && startTime <= now + thirtyDaysMs;
            if (!isOngoing && !startsThisMonth) {
              return false;
            }
          } else if (filters.dateRange === 'next_3_months') {
            const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
            const isOngoing = startTime <= now && endTime >= now;
            const startsIn90Days = startTime >= now && startTime <= now + ninetyDaysMs;
            if (!isOngoing && !startsIn90Days) {
              return false;
            }
          }
        }

        return true;
      });

      // 2. Sort
      result = [...result].sort((a, b) => {
        switch (filters.sortBy) {
          case 'date_asc':
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          case 'date_desc':
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'exhibitor_desc': {
            const countA = a.exhibitorCount || a.totalExhibitorsCount || 0;
            const countB = b.exhibitorCount || b.totalExhibitorsCount || 0;
            return countB - countA;
          }
          case 'distance_asc': {
            const distA = a.distanceMiles ?? 99999;
            const distB = b.distanceMiles ?? 99999;
            return distA - distB;
          }
          default:
            return 0;
        }
      });

      return result;
    },
    [filters]
  );

  return {
    filters,
    setSearchQuery,
    setCountry,
    setCity,
    setIndustry,
    setDateRange,
    setStatus,
    setSortBy,
    resetFilters,
    clearFilter,
    activeFilterCount,
    hasActiveFilters,
    filterChips,
    filterAndSortEvents,
  };
}
