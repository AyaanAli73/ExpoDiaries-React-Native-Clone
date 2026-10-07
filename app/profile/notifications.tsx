import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
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
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/theme';

export default function NotificationsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Notification Preference Toggles
  const [instantCaptureAlerts, setInstantCaptureAlerts] = useState(true);
  const [hotLeadPriorityAlerts, setHotLeadPriorityAlerts] = useState(true);
  const [teamAssignmentAlerts, setTeamAssignmentAlerts] = useState(true);
  const [crmSyncDigests, setCrmSyncDigests] = useState(true);
  const [dailyExpoSummary, setDailyExpoSummary] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [vibrationAlerts, setVibrationAlerts] = useState(true);
  const [quietHours, setQuietHours] = useState(false);

  // Destructive Action: Reset Notifications
  const handleResetNotifications = () => {
    Alert.alert(
      'Reset Notification Preferences',
      'Are you sure you want to restore default factory notification settings? All custom alert schedules will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Defaults',
          style: 'destructive',
          onPress: () => {
            setInstantCaptureAlerts(true);
            setHotLeadPriorityAlerts(true);
            setTeamAssignmentAlerts(true);
            setCrmSyncDigests(true);
            setDailyExpoSummary(false);
            setSoundAlerts(true);
            setVibrationAlerts(true);
            setQuietHours(false);
            Alert.alert('Settings Restored', 'Notification preferences restored to default.');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Notifications"
          subtitle="Configure lead alerts, assignment pings, and delivery rules"
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
        {/* 1. Lead & Team Activity Alerts */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Bell" size={18} color={theme.primary} />
                <CardTitle level={2}>Lead & Team Alerts</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    Instant Badge Scan Alerts
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Trigger push ping immediately after badge or business card OCR scan
                  </AppText>
                </View>
                <Switch
                  value={instantCaptureAlerts}
                  onValueChange={setInstantCaptureAlerts}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>

              <Divider />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <View style={styles.badgeLabelRow}>
                    <AppText variant="body" weight="semibold">
                      🔥 Hot Lead Priority Alerts
                    </AppText>
                    <Badge label="HIGH PRIORITY" variant="primary" size="sm" />
                  </View>
                  <AppText variant="caption" color="secondary">
                    High-priority alert when a prospect is qualified as Hot temperature
                  </AppText>
                </View>
                <Switch
                  value={hotLeadPriorityAlerts}
                  onValueChange={setHotLeadPriorityAlerts}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>

              <Divider />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    Team Delegations & Assignments
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Notify when a colleague assigns or re-routes an event lead to you
                  </AppText>
                </View>
                <Switch
                  value={teamAssignmentAlerts}
                  onValueChange={setTeamAssignmentAlerts}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 2. System & CRM Sync Updates */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="RefreshCw" size={18} color={theme.primary} />
                <CardTitle level={2}>System & CRM Delivery</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    CRM Batch Sync Reports
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Receive summary notice after Salesforce/HubSpot batches finish syncing
                  </AppText>
                </View>
                <Switch
                  value={crmSyncDigests}
                  onValueChange={setCrmSyncDigests}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>

              <Divider />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    Daily Expo Recap Digest
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Evening report at 7:00 PM with total booth visitor metrics
                  </AppText>
                </View>
                <Switch
                  value={dailyExpoSummary}
                  onValueChange={setDailyExpoSummary}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Audio & Hardware Signals */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Volume2" size={18} color={theme.primary} />
                <CardTitle level={2}>Sound & Haptic Feedback</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    Audible Scan Feedback
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Play chime on successful camera badge recognition
                  </AppText>
                </View>
                <Switch
                  value={soundAlerts}
                  onValueChange={setSoundAlerts}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>

              <Divider />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    Vibration Haptics
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Tactile confirmation when card is qualified and saved
                  </AppText>
                </View>
                <Switch
                  value={vibrationAlerts}
                  onValueChange={setVibrationAlerts}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>

              <Divider />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    Quiet Hours (10:00 PM – 7:00 AM)
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Silence non-urgent notifications outside active expo floor hours
                  </AppText>
                </View>
                <Switch
                  value={quietHours}
                  onValueChange={setQuietHours}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 4. Destructive Action: Reset Factory Notifications */}
        <Animated.View entering={FadeInDown.duration(260).delay(180)} style={styles.section}>
          <Card density="comfortable" style={{ borderColor: theme.border }}>
            <CardContent style={styles.resetContainer}>
              <View style={{ gap: 2 }}>
                <AppText variant="body" weight="semibold">
                  Restore Defaults
                </AppText>
                <AppText variant="caption" color="secondary">
                  Revert all alert schedules and sounds back to original settings.
                </AppText>
              </View>
              <Button
                label="Reset Notification Defaults"
                variant="outline"
                size="md"
                onPress={handleResetNotifications}
                aria-label="Reset notifications to default"
              />
            </CardContent>
          </Card>
        </Animated.View>
      </ScrollView>
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleInfo: {
    flex: 1,
    gap: 2,
  },
  badgeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  switchScale: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  resetContainer: {
    gap: Spacing.sm,
  },
});
