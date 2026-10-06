import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, usePathname } from 'expo-router';

import {
  AppText,
  Avatar,
  Badge,
  Button,
  Divider,
  Icon,
  IconButton,
  type IconName,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useActiveEvent } from '@/hooks/use-events';
import { useAppStore } from '@/stores/use-app-store';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Spacing } from '@/theme';

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
  matchPrefix: string;
}

// Exactly matching the 5 destinations: Home, Events, Leads, Capture, Profile
const NAV_ITEMS: NavItem[] = [
  { label: 'Home', route: '/(tabs)', icon: 'LayoutDashboard', matchPrefix: 'home' },
  { label: 'Events', route: '/(tabs)/events', icon: 'Calendar', matchPrefix: 'events' },
  { label: 'Leads', route: '/(tabs)/leads', icon: 'Users', matchPrefix: 'leads' },
  { label: 'Capture', route: '/(tabs)/capture', icon: 'QrCode', matchPrefix: 'capture' },
  { label: 'Profile', route: '/(tabs)/profile', icon: 'User', matchPrefix: 'profile' },
];

export function AppSidebar() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const pathname = usePathname();
  const { data: activeEvent } = useActiveEvent();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const {
    activeWorkspace,
    isSidebarExpanded,
    toggleSidebar,
    themePreference,
    setThemePreference,
  } = useAppStore();

  const toggleTheme = () => {
    if (themePreference === 'dark') {
      setThemePreference('light');
    } else {
      setThemePreference('dark');
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  const isNavActive = (item: NavItem): boolean => {
    if (item.matchPrefix === 'home') {
      return (
        pathname === '/' ||
        pathname === '/(tabs)' ||
        pathname === '/(tabs)/' ||
        pathname === '/(tabs)/index'
      );
    }
    return pathname.includes(item.matchPrefix);
  };

  const sidebarWidth = isSidebarExpanded ? 240 : 72;

  return (
    <View
      style={[
        styles.container,
        {
          width: sidebarWidth,
          backgroundColor: theme.surface,
          borderRightColor: theme.border,
        },
      ]}>
      {/* 1. LOGO & BRAND HEADER */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={[styles.brandIconWrapper, { backgroundColor: theme.primarySubtle }]}>
            <Icon name="Layers" size={20} color={theme.primary} />
          </View>
          {isSidebarExpanded && (
            <View style={styles.brandTextWrapper}>
              <AppText weight="bold" variant="body" style={styles.brandTitle}>
                ExpoDiaries
              </AppText>
              <Badge label="PRO" variant="primary" size="sm" />
            </View>
          )}
        </View>

        {/* 5. COLLAPSE CONTROL */}
        <IconButton
          icon={isSidebarExpanded ? 'ChevronLeft' : 'ChevronRight'}
          size="xs"
          variant="ghost"
          accessibilityLabel={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          onPress={toggleSidebar}
        />
      </View>

      <Divider />

      {/* 3. WORKSPACE / COMPANY SECTION */}
      {isSidebarExpanded ? (
        <View
          style={[
            styles.workspaceCard,
            { backgroundColor: theme.secondary, borderColor: theme.border },
          ]}>
          <View style={styles.workspaceTopRow}>
            <View style={[styles.workspaceIconBox, { backgroundColor: theme.primarySubtle }]}>
              <Icon name="Building2" size={14} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText weight="bold" variant="caption" numberOfLines={1}>
                {activeWorkspace.name}
              </AppText>
              <AppText variant="caption" color="muted">
                {activeWorkspace.plan.toUpperCase()} TIER
              </AppText>
            </View>
          </View>

          {activeEvent && (
            <View style={[styles.eventPill, { backgroundColor: theme.surface }]}>
              <View style={styles.liveDot} />
              <AppText variant="caption" color="secondary" numberOfLines={1} style={{ flex: 1 }}>
                {activeEvent.name} • {activeEvent.boothNumber}
              </AppText>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.workspaceCollapsed}>
          <View style={[styles.workspaceIconBox, { backgroundColor: theme.primarySubtle }]}>
            <Icon name="Building2" size={16} color={theme.primary} />
          </View>
        </View>
      )}

      {/* QUICK CAPTURE ACTION BUTTON */}
      <View style={styles.captureBtnWrapper}>
        {isSidebarExpanded ? (
          <Button
            label="Rapid Capture"
            variant="primary"
            size="md"
            leftIcon="QrCode"
            onPress={() => router.push('/(tabs)/capture')}
            style={styles.fullBtn}
          />
        ) : (
          <IconButton
            icon="QrCode"
            size="md"
            variant="primary"
            accessibilityLabel="Rapid Capture"
            onPress={() => router.push('/(tabs)/capture')}
          />
        )}
      </View>

      {/* 2. NAVIGATION ITEMS */}
      <View style={styles.navSection}>
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item);
          return (
            <Pressable
              key={item.route}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => router.push(item.route as never)}
              style={({ pressed }) => [
                styles.navItem,
                {
                  backgroundColor: active
                    ? theme.primarySubtle
                    : pressed
                      ? theme.secondary
                      : 'transparent',
                },
                !isSidebarExpanded && styles.navItemCollapsed,
              ]}>
              {/* Active Indicator Bar */}
              {active && isSidebarExpanded && (
                <View
                  style={[
                    styles.activeBar,
                    { backgroundColor: theme.primary },
                  ]}
                />
              )}
              <Icon
                name={item.icon}
                size={18}
                color={active ? theme.primary : theme.textSecondary}
              />
              {isSidebarExpanded && (
                <AppText
                  variant="body"
                  weight={active ? 'bold' : 'medium'}
                  style={{
                    color: active ? theme.primary : theme.textPrimary,
                    fontSize: 13,
                  }}>
                  {item.label}
                </AppText>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <Divider />

      {/* 4. USER PROFILE & FOOTER CONTROLS */}
      <View style={styles.footerSection}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`User account: ${user?.name || 'Alex Mercer'}`}
          onPress={() => router.push('/(tabs)/profile')}
          style={({ pressed }) => [
            styles.userRow,
            { opacity: pressed ? 0.75 : 1 },
            !isSidebarExpanded && styles.userRowCollapsed,
          ]}>
          <Avatar name={user?.name || 'Alex Mercer'} size={isSidebarExpanded ? 'md' : 'sm'} />
          {isSidebarExpanded && (
            <View style={styles.userTextCol}>
              <AppText weight="bold" variant="caption" numberOfLines={1}>
                {user?.name || 'Alex Mercer'}
              </AppText>
              <AppText variant="caption" color="muted" numberOfLines={1}>
                {user?.role?.toUpperCase() || 'EXHIBITOR'}
              </AppText>
            </View>
          )}
        </Pressable>

        <View style={[styles.footerActions, !isSidebarExpanded && styles.footerActionsCollapsed]}>
          <IconButton
            icon={scheme === 'dark' ? 'Sun' : 'Moon'}
            size="xs"
            variant="ghost"
            accessibilityLabel={`Switch to ${scheme === 'dark' ? 'light' : 'dark'} mode`}
            onPress={toggleTheme}
          />
          <IconButton
            icon="LogOut"
            size="xs"
            variant="ghost"
            accessibilityLabel="Sign out"
            onPress={handleLogout}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    borderRightWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs + 4,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    minHeight: 36,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.3,
  },
  workspaceCard: {
    padding: Spacing.xs + 4,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  workspaceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  workspaceIconBox: {
    width: 26,
    height: 26,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceCollapsed: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: Radius.small,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  captureBtnWrapper: {
    alignItems: 'center',
    marginVertical: 2,
  },
  fullBtn: {
    width: '100%',
  },
  navSection: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm - 1,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.medium,
    position: 'relative',
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
  },
  footerSection: {
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: 4,
  },
  userRowCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  userTextCol: {
    flex: 1,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  footerActionsCollapsed: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
});
