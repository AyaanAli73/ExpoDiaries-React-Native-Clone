import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppText,
  Avatar,
  Badge,
  Button,
  CardContent,
  CardHeader,
  CardTitle,
  Divider,
  Icon,
  IconButton,
  type IconName,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useActiveEvent } from '@/hooks/use-events';
import { useResponsive } from '@/hooks/use-responsive';
import { useAppStore } from '@/stores/use-app-store';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Shadows, Spacing } from '@/theme';

export interface AppShellHeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: IconName;
  type: 'lead' | 'event' | 'sync';
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Hot Lead Captured',
    message: 'Marcus Vance reached score 92 (CTO, SolarDrive Tech).',
    time: '5m ago',
    icon: 'Flame',
    type: 'lead',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Booth Shift Starting',
    message: 'Booth Duty Shift 1 at North Hall #N-408 begins shortly.',
    time: '25m ago',
    icon: 'Clock',
    type: 'event',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Offline Sync Success',
    message: '4 attendee badge records synced with central cloud database.',
    time: '1h ago',
    icon: 'CheckCircle2',
    type: 'sync',
    read: false,
  },
];

export function AppShellHeader({
  title: propTitle,
  subtitle: propSubtitle,
  action,
  showBack = false,
}: AppShellHeaderProps = {}) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { isTablet, isDesktop } = useResponsive();
  const isLargeScreen = isTablet || isDesktop;

  const user = useAuthStore((state) => state.user);
  const { activeWorkspace, themePreference, setThemePreference } = useAppStore();
  const { data: activeEvent } = useActiveEvent();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleTheme = () => {
    if (themePreference === 'dark') {
      setThemePreference('light');
    } else {
      setThemePreference('dark');
    }
  };

  // Dynamic Route Title & Subtitle
  const getRouteHeader = () => {
    if (
      pathname === '/' ||
      pathname === '/(tabs)' ||
      pathname === '/(tabs)/' ||
      pathname === '/(tabs)/index'
    ) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }).format(new Date());

      return {
        title: `${greeting}, ${firstName}`,
        subtitle: `${formattedDate} • ${activeEvent ? `${activeEvent.name} (${activeEvent.boothNumber})` : 'Trade Show Operations'}`,
      };
    }
    if (pathname.includes('/events')) {
      return {
        title: 'Expos & Conferences',
        subtitle: 'Manage active booths, event targets, and staff assignments',
      };
    }
    if (pathname.includes('/leads')) {
      return {
        title: 'Lead Operations',
        subtitle: 'Attendee badge database, score qualification, and CRM exports',
      };
    }
    if (pathname.includes('/capture')) {
      return {
        title: 'Rapid Lead Capture',
        subtitle: 'High-resolution badge scanner, card OCR, and offline ingestion',
      };
    }
    if (pathname.includes('/profile')) {
      return {
        title: 'Account & Operations',
        subtitle: 'Executive profile, workspace settings, and security telemetry',
      };
    }
    if (pathname.includes('/analytics')) {
      return {
        title: 'Analytics & ROI',
        subtitle: 'Booth traffic metrics, qualification velocity, and team performance',
      };
    }
    return {
      title: 'ExpoDiaries',
      subtitle: activeWorkspace.name,
    };
  };

  const routeContent = getRouteHeader();
  const displayTitle = propTitle || routeContent.title;
  const displaySubtitle = propSubtitle || routeContent.subtitle;

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
          paddingTop: isLargeScreen ? Spacing.sm : Math.max(insets.top, 10),
        },
      ]}>
      {/* Title & Metadata Left Column */}
      <View style={styles.leftCol}>
        {showBack && (
          <IconButton
            icon="ChevronLeft"
            size="sm"
            variant="ghost"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.backBtn}
          />
        )}
        <View style={styles.titleTextCol}>
          <View style={styles.workspaceRow}>
            <Badge label={activeWorkspace.name} variant="outline" size="sm" showDot />
            {isLargeScreen && (
              <Badge label={activeWorkspace.plan.toUpperCase()} variant="primary" size="sm" />
            )}
          </View>
          <AppText weight="bold" variant="title" style={styles.titleText} numberOfLines={1}>
            {displayTitle}
          </AppText>
          <AppText
            variant="caption"
            color="secondary"
            numberOfLines={1}
            style={styles.subtitleText}>
            {displaySubtitle}
          </AppText>
        </View>
      </View>

      {/* Action Controls Right Column */}
      <View style={styles.rightCol}>
        {/* Optional Page Action */}
        {action}

        {/* Theme Toggle */}
        <IconButton
          icon={scheme === 'dark' ? 'Sun' : 'Moon'}
          size="sm"
          variant="ghost"
          accessibilityLabel={`Switch to ${scheme === 'dark' ? 'light' : 'dark'} mode`}
          onPress={toggleTheme}
        />

        {/* Notification Button */}
        <View style={styles.notifBtnWrapper}>
          <IconButton
            icon="Bell"
            size="sm"
            variant="ghost"
            accessibilityLabel={`Notifications (${unreadCount} unread)`}
            onPress={() => setShowNotifications(true)}
          />
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.danger }]}>
              <AppText weight="bold" style={styles.unreadText}>
                {unreadCount}
              </AppText>
            </View>
          )}
        </View>

        {/* User Avatar */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`User profile: ${user?.name || 'Alex Mercer'}`}
          onPress={() => router.push('/(tabs)/profile')}
          style={({ pressed }) => [
            styles.avatarButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}>
          <Avatar
            name={user?.name || 'Alex Mercer'}
            source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined}
            size="sm"
          />
          <View
            style={[
              styles.avatarLiveDot,
              { backgroundColor: theme.success, borderColor: theme.surface },
            ]}
          />
        </Pressable>
      </View>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNotifications(false)}>
          <Pressable
            style={[
              styles.notifCard,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
                top: Math.max(insets.top + 50, 60),
              },
              Shadows.elevated,
            ]}
            onPress={(e) => e.stopPropagation()}>
            <CardHeader style={styles.notifHeader}>
              <View style={styles.notifHeaderRow}>
                <View style={styles.notifTitleRow}>
                  <Icon name="Bell" size={16} color={theme.primary} />
                  <CardTitle level={3}>Notifications</CardTitle>
                </View>
                {unreadCount > 0 && (
                  <Button
                    label="Mark All Read"
                    variant="ghost"
                    size="sm"
                    onPress={markAllAsRead}
                  />
                )}
              </View>
            </CardHeader>

            <Divider />

            <CardContent style={styles.notifList}>
              {notifications.map((item) => {
                const iconColor =
                  item.type === 'lead'
                    ? theme.danger
                    : item.type === 'event'
                      ? theme.warning
                      : theme.success;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.notifItem,
                      {
                        backgroundColor: item.read ? 'transparent' : theme.primarySubtle,
                        borderColor: theme.border,
                      },
                    ]}>
                    <View style={[styles.notifIconBox, { backgroundColor: theme.secondary }]}>
                      <Icon name={item.icon} size={16} color={iconColor} />
                    </View>
                    <View style={styles.notifItemText}>
                      <View style={styles.notifItemTop}>
                        <AppText weight="bold" variant="caption" numberOfLines={1}>
                          {item.title}
                        </AppText>
                        <AppText variant="caption" color="muted">
                          {item.time}
                        </AppText>
                      </View>
                      <AppText variant="caption" color="secondary" numberOfLines={2}>
                        {item.message}
                      </AppText>
                    </View>
                  </View>
                );
              })}
            </CardContent>

            <Divider />

            <View style={styles.notifFooter}>
              <Button
                label="Close"
                variant="outline"
                size="sm"
                onPress={() => setShowNotifications(false)}
                style={{ width: '100%' }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    zIndex: 20,
  },
  leftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.sm,
    gap: Spacing.xs,
  },
  backBtn: {
    marginRight: 2,
  },
  titleTextCol: {
    flex: 1,
    gap: 1,
  },
  workspaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  titleText: {
    letterSpacing: -0.4,
    fontSize: 17,
  },
  subtitleText: {
    lineHeight: 15,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifBtnWrapper: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 9,
  },
  avatarButton: {
    position: 'relative',
    marginLeft: 2,
  },
  avatarLiveDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
  },
  notifCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: Radius.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notifHeader: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  notifList: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    gap: 4,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.medium,
  },
  notifIconBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifItemText: {
    flex: 1,
    gap: 2,
  },
  notifItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifFooter: {
    padding: Spacing.sm,
  },
});
