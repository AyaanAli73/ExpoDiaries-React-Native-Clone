import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Icon, IconName } from '@/components/ui/icon';
import { Colors, Radius, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ErrorStateVariant = 'card' | 'inline' | 'banner';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: ErrorStateVariant;
  icon?: IconName;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  variant = 'card',
  icon = 'AlertTriangle',
  className,
  style,
}: ErrorStateProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  if (variant === 'banner') {
    return (
      <View
        accessibilityRole="alert"
        aria-live="polite"
        style={[
          styles.bannerContainer,
          {
            backgroundColor: theme.dangerBackground,
            borderColor: theme.danger,
          },
          style,
        ]}
        className={className}>
        <View style={styles.bannerContent}>
          <Icon name={icon} size={18} color={theme.danger} />
          <View style={styles.bannerTextWrapper}>
            {title ? (
              <AppText weight="semibold" style={{ color: theme.danger, fontSize: 13 }}>
                {title}
              </AppText>
            ) : null}
            <AppText variant="caption" style={{ color: theme.danger }}>
              {message}
            </AppText>
          </View>
        </View>
        {onRetry && (
          <Button
            label={retryLabel}
            variant="danger"
            size="sm"
            onPress={onRetry}
          />
        )}
      </View>
    );
  }

  if (variant === 'inline') {
    return (
      <View
        accessibilityRole="alert"
        aria-live="polite"
        style={[styles.inlineContainer, style]}
        className={className}>
        <Icon name={icon} size={16} color={theme.danger} />
        <AppText variant="caption" style={[styles.inlineMessage, { color: theme.danger }]}>
          {message}
        </AppText>
        {onRetry && (
          <Button
            label={retryLabel}
            variant="ghost"
            size="sm"
            onPress={onRetry}
          />
        )}
      </View>
    );
  }

  // Card variant (default)
  return (
    <View
      accessibilityRole="alert"
      aria-live="polite"
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.surface,
          borderColor: theme.danger,
        },
        style,
      ]}
      className={className}>
      <View style={[styles.iconCircle, { backgroundColor: theme.dangerBackground }]}>
        <Icon name={icon} size={28} color={theme.danger} />
      </View>

      <Heading level={3} style={styles.cardTitle}>
        {title}
      </Heading>

      <AppText
        color="secondary"
        variant="body"
        style={styles.cardMessage}>
        {message}
      </AppText>

      {onRetry && (
        <View style={styles.retryButtonContainer}>
          <Button
            label={retryLabel}
            variant="outline"
            leftIcon="RotateCcw"
            size="sm"
            onPress={onRetry}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: Spacing.xl,
    borderRadius: Radius.large,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  cardMessage: {
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  retryButtonContainer: {
    marginTop: Spacing.md,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.medium,
    borderWidth: 1,
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  bannerTextWrapper: {
    flex: 1,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  inlineMessage: {
    flex: 1,
  },
});
