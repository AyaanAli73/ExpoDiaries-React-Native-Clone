import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ResponsiveGrid } from '@/components/layout/responsive-grid';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Divider,
  Icon,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/use-responsive';
import { useAppStore } from '@/stores/use-app-store';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Spacing } from '@/theme';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { isTablet, isDesktop } = useResponsive();
  const { user, logout } = useAuthStore();
  const { density, setDensity, activeWorkspace } = useAppStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <ScreenContainer safeAreaEdges={['left', 'right']}>
      {/* 1. User Info Profile Header */}
      <Animated.View
        entering={FadeInDown.duration(280).springify().damping(18)}
        style={styles.section}>
        <Card density="comfortable">
          <CardHeader>
            <View style={styles.userHeader}>
              <View style={styles.userAvatarRow}>
                <Avatar
                  name={user?.name || 'Alex Mercer'}
                  source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined}
                  size="lg"
                />
                <View style={styles.userInfoCol}>
                  <CardTitle level={2}>{user?.name || 'Alex Mercer'}</CardTitle>
                  <AppText variant="caption" color="secondary">
                    {user?.title || 'Solutions Architect'} • {user?.email || 'alex@acme.io'}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    {user?.phone || '+1 (555) 234-8901'}
                  </AppText>
                </View>
              </View>
              <Badge label={user?.role?.toUpperCase() || 'ADMIN'} variant="primary" size="sm" />
            </View>
          </CardHeader>

          <Divider style={{ marginHorizontal: Spacing.md }} />

          <CardContent style={styles.orgDetails}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelRow}>
                <Icon name="Briefcase" size={14} color={theme.textMuted} />
                <AppText variant="caption" color="secondary">
                  Organization
                </AppText>
              </View>
              <AppText variant="body" weight="semibold">
                {activeWorkspace.name}
              </AppText>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabelRow}>
                <Icon name="Sparkles" size={14} color={theme.textMuted} />
                <AppText variant="caption" color="secondary">
                  Subscription Tier
                </AppText>
              </View>
              <Badge label={activeWorkspace.plan.toUpperCase()} variant="outline" size="sm" />
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabelRow}>
                <Icon name="Users" size={14} color={theme.textMuted} />
                <AppText variant="caption" color="secondary">
                  Seats Assigned
                </AppText>
              </View>
              <AppText variant="caption" weight="medium" tabular color="secondary">
                18 active staff credentials
              </AppText>
            </View>
          </CardContent>
        </Card>
      </Animated.View>

      <ResponsiveGrid gap={12} columns={isTablet || isDesktop ? 2 : 1}>
        {/* 2. Preferences Card */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(60).springify().damping(18)}
          style={styles.gridSection}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.cardHeaderWithIcon}>
                <Icon name="Sliders" size={16} color={theme.primary} />
                <CardTitle level={3}>Field Preferences</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.prefGrid}>
              <View style={styles.prefRow}>
                <View style={styles.prefTextCol}>
                  <AppText weight="semibold" variant="body">
                    Information Density
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Currently set to {density === 'compact' ? 'Compact' : 'Comfortable'} mode
                  </AppText>
                </View>
                <Button
                  label={density === 'compact' ? 'Comfortable' : 'Compact'}
                  variant="outline"
                  size="sm"
                  onPress={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Management Navigation Links */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(100).springify().damping(18)}
          style={styles.gridSection}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.cardHeaderWithIcon}>
                <Icon name="Settings" size={16} color={theme.primary} />
                <CardTitle level={3}>Management Shortcuts</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.navGrid}>
              <Button
                label="Edit Profile Details"
                variant="outline"
                size="sm"
                leftIcon="User"
                onPress={() => router.push('/profile/edit')}
              />
              <Button
                label="Team Roster & Booth Staff"
                variant="outline"
                size="sm"
                leftIcon="Users"
                onPress={() => router.push('/profile/team')}
              />
              <Button
                label="Offline Sync & Security"
                variant="outline"
                size="sm"
                leftIcon="Shield"
                onPress={() => router.push('/profile/security')}
              />
            </CardContent>
          </Card>
        </Animated.View>
      </ResponsiveGrid>

      {/* 4. Sign Out */}
      <Animated.View
        entering={FadeInDown.duration(300).delay(140).springify().damping(18)}
        style={styles.logoutSection}>
        <Button
          label="Sign Out of Session"
          variant="danger"
          size="md"
          leftIcon="LogOut"
          onPress={handleLogout}
        />
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: Spacing.sm,
  },
  gridSection: {
    marginBottom: Spacing.sm,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  userAvatarRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  userInfoCol: {
    flex: 1,
    gap: 2,
  },
  orgDetails: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  prefGrid: {
    gap: Spacing.sm,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  prefTextCol: {
    flex: 1,
    gap: 2,
  },
  navGrid: {
    gap: Spacing.xs + 2,
  },
  logoutSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
