import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ScreenContainer } from '@/components/layout/screen-container';
import { DigitalBusinessCard } from '@/components/profile/digital-business-card';
import { QrProfileModal } from '@/components/profile/qr-profile-modal';
import {
  AppText,
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
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Spacing } from '@/theme';

interface NavigationItem {
  key: string;
  label: string;
  subtitle: string;
  icon: any;
  route: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'outline';
}

const PERSONAL_MODULES: NavigationItem[] = [
  {
    key: 'me',
    label: 'My Profile',
    subtitle: 'Personal info, bio, and event badges',
    icon: 'User',
    route: '/profile/me',
  },
  {
    key: 'company',
    label: 'Company',
    subtitle: 'Acme Corporation • Booth #4209',
    icon: 'Building',
    route: '/profile/company',
    badge: 'EXHIBITOR',
    badgeVariant: 'outline',
  },
  {
    key: 'card',
    label: 'Digital Business Card',
    subtitle: 'NFC attendee pass, theme styles & socials',
    icon: 'CreditCard',
    route: '/profile/card',
    badge: 'NFC',
    badgeVariant: 'primary',
  },
  {
    key: 'qr',
    label: 'QR Profile',
    subtitle: 'Real QR code linking to public profile URL',
    icon: 'QrCode',
    route: '/profile/qr',
    badge: 'LIVE',
    badgeVariant: 'success',
  },
];

const PREFERENCE_MODULES: NavigationItem[] = [
  {
    key: 'notifications',
    label: 'Notifications',
    subtitle: 'Hot lead alerts, team pings & quiet hours',
    icon: 'Bell',
    route: '/profile/notifications',
  },
  {
    key: 'privacy',
    label: 'Privacy',
    subtitle: 'Visibility, biometrics & token security',
    icon: 'Shield',
    route: '/profile/privacy',
  },
  {
    key: 'appearance',
    label: 'Appearance',
    subtitle: 'Dark/Light mode, theme & density',
    icon: 'Palette',
    route: '/profile/appearance',
  },
  {
    key: 'data',
    label: 'Data',
    subtitle: 'Offline cache, storage breakdown & backup',
    icon: 'HardDrive',
    route: '/profile/data',
  },
  {
    key: 'account',
    label: 'Account',
    subtitle: 'Login sessions, password & 2FA security',
    icon: 'Lock',
    route: '/profile/account',
  },
];

const TEAM_MODULES: NavigationItem[] = [
  {
    key: 'team',
    label: 'Team Roster & Booth Staff',
    subtitle: '18 active credentials • Lead assignment',
    icon: 'Users',
    route: '/profile/team',
  },
  {
    key: 'crm',
    label: 'CRM Connections & Sync',
    subtitle: 'Salesforce, HubSpot, Dynamics, Custom API',
    icon: 'Share2',
    route: '/profile/crm',
    badge: '4 CRMs',
    badgeVariant: 'primary',
  },
];

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { user, logout } = useAuthStore();
  const [qrModalVisible, setQrModalVisible] = useState(false);

  // Destructive Action: Sign Out Confirmation
  const handleLogout = () => {
    Alert.alert(
      'Sign Out of Session',
      'Are you sure you want to sign out? Your offline captured leads are synced with local storage.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const renderModuleGroup = (title: string, items: NavigationItem[]) => (
    <Card density="comfortable" style={styles.groupCard}>
      <CardHeader>
        <CardTitle level={3}>{title}</CardTitle>
      </CardHeader>
      <CardContent style={styles.groupContent}>
        {items.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 && <Divider />}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Navigate to ${item.label}`}
              onPress={() => router.push(item.route as any)}
              style={styles.moduleRow}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.surfaceSubtle },
                ]}>
                <Icon name={item.icon} size={18} color={theme.primary} />
              </View>
              <View style={styles.moduleTextCol}>
                <AppText variant="body" weight="semibold">
                  {item.label}
                </AppText>
                <AppText variant="caption" color="secondary" numberOfLines={1}>
                  {item.subtitle}
                </AppText>
              </View>
              {item.badge && (
                <Badge
                  label={item.badge}
                  variant={item.badgeVariant || 'outline'}
                  size="sm"
                />
              )}
              <Icon name="ChevronRight" size={16} color={theme.textMuted} />
            </Pressable>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <ScreenContainer safeAreaEdges={['left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 1. Interactive Digital Business Card */}
        <Animated.View
          entering={FadeInDown.duration(280).springify().damping(18)}
          style={styles.cardSection}>
          <DigitalBusinessCard
            user={user}
            eventName="CES 2026 Las Vegas"
            boothLocation="Booth #4209"
            onOpenQrModal={() => setQrModalVisible(true)}
          />
        </Animated.View>

        {/* 2. Quick Action Buttons */}
        <Animated.View
          entering={FadeInDown.duration(260).delay(40)}
          style={styles.quickBar}>
          <Button
            label="View Card"
            variant="outline"
            size="sm"
            leftIcon="CreditCard"
            onPress={() => router.push('/profile/card' as any)}
            aria-label="Open digital business card screen"
            style={{ flex: 1 }}
          />
          <Button
            label="QR Pass"
            variant="outline"
            size="sm"
            leftIcon="QrCode"
            onPress={() => router.push('/profile/qr' as any)}
            aria-label="Open QR profile screen"
            style={{ flex: 1 }}
          />
          <Button
            label="Edit Info"
            variant="primary"
            size="sm"
            leftIcon="Edit3"
            onPress={() => router.push('/profile/edit' as any)}
            aria-label="Edit attendee profile details"
            style={{ flex: 1 }}
          />
        </Animated.View>

        {/* 3. Personal & Identity Modules (My Profile, Company, Digital Card, QR Profile) */}
        <Animated.View entering={FadeInDown.duration(260).delay(80)}>
          {renderModuleGroup('Attendee & Identity', PERSONAL_MODULES)}
        </Animated.View>

        {/* 4. Preferences & Privacy Modules (Notifications, Privacy, Appearance, Data, Account) */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)}>
          {renderModuleGroup('Preferences & Controls', PREFERENCE_MODULES)}
        </Animated.View>

        {/* 5. Team & CRM Integrations */}
        <Animated.View entering={FadeInDown.duration(260).delay(160)}>
          {renderModuleGroup('Team & Integrations', TEAM_MODULES)}
        </Animated.View>

        {/* 6. Sign Out Button (Destructive Confirmation) */}
        <Animated.View
          entering={FadeInDown.duration(260).delay(200)}
          style={styles.logoutSection}>
          <Button
            label="Sign Out of Session"
            variant="danger"
            size="md"
            leftIcon="LogOut"
            onPress={handleLogout}
            aria-label="Sign out of account session"
          />
        </Animated.View>
      </ScrollView>

      {/* QR Profile Modal */}
      <QrProfileModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        user={user}
        eventName="CES 2026 Las Vegas"
        boothLocation="Booth #4209"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  cardSection: {
    marginVertical: Spacing.xs,
  },
  quickBar: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  groupCard: {
    marginBottom: Spacing.xs,
  },
  groupContent: {
    gap: Spacing.xs,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTextCol: {
    flex: 1,
    gap: 2,
  },
  logoutSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
});
