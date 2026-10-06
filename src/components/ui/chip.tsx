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
import { Colors, Radius, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ChipVariant = 'filled' | 'outline' | 'filter';
export type ChipSize = 'sm' | 'md';

export interface ChipProps {
  label: string;
  selected?: boolean;
  icon?: IconName | React.ReactNode;
  onPress?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  size?: ChipSize;
  variant?: ChipVariant;
  className?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Chip({
  label,
  selected = false,
  icon,
  onPress,
  onRemove,
  disabled = false,
  size = 'md',
  variant = 'filled',
  className,
  style,
  accessibilityLabel,
}: ChipProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const sizeMetrics = {
    sm: { height: 26, paddingHorizontal: Spacing.sm, fontSize: 11, iconSize: 12 },
    md: { height: 32, paddingHorizontal: Spacing.sm + 2, fontSize: 12, iconSize: 14 },
  }[size];

  // Colors based on state and variant
  let backgroundColor: string;
  let textColor: string;
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (selected) {
    backgroundColor = theme.primarySubtle;
    textColor = theme.primary;
    borderColor = theme.primary;
    borderWidth = 1;
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    textColor = theme.textSecondary;
    borderColor = theme.border;
    borderWidth = 1;
  } else {
    // filled
    backgroundColor = theme.secondary;
    textColor = theme.textPrimary;
  }

  const role = onPress ? (variant === 'filter' ? 'checkbox' : 'button') : undefined;

  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected, disabled }}
      aria-selected={selected}
      aria-disabled={disabled}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={(state) => [
        styles.chip,
        {
          height: sizeMetrics.height,
          paddingHorizontal: sizeMetrics.paddingHorizontal,
          backgroundColor,
          borderColor,
          borderWidth,
          opacity: disabled ? 0.5 : 1,
          transform: [
            { scale: state.pressed && onPress && !disabled ? 0.96 : 1 },
          ],
        },
        style,
      ]}
      className={className}>
      {variant === 'filter' && selected && !icon ? (
        <View style={styles.iconWrapper}>
          <Icon name="Check" size={sizeMetrics.iconSize} color={theme.primary} />
        </View>
      ) : icon ? (
        <View style={styles.iconWrapper}>
          {typeof icon === 'string' ? (
            <Icon name={icon as IconName} size={sizeMetrics.iconSize} color={textColor} />
          ) : (
            icon
          )}
        </View>
      ) : null}

      <AppText
        weight={selected ? 'semibold' : 'medium'}
        style={{
          fontSize: sizeMetrics.fontSize,
          color: textColor,
        }}>
        {label}
      </AppText>

      {onRemove && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          hitSlop={6}
          style={styles.removeWrapper}>
          <Icon name="X" size={sizeMetrics.iconSize - 2} color={textColor} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  iconWrapper: {
    marginRight: Spacing.xs,
  },
  removeWrapper: {
    marginLeft: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
