import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { Icon, IconName } from '@/components/ui/icon';
import { Colors, Radius } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type IconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'subtle';

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /**
   * Accessible description of the button action. Mandatory for accessibility.
   */
  accessibilityLabel: string;
  icon: IconName | React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  rounded?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  className?: string;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  accessibilityHint?: string;
  testID?: string;
}

export function IconButton({
  accessibilityLabel,
  icon,
  variant = 'ghost',
  size = 'md',
  rounded = false,
  loading = false,
  disabled = false,
  onPress,
  className,
  accessibilityHint,
  style,
  testID,
  ...props
}: IconButtonProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Resolve color tokens based on variant
  let backgroundColor: string = 'transparent';
  let iconColor: string = theme.textPrimary;
  let borderColor: string = 'transparent';
  let borderWidth = 0;

  switch (variant) {
    case 'primary':
      backgroundColor = theme.primary;
      iconColor = theme.primaryForeground;
      break;
    case 'secondary':
      backgroundColor = theme.secondary;
      iconColor = theme.textPrimary;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      iconColor = theme.textPrimary;
      borderColor = theme.border;
      borderWidth = 1;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      iconColor = theme.textSecondary;
      break;
    case 'danger':
      backgroundColor = theme.danger;
      iconColor = '#FFFFFF';
      break;
    case 'subtle':
      backgroundColor = theme.primarySubtle;
      iconColor = theme.primary;
      break;
  }

  // Size metrics
  const dimensions = {
    xs: { dimension: 28, iconSize: 14, borderRadius: rounded ? Radius.pill : Radius.small },
    sm: { dimension: 34, iconSize: 16, borderRadius: rounded ? Radius.pill : Radius.medium },
    md: { dimension: 40, iconSize: 20, borderRadius: rounded ? Radius.pill : Radius.medium },
    lg: { dimension: 48, iconSize: 24, borderRadius: rounded ? Radius.pill : Radius.large },
  }[size];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      aria-label={accessibilityLabel}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      disabled={disabled || loading}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={onPress}
      style={(state) => [
        styles.base,
        {
          width: dimensions.dimension,
          height: dimensions.dimension,
          borderRadius: dimensions.borderRadius,
          backgroundColor,
          borderColor,
          borderWidth,
          opacity: disabled ? 0.45 : state.pressed && !loading ? 0.8 : 1,
          transform: [{ scale: state.pressed && !disabled && !loading ? 0.92 : 1 }],
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      className={className}
      {...props}>
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : typeof icon === 'string' ? (
        <Icon name={icon as IconName} size={dimensions.iconSize} color={iconColor} />
      ) : (
        icon
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
