import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing } from '@/theme';
import { TemperatureDistribution } from '@/types/analytics';

interface TemperatureDonutChartProps {
  distribution: TemperatureDistribution;
  size?: number;
  strokeWidth?: number;
}

export function TemperatureDonutChart({
  distribution,
  size = 180,
  strokeWidth = 20,
}: TemperatureDonutChartProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const { hot, warm, cold, total } = distribution;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate arc lengths
  const hotPct = (hot.count / (total || 1)) * 100;
  const warmPct = (warm.count / (total || 1)) * 100;
  const coldPct = (cold.count / (total || 1)) * 100;

  const hotLength = (hotPct / 100) * circumference;
  const warmLength = (warmPct / 100) * circumference;
  const coldLength = (coldPct / 100) * circumference;

  // Offsets for sequential continuous arcs
  // Rotate by -90deg so starts at top (12 o'clock)
  const hotOffset = 0;
  const warmOffset = -hotLength;
  const coldOffset = -(hotLength + warmLength);

  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { width: size, height: size }]}>
        <Svg
          width={size}
          height={size}
          accessibilityRole="image"
          accessibilityLabel={`Temperature distribution donut chart: ${hot.count} hot, ${warm.count} warm, ${cold.count} cold leads`}>
          {/* Background circle track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.border}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.3}
          />

          {/* Rotated Arc Group */}
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Hot Arc */}
            {hotLength > 0 && (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={hot.color || '#EF4444'}
                strokeWidth={strokeWidth}
                strokeDasharray={`${hotLength} ${circumference}`}
                strokeDashoffset={hotOffset}
                fill="none"
                strokeLinecap="butt"
              />
            )}

            {/* Warm Arc */}
            {warmLength > 0 && (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={warm.color || '#F59E0B'}
                strokeWidth={strokeWidth}
                strokeDasharray={`${warmLength} ${circumference}`}
                strokeDashoffset={warmOffset}
                fill="none"
                strokeLinecap="butt"
              />
            )}

            {/* Cold Arc */}
            {coldLength > 0 && (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={cold.color || '#3B82F6'}
                strokeWidth={strokeWidth}
                strokeDasharray={`${coldLength} ${circumference}`}
                strokeDashoffset={coldOffset}
                fill="none"
                strokeLinecap="butt"
              />
            )}
          </G>

          {/* Center Callout Text */}
          <SvgText
            x={center}
            y={center - 8}
            textAnchor="middle"
            fontSize={28}
            fontWeight="bold"
            fill={theme.text}>
            {total}
          </SvgText>
          <SvgText
            x={center}
            y={center + 14}
            textAnchor="middle"
            fontSize={10}
            fontWeight="600"
            fill={theme.textMuted}
            letterSpacing={0.5}>
            TOTAL LEADS
          </SvgText>
        </Svg>
      </View>

      {/* Structured Distribution Legend */}
      <View style={styles.legendWrapper}>
        {/* Hot Leads Row */}
        <View style={[styles.legendCard, { backgroundColor: theme.surfaceSubtle }]}>
          <View style={styles.legendLeft}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <View>
              <AppText weight="bold" variant="body">
                Hot Leads
              </AppText>
              <AppText variant="caption" color="secondary">
                Ready to buy • High intent
              </AppText>
            </View>
          </View>
          <View style={styles.legendRight}>
            <AppText weight="bold" variant="body" tabular color="primary">
              {hot.count}
            </AppText>
            <Badge label={`${hot.percentage}%`} variant="danger" size="sm" />
          </View>
        </View>

        {/* Warm Leads Row */}
        <View style={[styles.legendCard, { backgroundColor: theme.surfaceSubtle }]}>
          <View style={styles.legendLeft}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <View>
              <AppText weight="bold" variant="body">
                Warm Leads
              </AppText>
              <AppText variant="caption" color="secondary">
                Evaluating solutions
              </AppText>
            </View>
          </View>
          <View style={styles.legendRight}>
            <AppText weight="bold" variant="body" tabular>
              {warm.count}
            </AppText>
            <Badge label={`${warm.percentage}%`} variant="warning" size="sm" />
          </View>
        </View>

        {/* Cold Leads Row */}
        <View style={[styles.legendCard, { backgroundColor: theme.surfaceSubtle }]}>
          <View style={styles.legendLeft}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <View>
              <AppText weight="bold" variant="body">
                Cold Leads
              </AppText>
              <AppText variant="caption" color="secondary">
                Informational / General
              </AppText>
            </View>
          </View>
          <View style={styles.legendRight}>
            <AppText weight="bold" variant="body" tabular>
              {cold.count}
            </AppText>
            <Badge label={`${cold.percentage}%`} variant="outline" size="sm" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
  },
  legendWrapper: {
    width: '100%',
    gap: Spacing.xs,
  },
  legendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.medium,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
