import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppText, Badge, Button, Heading, Icon, Screen } from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Spacing } from '@/theme';

export default function SplashScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [mountedTimePassed, setMountedTimePassed] = useState(false);

  useEffect(() => {
    // Graceful presentation timer (800ms) for smooth splash experience
    const timer = setTimeout(() => {
      setMountedTimePassed(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mountedTimePassed) return;

    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [mountedTimePassed, isAuthenticated, isInitialized]);

  return (
    <Screen
      scrollable={false}
      statusBarStyle={scheme === 'dark' ? 'light' : 'dark'}
      contentContainerStyle={styles.container}>
      <View style={styles.centerBox}>
        {/* Animated Brand Mark */}
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: theme.primarySubtle,
              borderColor: theme.border,
            },
          ]}>
          <Icon name="Layers" size={44} color={theme.primary} />
        </View>

        <Badge label="EXPODIARIES ENTERPRISE" variant="primary" showDot />

        <Heading level={1} style={styles.title}>
          ExpoDiaries
        </Heading>

        <AppText color="secondary" variant="body" style={styles.subtitle}>
          Event Intelligence & Offline Booth Lead Capture
        </AppText>

        <View style={styles.loadingArea}>
          <ActivityIndicator size="small" color={theme.primary} />
          <AppText variant="caption" color="muted" style={styles.statusText}>
            Initializing secure local session…
          </AppText>
        </View>
      </View>

      {/* Manual Navigation Overrides (for testing & development) */}
      <View style={styles.footerOverrides}>
        <Button
          label="Direct: Command Center"
          variant="ghost"
          size="sm"
          onPress={() => router.replace('/(tabs)')}
        />
        <Button
          label="Direct: Welcome Screen"
          variant="ghost"
          size="sm"
          onPress={() => router.replace('/(auth)/welcome')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  centerBox: {
    alignItems: 'center',
    gap: Spacing.sm,
    maxWidth: 380,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: Radius.large + 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    letterSpacing: -0.8,
    marginTop: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  loadingArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
  },
  statusText: {
    letterSpacing: 0.2,
  },
  footerOverrides: {
    position: 'absolute',
    bottom: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
