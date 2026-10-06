import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  AppText,
  BottomSheet,
  Button,
  Chip,
  Divider,
  Icon,
  Input,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/theme';
import { LeadIntent } from '@/types/lead';

export interface LeadFilterState {
  temperature?: 'hot' | 'warm' | 'cold';
  intent?: LeadIntent;
  eventId?: string;
  company?: string;
  assignedToId?: string;
  followUpStatus?: 'none' | 'pending' | 'scheduled' | 'completed';
  dateRange?: 'all' | 'today' | 'yesterday' | 'week' | 'month';
  sortBy?: 'createdAt' | 'score' | 'company' | 'name' | 'priority' | 'temperature';
  sortOrder?: 'asc' | 'desc';
}

export interface LeadFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: LeadFilterState;
  onApplyFilters: (newFilters: LeadFilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount?: number;
}

const EVENTS_LIST = [
  { id: 'evt-2026-ces', name: 'CES 2026 International' },
  { id: 'evt-2026-saastr', name: 'SaaStr Annual 2026' },
  { id: 'evt-2026-mwc', name: 'MWC Barcelona 2026' },
];

const TEAM_MEMBERS_LIST = [
  { id: 'usr-alex-1', name: 'Alex Mercer (VP)' },
  { id: 'usr-elena-2', name: 'Elena Rostova (Lead)' },
  { id: 'usr-david-3', name: 'David Chen (AE)' },
  { id: 'usr-sarah-4', name: 'Sarah Jenkins (Solutions)' },
];

const DATE_OPTIONS: { id: LeadFilterState['dateRange']; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'Past 30 Days' },
];

const FOLLOW_UP_OPTIONS: { id: LeadFilterState['followUpStatus']; label: string }[] = [
  { id: 'pending', label: '⏳ Pending' },
  { id: 'scheduled', label: '🗓️ Meeting Set' },
  { id: 'completed', label: '✅ Contacted' },
  { id: 'none', label: '— None' },
];

const QUICK_COMPANIES = [
  'SolarDrive',
  'Apex Global',
  'Quantum Aerospace',
  'Cyberdyne',
  'Horizon Robotics',
  'CloudScale',
];

