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

export default function PrivacyScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Privacy Preference States
  const [publicProfileVisible, setPublicProfileVisible] = useState(true);
  const [searchIndexable, setSearchIndexable] = useState(false);
  const [hidePhoneUntilAccepted, setHidePhoneUntilAccepted] = useState(false);
  const [requireBiometricExport, setRequireBiometricExport] = useState(true);
  const [anonymousTelemetry, setAnonymousTelemetry] = useState(true);

  // Destructive Action: Revoke All CRM Tokens
  const handleRevokeCrmTokens = () => {
    Alert.alert(
      'Revoke CRM Access Tokens',
      'Are you sure you want to revoke all active CRM tokens? Active sync with Salesforce, HubSpot, and Microsoft Dynamics will immediately halt.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke All Tokens',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Tokens Revoked',
              'All CRM pipeline connections have been invalidated. Reconnection will require a new handshake.'
            );
          },
        },
      ]
    );
  };

  // Destructive Action: Purge Public Directory Cache
  const handlePurgePublicCache = () => {
    Alert.alert(
      'Purge Public Directory Cache',
      'This will remove your badge snapshot from the expo public web directory. Attendee badge will be temporarily unavailable for web lookups.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purge Web Cache',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Cache Purged',
              'Public directory profile cache successfully invalidated.'
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
          title="Privacy"
          subtitle="Data visibility, profile security, and access controls"
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
        {/* 1. Profile Discovery & Visibility */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Eye" size={18} color={theme.primary} />
                <CardTitle level={2}>Profile Discovery</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <View style={styles.badgeRow}>
                    <AppText variant="body" weight="semibold">
                      Public QR & Web URL
                    </AppText>
                    <Badge
                      label={publicProfileVisible ? 'ACTIVE' : 'OFFLINE'}
                      variant={publicProfileVisible ? 'success' : 'outline'}
                      size="sm"
                    />
                  </View>
                  <AppText variant="caption" color="secondary">
                    Allow attendees to scan your QR badge to view public digital card
                  </AppText>
                </View>
                <Switch
                  value={publicProfileVisible}
                  onValueChange={setPublicProfileVisible}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>

              <Divider />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    Search Engine Indexing
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Include noindex meta headers on public attendee profile URL
                  </AppText>
                </View>
                <Switch
                  value={searchIndexable}
                  onValueChange={setSearchIndexable}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>

              <Divider />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    Obfuscate Personal Phone Number
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Show only company email and website on public QR pass
                  </AppText>
                </View>
                <Switch
                  value={hidePhoneUntilAccepted}
                  onValueChange={setHidePhoneUntilAccepted}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 2. Security & Compliance */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Shield" size={18} color={theme.primary} />
                <CardTitle level={2}>Data Security & Verification</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <View style={styles.badgeRow}>
                    <AppText variant="body" weight="semibold">
                      Biometric Export Verification
                    </AppText>
                    <Badge label="RECOMMENDED" variant="primary" size="sm" />
                  </View>
                  <AppText variant="caption" color="secondary">
                    Require FaceID or biometric fingerprint prior to exporting lead records
                  </AppText>
                </View>
                <Switch
                  value={requireBiometricExport}
                  onValueChange={setRequireBiometricExport}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>

              <Divider />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <AppText variant="body" weight="semibold">
                    Anonymous Diagnostic Telemetry
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Share anonymized camera OCR performance and sync latency metrics
                  </AppText>
                </View>
                <Switch
                  value={anonymousTelemetry}
                  onValueChange={setAnonymousTelemetry}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  style={styles.switchScale}
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Destructive Privacy Actions */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="comfortable" style={{ borderColor: theme.danger }}>
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="AlertTriangle" size={18} color={theme.danger} />
                <CardTitle level={2}>Security & Token Revocation</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.destructiveItem}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="body" weight="semibold" color="danger">
                    Revoke All CRM Tokens
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Immediately sever active pipeline sync sessions with connected CRMs.
                  </AppText>
                </View>
                <Button
                  label="Revoke"
                  variant="danger"
                  size="sm"
                  onPress={handleRevokeCrmTokens}
                  aria-label="Revoke all CRM tokens"
                />
              </View>

              <Divider />

              <View style={styles.destructiveItem}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="body" weight="semibold">
                    Purge Public Web Cache
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Invalidate cached web cards from the trade-show attendee index.
                  </AppText>
                </View>
                <Button
                  label="Purge Cache"
                  variant="outline"
                  size="sm"
                  onPress={handlePurgePublicCache}
                  aria-label="Purge public profile cache"
                />
              </View>
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  switchScale: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  destructiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
});
