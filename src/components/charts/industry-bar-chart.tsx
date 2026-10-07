import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/theme';
import { IndustryDistributionItem } from '@/types/analytics';

interface IndustryBarChartProps {
  data: IndustryDistributionItem[];
}

export function IndustryBarChart({ data }: IndustryBarChartProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <View style={styles.container}>
      {data.map((item) => (
        <View key={item.industry} style={styles.itemRow}>
          <View style={styles.itemHeader}>
            <View style={styles.nameRow}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <AppText weight="semibold" variant="body" numberOfLines={1}>
                {item.industry}
              </AppText>
            </View>
            <View style={styles.statsRow}>
              <AppText variant="caption" weight="bold" tabular>
                {item.count} leads
              </AppText>
              <Badge label={`${item.percentage}%`} variant="outline" size="sm" />
            </View>
          </View>

          {/* Bar track and fill */}
          <View style={[styles.track, { backgroundColor: theme.surfaceSubtle }]}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.max(4, Math.min(100, item.percentage))}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    width: '100%',
  },
  itemRow: {
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
