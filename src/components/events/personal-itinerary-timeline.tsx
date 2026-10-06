import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

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
  EmptyState,
  Icon,
  IconButton,
  Input,
  Skeleton,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useCreateItineraryItem,
  useDeleteItineraryItem,
  useExhibitors,
  useItinerary,
  useReorderItinerary,
  useToggleBookmarkItinerary,
  useUpdateItineraryItem,
} from '@/hooks/use-events';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import {
  checkPotentialConflict,
  CreateItineraryItemInput,
  detectItineraryConflicts,
  ItineraryCategory,
  ItineraryItem,
} from '@/types/itinerary';

interface PersonalItineraryTimelineProps {
  eventId: string;
  onLocateBooth?: (boothNumber: string) => void;
  onFullScreenToggle?: () => void;
  isFullScreen?: boolean;
}

const CATEGORY_TEMPLATES: {
  category: ItineraryCategory;
  label: string;
  icon: string;
  colorVariant: 'primary' | 'success' | 'warning' | 'outline';
}[] = [
  { category: 'meeting', label: '1-on-1 Meeting', icon: 'Users', colorVariant: 'warning' },
  { category: 'booth_visit', label: 'Booth Visit', icon: 'Building2', colorVariant: 'primary' },
  { category: 'session', label: 'Event Session', icon: 'Calendar', colorVariant: 'outline' },
  { category: 'booth_duty', label: 'Booth Duty Shift', icon: 'Clock', colorVariant: 'success' },
  { category: 'networking', label: 'Networking / VIP', icon: 'Coffee', colorVariant: 'outline' },
];

const TIME_PRESETS = [
  { label: '08:00 AM', startHour: 8, startMin: 0 },
  { label: '09:00 AM', startHour: 9, startMin: 0 },
  { label: '10:00 AM', startHour: 10, startMin: 0 },
  { label: '11:00 AM', startHour: 11, startMin: 0 },
  { label: '12:00 PM', startHour: 12, startMin: 0 },
  { label: '01:00 PM', startHour: 13, startMin: 0 },
  { label: '02:00 PM', startHour: 14, startMin: 0 },
  { label: '03:30 PM', startHour: 15, startMin: 30 },
  { label: '05:00 PM', startHour: 17, startMin: 0 },
  { label: '07:00 PM', startHour: 19, startMin: 0 },
];

const DURATION_PRESETS = [
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '1.5h', minutes: 90 },
  { label: '2h', minutes: 120 },
];

