import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing } from '@/theme';
import { BoothDistributionItem } from '@/types/analytics';

interface BoothBarChartProps {
  data: BoothDistributionItem[];
}

export function BoothBarChart({ data }: BoothBarChartProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const isTop = index === 0;

        return (
          <View
            key={item.booth}
            style={[
              styles.boothCard,
              {
                backgroundColor: isTop ? theme.surfaceSubtle : theme.surface,
                borderColor: isTop ? theme.primary : theme.border,
              },
            ]}>
            <View style={styles.headerRow}>
              <View style={styles.boothInfo}>
                <View style={styles.titleRow}>
                  <Icon
                    name={isTop ? 'Trophy' : 'MapPin'}
                    size={14}
                    color={isTop ? theme.primary : theme.textMuted}
                  />
                  <AppText weight="bold" variant="body">
                    {item.booth}
                  </AppText>
                  {isTop && <Badge label="TOP STATION" variant="primary" size="sm" showDot />}
                </View>
                <AppText variant="caption" color="secondary" numberOfLines={1}>
                  {item.stationName}
                </AppText>
              </View>

              <View style={styles.countInfo}>
                <AppText variant="body" weight="bold" tabular color={isTop ? 'primary' : undefined}>
                  {item.count} leads
                </AppText>
                <AppText variant="caption" color="muted">
                  {item.percentage}% of total
                </AppText>
              </View>
            </View>

            {/* Visual Bar Indicator */}
            <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.max(6, Math.min(100, item.percentage))}%`,
                    backgroundColor: isTop ? theme.primary : '#64748B',
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs + 2,
    width: '100%',
  },
  boothCard: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  boothInfo: {
    flex: 1,
    gap: 2,
    marginRight: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countInfo: {
    alignItems: 'flex-end',
    gap: 2,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
