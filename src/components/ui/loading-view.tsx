import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Spacing } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large';
  fullscreen?: boolean;
  overlay?: boolean;
  color?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function LoadingView({
  message = 'Loading…',
  size = 'large',
  fullscreen = false,
  overlay = false,
  color,
  className,
  style,
}: LoadingViewProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const spinnerColor = color || theme.primary;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      aria-busy={true}
      style={[
        styles.container,
        fullscreen && styles.fullscreen,
        overlay && [
          styles.overlay,
          {
            backgroundColor: scheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.75)',
          },
        ],
        style,
      ]}
      className={className}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message ? (
        <AppText
          variant="caption"
          color="secondary"
          weight="medium"
          style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  message: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
