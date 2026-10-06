import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppShellHeader } from '@/components/layout/app-shell-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/use-responsive';
import { Colors } from '@/theme';

export interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
}

/**
 * AppShell: Universal Authenticated Application Shell
 * Provides unified adaptive layout for all screens:
 * - Mobile: Unified AppShellHeader at top, screen content below.
 * - Large screens: Adaptive AppSidebar on left, AppShellHeader at top, screen content below.
 */
export function AppShell({
  children,
  title,
  subtitle,
  action,
  showBack,
}: AppShellProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { isTablet, isDesktop } = useResponsive();
  const isLargeScreen = isTablet || isDesktop;

  if (isLargeScreen) {
    return (
      <View style={[styles.largeScreenContainer, { backgroundColor: theme.background }]}>
        <AppSidebar />
        <View style={styles.largeMainContent}>
          <AppShellHeader
            title={title}
            subtitle={subtitle}
            action={action}
            showBack={showBack}
          />
          <View style={styles.contentOutlet}>{children}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mobileContainer, { backgroundColor: theme.background }]}>
      <AppShellHeader
        title={title}
        subtitle={subtitle}
        action={action}
        showBack={showBack}
      />
      <View style={styles.contentOutlet}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  largeScreenContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  largeMainContent: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  mobileContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentOutlet: {
    flex: 1,
    width: '100%',
  },
});
