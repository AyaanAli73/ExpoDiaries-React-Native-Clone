import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, IconName } from '@/components/ui/icon';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface SegmentItem {
  label: string;
  value: string | number;
  icon?: IconName;
  badge?: string | number;
}

export interface SegmentedControlProps {
  values: (SegmentItem | string)[];
  selectedValue?: string | number;
  selectedIndex?: number;
  onChange?: (value: string | number, index: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl({
  values,
  selectedValue,
  selectedIndex,
  onChange,
  size = 'md',
  disabled = false,
  fullWidth = true,
  className,
  style,
}: SegmentedControlProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Normalize options into SegmentItem objects
  const items: SegmentItem[] = values.map((val) =>
    typeof val === 'string' ? { label: val, value: val } : val
  );

  const activeIndex = ((): number => {
    if (selectedValue !== undefined) {
      const idx = items.findIndex((it) => it.value === selectedValue);
      return idx >= 0 ? idx : 0;
    }
    return selectedIndex ?? 0;
  })();

  const sizeMetrics = {
    sm: { height: 30, paddingVertical: 2, fontSize: 11, iconSize: 12 },
    md: { height: 36, paddingVertical: 3, fontSize: 12, iconSize: 14 },
    lg: { height: 42, paddingVertical: 4, fontSize: 13, iconSize: 16 },
  }[size];

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        {
          height: sizeMetrics.height,
          backgroundColor: theme.secondary,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      className={className}>
      {items.map((item, index) => {
        const isSelected = index === activeIndex;

        return (
          <Pressable
            key={String(item.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected, disabled }}
            aria-selected={isSelected}
            aria-disabled={disabled}
            disabled={disabled}
            onPress={() => onChange?.(item.value, index)}
            style={(state) => [
              styles.segment,
              {
                paddingVertical: sizeMetrics.paddingVertical,
                backgroundColor: isSelected
                  ? theme.surface
                  : state.pressed && !disabled
                    ? 'rgba(128,128,128,0.1)'
                    : 'transparent',
                ...(isSelected ? Shadows.subtle : {}),
                transform: [
                  { scale: state.pressed && !isSelected && !disabled ? 0.98 : 1 },
                ],
              },
            ]}>
            {item.icon && (
              <View style={styles.iconWrapper}>
                <Icon
                  name={item.icon}
                  size={sizeMetrics.iconSize}
                  color={isSelected ? theme.primary : theme.textMuted}
                />
              </View>
            )}

            <AppText
              weight={isSelected ? 'semibold' : 'medium'}
              style={{
                fontSize: sizeMetrics.fontSize,
                color: isSelected ? theme.textPrimary : theme.textSecondary,
              }}>
              {item.label}
            </AppText>

            {item.badge !== undefined && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isSelected ? theme.primarySubtle : theme.border,
                  },
                ]}>
                <AppText
                  weight="bold"
                  tabular
                  style={{
                    fontSize: 9,
                    color: isSelected ? theme.primary : theme.textSecondary,
                  }}>
                  {item.badge}
                </AppText>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.medium,
    padding: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.small + 2,
    paddingHorizontal: Spacing.xs,
  },
  iconWrapper: {
    marginRight: Spacing.xs,
  },
  badge: {
    marginLeft: Spacing.xs,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
});
