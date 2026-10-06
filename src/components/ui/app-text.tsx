import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';

import { Colors, Typography } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type TextVariant =
  | 'display'
  | 'heading'
  | 'title'
  | 'body'
  | 'label'
  | 'caption'
  | 'code'
  | 'secondary'
  | 'muted';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger';

export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right';

export interface AppTextProps extends Omit<RNTextProps, 'role'> {
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextWeight;
  align?: TextAlign;
  tabular?: boolean;
  truncate?: boolean;
  className?: string;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export function AppText({
  variant = 'body',
  color,
  weight,
  align,
  tabular = false,
  truncate = false,
  numberOfLines,
  style,
  className,
  children,
  ...props
}: AppTextProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Resolve typography role token
  const roleStyle = ((): TextStyle => {
    switch (variant) {
      case 'display':
        return Typography.display;
      case 'heading':
        return Typography.heading;
      case 'title':
        return Typography.title;
      case 'label':
        return Typography.label;
      case 'caption':
        return Typography.caption;
      case 'muted':
        return Typography.caption;
      case 'secondary':
        return Typography.body;
      case 'code':
        return {
          fontFamily: 'monospace',
          fontSize: 12,
          lineHeight: 16,
        };
      case 'body':
      default:
        return Typography.body;
    }
  })();

  // Resolve semantic color (variant can default color if not explicitly provided)
  const textColor = ((): string => {
    if (color) {
      switch (color) {
        case 'secondary':
          return theme.textSecondary;
        case 'muted':
          return theme.textMuted;
        case 'inverse':
          return theme.primaryForeground;
        case 'brand':
          return theme.primary;
        case 'success':
          return theme.success;
        case 'warning':
          return theme.warning;
        case 'danger':
          return theme.danger;
        case 'primary':
        default:
          return theme.textPrimary;
      }
    }

    if (variant === 'secondary') return theme.textSecondary;
    if (variant === 'muted') return theme.textMuted;
    return theme.textPrimary;
  })();

  const weightStyle = weight ? styles[`weight_${weight}`] : null;
  const alignStyle = align ? { textAlign: align } : null;

  return (
    <RNText
      numberOfLines={truncate && numberOfLines === undefined ? 1 : numberOfLines}
      ellipsizeMode={truncate ? 'tail' : undefined}
      style={[
        roleStyle,
        { color: textColor },
        weightStyle,
        alignStyle,
        tabular && styles.tabularNums,
        style,
      ]}
      className={className}
      {...props}>
      {children}
    </RNText>
  );
}

// Backward-compatibility alias
export const Text = AppText;

const styles = StyleSheet.create({
  tabularNums: {
    fontVariant: ['tabular-nums'],
  },
  weight_normal: {
    fontWeight: '400',
  },
  weight_medium: {
    fontWeight: '500',
  },
  weight_semibold: {
    fontWeight: '600',
  },
  weight_bold: {
    fontWeight: '700',
  },
});
