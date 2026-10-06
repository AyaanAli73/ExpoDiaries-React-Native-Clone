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

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: IconName | React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  value?: string;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function ListItem({
  title,
  subtitle,
  leftIcon,
  leftElement,
  rightElement,
  value,
  showChevron = true,
  onPress,
  disabled = false,
  destructive = false,
  className,
  style,
  accessibilityLabel,
}: ListItemProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const isInteractive = Boolean(onPress);
  const titleColor = destructive
    ? theme.danger
    : disabled
      ? theme.textMuted
      : theme.textPrimary;

  const content = (
    <View style={styles.itemRow}>
      {leftElement ? (
        <View style={styles.leftContainer}>{leftElement}</View>
      ) : leftIcon ? (
        <View style={styles.leftContainer}>
          {typeof leftIcon === 'string' ? (
            <Icon
              name={leftIcon as IconName}
              size={18}
              color={destructive ? theme.danger : theme.textSecondary}
            />
          ) : (
            leftIcon
          )}
        </View>
      ) : null}

      <View style={styles.textContainer}>
        <AppText weight="medium" style={{ color: titleColor, fontSize: 13 }}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" color="muted" style={styles.subtitle}>
            {subtitle}
          </AppText>
        )}
      </View>

      <View style={styles.rightContainer}>
        {value && (
          <AppText variant="caption" color="secondary" style={styles.valueText}>
            {value}
          </AppText>
        )}
        {rightElement}
        {isInteractive && showChevron && (
          <Icon name="ChevronRight" size={16} color={theme.textMuted} />
        )}
      </View>
    </View>
  );

  if (isInteractive) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={(state) => [
          styles.itemWrapper,
          {
            backgroundColor: state.pressed && !disabled
              ? 'rgba(128,128,128,0.08)'
              : 'transparent',
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        className={className}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.itemWrapper, style]} className={className}>
      {content}
    </View>
  );
}

export interface ListSectionProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function ListSection({
  title,
  subtitle,
  action,
  footer,
  children,
  className,
  style,
}: ListSectionProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Convert children to array and insert dividers between items
  const childrenArray = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.sectionContainer, style]} className={className}>
      {(title || action) && (
        <View style={styles.headerRow}>
          <View>
            {title && (
              <AppText
                weight="semibold"
                color="secondary"
                style={styles.sectionTitle}>
                {title.toUpperCase()}
              </AppText>
            )}
            {subtitle && (
              <AppText variant="caption" color="muted">
                {subtitle}
              </AppText>
            )}
          </View>
          {action}
        </View>
      )}

      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}>
        {childrenArray.map((child, index) => {
          const isLast = index === childrenArray.length - 1;
          return (
            <React.Fragment key={index}>
              {child}
              {!isLast && (
                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor: theme.border,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {footer && (
        <View style={styles.footerContainer}>
          {typeof footer === 'string' ? (
            <AppText variant="caption" color="muted">
              {footer}
            </AppText>
          ) : (
            footer
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  cardContainer: {
    borderRadius: Radius.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemWrapper: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    minHeight: 46,
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginLeft: Spacing.sm,
  },
  valueText: {
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
  footerContainer: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
});
