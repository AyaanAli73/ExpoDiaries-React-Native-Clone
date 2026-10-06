import React from 'react';
import { StyleSheet, Text as RNText, TextStyle } from 'react-native';

import { Colors, Typography, TypographyRole } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppText, AppTextProps, Text } from './app-text';
import { Heading, HeadingProps } from './heading';

export { AppText, Text, Heading };
export type { AppTextProps, HeadingProps };

export interface TypographyComponentProps extends AppTextProps {
  textRole?: TypographyRole;
}

export function Display({ tabular = false, style, children, className, ...props }: TypographyComponentProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <RNText
      accessibilityRole="header"
      aria-level={1}
      style={[
        { color: theme.textPrimary },
        Typography.display,
        tabular && styles.tabularNums,
        style as TextStyle,
      ]}
      className={className}
      {...props}>
      {children}
    </RNText>
  );
}

export function Title({ tabular = false, style, children, className, ...props }: TypographyComponentProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <RNText
      accessibilityRole="header"
      aria-level={3}
      style={[
        { color: theme.textPrimary },
        Typography.title,
        tabular && styles.tabularNums,
        style as TextStyle,
      ]}
      className={className}
      {...props}>
      {children}
    </RNText>
  );
}

export function Body({ tabular = false, style, children, className, ...props }: TypographyComponentProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <RNText
      style={[
        { color: theme.textPrimary },
        Typography.body,
        tabular && styles.tabularNums,
        style as TextStyle,
      ]}
      className={className}
      {...props}>
      {children}
    </RNText>
  );
}

export function Label({ tabular = false, style, children, className, ...props }: TypographyComponentProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <RNText
      style={[
        { color: theme.textSecondary },
        Typography.label,
        tabular && styles.tabularNums,
        style as TextStyle,
      ]}
      className={className}
      {...props}>
      {children}
    </RNText>
  );
}

export function Caption({ tabular = false, style, children, className, ...props }: TypographyComponentProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <RNText
      style={[
        { color: theme.textMuted },
        Typography.caption,
        tabular && styles.tabularNums,
        style as TextStyle,
      ]}
      className={className}
      {...props}>
      {children}
    </RNText>
  );
}

export interface MetricDisplayProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  className?: string;
}

export function MetricDisplay({
  label,
  value,
  delta,
  deltaPositive,
  className,
}: MetricDisplayProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <RNText style={styles.metricContainer} className={className}>
      <Text variant="caption" weight="medium" style={styles.metricLabel}>
        {label}
      </Text>
      <Text variant="body" weight="bold" tabular style={styles.metricValue}>
        {value}
      </Text>
      {delta && (
        <Text
          variant="caption"
          weight="medium"
          tabular
          style={{ color: deltaPositive ? theme.success : theme.danger }}>
          {deltaPositive ? `↑ ${delta}` : `↓ ${delta}`}
        </Text>
      )}
    </RNText>
  );
}

const styles = StyleSheet.create({
  tabularNums: {
    fontVariant: ['tabular-nums'],
  },
  metricContainer: {
    flexDirection: 'column',
  },
  metricLabel: {
    marginBottom: 4,
  },
  metricValue: {
    fontSize: Typography.heading.fontSize,
    lineHeight: Typography.heading.lineHeight,
    letterSpacing: -0.5,
  },
});