export function LeadFilterSheet({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  totalFilteredCount,
}: LeadFilterSheetProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Working filter state inside the sheet
  const [draft, setDraft] = useState<LeadFilterState>(filters);

  // Sync when sheet opens without synchronous cascading render
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setDraft(filters);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [visible, filters]);

  const activeCount = React.useMemo(() => {
    let count = 0;
    if (draft.temperature) count++;
    if (draft.intent) count++;
    if (draft.eventId) count++;
    if (draft.company?.trim()) count++;
    if (draft.assignedToId) count++;
    if (draft.followUpStatus) count++;
    if (draft.dateRange && draft.dateRange !== 'all') count++;
    return count;
  }, [draft]);

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft({
      dateRange: 'all',
    });
    onResetFilters();
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filter Leads"
      maxHeightPercent={0.88}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Temperature Section */}
        <View style={styles.section}>
          <AppText variant="title" weight="bold">
            Lead Temperature
          </AppText>
          <View style={styles.chipsRow}>
            {(['hot', 'warm', 'cold'] as const).map((temp) => {
              const isSelected = draft.temperature === temp;
              const label =
                temp === 'hot' ? '🔥 Hot Lead' : temp === 'warm' ? '⚡ Warm Lead' : '❄️ Cold Lead';
              return (
                <Chip
                  key={temp}
                  label={label}
                  selected={isSelected}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      temperature: isSelected ? undefined : temp,
                    }))
                  }
                />
              );
            })}
          </View>
        </View>

        <Divider />

        {/* Lead Intent Section */}
        <View style={styles.section}>
          <AppText variant="title" weight="bold">
            Lead Intent
          </AppText>
          <View style={styles.chipsRow}>
            {(
              [
                { value: 'buying', label: '🛒 Buying' },
                { value: 'partnership', label: '🤝 Partnership' },
                { value: 'information', label: 'ℹ️ Information' },
                { value: 'follow_up', label: '📅 Follow-up' },
                { value: 'other', label: '🌐 Other' },
              ] as const
            ).map((opt) => {
              const isSelected = draft.intent === opt.value;
              return (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={isSelected}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      intent: isSelected ? undefined : opt.value,
                    }))
                  }
                />
              );
            })}
          </View>
        </View>

        <Divider />

        {/* Trade Show Event Section */}
        <View style={styles.section}>
          <AppText variant="title" weight="bold">
            Trade Show Event
          </AppText>
          <View style={styles.chipsRow}>
            {EVENTS_LIST.map((ev) => {
              const isSelected = draft.eventId === ev.id;
              return (
                <Chip
                  key={ev.id}
                  label={ev.name}
                  selected={isSelected}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      eventId: isSelected ? undefined : ev.id,
                    }))
                  }
                />
              );
            })}
          </View>
        </View>

        <Divider />

        {/* Company Filter Section */}
        <View style={styles.section}>
          <AppText variant="title" weight="bold">
            Target Company
          </AppText>
          <Input
            placeholder="Type company name…"
            value={draft.company || ''}
            onChangeText={(text) =>
              setDraft((prev) => ({ ...prev, company: text || undefined }))
            }
            autoCapitalize="words"
            autoCorrect={false}
            clearButtonMode="while-editing"
            leftAccessory={<Icon name="Building" size={16} color={theme.textMuted} />}
          />
          <View style={[styles.chipsRow, { marginTop: Spacing.xs }]}>
            {QUICK_COMPANIES.map((company) => {
              const isSelected =
                draft.company?.toLowerCase() === company.toLowerCase();
              return (
                <Chip
                  key={company}
                  label={company}
                  selected={isSelected}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      company: isSelected ? undefined : company,
                    }))
                  }
                />
              );
            })}
          </View>
        </View>

        <Divider />

        {/* Date Captured Range Section */}
        <View style={styles.section}>
          <AppText variant="title" weight="bold">
            Capture Date Range
          </AppText>
          <View style={styles.chipsRow}>
            {DATE_OPTIONS.map((opt) => {
              const isSelected =
                (draft.dateRange || 'all') === opt.id;
              return (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={isSelected}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      dateRange: opt.id,
                    }))
                  }
                />
              );
            })}
          </View>
        </View>

        <Divider />

        {/* Assigned Team Member Section */}
        <View style={styles.section}>
          <AppText variant="title" weight="bold">
            Assigned Sales Representative
          </AppText>
          <View style={styles.chipsRow}>
            {TEAM_MEMBERS_LIST.map((member) => {
              const isSelected = draft.assignedToId === member.id;
              return (
                <Chip
                  key={member.id}
                  label={member.name}
                  selected={isSelected}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      assignedToId: isSelected ? undefined : member.id,
                    }))
                  }
                />
              );
            })}
          </View>
        </View>

        <Divider />

        {/* Follow-up Status Section */}
        <View style={styles.section}>
          <AppText variant="title" weight="bold">
            Follow-Up Status
          </AppText>
          <View style={styles.chipsRow}>
            {FOLLOW_UP_OPTIONS.map((fup) => {
              const isSelected = draft.followUpStatus === fup.id;
              return (
                <Chip
                  key={fup.id}
                  label={fup.label}
                  selected={isSelected}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      followUpStatus: isSelected ? undefined : fup.id,
                    }))
                  }
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.sheetFooter, { borderTopColor: theme.borderSubtle }]}>
        <Button
          label="Reset Filters"
          variant="outline"
          size="md"
          onPress={handleReset}
          style={styles.actionButton}
        />
        <Button
          label={
            totalFilteredCount !== undefined
              ? `Show ${totalFilteredCount} Leads`
              : activeCount > 0
              ? `Apply Filters (${activeCount})`
              : 'Apply Filters'
          }
          variant="primary"
          size="md"
          onPress={handleApply}
          style={styles.actionButton}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
  },
});
