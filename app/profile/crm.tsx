import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
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
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCrmStore } from '@/stores/use-crm-store';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { CrmIntegration, CrmProvider } from '@/types/crm';

export default function CrmIntegrationsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const {
    integrations,
    loadIntegrations,
    toggleAutoSync,
    syncNow,
    isSyncing,
    syncingProvider,
    syncProgress,
    testConnection,
    connectProvider,
    disconnectProvider,
    updateWebhook,
    activeLogs,
  } = useCrmStore();

  const [expandedMappings, setExpandedMappings] = useState<string | null>(null);
  const [webhookModalVisible, setWebhookModalVisible] = useState(false);
  const [webhookInput, setWebhookInput] = useState('');
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const handleToggleAutoSync = async (integration: CrmIntegration) => {
    try {
      await toggleAutoSync(integration.provider, !integration.autoSync);
    } catch {
      Alert.alert('Error', 'Failed to toggle auto-sync.');
    }
  };

  const handleSyncNow = async (provider: CrmProvider) => {
    try {
      await syncNow(provider);
      Alert.alert('Sync Complete', 'Lead batch synchronized with CRM pipeline successfully.');
    } catch {
      Alert.alert('Sync Error', 'Failed to synchronize leads with CRM.');
    }
  };

  const handleTestConnection = async (provider: CrmProvider) => {
    setTestingProvider(provider);
    try {
      const res = await testConnection(provider);
      Alert.alert(res.success ? 'Connection Verified' : 'Connection Failed', res.message);
    } finally {
      setTestingProvider(null);
    }
  };

  const handleToggleConnection = async (integration: CrmIntegration) => {
    if (integration.status === 'connected') {
      Alert.alert(
        'Disconnect CRM',
        `Are you sure you want to disconnect ${integration.name}? Auto-sync will be disabled.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => disconnectProvider(integration.provider),
          },
        ]
      );
    } else {
      await connectProvider(integration.provider);
      Alert.alert(
        'Mock Connection Active',
        `Connected to ${integration.name} in sandbox mode. No real API credentials required.`
      );
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookInput.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid webhook URL.');
      return;
    }
    await updateWebhook(webhookInput.trim());
    setWebhookModalVisible(false);
    Alert.alert('Webhook Updated', 'Lead payloads will be dispatched to your webhook URL.');
  };

  const totalSynced = integrations.reduce((sum, i) => sum + i.totalSyncedCount, 0);
  const activeCount = integrations.filter((i) => i.status === 'connected').length;

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="CRM Connections"
          subtitle="Enterprise pipeline sync and lead ingestion pipelines"
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
      {/* Mock Sandbox Notice Card */}
      <Animated.View entering={FadeInDown.duration(240)} style={styles.section}>
        <Card
          density="compact"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surfaceSubtle,
          }}>
          <CardContent style={styles.noticeContent}>
            <Icon name="ShieldCheck" size={18} color={theme.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="caption" weight="semibold">
                Mock Connection Sandbox Active
              </AppText>
              <AppText variant="caption" color="secondary">
                Connect and disconnect enterprise pipelines with one tap. No real API credentials or OAuth secrets required.
              </AppText>
            </View>
            <Badge label="MOCK ONLY" variant="outline" size="sm" />
          </CardContent>
        </Card>
      </Animated.View>

      {/* Telemetry Summary Card */}
      <Animated.View entering={FadeInDown.duration(280)} style={styles.section}>
        <Card density="comfortable">
          <CardContent style={styles.statsRow}>
            <View style={styles.statCol}>
              <AppText variant="caption" color="secondary">
                Total Leads Synced
              </AppText>
              <AppText variant="title" weight="bold" tabular>
                {new Intl.NumberFormat().format(totalSynced)}
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <AppText variant="caption" color="secondary">
                Active Providers
              </AppText>
              <AppText variant="title" weight="bold" color="primary">
                {activeCount} / {integrations.length}
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <AppText variant="caption" color="secondary">
                Pipeline Health
              </AppText>
              <Badge label="OPTIMAL" variant="success" size="sm" showDot />
            </View>
          </CardContent>
        </Card>
      </Animated.View>

      {/* Sync in Progress Indicator */}
      {isSyncing && (
        <Animated.View entering={FadeInDown.duration(240)} style={styles.section}>
          <Card
            density="compact"
            style={{
              borderColor: theme.primary,
              backgroundColor: theme.primarySubtle,
            }}>
            <CardContent style={styles.syncProgressContainer}>
              <View style={styles.syncHeaderRow}>
                <AppText weight="bold" variant="body" color="primary">
                  Syncing with {syncingProvider?.toUpperCase()}… ({syncProgress}%)
                </AppText>
                <Badge label="IN PROGRESS" variant="primary" size="sm" showDot />
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: theme.surface }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${syncProgress}%`,
                      backgroundColor: theme.primary,
                    },
                  ]}
                />
              </View>
              {activeLogs.length > 0 && (
                <AppText
                  variant="caption"
                  color="secondary"
                  numberOfLines={2}
                  style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {activeLogs[activeLogs.length - 1]}
                </AppText>
              )}
            </CardContent>
          </Card>
        </Animated.View>
      )}

      {/* Integrations List */}
      <View style={styles.list}>
        {integrations.map((integration, index) => {
          const isConnected = integration.status === 'connected';
          const isExpanded = expandedMappings === integration.id;
          const formattedSyncTime = integration.lastSyncedAt
            ? new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(integration.lastSyncedAt))
            : 'Never synced';

          return (
            <Animated.View
              key={integration.id}
              entering={FadeInDown.duration(260).delay(index * 60)}>
              <Card
                density="comfortable"
                style={[
                  styles.providerCard,
                  isConnected && { borderColor: theme.border },
                ]}>
                <CardHeader>
                  <View style={styles.providerHeader}>
                    <View style={styles.providerLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: isConnected
                              ? theme.primarySubtle
                              : theme.surfaceSubtle,
                          },
                        ]}>
                        <Icon
                          name={(integration.icon as any) || 'Share2'}
                          size={22}
                          color={isConnected ? theme.primary : theme.textMuted}
                        />
                      </View>
                      <View style={{ gap: 2, flex: 1 }}>
                        <CardTitle level={3}>{integration.name}</CardTitle>
                        <AppText variant="caption" color="secondary" numberOfLines={2}>
                          {integration.description}
                        </AppText>
                      </View>
                    </View>
                    <Badge
                      label={isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                      variant={isConnected ? 'success' : 'outline'}
                      size="sm"
                      showDot={isConnected}
                    />
                  </View>
                </CardHeader>

                <CardContent style={styles.providerContent}>
                  {/* Status & Telemetry Row */}
                  <View style={styles.telemetryRow}>
                    <View style={styles.telemetryItem}>
                      <AppText variant="caption" color="muted">
                        Last Synced
                      </AppText>
                      <AppText variant="caption" weight="semibold">
                        {formattedSyncTime}
                      </AppText>
                    </View>
                    <View style={styles.telemetryItem}>
                      <AppText variant="caption" color="muted">
                        Synced Records
                      </AppText>
                      <AppText variant="caption" weight="semibold" tabular>
                        {integration.totalSyncedCount} leads
                      </AppText>
                    </View>
                    <View style={styles.telemetryItem}>
                      <AppText variant="caption" color="muted">
                        Auto-Sync
                      </AppText>
                      <Switch
                        value={integration.autoSync}
                        disabled={!isConnected}
                        onValueChange={() => handleToggleAutoSync(integration)}
                        trackColor={{ false: theme.border, true: theme.primary }}
                        thumbColor={theme.surface}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                      />
                    </View>
                  </View>

                  {/* Webhook / Custom API Endpoint Info */}
                  {(integration.provider === 'custom_api' || integration.provider === 'webhook') && isConnected && (
                    <View
                      style={[
                        styles.webhookBox,
                        { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                      ]}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <AppText variant="caption" color="secondary" weight="semibold">
                          Target Endpoint:
                        </AppText>
                        <AppText
                          variant="caption"
                          color="muted"
                          numberOfLines={1}
                          style={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {integration.webhookEndpoint || 'No URL configured'}
                        </AppText>
                      </View>
                      <IconButton
                        icon="Settings"
                        size="sm"
                        variant="outline"
                        accessibilityLabel="Configure Webhook URL"
                        onPress={() => {
                          setWebhookInput(integration.webhookEndpoint || '');
                          setWebhookModalVisible(true);
                        }}
                      />
                    </View>
                  )}

                  <Divider />

                  {/* Action Buttons Row */}
                  <View style={styles.actionsRow}>
                    <Button
                      label={isConnected ? 'Disconnect' : 'Connect'}
                      variant={isConnected ? 'outline' : 'primary'}
                      size="sm"
                      onPress={() => handleToggleConnection(integration)}
                    />
                    {isConnected && (
                      <>
                        <Button
                          label={
                            testingProvider === integration.provider
                              ? 'Testing…'
                              : 'Test Link'
                          }
                          variant="ghost"
                          size="sm"
                          leftIcon="CheckCircle"
                          loading={testingProvider === integration.provider}
                          onPress={() => handleTestConnection(integration.provider)}
                        />
                        <Button
                          label="Sync Now"
                          variant="primary"
                          size="sm"
                          leftIcon="RefreshCw"
                          loading={isSyncing && syncingProvider === integration.provider}
                          disabled={isSyncing}
                          onPress={() => handleSyncNow(integration.provider)}
                        />
                      </>
                    )}
                  </View>

                  {/* Field Mappings Toggle */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Toggle field mappings view"
                    onPress={() =>
                      setExpandedMappings(isExpanded ? null : integration.id)
                    }
                    style={styles.mappingToggle}>
                    <AppText variant="caption" color="secondary" weight="semibold">
                      {isExpanded ? 'Hide Field Mappings' : 'View Field Mappings (10 Fields)'}
                    </AppText>
                    <Icon
                      name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                      size={16}
                      color={theme.textMuted}
                    />
                  </Pressable>

                  {/* Expanded Field Mappings Sheet */}
                  {isExpanded && (
                    <View
                      style={[
                        styles.mappingTable,
                        { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                      ]}>
                      <View style={styles.mappingHeader}>
                        <AppText variant="caption" weight="bold">
                          APP FIELD
                        </AppText>
                        <AppText variant="caption" weight="bold">
                          CRM TARGET
                        </AppText>
                      </View>
                      <Divider />
                      {integration.fieldMappings.map((map) => (
                        <View key={map.appField} style={styles.mappingRow}>
                          <AppText variant="caption">
                            {map.appField}
                          </AppText>
                          <Badge
                            label={map.crmField}
                            variant="outline"
                            size="sm"
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </CardContent>
              </Card>
            </Animated.View>
          );
        })}
      </View>

      {/* Webhook Configuration Modal */}
      <Modal
        visible={webhookModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWebhookModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              Shadows.modal,
            ]}>
            <View style={styles.modalHeader}>
              <CardTitle level={2}>Webhook Destination</CardTitle>
              <IconButton
                icon="X"
                size="sm"
                variant="ghost"
                accessibilityLabel="Close webhook dialog"
                onPress={() => setWebhookModalVisible(false)}
              />
            </View>
            <AppText variant="caption" color="secondary">
              Enter your HTTPS endpoint where trade-show lead JSON payloads will be dispatched:
            </AppText>
            <TextInput
              value={webhookInput}
              onChangeText={setWebhookInput}
              placeholder="https://api.yourdomain.com/v1/leads"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={[
                styles.urlInput,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />
            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="outline"
                size="md"
                onPress={() => setWebhookModalVisible(false)}
              />
              <Button
                label="Save Endpoint"
                variant="primary"
                size="md"
                onPress={handleSaveWebhook}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.sm,
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  syncProgressContainer: {
    gap: Spacing.xs,
  },
  syncHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  list: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  providerCard: {
    borderWidth: 1,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  providerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerContent: {
    gap: Spacing.sm,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  telemetryItem: {
    gap: 2,
    alignItems: 'flex-start',
  },
  webhookBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xs + 2,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mappingToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  mappingTable: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  mappingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mappingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    padding: Spacing.md,
    borderRadius: Radius.large,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urlInput: {
    height: 46,
    borderRadius: Radius.medium,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
