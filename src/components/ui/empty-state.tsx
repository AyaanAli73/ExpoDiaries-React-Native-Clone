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

export interface EmptyStateProps {
  icon?: IconName | React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon = 'Inbox',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  children,
  className,
  style,
}: EmptyStateProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        style,
      ]}
      className={className}>
      <View style={[styles.iconCircle, { backgroundColor: theme.secondary }]}>
        {typeof icon === 'string' ? (
          <Icon name={icon as IconName} size={28} color={theme.textSecondary} />
        ) : (
          icon
        )}
      </View>

      <Heading level={3} style={styles.title}>
        {title}
      </Heading>

      {description ? (
        <AppText
          color="secondary"
          variant="body"
          style={styles.description}>
          {description}
        </AppText>
      ) : null}

      {children}

      {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <View style={styles.actionRow}>
          {actionLabel && onAction && (
            <Button
              label={actionLabel}
              variant="primary"
              size="sm"
              onPress={onAction}
            />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              label={secondaryActionLabel}
              variant="outline"
              size="sm"
              onPress={onSecondaryAction}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
