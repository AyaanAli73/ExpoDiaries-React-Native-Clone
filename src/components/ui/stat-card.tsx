import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Icon, IconName } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, Radius, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type DeltaType = 'increase' | 'decrease' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string | number;
  delta?: string | number;
  deltaType?: DeltaType;
  deltaPeriod?: string;
  icon?: IconName;
  loading?: boolean;
  interactive?: boolean;
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function StatCard({
  title,
  value,
  delta,
  deltaType = 'neutral',
  deltaPeriod,
  icon,
  loading = false,
  interactive = false,
  onPress,
  className,
  style,
  accessibilityLabel,
}: StatCardProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const isInteractive = interactive || Boolean(onPress);

  const deltaColor = {
    increase: theme.success,
    decrease: theme.danger,
    neutral: theme.textMuted,
  }[deltaType];

  const deltaIconName = {
    increase: 'TrendingUp',
    decrease: 'TrendingDown',
    neutral: 'Minus',
  }[deltaType] as IconName;

  const resolvedLabel =
    accessibilityLabel ||
    `${title}: ${value}${delta ? `, ${deltaType === 'increase' ? 'up' : 'down'} ${delta}` : ''}`;

  const content = (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <AppText
          variant="caption"
          weight="medium"
          color="secondary"
          style={styles.titleText}>
          {title}
        </AppText>
        {icon && (
          <View style={[styles.iconWrapper, { backgroundColor: theme.secondary }]}>
            <Icon name={icon} size={16} color={theme.primary} />
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        {loading ? (
          <Skeleton width={100} height={28} style={{ marginVertical: 4 }} />
        ) : (
          <Heading level={2} tabular style={styles.valueText}>
            {value}
          </Heading>
        )}
      </View>

      {(delta !== undefined || deltaPeriod) && (
        <View style={styles.deltaRow}>
          {loading ? (
            <Skeleton width={80} height={14} />
          ) : (
            <>
              {delta !== undefined && (
                <View style={styles.deltaBadge}>
                  <Icon name={deltaIconName} size={12} color={deltaColor} />
                  <AppText
                    variant="caption"
                    weight="semibold"
                    tabular
                    style={{ color: deltaColor, fontSize: 11, marginLeft: 2 }}>
                    {delta}
                  </AppText>
                </View>
              )}
              {deltaPeriod && (
                <AppText
                  variant="caption"
                  color="muted"
                  style={styles.periodText}>
                  {deltaPeriod}
                </AppText>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );

  if (isInteractive && onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={resolvedLabel}
        onPress={onPress}
        style={(state) => [
          styles.cardWrapper,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            transform: [{ scale: state.pressed ? 0.985 : 1 }],
          },
          style,
        ]}
        className={className}>
        {content}
      </Pressable>
    );
  }

  return (
    <Card style={[styles.cardWrapper, style]} className={className}>
      {content}
    </Card>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    padding: Spacing.md,
    borderRadius: Radius.large,
  },
  container: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    marginVertical: 2,
  },
  valueText: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 11,
  },
});
