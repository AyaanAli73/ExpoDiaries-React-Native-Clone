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

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingColor = 'primary' | 'secondary' | 'brand' | 'inverse';
export type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export interface HeadingProps extends Omit<RNTextProps, 'role'> {
  level?: HeadingLevel;
  color?: HeadingColor;
  weight?: HeadingWeight;
  align?: 'left' | 'center' | 'right';
  tabular?: boolean;
  truncate?: boolean;
  className?: string;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export function Heading({
  level = 2,
  color = 'primary',
  weight,
  align,
  tabular = false,
  truncate = false,
  numberOfLines,
  style,
  className,
  children,
  ...props
}: HeadingProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Map heading levels to typography tokens
  const levelStyle = ((): TextStyle => {
    switch (level) {
      case 1:
        return Typography.display;
      case 2:
        return Typography.heading;
      case 3:
        return Typography.title;
      case 4:
        return {
          fontSize: 15,
          lineHeight: 20,
          fontWeight: '600',
          letterSpacing: -0.2,
        };
      case 5:
        return {
          fontSize: 13,
          lineHeight: 18,
          fontWeight: '600',
          letterSpacing: -0.1,
        };
      case 6:
      default:
        return Typography.label;
    }
  })();

  const headingColor = ((): string => {
    switch (color) {
      case 'secondary':
        return theme.textSecondary;
      case 'brand':
        return theme.primary;
      case 'inverse':
        return theme.primaryForeground;
      case 'primary':
      default:
        return theme.textPrimary;
    }
  })();

  const weightStyle = weight ? styles[`weight_${weight}`] : null;
  const alignStyle = align ? { textAlign: align } : null;

  return (
    <RNText
      accessibilityRole="header"
      aria-level={level}
      numberOfLines={truncate && numberOfLines === undefined ? 1 : numberOfLines}
      ellipsizeMode={truncate ? 'tail' : undefined}
      style={[
        levelStyle,
        { color: headingColor },
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
