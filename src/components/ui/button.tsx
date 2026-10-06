import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, IconName } from '@/components/ui/icon';
import { Colors, Radius, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'subtle';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconName | React.ReactNode;
  rightIcon?: IconName | React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  className?: string;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({
  label,
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  loadingText,
  disabled = false,
  fullWidth = false,
  onPress,
  className,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
  ...props
}: ButtonProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Resolve color tokens based on variant
  let backgroundColor: string = theme.primary;
  let textColor: string = theme.primaryForeground;
  let borderColor: string = 'transparent';
  let borderWidth = 0;

  switch (variant) {
    case 'secondary':
      backgroundColor = theme.secondary;
      textColor = theme.textPrimary;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      textColor = theme.textPrimary;
      borderColor = theme.border;
      borderWidth = 1;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = theme.textSecondary;
      break;
    case 'danger':
      backgroundColor = theme.danger;
      textColor = '#FFFFFF';
      break;
    case 'subtle':
      backgroundColor = theme.primarySubtle;
      textColor = theme.primary;
      break;
    case 'primary':
    default:
      backgroundColor = theme.primary;
      textColor = theme.primaryForeground;
      break;
  }

  // Size metrics
  const sizeStyles = {
    sm: {
      height: 32,
      paddingHorizontal: Spacing.sm + 2,
      fontSize: 12,
      iconSize: 14,
      gap: Spacing.xs,
    },
    md: {
      height: 38,
      paddingHorizontal: Spacing.md,
      fontSize: 13,
      iconSize: 16,
      gap: Spacing.xs + 2,
    },
    lg: {
      height: 46,
      paddingHorizontal: Spacing.lg,
      fontSize: 15,
      iconSize: 18,
      gap: Spacing.sm,
    },
  }[size];

  const resolvedAccessibilityLabel =
    accessibilityLabel || (typeof label === 'string' ? label : undefined) || 'Button';

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      disabled={disabled || loading}
      onPress={onPress}
      style={(state) => [
        styles.base,
        {
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          backgroundColor,
          borderColor,
          borderWidth,
          opacity: disabled ? 0.45 : state.pressed && !loading ? 0.88 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          transform: [{ scale: state.pressed && !disabled && !loading ? 0.97 : 1 }],
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      className={className}
      {...props}>
      {loading ? (
        <View style={[styles.content, { gap: sizeStyles.gap }]}>
          <ActivityIndicator size="small" color={textColor} />
          {loadingText ? (
            <AppText
              weight="semibold"
              style={{ color: textColor, fontSize: sizeStyles.fontSize }}>
              {loadingText}
            </AppText>
          ) : null}
        </View>
      ) : (
        <View style={[styles.content, { gap: sizeStyles.gap }]}>
          {leftIcon && (
            <View style={styles.iconContainer}>
              {typeof leftIcon === 'string' ? (
                <Icon name={leftIcon as IconName} size={sizeStyles.iconSize} color={textColor} />
              ) : (
                leftIcon
              )}
            </View>
          )}

          {label ? (
            <AppText
              weight="semibold"
              style={{
                color: textColor,
                fontSize: sizeStyles.fontSize,
              }}>
              {label}
            </AppText>
          ) : (
            children
          )}

          {rightIcon && (
            <View style={styles.iconContainer}>
              {typeof rightIcon === 'string' ? (
                <Icon name={rightIcon as IconName} size={sizeStyles.iconSize} color={textColor} />
              ) : (
                rightIcon
              )}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
