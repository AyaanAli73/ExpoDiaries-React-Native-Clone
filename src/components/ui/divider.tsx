import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  inset?: boolean | number;
  label?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Divider({
  orientation = 'horizontal',
  thickness = 1,
  color,
  inset = false,
  label,
  className,
  style,
}: DividerProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const resolvedColor = color || theme.border;
  const isHorizontal = orientation === 'horizontal';

  const insetValue = typeof inset === 'number' ? inset : inset ? Spacing.md : 0;

  if (label && isHorizontal) {
    return (
      <View
        aria-hidden={true}
        style={[
          styles.labelContainer,
          {
            marginHorizontal: insetValue,
          },
          style,
        ]}
        className={className}>
        <View style={[styles.line, { height: thickness, backgroundColor: resolvedColor }]} />
        <AppText
          variant="caption"
          color="muted"
          style={styles.labelText}>
          {label}
        </AppText>
        <View style={[styles.line, { height: thickness, backgroundColor: resolvedColor }]} />
      </View>
    );
  }

  return (
    <View
      aria-hidden={true}
      style={[
        isHorizontal
          ? {
              height: thickness,
              width: '100%',
              backgroundColor: resolvedColor,
              marginHorizontal: insetValue,
            }
          : {
              width: thickness,
              height: '100%',
              backgroundColor: resolvedColor,
              marginVertical: insetValue,
            },
        style,
      ]}
      className={className}
    />
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  line: {
    flex: 1,
  },
  labelText: {
    marginHorizontal: Spacing.sm,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.8,
  },
});
