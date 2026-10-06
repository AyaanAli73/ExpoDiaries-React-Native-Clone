import React, { useState } from 'react';
import {
  Clipboard,
  StyleSheet,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { PersonalItineraryTimeline } from '@/components/events/personal-itinerary-timeline';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Badge,
  IconButton,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEvent, useItinerary } from '@/hooks/use-events';
import { Colors, Spacing } from '@/theme';

export default function FullScreenItineraryScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = id || 'evt-2026-ces';

  const { data: event } = useEvent(eventId);
  const { data: itinerary = [] } = useItinerary(eventId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Copy plain-text agenda summary to clipboard for sharing
  const handleShareItinerary = () => {
    if (itinerary.length === 0) {
      setToastMessage('Itinerary is empty');
      return;
    }

    const lines = [
      `📅 ${event?.name || 'Trade Show'} – Personal Itinerary`,
      `Venue: ${event?.venue || event?.location || 'Convention Center'}`,
      '----------------------------------------',
    ];

    itinerary.forEach((item) => {
      const timeStr = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(item.startTime));

      lines.push(`• [${timeStr}] ${item.title}`);
      if (item.company) lines.push(`  Company: ${item.company}`);
      if (item.booth) lines.push(`  Booth: ${item.booth} (${item.hall || 'Main Hall'})`);
      if (item.notes) lines.push(`  Notes: ${item.notes}`);
      lines.push('');
    });

    Clipboard.setString(lines.join('\n'));
    setToastMessage('Itinerary copied to clipboard');
  };

  const handleLocateBooth = (boothNumber: string) => {
    router.push({
      pathname: '/events/[id]',
      params: { id: eventId, initialTab: 'floor' },
    });
  };

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
            accessibilityLabel="Back to event"
            onPress={() => router.back()}
          />
          <View style={styles.headerTitleCol}>
            <View style={styles.titleRow}>
              <AppText weight="bold" variant="body" numberOfLines={1}>
                Personal Itinerary Timeline
              </AppText>
              <Badge label="LIVE AGENDA" variant="success" size="sm" showDot />
            </View>
            <AppText variant="caption" color="secondary" numberOfLines={1}>
              {event?.name || 'Conference Plan'}
            </AppText>
          </View>

          <View style={styles.headerActions}>
            <IconButton
              icon="Share2"
              size="sm"
              variant="ghost"
              accessibilityLabel="Share itinerary summary"
              onPress={handleShareItinerary}
            />
            <IconButton
              icon="Map"
              size="sm"
              variant="ghost"
              accessibilityLabel="View floor plan"
              onPress={() =>
                router.push({
                  pathname: '/events/[id]',
                  params: { id: eventId, initialTab: 'floor' },
                })
              }
            />
          </View>
        </View>
      }>
      {/* Toast Notification */}
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        duration={2400}
        onDismiss={() => setToastMessage(null)}
      />

      <View style={styles.screenBody}>
        <PersonalItineraryTimeline
          eventId={eventId}
          onLocateBooth={handleLocateBooth}
          isFullScreen={true}
        />
      </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  screenBody: {
    paddingVertical: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
});
