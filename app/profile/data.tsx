import React, { useState } from 'react';
import {
  Alert,
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
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/theme';

export default function DataScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const [leadCacheSize, setLeadCacheSize] = useState('4.8 MB');
  const [photoCacheSize, setPhotoCacheSize] = useState('11.2 MB');
  const [audioCacheSize, setAudioCacheSize] = useState('8.4 MB');

  // Export full local backup JSON
  const handleExportBackup = () => {
    Alert.alert(
      'Export Database Backup',
      'Compiled 164 lead records, 42 badge OCR attachments, and sync journals into backup JSON package. Ready to save or AirDrop.'
    );
  };

  // Destructive Action 1: Clear Photo Cache
  const handleClearPhotoCache = () => {
    Alert.alert(
      'Clear Photo & Badge Cache',
      'Are you sure you want to delete 11.2 MB of cached badge scans? High-resolution images will be re-downloaded from cloud storage as needed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Photos',
          style: 'destructive',
          onPress: () => {
            setPhotoCacheSize('0.0 MB');
            Alert.alert('Cache Cleared', '11.2 MB of cached images removed from device.');
          },
        },
      ]
    );
  };

  // Destructive Action 2: Reset Offline Database
  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Offline Database',
      'WARNING: This will purge all local SQLite tables and reset the offline queue. Any leads not yet synced to your CRM or cloud repository will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Database',
          style: 'destructive',
          onPress: () => {
            setLeadCacheSize('0.2 MB');
            setPhotoCacheSize('0.0 MB');
            setAudioCacheSize('0.0 MB');
            Alert.alert(
              'Database Reset',
              'Local storage tables purged and re-initialized to initial clean state.'
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
          title="Data & Storage"
          subtitle="Local storage breakdown, offline cache, and database backups"
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
        {/* 1. Storage Breakdown Overview */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="HardDrive" size={18} color={theme.primary} />
                <CardTitle level={2}>Device Storage Footprint</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.storageItem}>
                <View style={styles.storageLeft}>
                  <Icon name="FileText" size={16} color={theme.primary} />
                  <View style={{ gap: 2 }}>
                    <AppText variant="body" weight="semibold">
                      Lead Records & Notes
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      164 indexed leads with attendee metadata
                    </AppText>
                  </View>
                </View>
                <AppText variant="body" weight="bold" tabular>
                  {leadCacheSize}
                </AppText>
              </View>

              <Divider />

              <View style={styles.storageItem}>
                <View style={styles.storageLeft}>
                  <Icon name="Image" size={16} color={theme.primary} />
                  <View style={{ gap: 2 }}>
                    <AppText variant="body" weight="semibold">
                      Badge Scans & Photos
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      42 business cards and photo attachments
                    </AppText>
                  </View>
                </View>
                <AppText variant="body" weight="bold" tabular>
                  {photoCacheSize}
                </AppText>
              </View>

              <Divider />

              <View style={styles.storageItem}>
                <View style={styles.storageLeft}>
                  <Icon name="Mic" size={16} color={theme.primary} />
                  <View style={{ gap: 2 }}>
                    <AppText variant="body" weight="semibold">
                      Voice Memos & Audio
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      14 recorded audio notes with transcripts
                    </AppText>
                  </View>
                </View>
                <AppText variant="body" weight="bold" tabular>
                  {audioCacheSize}
                </AppText>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 2. Full Local Database Backup */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Download" size={18} color={theme.primary} />
                <CardTitle level={2}>Backup & Portability</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <AppText variant="caption" color="secondary">
                Generate an uncompressed JSON backup containing all captured leads, notes, and qualification ratings stored locally on this phone.
              </AppText>

              <Button
                label="Export Full SQLite JSON Backup"
                variant="primary"
                size="md"
                leftIcon="Download"
                onPress={handleExportBackup}
                aria-label="Export database backup"
              />

              <Button
                label="Go to Multi-Format Lead Export (CSV, XLSX, JSON)"
                variant="outline"
                size="sm"
                leftIcon="Share2"
                onPress={() => router.push('/leads/export')}
                aria-label="Go to lead export screen"
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Destructive Cache & Database Management */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="comfortable" style={{ borderColor: theme.danger }}>
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Trash2" size={18} color={theme.danger} />
                <CardTitle level={2}>Purge & Reset Controls</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.destructiveItem}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="body" weight="semibold">
                    Clear Cached Badge Photos
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    Frees up {photoCacheSize} by removing temporary badge image buffers.
                  </AppText>
                </View>
                <Button
                  label="Clear Images"
                  variant="outline"
                  size="sm"
                  onPress={handleClearPhotoCache}
                  aria-label="Clear image cache"
                />
              </View>

              <Divider />

              <View style={styles.destructiveItem}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                    <AppText variant="body" weight="semibold" color="danger">
                      Reset Offline Database
                    </AppText>
                    <Badge label="HIGH RISK" variant="danger" size="sm" />
                  </View>
                  <AppText variant="caption" color="secondary">
                    Irrevocably deletes local tables and empties the unsynced lead queue.
                  </AppText>
                </View>
                <Button
                  label="Purge DB"
                  variant="danger"
                  size="sm"
                  onPress={handleResetDatabase}
                  aria-label="Reset offline database"
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
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  storageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  destructiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
});
