import React, { useEffect } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Icon, IconName } from '@/components/ui/icon';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastProps {
  visible: boolean;
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  action?: ToastAction;
  position?: ToastPosition;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Toast({
  visible,
  message,
  title,
  type = 'info',
  duration = 4000,
  onDismiss,
  action,
  position = 'top',
  className,
  style,
}: ToastProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();

  const hiddenOffset = position === 'top' ? -80 : 80;
  const translateY = useSharedValue(hiddenOffset);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 250 });
      opacity.value = withTiming(1, { duration: 250 });

      if (duration > 0 && onDismiss) {
        const timer = setTimeout(() => {
          onDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      translateY.value = withTiming(hiddenOffset, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, duration, onDismiss, position, hiddenOffset, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const iconName: IconName = {
    success: 'CheckCircle2',
    error: 'AlertCircle',
    warning: 'AlertTriangle',
    info: 'Info',
  }[type] as IconName;

  const typeColor = {
    success: theme.success,
    error: theme.danger,
    warning: theme.warning,
    info: theme.primary,
  }[type];

  const topInset = position === 'top' ? insets.top + Spacing.sm : undefined;
  const bottomInset = position === 'bottom' ? insets.bottom + Spacing.sm : undefined;

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      aria-live="polite"
      style={[
        styles.container,
        {
          top: topInset,
          bottom: bottomInset,
        },
        animatedStyle,
      ]}>
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.border,
          },
          style,
        ]}
        className={className}>
        <View style={styles.contentRow}>
          <Icon name={iconName} size={18} color={typeColor} />

          <View style={styles.textColumn}>
            {title ? (
              <AppText weight="semibold" style={{ fontSize: 13, color: theme.textPrimary }}>
                {title}
              </AppText>
            ) : null}
            <AppText variant="caption" color="secondary" style={styles.messageText}>
              {message}
            </AppText>
          </View>

          {action && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => {
                action.onPress();
                onDismiss?.();
              }}
              style={styles.actionButton}>
              <AppText weight="bold" style={{ color: theme.primary, fontSize: 12 }}>
                {action.label}
              </AppText>
            </Pressable>
          )}

          {onDismiss && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss alert"
              onPress={onDismiss}
              hitSlop={8}
              style={styles.dismissButton}>
              <Icon name="X" size={14} color={theme.textMuted} />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: Radius.medium + 2,
    borderWidth: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    ...Shadows.elevated,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    marginLeft: Spacing.sm,
    marginRight: Spacing.xs,
  },
  messageText: {
    lineHeight: 16,
  },
  actionButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  dismissButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
