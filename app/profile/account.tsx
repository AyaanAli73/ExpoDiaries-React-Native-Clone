import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
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
  IconButton,
  Input,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/use-auth-store';
import { Colors, Radius, Shadows, Spacing } from '@/theme';

export default function AccountScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { user, logout } = useAuthStore();

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Change Password
  const handleSavePassword = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Validation Error', 'Please complete all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match.');
      return;
    }
    setPasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Password Updated', 'Your account credentials have been updated.');
  };

  // Destructive Action: Revoke Other Sessions
  const handleRevokeSessions = () => {
    Alert.alert(
      'Revoke Active Sessions',
      'Are you sure you want to log out of all other devices and browser dashboards? You will remain signed in on this phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Sessions',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Sessions Terminated',
              'All other mobile and desktop sessions have been invalidated.'
            );
          },
        },
      ]
    );
  };

  // Destructive Action: Sign Out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of ExpoDiaries? Unsaved badge drafts will be discarded.',
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

  // Destructive Action: Delete Account (Two-step confirmation)
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your ExpoDiaries account? This action cannot be undone and your exhibitor credentials will be revoked.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue…',
          style: 'destructive',
          onPress: () => {
            // Step 2 confirmation
            Alert.alert(
              'Final Confirmation',
              'Type confirmation: All personal data and team lead assignments will be permanently unlinked.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Permanently Delete',
                  style: 'destructive',
                  onPress: () => {
                    logout();
                    router.replace('/(auth)/welcome');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Account"
          subtitle="Security credentials, login sessions, and identity management"
          action={
            <Button
              label="Back"
              variant="outline"
              size="sm"
              leftIcon="ChevronLeft"
              onPress={() => router.back()}
              aria-label="Back to profile hub"
            />
          }
        />
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 1. Account Identity */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="User" size={18} color={theme.primary} />
                <CardTitle level={2}>Account Identity</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.infoRow}>
                <AppText variant="caption" color="secondary">
                  Primary Email
                </AppText>
                <AppText variant="body" weight="semibold">
                  {user?.email || 'alex@acme.io'}
                </AppText>
              </View>
              <Divider />
              <View style={styles.infoRow}>
                <AppText variant="caption" color="secondary">
                  Display Name
                </AppText>
                <AppText variant="body" weight="semibold">
                  {user?.name || 'Alex Mercer'}
                </AppText>
              </View>
              <Divider />
              <View style={styles.infoRow}>
                <AppText variant="caption" color="secondary">
                  Organization Membership
                </AppText>
                <Badge label="ACME CORP • ADMIN" variant="primary" size="sm" />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 2. Password & Authentication Security */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Key" size={18} color={theme.primary} />
                <CardTitle level={2}>Authentication & 2FA</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.securityRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="body" weight="semibold">
                    Account Password
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Last modified 14 days ago
                  </AppText>
                </View>
                <Button
                  label="Change"
                  variant="outline"
                  size="sm"
                  onPress={() => setPasswordModalVisible(true)}
                  aria-label="Change account password"
                />
              </View>

              <Divider />

              <View style={styles.securityRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.authBadgeRow}>
                    <AppText variant="body" weight="semibold">
                      Two-Factor Authentication
                    </AppText>
                    <Badge label="ENABLED" variant="success" size="sm" showDot />
                  </View>
                  <AppText variant="caption" color="secondary">
                    SMS & Authenticator app verification active
                  </AppText>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Active Login Sessions */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Smartphone" size={18} color={theme.primary} />
                <CardTitle level={2}>Active Device Sessions</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.sessionItem}>
                <Icon name="Smartphone" size={18} color={theme.primary} />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                    <AppText variant="body" weight="semibold">
                      Mobile App (This Device)
                    </AppText>
                    <Badge label="CURRENT" variant="primary" size="sm" />
                  </View>
                  <AppText variant="caption" color="secondary">
                    Expo Go • iOS 18.2 • Las Vegas, NV
                  </AppText>
                </View>
              </View>

              <Divider />

              <View style={styles.sessionItem}>
                <Icon name="Monitor" size={18} color={theme.textMuted} />
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="body" weight="semibold">
                    Web Event Dashboard
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Chrome 131 • macOS • San Francisco, CA
                  </AppText>
                </View>
              </View>

              <Button
                label="Revoke All Other Sessions"
                variant="outline"
                size="sm"
                onPress={handleRevokeSessions}
                aria-label="Revoke other login sessions"
                style={{ marginTop: 4 }}
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* 4. Destructive Actions: Sign Out & Account Deletion */}
        <Animated.View entering={FadeInDown.duration(260).delay(180)} style={styles.section}>
          <Card density="comfortable" style={{ borderColor: theme.danger }}>
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="AlertTriangle" size={18} color={theme.danger} />
                <CardTitle level={2}>Danger Zone</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.dangerRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="body" weight="semibold">
                    Sign Out
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    End current authenticated mobile session
                  </AppText>
                </View>
                <Button
                  label="Sign Out"
                  variant="outline"
                  size="sm"
                  onPress={handleSignOut}
                  aria-label="Sign out of account"
                />
              </View>

              <Divider />

              <View style={styles.dangerRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="body" weight="semibold" color="danger">
                    Delete Account
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Permanently delete account credentials and team seat
                  </AppText>
                </View>
                <Button
                  label="Delete Account"
                  variant="danger"
                  size="sm"
                  onPress={handleDeleteAccount}
                  aria-label="Permanently delete account"
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              Shadows.modal,
            ]}>
            <View style={styles.modalHeaderRow}>
              <CardTitle level={2}>Change Password</CardTitle>
              <IconButton
                icon="X"
                size="sm"
                variant="ghost"
                accessibilityLabel="Close password modal"
                onPress={() => setPasswordModalVisible(false)}
              />
            </View>

            <Input
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="••••••••"
            />
            <Input
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="••••••••"
            />
            <Input
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="••••••••"
            />

            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="outline"
                size="md"
                onPress={() => setPasswordModalVisible(false)}
              />
              <Button
                label="Update Password"
                variant="primary"
                size="md"
                onPress={handleSavePassword}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardInner: {
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  authBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    padding: Spacing.md,
    borderRadius: Radius.large,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
