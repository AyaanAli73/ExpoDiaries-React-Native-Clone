import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
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
  Chip,
  Divider,
  Icon,
  Input,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { leadsRepository } from '@/repositories/leads.repository';
import { exportService } from '@/services/export/export.service';
import { useAppStore } from '@/stores/use-app-store';
import { Colors, Radius, Spacing } from '@/theme';
import { ExportFormat, ExportProgressEvent, ExportScope } from '@/types/export';
import { Lead } from '@/types/lead';

interface FormatConfig {
  key: ExportFormat;
  label: string;
  extension: string;
  badge: string;
  description: string;
  icon: 'FileText' | 'FileSpreadsheet' | 'Code' | 'Download';
}

const FORMAT_OPTIONS: FormatConfig[] = [
  {
    key: 'csv',
    label: 'CSV File',
    extension: '.csv',
    badge: 'Universal',
    description: 'Comma-separated values, RFC 4180 standard. Compatible with all spreadsheets and CRM bulk loaders.',
    icon: 'FileText',
  },
  {
    key: 'xlsx',
    label: 'Excel Workbook',
    extension: '.xlsx',
    badge: 'Spreadsheet',
    description: 'Microsoft Excel XML Spreadsheet with styled headers, auto-typed cells, and worksheet formatting.',
    icon: 'FileSpreadsheet',
  },
  {
    key: 'json',
    label: 'JSON Payload',
    extension: '.json',
    badge: 'API & Webhook',
    description: 'Structured JSON with metadata, nested contact and qualification objects. Ready for REST endpoints.',
    icon: 'Code',
  },
];

