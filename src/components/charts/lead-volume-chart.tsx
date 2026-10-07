import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/theme';
import { VolumeDataPoint } from '@/types/analytics';

interface LeadVolumeChartProps {
  data: VolumeDataPoint[];
  height?: number;
}

export function LeadVolumeChart({ data, height = 220 }: LeadVolumeChartProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const [containerWidth, setContainerWidth] = useState<number>(340);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 28;
  const paddingBottom = 32;

  const chartWidth = Math.max(containerWidth - paddingLeft - paddingRight, 100);
  const chartHeight = Math.max(height - paddingTop - paddingBottom, 60);

  // Calculate max values
  const { maxVal, points } = useMemo(() => {
    if (!data || data.length === 0) {
      return { maxVal: 10, points: [] };
    }

    const max = Math.max(...data.map((d) => d.total), 10);
    // Round up max to a nice multiple of 5 or 10
    const roundedMax = Math.ceil(max / 10) * 10;

    const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth / 2;

    const computedPoints = data.map((item, index) => {
      const x = paddingLeft + index * stepX;
      const yTotal = paddingTop + chartHeight - (item.total / roundedMax) * chartHeight;
      const yHot = paddingTop + chartHeight - (item.hot / roundedMax) * chartHeight;
      return {
        ...item,
        x,
        yTotal,
        yHot,
        index,
      };
    });

    return { maxVal: roundedMax, points: computedPoints };
  }, [data, chartWidth, chartHeight, paddingLeft, paddingTop]);

  // Construct SVG Area and Line paths
  const { areaPathTotal, linePathTotal, linePathHot } = useMemo(() => {
    if (points.length === 0) return { areaPathTotal: '', linePathTotal: '', linePathHot: '' };

    // Line path total
    const lineTotal = points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.yTotal}`;
      // Smooth cubic curve control points
      const prev = points[idx - 1];
      const cp1x = prev.x + (pt.x - prev.x) / 2;
      const cp1y = prev.yTotal;
      const cp2x = prev.x + (pt.x - prev.x) / 2;
      const cp2y = pt.yTotal;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.yTotal}`;
    }, '');

    // Area path total closes down to bottom
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const baselineY = paddingTop + chartHeight;
    const areaTotal = `${lineTotal} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

    // Line path hot leads
    const lineHot = points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.yHot}`;
      const prev = points[idx - 1];
      const cp1x = prev.x + (pt.x - prev.x) / 2;
      const cp1y = prev.yHot;
      const cp2x = prev.x + (pt.x - prev.x) / 2;
      const cp2y = pt.yHot;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.yHot}`;
    }, '');

    return { areaPathTotal: areaTotal, linePathTotal: lineTotal, linePathHot: lineHot };
  }, [points, chartHeight, paddingTop]);

  const selectedPoint = selectedIndex !== null ? points[selectedIndex] : null;

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      {/* Legend & Tooltip Header */}
      <View style={styles.legendRow}>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
            <AppText variant="caption" color="secondary">
              Total Volume
            </AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <AppText variant="caption" color="secondary">
              Hot Prospects
            </AppText>
          </View>
        </View>

        {selectedPoint ? (
          <View style={styles.tooltipBadge}>
            <Badge
              label={`${selectedPoint.label}: ${selectedPoint.total} leads (${selectedPoint.hot} hot)`}
              variant="primary"
              size="sm"
            />
          </View>
        ) : (
          <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
            Tap data point for details
          </AppText>
        )}
      </View>

      {/* SVG Canvas */}
      <Svg
        width={containerWidth}
        height={height}
        accessibilityRole="image"
        accessibilityLabel="Lead capture volume over time area chart">
        <Defs>
          <LinearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.32" />
            <Stop offset="80%" stopColor={theme.primary} stopOpacity="0.04" />
            <Stop offset="100%" stopColor={theme.primary} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal Grid lines */}
        {[0, 0.33, 0.66, 1].map((pct, idx) => {
          const y = paddingTop + chartHeight * (1 - pct);
          const gridVal = Math.round(maxVal * pct);
          return (
            <React.Fragment key={`grid-${idx}`}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={containerWidth - paddingRight}
                y2={y}
                stroke={theme.border}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill={theme.textMuted}>
                {gridVal}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Total Volume Gradient Area */}
        {areaPathTotal ? <Path d={areaPathTotal} fill="url(#volumeGradient)" /> : null}

        {/* Total Volume Curved Line */}
        {linePathTotal ? (
          <Path
            d={linePathTotal}
            fill="none"
            stroke={theme.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ) : null}

        {/* Hot Leads Curved Line */}
        {linePathHot ? (
          <Path
            d={linePathHot}
            fill="none"
            stroke="#EF4444"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="2,2"
          />
        ) : null}

        {/* Active Selection Vertical Guideline */}
        {selectedPoint ? (
          <Line
            x1={selectedPoint.x}
            y1={paddingTop}
            x2={selectedPoint.x}
            y2={paddingTop + chartHeight}
            stroke={theme.primary}
            strokeWidth={1.5}
            strokeDasharray="3,3"
          />
        ) : null}

        {/* Data Points and X Labels */}
        {points.map((pt, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <React.Fragment key={`pt-${idx}`}>
              {/* Outer halo if selected */}
              {isSelected ? (
                <Circle cx={pt.x} cy={pt.yTotal} r={8} fill={theme.primary} fillOpacity={0.25} />
              ) : null}

              {/* Total Point Dot */}
              <Circle
                cx={pt.x}
                cy={pt.yTotal}
                r={isSelected ? 5 : 3.5}
                fill={theme.surface}
                stroke={theme.primary}
                strokeWidth={2}
              />

              {/* Hot Point Dot */}
              <Circle
                cx={pt.x}
                cy={pt.yHot}
                r={isSelected ? 4 : 2.5}
                fill={theme.surface}
                stroke="#EF4444"
                strokeWidth={2}
              />

              {/* X Axis Time Labels */}
              <SvgText
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                fontSize={10}
                fontWeight={isSelected ? 'bold' : 'normal'}
                fill={isSelected ? theme.primary : theme.textMuted}>
                {pt.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Invisible Interactive Touch Targets for Easy Tap */}
      <View style={[StyleSheet.absoluteFill, styles.touchOverlay]} pointerEvents="box-none">
        {points.map((pt, idx) => (
          <Pressable
            key={`touch-${idx}`}
            accessibilityRole="button"
            accessibilityLabel={`View data for ${pt.label}: ${pt.total} leads`}
            onPress={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
            style={[
              styles.touchTarget,
              {
                left: pt.x - 22,
                top: paddingTop,
                width: 44,
                height: chartHeight + 20,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingHorizontal: 4,
    minHeight: 24,
  },
  legendItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tooltipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  touchOverlay: {
    zIndex: 10,
  },
  touchTarget: {
    position: 'absolute',
  },
});
