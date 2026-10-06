import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  AppText,
  BottomSheet,
  Button,
  Chip,
  Divider,
  Icon,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DATE_FILTER_OPTIONS,
  EventFilterState,
  SORT_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/hooks/use-event-filters';
import { Colors, Spacing } from '@/theme';

export interface EventFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: EventFilterState;
  onApplyFilters: (newFilters: EventFilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount?: number;
  availableIndustries?: string[];
  availableCountries?: string[];
  availableCities?: string[];
}

const DEFAULT_INDUSTRIES = [
  'AI & Hardware',
  'Enterprise SaaS',
  'Cloud Infrastructure',
  'Cybersecurity',
  'Fintech',
  'Healthcare & BioTech',
  'Telecom & Edge',
  'Startups & VCs',
];

const DEFAULT_COUNTRIES = ['United States', 'Spain', 'Finland'];

const DEFAULT_CITIES = [
  'Las Vegas',
  'San Francisco',
  'San Mateo',
  'New York',
  'Boston',
  'Barcelona',
  'Helsinki',
];

function EventFilterSheetContent({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  totalFilteredCount,
  availableIndustries = DEFAULT_INDUSTRIES,
  availableCountries = DEFAULT_COUNTRIES,
  availableCities = DEFAULT_CITIES,
}: EventFilterSheetProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Local draft state initialized fresh on sheet mount
  const [draft, setDraft] = useState<EventFilterState>(filters);

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  const hasDraftChanges = useMemo(() => {
    return (
      draft.country !== 'All' ||
      draft.city !== 'All' ||
      draft.industry !== 'All' ||
      draft.dateRange !== 'all' ||
      draft.status !== 'all' ||
      draft.sortBy !== 'date_asc'
    );
  }, [draft]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filter & Sort Expos"
      subtitle="Refine trade shows by location, date window, sector, or attendance"
      maxHeightPercent={90}
      footer={
        <View style={styles.footerRow}>
          <Button
            label="Clear All"
            variant="outline"
            size="md"
            disabled={!hasDraftChanges}
            onPress={handleReset}
            style={styles.clearBtn}
          />
          <Button
            label={
              totalFilteredCount !== undefined
                ? `Apply Filters (${totalFilteredCount})`
                : 'Apply Filters'
            }
            variant="primary"
            size="md"
            onPress={handleApply}
            style={styles.applyBtn}
          />
        </View>
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sheetContent}>
        {/* 1. Sort Option */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="ArrowDownUp" size={16} color={theme.primary} />
            <AppText weight="bold" variant="body">
              Sort By
            </AppText>
          </View>
          <View style={styles.chipCluster}>
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                label={opt.label}
                selected={draft.sortBy === opt.id}
                onPress={() => setDraft((p) => ({ ...p, sortBy: opt.id }))}
                size="md"
              />
            ))}
          </View>
        </View>

        <Divider />

        {/* 2. Event Status */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="Radio" size={16} color={theme.primary} />
            <AppText weight="bold" variant="body">
              Event Status
            </AppText>
          </View>
          <View style={styles.chipCluster}>
            {STATUS_FILTER_OPTIONS.map((statusOpt) => (
              <Chip
                key={statusOpt.id}
                label={statusOpt.label}
                selected={draft.status === statusOpt.id}
                onPress={() => setDraft((p) => ({ ...p, status: statusOpt.id }))}
                size="md"
              />
            ))}
          </View>
        </View>

        <Divider />

        {/* 3. Industry Sector */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="Briefcase" size={16} color={theme.primary} />
            <AppText weight="bold" variant="body">
              Industry Sector
            </AppText>
          </View>
          <View style={styles.chipCluster}>
            <Chip
              label="All Industries"
              selected={draft.industry === 'All'}
              onPress={() => setDraft((p) => ({ ...p, industry: 'All' }))}
              size="md"
            />
            {availableIndustries.map((ind) => (
              <Chip
                key={ind}
                label={ind}
                selected={draft.industry.toLowerCase() === ind.toLowerCase()}
                onPress={() => setDraft((p) => ({ ...p, industry: ind }))}
                size="md"
              />
            ))}
          </View>
        </View>

        <Divider />

        {/* 4. Date Window */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="Calendar" size={16} color={theme.primary} />
            <AppText weight="bold" variant="body">
              Date Window
            </AppText>
          </View>
          <View style={styles.chipCluster}>
            {DATE_FILTER_OPTIONS.map((dOpt) => (
              <Chip
                key={dOpt.id}
                label={dOpt.label}
                selected={draft.dateRange === dOpt.id}
                onPress={() => setDraft((p) => ({ ...p, dateRange: dOpt.id }))}
                size="md"
              />
            ))}
          </View>
        </View>

        <Divider />

        {/* 5. Country */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="Globe" size={16} color={theme.primary} />
            <AppText weight="bold" variant="body">
              Country
            </AppText>
          </View>
          <View style={styles.chipCluster}>
            <Chip
              label="All Countries"
              selected={draft.country === 'All'}
              onPress={() => setDraft((p) => ({ ...p, country: 'All' }))}
              size="md"
            />
            {availableCountries.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={draft.country.toLowerCase() === c.toLowerCase()}
                onPress={() => setDraft((p) => ({ ...p, country: c }))}
                size="md"
              />
            ))}
          </View>
        </View>

        <Divider />

        {/* 6. City */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="MapPin" size={16} color={theme.primary} />
            <AppText weight="bold" variant="body">
              City
            </AppText>
          </View>
          <View style={styles.chipCluster}>
            <Chip
              label="All Cities"
              selected={draft.city === 'All'}
              onPress={() => setDraft((p) => ({ ...p, city: 'All' }))}
              size="md"
            />
            {availableCities.map((city) => (
              <Chip
                key={city}
                label={city}
                selected={draft.city.toLowerCase() === city.toLowerCase()}
                onPress={() => setDraft((p) => ({ ...p, city }))}
                size="md"
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

export function EventFilterSheet(props: EventFilterSheetProps) {
  if (!props.visible) return null;
  return <EventFilterSheetContent {...props} />;
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  sectionBlock: {
    gap: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  chipCluster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  clearBtn: {
    flex: 1,
  },
  applyBtn: {
    flex: 2,
  },
});
