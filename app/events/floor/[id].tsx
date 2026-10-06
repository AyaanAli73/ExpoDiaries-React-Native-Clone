import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ExpoFloorVisualizer } from '@/components/events/expo-floor-visualizer';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Badge,
  IconButton,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEvent } from '@/hooks/use-events';
import { Colors, Spacing } from '@/theme';

export default function FullScreenFloorScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = id || 'evt-2026-ces';

  const { data: event } = useEvent(eventId);

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
                Expo Floor Map Mode
              </AppText>
              <Badge label="INTERACTIVE MAP" variant="success" size="sm" showDot />
            </View>
            <AppText variant="caption" color="secondary" numberOfLines={1}>
              {event?.venue || event?.name || 'Convention Center Pavilion'}
            </AppText>
          </View>

          <View style={styles.headerActions}>
            <IconButton
              icon="Calendar"
              size="sm"
              variant="ghost"
              accessibilityLabel="View itinerary"
              onPress={() =>
                router.push({
                  pathname: '/events/[id]',
                  params: { id: eventId, initialTab: 'itinerary' },
                })
              }
            />
          </View>
        </View>
      }>
      <View style={styles.screenBody}>
        <ExpoFloorVisualizer
          eventId={eventId}
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
