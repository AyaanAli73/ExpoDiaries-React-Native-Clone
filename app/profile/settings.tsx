import React from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';
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
  Chip,
  Divider,
  Icon,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/stores/use-settings-store';
import { Colors, Spacing } from '@/theme';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const {
    themeMode,
    setThemeMode,
    hapticsEnabled,
    toggleHaptics,
    soundEnabled,
    toggleSound,
    autoFlashEnabled,
    toggleAutoFlash,
    autoCropEnabled,
    toggleAutoCrop,
    defaultTemperature,
    setDefaultTemperature,
    followUpSlaDays,
    setFollowUpSlaDays,
    anonymizeExports,
    toggleAnonymizeExports,
    telemetryEnabled,
    toggleTelemetry,
    cacheSizeBytes,
    clearCache,
  } = useSettingsStore();

  const handleClearCache = () => {
    Alert.alert(
      'Clear Offline Cache',
      'This will remove cached badge images and offline card snapshots. Lead data will remain safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            Alert.alert('Cache Cleared', 'Local storage freed up.');
          },
        },
      ]
    );
  };

  const formattedCacheSize =
    cacheSizeBytes > 0
      ? `${(cacheSizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : '0 KB';

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Settings & Hardware"
          subtitle="Preferences, scanner behavior, and data governance"
          action={
            <Button
              label="Back"
              variant="outline"
              size="sm"
              leftIcon="ChevronLeft"
              onPress={() => router.back()}
            />
          }
        />
      }>
      {/* 1. Appearance / Theme */}
      <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
        <Card density="comfortable">
          <CardHeader>
            <View style={styles.headerRow}>
              <Icon name="Sun" size={18} color={theme.primary} />
              <CardTitle level={2}>Interface Appearance</CardTitle>
            </View>
          </CardHeader>
          <CardContent style={styles.content}>
            <AppText variant="caption" color="secondary">
              Select your color mode preference:
            </AppText>
            <View style={styles.chipsRow}>
              {(['system', 'light', 'dark'] as const).map((mode) => (
                <Chip
                  key={mode}
                  label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                  selected={themeMode === mode}
                  onPress={() => setThemeMode(mode)}
                  size="md"
                />
              ))}
            </View>
          </CardContent>
        </Card>
      </Animated.View>

      {/* 2. Scanner & Hardware Preferences */}
      <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
        <Card density="comfortable">
          <CardHeader>
            <View style={styles.headerRow}>
              <Icon name="Camera" size={18} color={theme.primary} />
              <CardTitle level={2}>Scanner & Capture Feedback</CardTitle>
            </View>
          </CardHeader>
          <CardContent style={styles.content}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <AppText weight="semibold" variant="body">
                  Haptic Feedback
                </AppText>
                <AppText variant="caption" color="secondary">
                  Vibrate device upon successful barcode/card scan
                </AppText>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={toggleHaptics}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </View>

            <Divider />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <AppText weight="semibold" variant="body">
                  Capture Audio Chime
                </AppText>
                <AppText variant="caption" color="secondary">
                  Play acoustic confirmation chime on card capture
                </AppText>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </View>

            <Divider />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <AppText weight="semibold" variant="body">
                  Low-Light Auto Flash
                </AppText>
                <AppText variant="caption" color="secondary">
                  Engage torch automatically when scanning in dim halls
                </AppText>
              </View>
              <Switch
                value={autoFlashEnabled}
                onValueChange={toggleAutoFlash}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </View>

            <Divider />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <AppText weight="semibold" variant="body">
                  OCR Perspective Auto-Crop
                </AppText>
                <AppText variant="caption" color="secondary">
                  Detect business card rectangular corners automatically
                </AppText>
              </View>
              <Switch
                value={autoCropEnabled}
                onValueChange={toggleAutoCrop}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </View>
          </CardContent>
        </Card>
      </Animated.View>

      {/* 3. Lead Qualification Defaults */}
      <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
        <Card density="comfortable">
          <CardHeader>
            <View style={styles.headerRow}>
              <Icon name="Target" size={18} color={theme.primary} />
              <CardTitle level={2}>Lead Qualification Defaults</CardTitle>
            </View>
          </CardHeader>
          <CardContent style={styles.content}>
            <AppText variant="caption" color="secondary">
              Default Lead Temperature on New Capture:
            </AppText>
            <View style={styles.chipsRow}>
              {(['hot', 'warm', 'cold'] as const).map((temp) => (
                <Chip
                  key={temp}
                  label={temp.toUpperCase()}
                  selected={defaultTemperature === temp}
                  onPress={() => setDefaultTemperature(temp)}
                  size="md"
                />
              ))}
            </View>

            <Divider />

            <AppText variant="caption" color="secondary">
              Default Follow-Up SLA Window:
            </AppText>
            <View style={styles.chipsRow}>
              {[
                { label: '24 Hours', val: 1 },
                { label: '48 Hours', val: 2 },
                { label: '1 Week', val: 7 },
              ].map((item) => (
                <Chip
                  key={item.val}
                  label={item.label}
                  selected={followUpSlaDays === item.val}
                  onPress={() => setFollowUpSlaDays(item.val)}
                  size="md"
                />
              ))}
            </View>
          </CardContent>
        </Card>
      </Animated.View>

      {/* 4. Storage & Offline Caching */}
      <Animated.View entering={FadeInDown.duration(260).delay(180)} style={styles.section}>
        <Card density="comfortable">
          <CardHeader>
            <View style={styles.headerRow}>
              <Icon name="Database" size={18} color={theme.primary} />
              <CardTitle level={2}>Storage & Offline Caching</CardTitle>
            </View>
          </CardHeader>
          <CardContent style={styles.content}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <AppText weight="semibold" variant="body">
                  Local Cached Media
                </AppText>
                <AppText variant="caption" color="secondary">
                  Cached card photos and voice memos on device
                </AppText>
              </View>
              <Badge label={formattedCacheSize} variant="outline" size="md" />
            </View>

            <Button
              label="Clear Image Cache"
              variant="outline"
              size="sm"
              leftIcon="Trash2"
              onPress={handleClearCache}
              style={{ alignSelf: 'flex-start', marginTop: 4 }}
            />
          </CardContent>
        </Card>
      </Animated.View>

      {/* 5. Data Privacy & Export Governance */}
      <Animated.View entering={FadeInDown.duration(260).delay(240)} style={styles.section}>
        <Card density="comfortable">
          <CardHeader>
            <View style={styles.headerRow}>
              <Icon name="Shield" size={18} color={theme.primary} />
              <CardTitle level={2}>Privacy & Governance</CardTitle>
            </View>
          </CardHeader>
          <CardContent style={styles.content}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <AppText weight="semibold" variant="body">
                  Anonymize Export Contact Info
                </AppText>
                <AppText variant="caption" color="secondary">
                  Mask phone numbers and emails when sharing reports
                </AppText>
              </View>
              <Switch
                value={anonymizeExports}
                onValueChange={toggleAnonymizeExports}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </View>

            <Divider />

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <AppText weight="semibold" variant="body">
                  Anonymous Performance Telemetry
                </AppText>
                <AppText variant="caption" color="secondary">
                  Share anonymized capture velocity for booth benchmarks
                </AppText>
              </View>
              <Switch
                value={telemetryEnabled}
                onValueChange={toggleTelemetry}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
              />
            </View>
          </CardContent>
        </Card>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  content: {
    gap: Spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleTextCol: {
    flex: 1,
    gap: 2,
  },
});