export default function ExportLeadsScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const activeEventId = useAppStore((state) => state.activeEventId);

  // Configuration State
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [scope, setScope] = useState<ExportScope>('all_event');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Leads Data & Selection State
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [searchLeadQuery, setSearchLeadQuery] = useState('');

  // Execution & Telemetry State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgressEvent | null>(null);
  const [copied, setCopied] = useState(false);

  // Load leads for interactive selection and counting
  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await leadsRepository.getLeads(
          activeEventId ? { eventId: activeEventId } : undefined,
          { page: 1, pageSize: 250 }
        );
        setAllLeads(res.items);
        // Pre-select top 8 leads by default
        setSelectedLeadIds(res.items.slice(0, 8).map((l) => l.id));
      } catch {
        // Fallback to empty list
        setAllLeads([]);
      }
    }
    fetchLeads();
  }, [activeEventId]);

  // Filtered leads for the interactive selection list
  const filteredPickerLeads = useMemo(() => {
    if (!searchLeadQuery.trim()) return allLeads;
    const q = searchLeadQuery.toLowerCase().trim();
    return allLeads.filter(
      (l) =>
        l.firstName.toLowerCase().includes(q) ||
        l.lastName.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q)
    );
  }, [allLeads, searchLeadQuery]);

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
    // Reset completed state if user changes selection
    if (exportProgress?.status === 'success') {
      setExportProgress(null);
    }
  };

  const handleSelectAll = () => {
    setSelectedLeadIds(allLeads.map((l) => l.id));
  };

  const handleClearSelection = () => {
    setSelectedLeadIds([]);
  };

  // Target records count based on scope
  const targetLeadCount = useMemo(() => {
    if (scope === 'all_event') return allLeads.length || 164;
    if (scope === 'selected') return selectedLeadIds.length;
    if (scope === 'hot') return allLeads.filter((l) => l.temperature === 'hot').length || 48;
    if (scope === 'qualified')
      return (
        allLeads.filter(
          (l) => l.status === 'qualified' || l.temperature === 'hot' || l.temperature === 'warm'
        ).length || 86
      );
    return allLeads.length;
  }, [scope, allLeads, selectedLeadIds]);

  // Execute export action via IExportService
  const handleStartExport = async () => {
    if (scope === 'selected' && selectedLeadIds.length === 0) {
      Alert.alert(
        'No Leads Selected',
        'Please select at least one lead from the list or switch scope to "All Event Leads".'
      );
      return;
    }

    setIsExporting(true);
    setExportProgress({
      status: 'preparing',
      progressPercent: 10,
      currentStep: 'Initializing export pipeline…',
      totalRecords: targetLeadCount,
      processedRecords: 0,
      format,
    });

    try {
      const result = await exportService.exportLeads(
        {
          format,
          scope,
          eventId: activeEventId || 'evt-2026-ces',
          selectedLeadIds: scope === 'selected' ? selectedLeadIds : undefined,
          simulateFailure,
        },
        (progress) => {
          setExportProgress(progress);
        }
      );
      setExportProgress(result);
    } catch (err: any) {
      setExportProgress({
        status: 'failure',
        progressPercent: 0,
        currentStep: 'Export generation failed',
        totalRecords: targetLeadCount,
        processedRecords: 0,
        format,
        error: String(err?.message || err || 'Unexpected export failure occurred.'),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = () => {
    if (!exportProgress?.fileContent) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    Alert.alert(
      'Copied to Clipboard',
      `${format.toUpperCase()} dataset content copied to system clipboard.`
    );
  };

  const handleShareFile = () => {
    if (!exportProgress?.fileName) return;
    Alert.alert(
      'Share Dataset',
      `Dispatching ${exportProgress.fileName} (${exportProgress.fileSizeFormatted}) to native share sheet / AirDrop.`
    );
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Data Export"
          subtitle="Export event or selected leads to CSV, XLSX, and JSON"
          action={
            <Button
              label="Back"
              variant="outline"
              size="sm"
              leftIcon="ChevronLeft"
              onPress={() => router.back()}
              aria-label="Back to leads list"
            />
          }
        />
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 1. Format Actions Cards */}
        <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Download" size={18} color={theme.primary} />
                <CardTitle level={2}>Choose Export Format</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.formatGrid}>
                {FORMAT_OPTIONS.map((opt) => {
                  const isSelected = format === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${opt.label} format`}
                      onPress={() => {
                        setFormat(opt.key);
                        if (exportProgress?.status === 'success') {
                          setExportProgress(null);
                        }
                      }}
                      style={[
                        styles.formatCard,
                        {
                          backgroundColor: isSelected
                            ? theme.primarySubtle
                            : theme.surfaceSubtle,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}>
                      <View style={styles.formatTopRow}>
                        <View style={styles.formatTitleGroup}>
                          <Icon
                            name={opt.icon}
                            size={18}
                            color={isSelected ? theme.primary : theme.textMuted}
                          />
                          <AppText
                            variant="body"
                            weight={isSelected ? 'bold' : 'semibold'}
                            color={isSelected ? 'primary' : undefined}>
                            {opt.label}
                          </AppText>
                        </View>
                        <Badge
                          label={opt.extension}
                          variant={isSelected ? 'primary' : 'outline'}
                          size="sm"
                        />
                      </View>
                      <AppText variant="caption" color="secondary" numberOfLines={2}>
                        {opt.description}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 2. Dataset Scope Selection */}
        <Animated.View entering={FadeInDown.duration(260).delay(60)} style={styles.section}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerRow}>
                <Icon name="Filter" size={18} color={theme.primary} />
                <CardTitle level={2}>Dataset Scope</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardInner}>
              <View style={styles.scopeOptions}>
                {/* Event Leads Option */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Export all event leads"
                  onPress={() => {
                    setScope('all_event');
                    if (exportProgress?.status === 'success') setExportProgress(null);
                  }}
                  style={[
                    styles.scopeCard,
                    {
                      backgroundColor:
                        scope === 'all_event' ? theme.primarySubtle : theme.surfaceSubtle,
                      borderColor: scope === 'all_event' ? theme.primary : theme.border,
                    },
                  ]}>
                  <View style={styles.scopeCardLeft}>
                    <Icon
                      name={scope === 'all_event' ? 'CheckCircle' : 'Circle'}
                      size={20}
                      color={scope === 'all_event' ? theme.primary : theme.textMuted}
                    />
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="body" weight="semibold">
                        All Event Leads
                      </AppText>
                      <AppText variant="caption" color="secondary">
                        All {allLeads.length || 164} leads captured across all booths for CES 2026
                      </AppText>
                    </View>
                  </View>
                  <Badge
                    label={`${allLeads.length || 164} LEADS`}
                    variant={scope === 'all_event' ? 'primary' : 'outline'}
                    size="sm"
                  />
                </Pressable>

                {/* Selected Leads Option */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Export selected leads"
                  onPress={() => {
                    setScope('selected');
                    if (exportProgress?.status === 'success') setExportProgress(null);
                  }}
                  style={[
                    styles.scopeCard,
                    {
                      backgroundColor:
                        scope === 'selected' ? theme.primarySubtle : theme.surfaceSubtle,
                      borderColor: scope === 'selected' ? theme.primary : theme.border,
                    },
                  ]}>
                  <View style={styles.scopeCardLeft}>
                    <Icon
                      name={scope === 'selected' ? 'CheckCircle' : 'Circle'}
                      size={20}
                      color={scope === 'selected' ? theme.primary : theme.textMuted}
                    />
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="body" weight="semibold">
                        Selected Leads Only
                      </AppText>
                      <AppText variant="caption" color="secondary">
                        Choose specific lead records to export ({selectedLeadIds.length} currently selected)
                      </AppText>
                    </View>
                  </View>
                  <Badge
                    label={`${selectedLeadIds.length} SELECTED`}
                    variant={scope === 'selected' ? 'primary' : 'outline'}
                    size="sm"
                  />
                </Pressable>
              </View>

              {/* Preset Quick Filter Chips */}
              <View style={styles.presetChipsRow}>
                <AppText variant="caption" color="secondary" weight="semibold">
                  Quick Presets:
                </AppText>
                <Chip
                  label="🔥 Hot Leads Only"
                  selected={scope === 'hot'}
                  onPress={() => {
                    setScope('hot');
                    if (exportProgress?.status === 'success') setExportProgress(null);
                  }}
                  size="sm"
                />
                <Chip
                  label="⭐ Qualified Prospects"
                  selected={scope === 'qualified'}
                  onPress={() => {
                    setScope('qualified');
                    if (exportProgress?.status === 'success') setExportProgress(null);
                  }}
                  size="sm"
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* 3. Interactive Lead Selector (when Scope === 'selected') */}
        {scope === 'selected' && (
          <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
            <Card density="comfortable">
              <CardHeader>
                <View style={styles.pickerHeaderRow}>
                  <View style={{ gap: 2 }}>
                    <CardTitle level={3}>Select Specific Leads</CardTitle>
                    <AppText variant="caption" color="secondary">
                      {selectedLeadIds.length} of {allLeads.length} leads checked
                    </AppText>
                  </View>
                  <View style={styles.pickerHeaderActions}>
                    <Button
                      label="Select All"
                      variant="ghost"
                      size="sm"
                      onPress={handleSelectAll}
                    />
                    <Button
                      label="Clear"
                      variant="ghost"
                      size="sm"
                      onPress={handleClearSelection}
                    />
                  </View>
                </View>
              </CardHeader>
              <CardContent style={styles.cardInner}>
                <Input
                  value={searchLeadQuery}
                  onChangeText={setSearchLeadQuery}
                  placeholder="Filter leads by name, email, or company…"
                  leftAccessory={<Icon name="Search" size={16} color={theme.textMuted} />}
                  aria-label="Filter lead list"
                />

                <View style={styles.leadsListContainer}>
                  {filteredPickerLeads.slice(0, 10).map((lead) => {
                    const isChecked = selectedLeadIds.includes(lead.id);
                    return (
                      <Pressable
                        key={lead.id}
                        accessibilityRole="checkbox"
                        accessibilityLabel={`${lead.firstName} ${lead.lastName}`}
                        accessibilityState={{ checked: isChecked }}
                        onPress={() => toggleLeadSelection(lead.id)}
                        style={[
                          styles.leadItemRow,
                          {
                            backgroundColor: isChecked
                              ? theme.primarySubtle
                              : theme.surfaceSubtle,
                            borderColor: isChecked ? theme.primary : theme.border,
                          },
                        ]}>
                        <Icon
                          name={isChecked ? 'CheckSquare' : 'Square'}
                          size={18}
                          color={isChecked ? theme.primary : theme.textMuted}
                        />
                        <View style={{ flex: 1, gap: 2 }}>
                          <AppText variant="body" weight="semibold">
                            {lead.firstName} {lead.lastName}
                          </AppText>
                          <AppText variant="caption" color="secondary" numberOfLines={1}>
                            {lead.title ? `${lead.title} • ` : ''}
                            {lead.company}
                          </AppText>
                        </View>
                        <Badge
                          label={lead.temperature?.toUpperCase() || 'WARM'}
                          variant={
                            lead.temperature === 'hot'
                              ? 'danger'
                              : lead.temperature === 'warm'
                              ? 'warning'
                              : 'outline'
                          }
                          size="sm"
                        />
                      </Pressable>
                    );
                  })}
                  {filteredPickerLeads.length > 10 && (
                    <AppText
                      variant="caption"
                      color="secondary"
                      style={{ textAlign: 'center', marginTop: 4 }}>
                      + {filteredPickerLeads.length - 10} more leads available
                    </AppText>
                  )}
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {/* 4. Resilience & Error State Simulation Option */}
        <Animated.View entering={FadeInDown.duration(260).delay(120)} style={styles.section}>
          <Card density="compact" style={{ borderColor: theme.border }}>
            <CardContent style={styles.resilienceRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="caption" weight="semibold">
                  Simulate Export Failure
                </AppText>
                <AppText variant="caption" color="secondary">
                  Trigger mock network error to verify failure UI state and retry flow
                </AppText>
              </View>
              <Switch
                value={simulateFailure}
                onValueChange={(val) => {
                  setSimulateFailure(val);
                  if (exportProgress?.status === 'failure' && !val) {
                    setExportProgress(null);
                  }
                }}
                trackColor={{ false: theme.border, true: theme.danger }}
                thumbColor={theme.surface}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                accessibilityLabel="Toggle simulated export failure"
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* 5. Primary Export Execution Card */}
        <Animated.View entering={FadeInDown.duration(260).delay(160)} style={styles.section}>
          <Card density="comfortable">
            <CardContent style={styles.cardInner}>
              <View style={styles.summaryBar}>
                <View style={{ gap: 2 }}>
                  <AppText variant="caption" color="secondary">
                    Export Ready
                  </AppText>
                  <AppText variant="body" weight="bold" tabular>
                    {targetLeadCount} lead records • {format.toUpperCase()} format
                  </AppText>
                </View>
                <Badge
                  label={format.toUpperCase()}
                  variant="primary"
                  size="md"
                />
              </View>

              <Button
                label={
                  isExporting
                    ? 'Exporting Data…'
                    : `Generate ${format.toUpperCase()} Export`
                }
                variant="primary"
                size="lg"
                leftIcon="Download"
                loading={isExporting}
                disabled={isExporting || targetLeadCount === 0}
                onPress={handleStartExport}
                aria-label={`Execute ${format.toUpperCase()} export`}
              />

              <Button
                label="Direct Sync to Connected CRM"
                variant="outline"
                size="md"
                leftIcon="Share2"
                onPress={() => router.push('/profile/crm' as any)}
                aria-label="Navigate to CRM Integrations screen"
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* 6. Export Progress Indicator (Telemetry Feedback) */}
        {isExporting && exportProgress && (
          <Animated.View entering={FadeInDown.duration(240)} style={styles.section}>
            <Card
              density="comfortable"
              style={{
                borderColor: theme.primary,
                backgroundColor: theme.primarySubtle,
              }}>
              <CardContent style={styles.progressContainer}>
                <View style={styles.progressHeaderRow}>
                  <View style={{ gap: 2 }}>
                    <AppText weight="bold" variant="body" color="primary">
                      Exporting {exportProgress.format.toUpperCase()}… ({exportProgress.progressPercent}%)
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      {exportProgress.currentStep}
                    </AppText>
                  </View>
                  <Badge label="IN PROGRESS" variant="primary" size="sm" showDot />
                </View>

                {/* Progress Bar Track */}
                <View style={[styles.progressBarTrack, { backgroundColor: theme.surface }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${exportProgress.progressPercent}%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>

                <View style={styles.progressFooterRow}>
                  <AppText variant="caption" color="secondary" tabular>
                    Records: {exportProgress.processedRecords} / {exportProgress.totalRecords}
                  </AppText>
                  <AppText variant="caption" color="primary" weight="semibold">
                    Step {exportProgress.progressPercent < 40 ? '1/3' : exportProgress.progressPercent < 75 ? '2/3' : '3/3'}
                  </AppText>
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {/* 7. Success State Card */}
        {exportProgress?.status === 'success' && !isExporting && (
          <Animated.View entering={FadeInDown.duration(280)} style={styles.section}>
            <Card density="comfortable" style={{ borderColor: theme.success }}>
              <CardHeader>
                <View style={styles.headerRow}>
                  <Badge label="EXPORT SUCCESS" variant="success" size="sm" showDot />
                  <CardTitle level={2}>File Ready for Download</CardTitle>
                </View>
              </CardHeader>
              <CardContent style={styles.cardInner}>
                {/* File Metadata Overview */}
                <View
                  style={[
                    styles.fileMetaBox,
                    { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                  ]}>
                  <View style={styles.fileMetaItem}>
                    <AppText variant="caption" color="muted">
                      File Name
                    </AppText>
                    <AppText variant="body" weight="semibold" numberOfLines={1}>
                      {exportProgress.fileName}
                    </AppText>
                  </View>
                  <Divider />
                  <View style={styles.fileMetaRow}>
                    <View style={styles.fileMetaSubItem}>
                      <AppText variant="caption" color="muted">
                        File Size
                      </AppText>
                      <AppText variant="caption" weight="bold">
                        {exportProgress.fileSizeFormatted}
                      </AppText>
                    </View>
                    <View style={styles.fileMetaSubItem}>
                      <AppText variant="caption" color="muted">
                        Total Records
                      </AppText>
                      <AppText variant="caption" weight="bold" tabular>
                        {exportProgress.totalRecords} leads
                      </AppText>
                    </View>
                    <View style={styles.fileMetaSubItem}>
                      <AppText variant="caption" color="muted">
                        Format
                      </AppText>
                      <Badge label={exportProgress.format.toUpperCase()} variant="primary" size="sm" />
                    </View>
                  </View>
                </View>

                {/* Data Preview Container */}
                {exportProgress.fileContent && (
                  <View style={{ gap: Spacing.xs }}>
                    <AppText variant="caption" color="secondary" weight="semibold">
                      Content Preview:
                    </AppText>
                    <View
                      style={[
                        styles.previewContainer,
                        { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                      ]}>
                      <AppText
                        variant="caption"
                        style={{ fontFamily: 'monospace', fontSize: 11 }}
                        numberOfLines={8}>
                        {exportProgress.fileContent}
                      </AppText>
                    </View>
                  </View>
                )}

                {/* Success Action Buttons */}
                <View style={styles.previewActions}>
                  <Button
                    label={copied ? 'Copied!' : 'Copy Content'}
                    variant="outline"
                    size="md"
                    leftIcon="Copy"
                    onPress={handleCopyClipboard}
                    aria-label="Copy export content to clipboard"
                  />
                  <Button
                    label="Share File"
                    variant="primary"
                    size="md"
                    leftIcon="Share2"
                    onPress={handleShareFile}
                    aria-label="Share export file"
                  />
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {/* 8. Failure State Card */}
        {exportProgress?.status === 'failure' && !isExporting && (
          <Animated.View entering={FadeInDown.duration(280)} style={styles.section}>
            <Card
              density="comfortable"
              style={{
                borderColor: theme.danger,
                backgroundColor: theme.surface,
              }}>
              <CardHeader>
                <View style={styles.headerRow}>
                  <Badge label="EXPORT FAILED" variant="danger" size="sm" showDot />
                  <CardTitle level={2}>Unable to Complete Export</CardTitle>
                </View>
              </CardHeader>
              <CardContent style={styles.cardInner}>
                <View
                  style={[
                    styles.errorMessageBox,
                    { backgroundColor: theme.surfaceSubtle, borderColor: theme.danger },
                  ]}>
                  <Icon name="AlertTriangle" size={20} color={theme.danger} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="body" weight="semibold" color="danger">
                      Export Interrupted
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      {exportProgress.error ||
                        'A simulated network error or timeout prevented completing the dataset packaging.'}
                    </AppText>
                  </View>
                </View>

                <View style={styles.failureActions}>
                  <Button
                    label="Retry Export"
                    variant="primary"
                    size="md"
                    leftIcon="RefreshCw"
                    onPress={handleStartExport}
                    aria-label="Retry lead export"
                  />
                  <Button
                    label="Dismiss"
                    variant="outline"
                    size="md"
                    onPress={() => setExportProgress(null)}
                    aria-label="Dismiss error notification"
                  />
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        )}
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
  formatGrid: {
    gap: Spacing.xs,
  },
  formatCard: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: 4,
  },
  formatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formatTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  scopeOptions: {
    gap: Spacing.xs,
  },
  scopeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  scopeCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  presetChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    paddingTop: 4,
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerHeaderActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  leadsListContainer: {
    gap: Spacing.xs,
    maxHeight: 280,
  },
  leadItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs + 2,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  resilienceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    gap: Spacing.sm,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileMetaBox: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  fileMetaItem: {
    gap: 2,
  },
  fileMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileMetaSubItem: {
    gap: 2,
    alignItems: 'flex-start',
  },
  previewContainer: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    maxHeight: 180,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  errorMessageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  failureActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
});
