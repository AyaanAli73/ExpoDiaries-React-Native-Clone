import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  AppText,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  CardContent,
  Divider,
  Icon,
  Skeleton,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTeamMembers } from '@/hooks/use-team';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { TeamMember } from '@/types/team';

interface LeadAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  currentAssigneeId?: string;
  onAssignMember: (member: TeamMember, note?: string) => void;
}

export function LeadAssignmentModal({
  visible,
  onClose,
  currentAssigneeId,
  onAssignMember,
}: LeadAssignmentModalProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { data: teamMembers = [], isLoading } = useTeamMembers();

  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [handoffNote, setHandoffNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setStep('select');
    setSelectedMember(null);
    setHandoffNote('');
    onClose();
  };

  const handleSelectMember = (member: TeamMember) => {
    setSelectedMember(member);
    setStep('confirm');
  };

  const handleConfirmAssignment = async () => {
    if (!selectedMember) return;
    setSubmitting(true);
    try {
      await onAssignMember(selectedMember, handoffNote.trim() || undefined);
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return teamMembers;
    const q = searchQuery.toLowerCase();
    return teamMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.title && m.title.toLowerCase().includes(q)) ||
        m.role.toLowerCase().includes(q) ||
        (m.boothStation && m.boothStation.toLowerCase().includes(q))
    );
  }, [teamMembers, searchQuery]);

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      maxHeightPercent={0.85}
      title={step === 'select' ? 'Assign Lead to Team Member' : 'Confirm Lead Assignment'}>
      <View style={styles.container}>
        {/* ============================================================ */}
        {/* STEP 1: SEARCH & SELECT MEMBER                               */}
        {/* ============================================================ */}
        {step === 'select' && (
          <>
            <AppText variant="caption" color="secondary">
              Search and select an account executive or booth specialist to route this lead:
            </AppText>

            {/* Search Input */}
            <View
              style={[
                styles.searchRow,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
              ]}>
              <Icon name="Search" size={16} color={theme.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search staff by name, role, station…"
                placeholderTextColor={theme.textMuted}
                style={[styles.searchInput, { color: theme.text }]}
              />
            </View>

            {isLoading ? (
              <View style={{ gap: Spacing.xs, paddingVertical: Spacing.sm }}>
                <Skeleton width="100%" height={80} style={{ borderRadius: Radius.medium }} />
                <Skeleton width="100%" height={80} style={{ borderRadius: Radius.medium }} />
                <Skeleton width="100%" height={80} style={{ borderRadius: Radius.medium }} />
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}>
                {filteredMembers.map((member) => {
                  const isAssigned =
                    currentAssigneeId === member.userId || currentAssigneeId === member.id;
                  const presenceColor =
                    member.presence === 'on_duty'
                      ? '#10B981'
                      : member.presence === 'break'
                      ? '#F59E0B'
                      : '#94A3B8';

                  return (
                    <Pressable
                      key={member.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${member.name} for assignment`}
                      onPress={() => handleSelectMember(member)}
                      style={({ pressed }) => [
                        styles.memberCard,
                        {
                          backgroundColor: isAssigned ? theme.primarySubtle : theme.surface,
                          borderColor: isAssigned ? theme.primary : theme.border,
                          transform: [{ scale: pressed ? 0.98 : 1 }],
                        },
                        isAssigned && Shadows.subtle,
                      ]}>
                      <View style={styles.avatarWrapper}>
                        <Avatar name={member.name} size="md" />
                        <View
                          style={[
                            styles.presenceDot,
                            {
                              backgroundColor: presenceColor,
                              borderColor: theme.surface,
                            },
                          ]}
                        />
                      </View>

                      <View style={styles.memberInfoCol}>
                        <View style={styles.memberNameRow}>
                          <AppText weight="bold" variant="body">
                            {member.name}
                          </AppText>
                          {isAssigned ? (
                            <Badge label="CURRENT" variant="primary" size="sm" showDot />
                          ) : (
                            <Badge
                              label={member.role.replace('_', ' ').toUpperCase()}
                              variant={member.role === 'admin' ? 'primary' : 'outline'}
                              size="sm"
                            />
                          )}
                        </View>
                        <AppText variant="caption" color="secondary" numberOfLines={1}>
                          {member.title || 'Booth Representative'}
                        </AppText>
                        {member.boothStation && (
                          <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
                            📍 {member.boothStation}
                          </AppText>
                        )}
                        <View style={styles.memberMetricsRow}>
                          <AppText variant="caption" color="muted" tabular style={{ fontSize: 11 }}>
                            {member.leadsCapturedCount} captured
                          </AppText>
                          <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
                            •
                          </AppText>
                          <AppText
                            variant="caption"
                            color="primary"
                            weight="semibold"
                            tabular
                            style={{ fontSize: 11 }}>
                            {member.hotLeadsCount || 0} hot
                          </AppText>
                          <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
                            •
                          </AppText>
                          <AppText variant="caption" color="muted" tabular style={{ fontSize: 11 }}>
                            {member.meetingsCount || 0} meetings
                          </AppText>
                        </View>
                      </View>

                      <Icon
                        name="ChevronRight"
                        size={18}
                        color={theme.primary}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* STEP 2: CONFIRM ASSIGNMENT                                    */}
        {/* ============================================================ */}
        {step === 'confirm' && selectedMember && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.confirmScroll}>
            <AppText variant="caption" color="secondary">
              Review assignment details and optional briefing note before routing:
            </AppText>

            {/* Selected Assignee Profile Card */}
            <Card density="comfortable" style={styles.confirmCard}>
              <CardContent style={styles.confirmCardContent}>
                <View style={styles.confirmAssigneeHeader}>
                  <Avatar name={selectedMember.name} size="lg" />
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.confirmNameRow}>
                      <AppText weight="bold" variant="title">
                        {selectedMember.name}
                      </AppText>
                      <Badge
                        label={selectedMember.role.replace('_', ' ').toUpperCase()}
                        variant="primary"
                        size="sm"
                      />
                    </View>
                    <AppText variant="caption" color="secondary">
                      {selectedMember.title || 'Sales Representative'} • {selectedMember.email}
                    </AppText>
                    {selectedMember.boothStation && (
                      <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
                        📍 {selectedMember.boothStation}
                      </AppText>
                    )}
                  </View>
                </View>

                <Divider />

                {/* Workload Snapshot */}
                <View style={styles.workloadRow}>
                  <View style={styles.workloadItem}>
                    <AppText variant="caption" color="muted">
                      Active Leads
                    </AppText>
                    <AppText variant="body" weight="bold" tabular>
                      {selectedMember.leadsCapturedCount}
                    </AppText>
                  </View>
                  <View style={styles.workloadItem}>
                    <AppText variant="caption" color="muted">
                      Hot Leads
                    </AppText>
                    <AppText variant="body" weight="bold" color="primary" tabular>
                      {selectedMember.hotLeadsCount || 0}
                    </AppText>
                  </View>
                  <View style={styles.workloadItem}>
                    <AppText variant="caption" color="muted">
                      Meetings
                    </AppText>
                    <AppText variant="body" weight="bold" tabular>
                      {selectedMember.meetingsCount || 0}
                    </AppText>
                  </View>
                  <View style={styles.workloadItem}>
                    <AppText variant="caption" color="muted">
                      Status
                    </AppText>
                    <Badge
                      label={selectedMember.presence === 'on_duty' ? 'ON DUTY' : 'BREAK'}
                      variant={selectedMember.presence === 'on_duty' ? 'success' : 'outline'}
                      size="sm"
                    />
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Handoff Note Input */}
            <View style={styles.noteInputGroup}>
              <AppText variant="caption" weight="bold">
                Handoff Note & Context (Optional)
              </AppText>
              <TextInput
                value={handoffNote}
                onChangeText={setHandoffNote}
                placeholder="e.g. Discussed Q1 deployment, high urgency, follow up by Friday…"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                style={[
                  styles.noteTextArea,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.confirmActionsRow}>
              <Button
                label="Back"
                variant="outline"
                size="md"
                leftIcon="ChevronLeft"
                disabled={submitting}
                onPress={() => setStep('select')}
              />
              <Button
                label={submitting ? 'Assigning…' : 'Confirm Assignment'}
                variant="primary"
                size="md"
                leftIcon="UserCheck"
                loading={submitting}
                onPress={handleConfirmAssignment}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: Radius.medium,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  listContainer: {
    gap: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
  },
  presenceDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  memberInfoCol: {
    flex: 1,
    gap: 2,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  memberMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  confirmScroll: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  confirmCard: {
    borderWidth: 1,
  },
  confirmCardContent: {
    gap: Spacing.sm,
  },
  confirmAssigneeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  confirmNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workloadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workloadItem: {
    gap: 2,
    alignItems: 'center',
  },
  noteInputGroup: {
    gap: 4,
  },
  noteTextArea: {
    minHeight: 70,
    borderRadius: Radius.medium,
    borderWidth: 1,
    padding: Spacing.sm,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
