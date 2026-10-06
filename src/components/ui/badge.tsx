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

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  label: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  showDot?: boolean;
  icon?: IconName | React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  showDot = false,
  icon,
  removable = false,
  onRemove,
  style,
  className,
}: BadgeProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const variantStyles: Record<
    BadgeVariant,
    { bg: string; text: string; dot: string; border: string }
  > = {
    default: {
      bg: theme.secondary,
      text: theme.textSecondary,
      dot: theme.textMuted,
      border: 'transparent',
    },
    primary: {
      bg: theme.primarySubtle,
      text: theme.primary,
      dot: theme.primary,
      border: 'transparent',
    },
    secondary: {
      bg: theme.secondary,
      text: theme.textPrimary,
      dot: theme.textSecondary,
      border: 'transparent',
    },
    success: {
      bg: theme.successBackground,
      text: theme.success,
      dot: theme.success,
      border: 'transparent',
    },
    warning: {
      bg: theme.warningBackground,
      text: theme.warning,
      dot: theme.warning,
      border: 'transparent',
    },
    danger: {
      bg: theme.dangerBackground,
      text: theme.danger,
      dot: theme.danger,
      border: 'transparent',
    },
    info: {
      bg: theme.infoBackground,
      text: theme.info,
      dot: theme.info,
      border: 'transparent',
    },
    outline: {
      bg: 'transparent',
      text: theme.textSecondary,
      dot: theme.textMuted,
      border: theme.border,
    },
  };

  const current = variantStyles[variant];

  const sizeMetrics = {
    sm: {
      paddingHorizontal: Spacing.xs + 2,
      paddingVertical: 1,
      fontSize: 10,
      lineHeight: 13,
      dotSize: 5,
      iconSize: 11,
    },
    md: {
      paddingHorizontal: Spacing.sm - 1,
      paddingVertical: 2,
      fontSize: 11,
      lineHeight: 15,
      dotSize: 6,
      iconSize: 12,
    },
    lg: {
      paddingHorizontal: Spacing.sm + 2,
      paddingVertical: 4,
      fontSize: 12,
      lineHeight: 16,
      dotSize: 7,
      iconSize: 14,
    },
  }[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: current.bg,
          borderColor: current.border,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingHorizontal: sizeMetrics.paddingHorizontal,
          paddingVertical: sizeMetrics.paddingVertical,
        },
        style,
      ]}
      className={className}>
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              width: sizeMetrics.dotSize,
              height: sizeMetrics.dotSize,
              backgroundColor: current.dot,
            },
          ]}
        />
      )}

      {icon && (
        <View style={styles.iconWrapper}>
          {typeof icon === 'string' ? (
            <Icon name={icon as IconName} size={sizeMetrics.iconSize} color={current.text} />
          ) : (
            icon
          )}
        </View>
      )}

      {typeof label === 'string' ? (
        <AppText
          weight="medium"
          style={{
            color: current.text,
            fontSize: sizeMetrics.fontSize,
            lineHeight: sizeMetrics.lineHeight,
          }}>
          {label}
        </AppText>
      ) : (
        label
      )}

      {removable && onRemove && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove badge"
          onPress={onRemove}
          hitSlop={6}
          style={styles.removeButton}>
          <Icon name="X" size={sizeMetrics.iconSize} color={current.text} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.small,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: Radius.pill,
    marginRight: Spacing.xs,
  },
  iconWrapper: {
    marginRight: Spacing.xs,
  },
  removeButton: {
    marginLeft: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
