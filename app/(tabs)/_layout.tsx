import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, Tabs } from 'expo-router';

import { AppShellHeader } from '@/components/layout/app-shell-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppTabBar } from '@/components/layout/app-tab-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/use-responsive';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors } from '@/theme';

export default function TabLayout() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { isTablet, isDesktop } = useResponsive();
  const isLargeScreen = isTablet || isDesktop;

  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/(auth)/welcome');
    }
  }, [isInitialized, isAuthenticated]);

  if (isInitialized && !isAuthenticated) {
    return null;
  }

  const tabsContent = (
    <Tabs
      tabBar={(props) => (!isLargeScreen ? <AppTabBar {...props} /> : null)}
      screenOptions={{
        headerShown: false,
        tabBarStyle: isLargeScreen ? { display: 'none' } : undefined,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );

  if (isLargeScreen) {
    return (
      <View style={[styles.largeShellContainer, { backgroundColor: theme.background }]}>
        <AppSidebar />
        <View style={styles.largeMainContent}>
          <AppShellHeader />
          <View style={styles.contentOutlet}>{tabsContent}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mobileShellContainer, { backgroundColor: theme.background }]}>
      <AppShellHeader />
      <View style={styles.contentOutlet}>{tabsContent}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  largeShellContainer: {
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
  mobileShellContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentOutlet: {
    flex: 1,
    width: '100%',
  },
});
