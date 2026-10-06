import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  LeadActivityTimeline,
  LeadAssignmentModal,
  LeadAttachmentsHub,
  LeadNotesStream,
} from '@/components/leads';
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
  Chip,
  Divider,
  Icon,
  IconButton,
  Skeleton,
  Toast,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useAssignLead,
  useDeleteLead,
  useLead,
  useLeadActivities,
  useLeadAttachments,
  useUpdateLead,
  useUpdateLeadFollowUp,
  useUpdateLeadStatus,
} from '@/hooks/use-leads';
import { Colors, Radius, Spacing } from '@/theme';
import { LeadPriority, LeadStatus } from '@/types/lead';
import { TeamMember } from '@/types/team';

const STATUS_OPTIONS: { value: LeadStatus; label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'outline' }[] = [
  { value: 'new', label: 'New', variant: 'outline' },
  { value: 'contacted', label: 'Contacted', variant: 'warning' },
  { value: 'qualified', label: 'Qualified', variant: 'success' },
  { value: 'disqualified', label: 'Disqualified', variant: 'danger' },
  { value: 'customer', label: 'Customer', variant: 'primary' },
];

export default function LeadDetailScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const { id } = useLocalSearchParams<{ id: string }>();
  const leadId = id || '';

  // Queries
  const { data: lead, isLoading } = useLead(leadId);
  const { data: activities = [] } = useLeadActivities(leadId);
  const { data: attachments = [] } = useLeadAttachments(leadId);

  // Mutations
  const updateLeadMutation = useUpdateLead();
  const updateStatusMutation = useUpdateLeadStatus();
  const updateFollowUpMutation = useUpdateLeadFollowUp();
  const assignLeadMutation = useAssignLead();
  const deleteLeadMutation = useDeleteLead();

  // Local State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Formatted capture timestamp using Intl.DateTimeFormat
  const formattedCaptureTime = React.useMemo(() => {
    if (!lead?.createdAt) return '';
    try {
      const date = new Date(lead.createdAt);
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return lead?.createdAt || '';
    }
  }, [lead]);

  if (isLoading) {
    return (
      <ScreenContainer safeAreaEdges={['left', 'right']}>
        <View style={{ gap: Spacing.md, padding: Spacing.md }}>
          <Skeleton width="100%" height={160} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={120} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={240} style={{ borderRadius: Radius.large }} />
        </View>
      </ScreenContainer>
    );
  }

  if (!lead) {
    return (
      <ScreenContainer safeAreaEdges={['left', 'right']}>
        <View style={styles.notFoundCenter}>
          <Icon name="Users" size={48} color={theme.textMuted} />
          <AppText weight="bold" variant="heading">
            Lead Not Found
          </AppText>
          <AppText variant="caption" color="secondary">
            This lead record may have been removed or does not exist.
          </AppText>
          <Button
            label="Return to Leads"
            variant="primary"
            size="md"
            onPress={() => router.back()}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      </ScreenContainer>
    );
  }

  const currentTemp =
    lead.temperature || (lead.score >= 75 ? 'hot' : lead.score >= 40 ? 'warm' : 'cold');
  const isHot = currentTemp === 'hot';
  const isWarm = currentTemp === 'warm';
  const scoreVariant = isHot ? 'success' : isWarm ? 'warning' : 'outline';

  const handleStatusChange = async (status: LeadStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: lead.id, status });
      setToastMessage(`Status updated to ${status.toUpperCase()}`);
    } catch {
      setToastMessage('Failed to update status.');
    }
  };

  const handleFollowUpChange = async (fupStatus: 'none' | 'pending' | 'scheduled' | 'completed') => {
    try {
      await updateFollowUpMutation.mutateAsync({
        id: lead.id,
        followUpStatus: fupStatus,
      });
      setToastMessage(`Follow-up set to ${fupStatus.toUpperCase()}`);
    } catch {
      setToastMessage('Failed to update follow-up status.');
    }
  };

  const handleTemperatureChange = async (temp: 'hot' | 'warm' | 'cold') => {
    const priorityMap: Record<'hot' | 'warm' | 'cold', LeadPriority> = {
      hot: 'urgent',
      warm: 'high',
      cold: 'low',
    };
    const scoreAdjustment = temp === 'hot' ? 90 : temp === 'warm' ? 65 : 30;

    try {
      await updateLeadMutation.mutateAsync({
        id: lead.id,
        updates: {
          temperature: temp,
          priority: priorityMap[temp],
          score: scoreAdjustment,
        },
      });
      setToastMessage(`Temperature marked as ${temp.toUpperCase()}`);
    } catch {
      setToastMessage('Failed to update temperature.');
    }
  };

  const handleAssignMember = async (member: TeamMember) => {
    try {
      await assignLeadMutation.mutateAsync({
        id: lead.id,
        assigneeId: member.userId,
        assigneeName: member.name,
      });
      setToastMessage(`Assigned lead to ${member.name}`);
    } catch {
      setToastMessage('Failed to assign lead.');
    }
  };



  const handleDeleteLead = () => {
    Alert.alert(
      'Delete Lead Record',
      `Are you sure you want to remove ${lead.firstName} ${lead.lastName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLeadMutation.mutateAsync(lead.id);
            router.back();
          },
        },
      ]
    );
  };

  const openPhone = () => {
    if (lead.phone) Linking.openURL(`tel:${lead.phone}`);
  };

  const openEmail = () => {
    if (lead.email) Linking.openURL(`mailto:${lead.email}`);
  };

  const openWebsite = () => {
    if (lead.website) {
      const url = lead.website.startsWith('http') ? lead.website : `https://${lead.website}`;
      Linking.openURL(url);
    }
  };

  return (
    <ScreenContainer
      safeAreaEdges={['left', 'right']}
      header={
        <View
          style={[
            styles.headerBar,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}>
          <IconButton
            icon="ChevronLeft"
            size="sm"
            variant="ghost"
            accessibilityLabel="Back to leads"
            onPress={() => router.back()}
          />
          <View style={styles.headerTitleCol}>
            <AppText weight="bold" variant="body" numberOfLines={1}>
              {lead.firstName} {lead.lastName}
            </AppText>
            <AppText variant="caption" color="secondary" numberOfLines={1}>
              {lead.company || 'Attendee Profile'}
            </AppText>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="Trash2"
              size="sm"
              variant="ghost"
              accessibilityLabel="Delete lead"
              onPress={handleDeleteLead}
            />
          </View>
        </View>
      }>
      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        type="success"
        duration={3000}
        onDismiss={() => setToastMessage(null)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* ============================================================ */}
        {/* HERO PROFILE CARD                                            */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260)}>
          <Card variant="elevated" density="comfortable" style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <Avatar
                name={`${lead.firstName} ${lead.lastName}`}
                source={lead.avatarUrl ? { uri: lead.avatarUrl } : undefined}
                size="lg"
              />
              <View style={styles.heroInfoCol}>
                <View style={styles.nameBadgesRow}>
                  <AppText weight="bold" variant="heading" numberOfLines={1}>
                    {lead.firstName} {lead.lastName}
                  </AppText>
                  <Badge
                    label={`SCORE ${lead.score}`}
                    variant={scoreVariant}
                    size="sm"
                    showDot
                  />
                </View>

                <AppText weight="semibold" variant="body" style={{ color: theme.primary }} numberOfLines={1}>
                  {lead.title || 'Exhibition Attendee'}
                </AppText>

                <AppText variant="caption" color="secondary" numberOfLines={1}>
                  {lead.company || 'Company'}
                  {lead.address ? ` • ${lead.address}` : ''}
                </AppText>

                {/* Event & Booth Context */}
                <View style={styles.eventBoothRow}>
                  <View style={styles.contextPill}>
                    <Icon name="Calendar" size={13} color={theme.textMuted} />
                    <AppText variant="caption" color="secondary" numberOfLines={1}>
                      {lead.eventName || 'CES 2026 International'}
                    </AppText>
                  </View>
                  {lead.boothNumber && (
                    <View style={styles.contextPill}>
                      <Icon name="MapPin" size={13} color={theme.primary} />
                      <AppText variant="caption" weight="semibold" style={{ color: theme.primary }} numberOfLines={1}>
                        {lead.hall ? `${lead.hall} • ` : ''}{lead.boothNumber}
                      </AppText>
                    </View>
                  )}
                </View>

                {/* Captured Time */}
                {Boolean(formattedCaptureTime) && (
                  <View style={styles.captureTimeRow}>
                    <Icon name="Clock" size={12} color={theme.textMuted} />
                    <AppText variant="caption" color="secondary">
                      Captured {formattedCaptureTime}
                    </AppText>
                  </View>
                )}

                <View style={styles.metaBadgesWrap}>
                  <Badge
                    label={lead.captureSource.replace('_', ' ').toUpperCase()}
                    variant="outline"
                    size="sm"
                  />
                  {lead.intent && (
                    <Badge
                      label={`INTENT: ${lead.intent.replace('_', ' ').toUpperCase()}`}
                      variant="primary"
                      size="sm"
                    />
                  )}
                  {lead.ocrConfidence && (
                    <Badge
                      label={`OCR ${(lead.ocrConfidence * 100).toFixed(0)}% MATCH`}
                      variant="outline"
                      size="sm"
                    />
                  )}
                </View>
              </View>
            </View>

            {/* Direct Communication Bar */}
            <View style={[styles.contactBar, { backgroundColor: theme.secondary, borderColor: theme.border }]}>
              {lead.phone ? (
                <Button
                  label={lead.phone}
                  variant="subtle"
                  size="sm"
                  leftIcon="Phone"
                  onPress={openPhone}
                  style={{ flex: 1 }}
                />
              ) : null}
              {lead.email ? (
                <Button
                  label={lead.email}
                  variant="subtle"
                  size="sm"
                  leftIcon="Mail"
                  onPress={openEmail}
                  style={{ flex: 1 }}
                />
              ) : null}
              {lead.website ? (
                <IconButton
                  icon="Globe"
                  size="sm"
                  variant="outline"
                  accessibilityLabel="Open company website"
                  onPress={openWebsite}
                />
              ) : null}
            </View>

            {/* Assigned Staff Banner */}
            <View style={[styles.assigneeBanner, { borderColor: theme.border }]}>
              <View style={styles.assigneeGroup}>
                <Avatar name={lead.assignedToName || 'Alex Mercer'} size="xs" />
                <View style={{ gap: 1 }}>
                  <AppText variant="caption" color="secondary">
                    Assigned Account Rep:
                  </AppText>
                  <AppText weight="bold" variant="caption">
                    {lead.assignedToName || 'Alex Mercer (Lead AE)'}
                  </AppText>
                </View>
              </View>

              <Button
                label="Reassign"
                variant="outline"
                size="sm"
                leftIcon="UserCheck"
                onPress={() => setShowAssignModal(true)}
              />
            </View>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* QUALIFICATION MATRIX & HEAT SELECTOR                         */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(40)}>
          <Card variant="outline" density="comfortable" style={styles.matrixCard}>
            <CardHeader style={styles.matrixHeader}>
              <View style={styles.matrixTitleGroup}>
                <Icon name="Target" size={18} color={theme.primary} />
                <CardTitle level={2}>Qualification Matrix</CardTitle>
              </View>
              <Badge
                label={lead.status.toUpperCase()}
                variant={lead.status === 'qualified' ? 'success' : 'primary'}
                showDot
              />
            </CardHeader>

            <CardContent style={styles.matrixContent}>
              {/* Status Segmented Control */}
              <View style={styles.statusSegment}>
                <AppText variant="caption" weight="bold" color="secondary">
                  LIFECYCLE STATUS
                </AppText>
                <View style={styles.statusPillsRow}>
                  {STATUS_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      selected={lead.status === opt.value}
                      onPress={() => handleStatusChange(opt.value)}
                      size="sm"
                    />
                  ))}
                </View>
              </View>

              <Divider />

              {/* Temperature Selector */}
              <View style={styles.tempSection}>
                <AppText variant="caption" weight="bold" color="secondary">
                  LEAD TEMPERATURE (1-TAP HEAT QUALIFIER)
                </AppText>
                <View style={styles.tempRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Mark Hot lead"
                    onPress={() => handleTemperatureChange('hot')}
                    style={({ pressed }) => [
                      styles.tempBox,
                      {
                        backgroundColor: currentTemp === 'hot' ? theme.dangerSubtle : theme.surface,
                        borderColor: currentTemp === 'hot' ? theme.danger : theme.border,
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      },
                    ]}>
                    <AppText style={styles.tempEmoji}>🔥</AppText>
                    <AppText weight="bold" variant="caption" style={currentTemp === 'hot' ? { color: theme.danger } : {}}>
                      HOT
                    </AppText>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Mark Warm lead"
                    onPress={() => handleTemperatureChange('warm')}
                    style={({ pressed }) => [
                      styles.tempBox,
                      {
                        backgroundColor: currentTemp === 'warm' ? theme.warningSubtle : theme.surface,
                        borderColor: currentTemp === 'warm' ? theme.warning : theme.border,
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      },
                    ]}>
                    <AppText style={styles.tempEmoji}>⚡</AppText>
                    <AppText weight="bold" variant="caption" style={currentTemp === 'warm' ? { color: theme.warning } : {}}>
                      WARM
                    </AppText>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Mark Cold lead"
                    onPress={() => handleTemperatureChange('cold')}
                    style={({ pressed }) => [
                      styles.tempBox,
                      {
                        backgroundColor: currentTemp === 'cold' ? theme.primarySubtle : theme.surface,
                        borderColor: currentTemp === 'cold' ? theme.primary : theme.border,
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      },
                    ]}>
                    <AppText style={styles.tempEmoji}>❄️</AppText>
                    <AppText weight="bold" variant="caption" style={currentTemp === 'cold' ? { color: theme.primary } : {}}>
                      COLD
                    </AppText>
                  </Pressable>
                </View>
              </View>

              <Divider />

              {/* Follow-up State Selector */}
              <View style={styles.statusSegment}>
                <AppText variant="caption" weight="bold" color="secondary">
                  FOLLOW-UP STATUS
                </AppText>
                <View style={styles.statusPillsRow}>
                  {[
                    { value: 'none', label: '— None' },
                    { value: 'pending', label: '⏳ Due Follow-up' },
                    { value: 'scheduled', label: '🗓️ Meeting Set' },
                    { value: 'completed', label: '✅ Contacted' },
                  ].map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      selected={(lead.followUpStatus || 'none') === opt.value}
                      onPress={() => handleFollowUpChange(opt.value as 'none' | 'pending' | 'scheduled' | 'completed')}
                      size="sm"
                    />
                  ))}
                </View>
              </View>

              {/* BANT Signals */}
              <View style={styles.bantGrid}>
                <View style={styles.bantItem}>
                  <AppText variant="caption" color="secondary">
                    Budget:
                  </AppText>
                  <AppText weight="semibold" variant="body">
                    {lead.budgetRange ? lead.budgetRange.replace('_', '–').toUpperCase() : '$25k–$100k'}
                  </AppText>
                </View>
                <View style={styles.bantItem}>
                  <AppText variant="caption" color="secondary">
                    Role Authority:
                  </AppText>
                  <AppText weight="semibold" variant="body">
                    {lead.decisionRole ? lead.decisionRole.replace('_', ' ').toUpperCase() : 'Decision Maker'}
                  </AppText>
                </View>
                <View style={styles.bantItem}>
                  <AppText variant="caption" color="secondary">
                    Timeline:
                  </AppText>
                  <AppText weight="semibold" variant="body">
                    {lead.purchaseTimeline ? lead.purchaseTimeline.toUpperCase() : 'This Quarter'}
                  </AppText>
                </View>
              </View>

              {/* Tags */}
              {lead.tags?.length > 0 && (
                <View style={styles.tagsRow}>
                  {lead.tags.map((t) => (
                    <Badge key={t} label={t} variant="outline" size="sm" />
                  ))}
                </View>
              )}
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* LEAD ATTACHMENTS (VOICE MEMOS & PHOTOS)                      */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(80)}>
          <LeadAttachmentsHub
            leadId={lead.id}
            eventId={lead.eventId}
            attachments={attachments}
            cardImageUri={lead.cardImageUri}
            cardBackImageUri={lead.cardBackImageUri}
            onToastMessage={(msg) => setToastMessage(msg)}
          />
        </Animated.View>

        {/* ============================================================ */}
        {/* NOTES & OBSERVATIONS STREAM                                  */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(160)}>
          <LeadNotesStream leadId={lead.id} />
        </Animated.View>

        {/* ============================================================ */}
        {/* AUDIT TRAIL & ACTIVITY TIMELINE                              */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(200)}>
          <LeadActivityTimeline activities={activities} />
        </Animated.View>
      </ScrollView>

      {/* Reassign Team Member Modal */}
      <LeadAssignmentModal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        currentAssigneeId={lead.assignedToId}
        onAssignMember={handleAssignMember}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    gap: Spacing.xs,
  },
  headerTitleCol: {
    flex: 1,
    gap: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  notFoundCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.xl,
  },
  heroCard: {
    borderRadius: Radius.large,
    gap: Spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroInfoCol: {
    flex: 1,
    gap: 3,
  },
  nameBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventBoothRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 2,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  captureTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  metaBadgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingTop: 2,
  },
  contactBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  assigneeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
  },
  assigneeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  matrixCard: {
    borderRadius: Radius.large,
  },
  matrixHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matrixTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  matrixContent: {
    gap: Spacing.md,
  },
  statusSegment: {
    gap: 6,
  },
  statusPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tempSection: {
    gap: 6,
  },
  tempRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tempBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
    gap: 2,
  },
  tempEmoji: {
    fontSize: 18,
  },
  bantGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
  },
  bantItem: {
    gap: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  recordVoiceCard: {
    borderRadius: Radius.large,
  },
  recordVoiceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  voicePromptGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
});
