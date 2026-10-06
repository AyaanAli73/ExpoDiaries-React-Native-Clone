import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useResponsive } from '@/hooks/use-responsive';

export interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number; // Override default auto calculation
  gap?: number;
  style?: ViewStyle;
}

export function ResponsiveGrid({
  children,
  columns: overrideColumns,
  gap = 12,
  style,
}: ResponsiveGridProps) {
  const { gridColumns } = useResponsive();
  const activeColumns = overrideColumns || gridColumns;

  const childArray = React.Children.toArray(children);

  if (activeColumns === 1) {
    return (
      <View style={[{ gap }, style]}>
        {childArray.map((child, index) => (
          <View key={index} style={styles.fullWidth}>
            {child}
          </View>
        ))}
      </View>
    );
  }

  // Multi-column responsive flex grid
  return (
    <View style={[styles.gridRow, { marginHorizontal: -gap / 2 }, style]}>
      {childArray.map((child, index) => {
        const itemWidthPercent = `${100 / activeColumns}%`;
        return (
          <View
            key={index}
            style={[
              {
                width: itemWidthPercent as any,
                paddingHorizontal: gap / 2,
                marginBottom: gap,
              },
            ]}>
            {child}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