export function PersonalItineraryTimeline({
  eventId,
  onLocateBooth,
  onFullScreenToggle,
  isFullScreen = false,
}: PersonalItineraryTimelineProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Queries
  const { data: allItinerary = [], isLoading: loadingItinerary } = useItinerary(eventId);
  const { data: exhibitors = [] } = useExhibitors(eventId);

  // Mutations
  const createItemMutation = useCreateItineraryItem();
  const updateItemMutation = useUpdateItineraryItem();
  const deleteItemMutation = useDeleteItineraryItem();
  const reorderMutation = useReorderItinerary();
  const toggleBookmarkMutation = useToggleBookmarkItinerary();

  // Local filter states
  const [selectedDay, setSelectedDay] = useState<'day1' | 'day2' | 'all'>('day2');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal / Form state for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  // Form fields
  const [formCategory, setFormCategory] = useState<ItineraryCategory>('meeting');
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formBooth, setFormBooth] = useState('');
  const [formHall, setFormHall] = useState('North Hall');
  const [formNotes, setFormNotes] = useState('');
  const [formDay, setFormDay] = useState<'day1' | 'day2'>('day2');
  const [formStartHour, setFormStartHour] = useState(10);
  const [formStartMin, setFormStartMin] = useState(0);
  const [formDurationMin, setFormDurationMin] = useState(45);
  const [formSpeaker, setFormSpeaker] = useState('');

  // 1. Conflict detection across all items
  const conflictMap = useMemo(() => {
    return detectItineraryConflicts(allItinerary);
  }, [allItinerary]);

  // 2. Filtered list for the active day and category
  const filteredItems = useMemo(() => {
    return allItinerary
      .filter((item) => {
        // Day filtering
        const isDay1 = item.startTime.includes('2026-10-04') || item.startTime.includes('2026-11-04');
        const isDay2 = item.startTime.includes('2026-10-05') || item.startTime.includes('2026-11-05');

        const matchDay =
          selectedDay === 'all' ? true : selectedDay === 'day1' ? isDay1 : isDay2;

        const matchCat =
          selectedCategory === 'all'
            ? true
            : selectedCategory === 'completed'
              ? Boolean(item.isCompleted)
              : item.category === selectedCategory;

        return matchDay && matchCat;
      })
      .sort((a, b) => {
        // Sort by order if set, otherwise by start time
        if (a.order !== undefined && b.order !== undefined && a.startTime === b.startTime) {
          return a.order - b.order;
        }
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
  }, [allItinerary, selectedDay, selectedCategory]);

  // 3. Trade Show "Happening Now / Next Up" Beacon
  const activeNowOrNextItem = useMemo(() => {
    const todayItems = allItinerary.filter((it) => it.startTime.includes('2026-10-05'));
    if (todayItems.length === 0) return null;

    // Fixed mock timestamp: 2026-10-05T10:15:00.000Z
    const mockNowMs = new Date('2026-10-05T10:15:00.000Z').getTime();

    // Check ongoing
    const ongoing = todayItems.find((it) => {
      const s = new Date(it.startTime).getTime();
      const e = new Date(it.endTime).getTime();
      return mockNowMs >= s && mockNowMs <= e;
    });

    if (ongoing) return { item: ongoing, isOngoing: true };

    // Check next upcoming
    const upcoming = todayItems
      .filter((it) => new Date(it.startTime).getTime() > mockNowMs)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

    return upcoming ? { item: upcoming, isOngoing: false } : null;
  }, [allItinerary]);

  // 4. Overlap count for current view
  const currentDayConflictCount = useMemo(() => {
    let count = 0;
    filteredItems.forEach((it) => {
      if (conflictMap.has(it.id)) count++;
    });
    return count;
  }, [filteredItems, conflictMap]);

  // Real-time conflict preview in form
  const candidateConflictList = useMemo(() => {
    if (!isModalOpen) return [];
    const datePrefix = formDay === 'day1' ? '2026-10-04' : '2026-10-05';
    const sIso = `${datePrefix}T${String(formStartHour).padStart(2, '0')}:${String(formStartMin).padStart(2, '0')}:00.000Z`;

    const endTotalMin = formStartMin + formDurationMin;
    const eHour = formStartHour + Math.floor(endTotalMin / 60);
    const eMin = endTotalMin % 60;
    const eIso = `${datePrefix}T${String(eHour).padStart(2, '0')}:${String(eMin).padStart(2, '0')}:00.000Z`;

    return checkPotentialConflict(
      {
        id: editingItem?.id,
        startTime: sIso,
        endTime: eIso,
      },
      allItinerary
    );
  }, [
    isModalOpen,
    formDay,
    formStartHour,
    formStartMin,
    formDurationMin,
    editingItem,
    allItinerary,
  ]);

  // Open Add Modal
  const handleOpenAddModal = (presetCategory?: ItineraryCategory) => {
    setEditingItem(null);
    setFormCategory(presetCategory || 'meeting');
    setFormTitle('');
    setFormCompany('');
    setFormBooth('');
    setFormHall('North Hall');
    setFormNotes('');
    setFormDay(selectedDay === 'day1' ? 'day1' : 'day2');
    setFormStartHour(10);
    setFormStartMin(0);
    setFormDurationMin(45);
    setFormSpeaker('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: ItineraryItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormCompany(item.company || '');
    setFormBooth(item.booth || '');
    setFormHall(item.hall || 'North Hall');
    setFormNotes(item.notes || '');
    setFormSpeaker(item.speakerName || '');

    const isDay1 = item.startTime.includes('2026-10-04') || item.startTime.includes('2026-11-04');
    setFormDay(isDay1 ? 'day1' : 'day2');

    try {
      const s = new Date(item.startTime);
      const e = new Date(item.endTime);
      setFormStartHour(s.getUTCHours());
      setFormStartMin(s.getUTCMinutes());
      const diffMin = Math.max(15, Math.round((e.getTime() - s.getTime()) / 60000));
      setFormDurationMin(diffMin);
    } catch {
      setFormStartHour(10);
      setFormStartMin(0);
      setFormDurationMin(45);
    }

    setIsModalOpen(true);
  };

  // Quick autofill when choosing an exhibitor
  const handleSelectExhibitor = (exName: string) => {
    setFormCompany(exName);
    const matched = exhibitors.find((e) => e.name.toLowerCase() === exName.toLowerCase());
    if (matched) {
      setFormBooth(matched.boothNumber);
      setFormHall(matched.hall || 'North Hall');
      if (!formTitle) {
        setFormTitle(
          formCategory === 'booth_visit'
            ? `Visit ${matched.name}`
            : `Meeting with ${matched.name}`
        );
      }
    }
  };

  // Save Add/Edit
  const handleSaveActivity = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Required Field', 'Please provide a title for this activity.');
      return;
    }

    const datePrefix = formDay === 'day1' ? '2026-10-04' : '2026-10-05';
    const sIso = `${datePrefix}T${String(formStartHour).padStart(2, '0')}:${String(formStartMin).padStart(2, '0')}:00.000Z`;

    const endTotalMin = formStartMin + formDurationMin;
    const eHour = formStartHour + Math.floor(endTotalMin / 60);
    const eMin = endTotalMin % 60;
    const eIso = `${datePrefix}T${String(eHour).padStart(2, '0')}:${String(eMin).padStart(2, '0')}:00.000Z`;

    const locationStr = formBooth
      ? `${formBooth}${formHall ? ` • ${formHall}` : ''}`
      : formHall || 'Trade Show Floor';

    try {
      if (editingItem) {
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          updates: {
            title: formTitle.trim(),
            category: formCategory,
            company: formCompany.trim() || undefined,
            booth: formBooth.trim() || undefined,
            hall: formHall.trim() || undefined,
            location: locationStr,
            notes: formNotes.trim() || undefined,
            speakerName: formSpeaker.trim() || undefined,
            startTime: sIso,
            endTime: eIso,
          },
        });
        setToastMessage(`Updated “${formTitle.trim()}”`);
      } else {
        const input: CreateItineraryItemInput = {
          eventId,
          title: formTitle.trim(),
          category: formCategory,
          company: formCompany.trim() || undefined,
          booth: formBooth.trim() || undefined,
          hall: formHall.trim() || undefined,
          location: locationStr,
          notes: formNotes.trim() || undefined,
          speakerName: formSpeaker.trim() || undefined,
          startTime: sIso,
          endTime: eIso,
          isBookmarked: true,
          remindersEnabled: true,
          isCompleted: false,
        };
        await createItemMutation.mutateAsync(input);
        setToastMessage(`Added “${formTitle.trim()}” to your itinerary`);
      }
      setIsModalOpen(false);
    } catch {
      Alert.alert('Error', 'Unable to save activity to itinerary. Please try again.');
    }
  };

  // Delete
  const handleDeleteActivity = async (item: ItineraryItem) => {
    try {
      await deleteItemMutation.mutateAsync({ id: item.id, eventId });
      setToastMessage(`Removed “${item.title}” from itinerary`);
    } catch {
      setToastMessage('Could not remove activity');
    }
  };

  // Toggle Completed
  const handleToggleCompleted = async (item: ItineraryItem) => {
    try {
      await updateItemMutation.mutateAsync({
        id: item.id,
        updates: { isCompleted: !item.isCompleted },
      });
      setToastMessage(
        item.isCompleted ? `Marked “${item.title}” as pending` : `Marked “${item.title}” as attended`
      );
    } catch {
      setToastMessage('Could not update status');
    }
  };

  const handleToggleBookmark = async (item: ItineraryItem) => {
    try {
      await toggleBookmarkMutation.mutateAsync(item.id);
      setToastMessage(
        item.isBookmarked
          ? `Removed “${item.title}” from bookmarks`
          : `Bookmarked “${item.title}”`
      );
    } catch {
      setToastMessage('Could not update bookmark');
    }
  };

  // Reorder Item Up/Down
  const handleMoveItem = async (item: ItineraryItem, direction: 'up' | 'down') => {
    const currentIndex = filteredItems.findIndex((it) => it.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredItems.length) return;

    const newOrder = [...filteredItems];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    try {
      await reorderMutation.mutateAsync({
        eventId,
        itemIds: newOrder.map((it) => it.id),
      });
      setToastMessage(`Reordered “${item.title}”`);
    } catch {
      setToastMessage('Could not reorder item');
    }
  };

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        duration={2400}
        onDismiss={() => setToastMessage(null)}
      />

      {/* ============================================================ */}
      {/* 1. TOP METRICS & QUICK ACTIONS STRIP                         */}
      {/* ============================================================ */}
      <View style={styles.topActionBar}>
        <View style={styles.metricsRow}>
          <View style={[styles.metricPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="Calendar" size={13} color={theme.primary} />
            <AppText variant="caption" weight="bold" tabular>
              {allItinerary.length} Activities
            </AppText>
          </View>

          <View style={[styles.metricPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="CheckCircle" size={13} color={theme.success} />
            <AppText variant="caption" weight="bold" tabular style={{ color: theme.success }}>
              {allItinerary.filter((i) => i.isCompleted).length} Attended
            </AppText>
          </View>

          {currentDayConflictCount > 0 && (
            <View style={[styles.metricPill, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
              <Icon name="AlertTriangle" size={13} color="#D97706" />
              <AppText variant="caption" weight="bold" tabular style={{ color: '#B45309' }}>
                {currentDayConflictCount} Conflicts
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.actionButtonsRow}>
          {onFullScreenToggle && (
            <IconButton
              icon={isFullScreen ? 'Minimize2' : 'Maximize2'}
              size="sm"
              variant="outline"
              accessibilityLabel={isFullScreen ? 'Exit full screen' : 'Expand full screen itinerary'}
              onPress={onFullScreenToggle}
            />
          )}

          <Button
            label="+ Add Activity"
            variant="primary"
            size="sm"
            leftIcon="Plus"
            onPress={() => handleOpenAddModal()}
          />
        </View>
      </View>

      {/* ============================================================ */}
      {/* 2. CONFLICT WARNING BANNER                                   */}
      {/* ============================================================ */}
      {currentDayConflictCount > 0 && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.conflictBanner}>
          <View style={styles.conflictBannerIcon}>
            <Icon name="AlertTriangle" size={18} color="#D97706" />
          </View>
          <View style={styles.conflictBannerTextCol}>
            <AppText weight="bold" variant="caption" style={{ color: '#92400E' }}>
              Schedule Overlap Detected ({currentDayConflictCount} Activities)
            </AppText>
            <AppText variant="caption" style={{ color: '#B45309', fontSize: 11 }}>
              Overlapping activities found in your timetable. Tap any card below to edit time or reorder.
            </AppText>
          </View>
        </Animated.View>
      )}

      {/* ============================================================ */}
      {/* 3. TRADE SHOW "NOW / NEXT UP" LIVE BEACON                    */}
      {/* ============================================================ */}
      {activeNowOrNextItem && (
        <Animated.View entering={FadeInDown.duration(240).springify().damping(18)}>
          <Card
            variant="elevated"
            density="compact"
            style={[
              styles.liveBeaconCard,
              {
                borderColor: activeNowOrNextItem.isOngoing ? theme.success : theme.primary,
                backgroundColor: activeNowOrNextItem.isOngoing
                  ? theme.successSubtle
                  : theme.surfaceElevated,
              },
            ]}>
            <View style={styles.beaconHeader}>
              <View style={styles.beaconBadgeGroup}>
                <View
                  style={[
                    styles.beaconPulseDot,
                    {
                      backgroundColor: activeNowOrNextItem.isOngoing
                        ? theme.success
                        : theme.primary,
                    },
                  ]}
                />
                <AppText
                  weight="bold"
                  variant="caption"
                  style={{
                    color: activeNowOrNextItem.isOngoing ? theme.success : theme.primary,
                    textTransform: 'uppercase',
                  }}>
                  {activeNowOrNextItem.isOngoing ? 'Happening Right Now' : 'Up Next on Agenda'}
                </AppText>
              </View>

              <Badge
                label={activeNowOrNextItem.item.category.replace('_', ' ').toUpperCase()}
                variant={activeNowOrNextItem.isOngoing ? 'success' : 'primary'}
                size="sm"
              />
            </View>

            <View style={styles.beaconContent}>
              <AppText weight="bold" variant="body" numberOfLines={1}>
                {activeNowOrNextItem.item.title}
              </AppText>
              <AppText variant="caption" color="secondary" numberOfLines={1}>
                {activeNowOrNextItem.item.company || activeNowOrNextItem.item.speakerName || 'Conference Event'}{' '}
                • {activeNowOrNextItem.item.location}
              </AppText>
            </View>

            <View style={styles.beaconFooter}>
              {activeNowOrNextItem.item.booth && onLocateBooth && (
                <Button
                  label={`Locate ${activeNowOrNextItem.item.booth}`}
                  variant="outline"
                  size="sm"
                  leftIcon="Compass"
                  onPress={() => onLocateBooth(activeNowOrNextItem.item.booth!)}
                />
              )}
              <Button
                label={activeNowOrNextItem.item.isCompleted ? 'Completed' : 'Mark Attended'}
                variant={activeNowOrNextItem.item.isCompleted ? 'secondary' : 'primary'}
                size="sm"
                leftIcon="Check"
                onPress={() => handleToggleCompleted(activeNowOrNextItem.item)}
              />
            </View>
          </Card>
        </Animated.View>
      )}

      {/* ============================================================ */}
      {/* 4. DAY TABS & CATEGORY FILTERS                               */}
      {/* ============================================================ */}
      <View style={styles.filterSection}>
        {/* Day switch */}
        <View style={styles.daySwitchRow}>
          <Button
            label="Day 1 • Oct 4"
            variant={selectedDay === 'day1' ? 'primary' : 'outline'}
            size="sm"
            onPress={() => setSelectedDay('day1')}
            style={{ flex: 1 }}
          />
          <Button
            label="Day 2 • Today"
            variant={selectedDay === 'day2' ? 'primary' : 'outline'}
            size="sm"
            onPress={() => setSelectedDay('day2')}
            style={{ flex: 1 }}
          />
          <Button
            label="All Days"
            variant={selectedDay === 'all' ? 'primary' : 'outline'}
            size="sm"
            onPress={() => setSelectedDay('all')}
          />
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsScroll}>
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'meeting', label: 'Meetings' },
            { id: 'booth_visit', label: 'Booth Visits' },
            { id: 'session', label: 'Sessions' },
            { id: 'booth_duty', label: 'Booth Shifts' },
            { id: 'completed', label: 'Attended' },
          ].map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              size="sm"
            />
          ))}
        </ScrollView>
      </View>

      {/* ============================================================ */}
      {/* 5. TIMELINE LIST                                             */}
      {/* ============================================================ */}
      {loadingItinerary ? (
        <View style={{ gap: Spacing.sm, paddingVertical: Spacing.sm }}>
          <Skeleton width="100%" height={120} style={{ borderRadius: Radius.medium }} />
          <Skeleton width="100%" height={120} style={{ borderRadius: Radius.medium }} />
        </View>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="Calendar"
          title="No Activities Scheduled"
          description="Your itinerary is clear for this filter. Add meetings, booth visits, or sessions."
          actionLabel="+ Add Your First Activity"
          onAction={() => handleOpenAddModal()}
        />
      ) : (
        <View style={styles.timelineList}>
          {filteredItems.map((item, index) => {
            const conflicts = conflictMap.get(item.id) || [];
            const hasConflict = conflicts.length > 0;
            const isCompleted = Boolean(item.isCompleted);

            const startTimeFormatted = new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }).format(new Date(item.startTime));

            const endTimeFormatted = new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }).format(new Date(item.endTime));

            // Duration in minutes
            const sMs = new Date(item.startTime).getTime();
            const eMs = new Date(item.endTime).getTime();
            const durationMin = Math.round((eMs - sMs) / 60000);

            return (
              <View key={item.id} style={styles.timelineRow}>
                {/* Left Trace Rail */}
                <View style={styles.traceRail}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isCompleted }}
                    accessibilityLabel={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    onPress={() => handleToggleCompleted(item)}
                    style={[
                      styles.traceDot,
                      {
                        backgroundColor: isCompleted
                          ? theme.success
                          : hasConflict
                            ? '#D97706'
                            : theme.primary,
                      },
                    ]}>
                    <Icon
                      name={isCompleted ? 'Check' : hasConflict ? 'AlertTriangle' : 'Clock'}
                      size={11}
                      color="#FFFFFF"
                    />
                  </Pressable>
                  {index < filteredItems.length - 1 && (
                    <View style={[styles.traceLine, { backgroundColor: theme.border }]} />
                  )}
                </View>

                {/* Timeline Card */}
                <Card
                  variant="elevated"
                  density="comfortable"
                  style={[
                    styles.timelineCard,
                    hasConflict && styles.cardConflictBorder,
                    isCompleted && styles.cardCompletedStyle,
                  ]}>
                  {/* Top Bar: Time, Category & Reorder Controls */}
                  <CardHeader style={styles.cardHeader}>
                    <View style={styles.timeTagRow}>
                      <View style={styles.timeBadgeBox}>
                        <Icon name="Clock" size={13} color={theme.primary} />
                        <AppText variant="caption" weight="bold" tabular>
                          {startTimeFormatted} – {endTimeFormatted}
                        </AppText>
                        <AppText variant="caption" color="secondary" tabular style={{ fontSize: 11 }}>
                          ({durationMin}m)
                        </AppText>
                      </View>

                      <Badge
                        label={item.category.replace('_', ' ').toUpperCase()}
                        variant={
                          item.category === 'booth_duty'
                            ? 'success'
                            : item.category === 'meeting'
                              ? 'warning'
                              : item.category === 'booth_visit'
                                ? 'primary'
                                : 'outline'
                        }
                        size="sm"
                      />
                    </View>

                    {/* Quick Reorder Up/Down */}
                    <View style={styles.reorderControlsRow}>
                      {index > 0 && (
                        <IconButton
                          icon="ArrowUp"
                          size="sm"
                          variant="ghost"
                          accessibilityLabel="Move activity up"
                          onPress={() => handleMoveItem(item, 'up')}
                        />
                      )}
                      {index < filteredItems.length - 1 && (
                        <IconButton
                          icon="ArrowDown"
                          size="sm"
                          variant="ghost"
                          accessibilityLabel="Move activity down"
                          onPress={() => handleMoveItem(item, 'down')}
                        />
                      )}
                      <IconButton
                        icon={item.isBookmarked ? 'BookmarkCheck' : 'Bookmark'}
                        size="sm"
                        variant="ghost"
                        accessibilityLabel={item.isBookmarked ? 'Remove bookmark' : 'Bookmark activity'}
                        onPress={() => handleToggleBookmark(item)}
                      />
                    </View>
                  </CardHeader>

                  <CardContent style={styles.cardBody}>
                    {/* Activity Title */}
                    <AppText
                      weight="bold"
                      variant="body"
                      style={[isCompleted && styles.completedText]}>
                      {item.title}
                    </AppText>

                    {/* Company & Speaker */}
                    {(item.company || item.speakerName) && (
                      <View style={styles.metaRow}>
                        {item.company && (
                          <View style={styles.metaChip}>
                            <Icon name="Building2" size={12} color={theme.primary} />
                            <AppText variant="caption" weight="semibold" color="primary">
                              {item.company}
                            </AppText>
                          </View>
                        )}
                        {item.speakerName && (
                          <View style={styles.metaChip}>
                            <Icon name="User" size={12} color={theme.textMuted} />
                            <AppText variant="caption" color="secondary">
                              {item.speakerName}
                            </AppText>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Booth & Hall Badges */}
                    <View style={styles.locationBadgesRow}>
                      {item.booth && (
                        <Badge label={`Booth: ${item.booth}`} variant="outline" size="sm" />
                      )}
                      {item.hall && (
                        <Badge label={`Hall: ${item.hall}`} variant="outline" size="sm" />
                      )}
                      {item.location && !item.booth && (
                        <Badge label={item.location} variant="outline" size="sm" />
                      )}
                    </View>

                    {/* Preparation Notes Box */}
                    {item.notes && (
                      <View
                        style={[
                          styles.notesBox,
                          { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                        ]}>
                        <Icon name="FileText" size={13} color={theme.textMuted} />
                        <AppText variant="caption" color="secondary" style={styles.notesText}>
                          {item.notes}
                        </AppText>
                      </View>
                    )}

                    {/* Schedule Conflict In-Card Alert */}
                    {hasConflict && (
                      <View style={styles.inCardConflictBox}>
                        <Icon name="AlertTriangle" size={14} color="#D97706" />
                        <View style={{ flex: 1 }}>
                          <AppText weight="bold" variant="caption" style={{ color: '#92400E' }}>
                            Conflict Alert
                          </AppText>
                          <AppText variant="caption" style={{ color: '#B45309', fontSize: 11 }}>
                            Overlaps with: {conflicts.map((c) => `“${c.title}”`).join(', ')}
                          </AppText>
                        </View>
                      </View>
                    )}
                  </CardContent>

                  {/* Card Action Bar */}
                  <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                    <View style={styles.cardFooterActionsLeft}>
                      {item.booth && onLocateBooth && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Locate booth ${item.booth} on floor plan`}
                          onPress={() => onLocateBooth(item.booth!)}
                          style={styles.cardActionBtn}>
                          <Icon name="Compass" size={13} color={theme.primary} />
                          <AppText variant="caption" weight="semibold" style={{ color: theme.primary }}>
                            Locate
                          </AppText>
                        </Pressable>
                      )}

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Edit activity details"
                        onPress={() => handleOpenEditModal(item)}
                        style={styles.cardActionBtn}>
                        <Icon name="Edit3" size={13} color={theme.textSecondary} />
                        <AppText variant="caption" weight="semibold" color="secondary">
                          Edit
                        </AppText>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Delete activity from itinerary"
                        onPress={() => handleDeleteActivity(item)}
                        style={styles.cardActionBtn}>
                        <Icon name="Trash2" size={13} color="#EF4444" />
                        <AppText variant="caption" weight="semibold" style={{ color: '#EF4444' }}>
                          Delete
                        </AppText>
                      </Pressable>
                    </View>

                    <Button
                      label={isCompleted ? 'Attended' : 'Mark Done'}
                      variant={isCompleted ? 'secondary' : 'outline'}
                      size="sm"
                      leftIcon={isCompleted ? 'Check' : 'Circle'}
                      onPress={() => handleToggleCompleted(item)}
                    />
                  </View>
                </Card>
              </View>
            );
          })}
        </View>
      )}

      {/* ============================================================ */}
      {/* 6. ADD & EDIT ACTIVITY MODAL SHEET                           */}
      {/* ============================================================ */}
      <RNModal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close dialog"
            onPress={() => setIsModalOpen(false)}
            style={StyleSheet.absoluteFill}
          />

          <View
            style={[
              styles.modalDialog,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ gap: 2 }}>
                <CardTitle level={2}>
                  {editingItem ? 'Edit Itinerary Activity' : 'Schedule Planned Activity'}
                </CardTitle>
                <CardDescription>
                  Configure trade-show meetings, booth visits, and sessions with conflict checks.
                </CardDescription>
              </View>
              <IconButton
                icon="X"
                size="sm"
                variant="ghost"
                accessibilityLabel="Close"
                onPress={() => setIsModalOpen(false)}
              />
            </View>

            {/* Modal Form Body */}
            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              {/* Category Selector Chips */}
              <View style={styles.formSection}>
                <AppText weight="semibold" variant="caption">
                  Activity Classification
                </AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {CATEGORY_TEMPLATES.map((tmpl) => (
                    <Chip
                      key={tmpl.category}
                      label={tmpl.label}
                      selected={formCategory === tmpl.category}
                      onPress={() => setFormCategory(tmpl.category)}
                      size="sm"
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Title Input */}
              <View style={styles.formSection}>
                <AppText weight="semibold" variant="caption">
                  Activity Title *
                </AppText>
                <Input
                  placeholder="e.g. Partner Review, Drone Demo, Keynote…"
                  value={formTitle}
                  onChangeText={setFormTitle}
                  spellCheck={false}
                />
              </View>

              {/* Quick Exhibitor Picker if meeting or booth_visit */}
              {(formCategory === 'meeting' || formCategory === 'booth_visit') && (
                <View style={styles.formSection}>
                  <AppText weight="semibold" variant="caption">
                    Quick Select Registered Exhibitor
                  </AppText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exhibitorChipsScroll}>
                    {exhibitors.map((ex) => (
                      <Chip
                        key={ex.id}
                        label={`${ex.name} (${ex.boothNumber})`}
                        selected={formCompany === ex.name}
                        onPress={() => handleSelectExhibitor(ex.name)}
                        size="sm"
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Company & Speaker */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, gap: 4 }}>
                  <AppText weight="semibold" variant="caption">
                    Company / Organization
                  </AppText>
                  <Input
                    placeholder="e.g. Veritas Robotics"
                    value={formCompany}
                    onChangeText={setFormCompany}
                    spellCheck={false}
                  />
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                  <AppText weight="semibold" variant="caption">
                    Speaker / Contact Person
                  </AppText>
                  <Input
                    placeholder="e.g. Dr. Evelyn Reed"
                    value={formSpeaker}
                    onChangeText={setFormSpeaker}
                    spellCheck={false}
                  />
                </View>
              </View>

              {/* Booth & Hall */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, gap: 4 }}>
                  <AppText weight="semibold" variant="caption">
                    Booth Number
                  </AppText>
                  <Input
                    placeholder="e.g. #N-412"
                    value={formBooth}
                    onChangeText={setFormBooth}
                    spellCheck={false}
                  />
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                  <AppText weight="semibold" variant="caption">
                    Exhibition Hall
                  </AppText>
                  <Input
                    placeholder="e.g. North Hall"
                    value={formHall}
                    onChangeText={setFormHall}
                    spellCheck={false}
                  />
                </View>
              </View>

              {/* Conference Day */}
              <View style={styles.formSection}>
                <AppText weight="semibold" variant="caption">
                  Conference Day
                </AppText>
                <View style={styles.daySelectorRow}>
                  <Button
                    label="Day 1 • Oct 4, 2026"
                    variant={formDay === 'day1' ? 'primary' : 'outline'}
                    size="sm"
                    onPress={() => setFormDay('day1')}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Day 2 • Oct 5, 2026 (Today)"
                    variant={formDay === 'day2' ? 'primary' : 'outline'}
                    size="sm"
                    onPress={() => setFormDay('day2')}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>

              {/* Start Time Presets */}
              <View style={styles.formSection}>
                <AppText weight="semibold" variant="caption">
                  Start Time
                </AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeScroll}>
                  {TIME_PRESETS.map((t) => {
                    const isSelected = formStartHour === t.startHour && formStartMin === t.startMin;
                    return (
                      <Chip
                        key={t.label}
                        label={t.label}
                        selected={isSelected}
                        onPress={() => {
                          setFormStartHour(t.startHour);
                          setFormStartMin(t.startMin);
                        }}
                        size="sm"
                      />
                    );
                  })}
                </ScrollView>
              </View>

              {/* Duration Presets */}
              <View style={styles.formSection}>
                <AppText weight="semibold" variant="caption">
                  Duration
                </AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeScroll}>
                  {DURATION_PRESETS.map((d) => (
                    <Chip
                      key={d.label}
                      label={d.label}
                      selected={formDurationMin === d.minutes}
                      onPress={() => setFormDurationMin(d.minutes)}
                      size="sm"
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Real-time Conflict Alert in Form */}
              {candidateConflictList.length > 0 && (
                <View style={styles.modalConflictAlert}>
                  <Icon name="AlertTriangle" size={16} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <AppText weight="bold" variant="caption" style={{ color: '#92400E' }}>
                      Potential Schedule Overlap!
                    </AppText>
                    <AppText variant="caption" style={{ color: '#B45309', fontSize: 11 }}>
                      This time slot overlaps with: {candidateConflictList.map((c) => `“${c.title}”`).join(', ')}.
                    </AppText>
                  </View>
                </View>
              )}

              {/* Notes */}
              <View style={styles.formSection}>
                <AppText weight="semibold" variant="caption">
                  Preparation & Trade Show Notes
                </AppText>
                <Input
                  placeholder="Questions for the team, NDA requirements, target leads to collect…"
                  value={formNotes}
                  onChangeText={setFormNotes}
                  multiline
                  numberOfLines={3}
                  spellCheck={false}
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Button
                label="Cancel"
                variant="ghost"
                size="md"
                onPress={() => setIsModalOpen(false)}
              />
              <Button
                label={editingItem ? 'Save Changes' : 'Add to Itinerary'}
                variant="primary"
                size="md"
                leftIcon="Check"
                loading={createItemMutation.isPending || updateItemMutation.isPending}
                onPress={handleSaveActivity}
              />
            </View>
          </View>
        </View>
      </RNModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  topActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Conflict Banner
  conflictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    padding: Spacing.sm,
    borderRadius: Radius.medium,
  },
  conflictBannerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conflictBannerTextCol: {
    flex: 1,
    gap: 2,
  },

  // Live Beacon Card
  liveBeaconCard: {
    borderRadius: Radius.large,
    borderWidth: 1.5,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  beaconHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beaconBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  beaconPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  beaconContent: {
    gap: 2,
  },
  beaconFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    paddingTop: 4,
  },

  // Filters
  filterSection: {
    gap: Spacing.xs,
  },
  daySwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryPillsScroll: {
    gap: 6,
    paddingVertical: 2,
  },

  // Timeline list
  timelineList: {
    gap: Spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  traceRail: {
    width: 24,
    alignItems: 'center',
    paddingTop: 16,
  },
  traceDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  traceLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    borderRadius: Radius.medium,
  },
  cardConflictBorder: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  cardCompletedStyle: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 2,
  },
  timeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  timeBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reorderControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardBody: {
    gap: 6,
    paddingTop: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 8,
    borderRadius: Radius.small,
    borderWidth: 1,
    marginTop: 2,
  },
  notesText: {
    flex: 1,
    lineHeight: 16,
    fontSize: 12,
  },
  inCardConflictBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    padding: 8,
    borderRadius: Radius.small,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  cardFooterActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalDialog: {
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    borderTopWidth: 1,
    maxHeight: '90%',
    ...Shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  modalScrollBody: {
    padding: Spacing.md,
  },
  formSection: {
    gap: 6,
    marginBottom: Spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  exhibitorChipsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  timeScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  daySelectorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  modalConflictAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    padding: 10,
    borderRadius: Radius.medium,
    marginBottom: Spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
});
