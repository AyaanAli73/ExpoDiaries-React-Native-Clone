import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppHeader } from '@/components/layout/app-header';
import { ScreenContainer } from '@/components/layout/screen-container';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardTitle,
  Chip,
  Divider,
  Icon,
  IconButton,
  Skeleton,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useInviteTeamMember,
  useTeamMembers,
  useUpdateMemberPresence,
} from '@/hooks/use-team';
import { Colors, Radius, Shadows, Spacing } from '@/theme';
import { UserRole } from '@/types/auth';
import { TeamMember, TeamMemberPresence } from '@/types/team';

export default function TeamManagementScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const { data: teamMembers = [], isLoading } = useTeamMembers();
  const inviteMutation = useInviteTeamMember();
  const updatePresenceMutation = useUpdateMemberPresence();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | UserRole>('all');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  // Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('field_staff');

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesSearch =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.boothStation && m.boothStation.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole =
        selectedRoleFilter === 'all' || m.role === selectedRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [teamMembers, searchQuery, selectedRoleFilter]);

  const onDutyCount = teamMembers.filter((m) => m.presence === 'on_duty').length;
  const totalLeads = teamMembers.reduce((sum, m) => sum + m.leadsCapturedCount, 0);

  const handleCyclePresence = async (member: TeamMember) => {
    const nextPresence: Record<TeamMemberPresence, TeamMemberPresence> = {
      on_duty: 'break',
      break: 'offline',
      offline: 'on_duty',
    };
    const next = nextPresence[member.presence || 'on_duty'];
    try {
      await updatePresenceMutation.mutateAsync({ id: member.id, presence: next });
    } catch {
      Alert.alert('Error', 'Failed to update presence status.');
    }
  };

  const handleSendInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      Alert.alert('Validation Error', 'Please provide both staff member name and email.');
      return;
    }
    try {
      await inviteMutation.mutateAsync({
        input: {
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          title: inviteTitle.trim() || undefined,
          role: inviteRole,
        },
      });
      setInviteModalVisible(false);
      setInviteName('');
      setInviteEmail('');
      setInviteTitle('');
      Alert.alert('Invitation Dispatched', `Credentials sent to ${inviteEmail}.`);
    } catch {
      Alert.alert('Error', 'Failed to invite team member.');
    }
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Team Roster"
          subtitle="Booth staff presence, scanner permissions, and stations"
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
      {/* 1. Team Telemetry KPI Bar */}
      <Animated.View entering={FadeInDown.duration(260)} style={styles.section}>
        <Card density="comfortable">
          <CardContent style={styles.statsRow}>
            <View style={styles.statCol}>
              <AppText variant="caption" color="secondary">
                Roster Size
              </AppText>
              <AppText variant="title" weight="bold" tabular>
                {teamMembers.length} staff
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <AppText variant="caption" color="secondary">
                Active On Duty
              </AppText>
              <AppText variant="title" weight="bold" color="primary" tabular>
                {onDutyCount} booth reps
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <AppText variant="caption" color="secondary">
                Total Captured
              </AppText>
              <AppText variant="title" weight="bold" tabular>
                {totalLeads} leads
              </AppText>
            </View>
          </CardContent>
        </Card>
      </Animated.View>

      {/* 2. Controls & Search Row */}
      <View style={styles.controlsRow}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <Icon name="Search" size={16} color={theme.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search staff, station, title…"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>
        <Button
          label="Invite Staff"
          variant="primary"
          size="sm"
          leftIcon="UserPlus"
          onPress={() => setInviteModalVisible(true)}
        />
      </View>

      {/* 3. Role Filters */}
      <View style={styles.filtersRow}>
        {(['all', 'admin', 'manager', 'field_staff'] as const).map((role) => (
          <Chip
            key={role}
            label={role === 'all' ? 'All Roles' : role.replace('_', ' ').toUpperCase()}
            selected={selectedRoleFilter === role}
            onPress={() => setSelectedRoleFilter(role)}
            size="sm"
          />
        ))}
      </View>

      {/* 4. Staff Member Cards List */}
      {isLoading ? (
        <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
          <Skeleton width="100%" height={110} style={{ borderRadius: Radius.medium }} />
          <Skeleton width="100%" height={110} style={{ borderRadius: Radius.medium }} />
          <Skeleton width="100%" height={110} style={{ borderRadius: Radius.medium }} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}>
          {filteredMembers.map((member, index) => {
            const presenceColor =
              member.presence === 'on_duty'
                ? '#10B981'
                : member.presence === 'break'
                ? '#F59E0B'
                : '#94A3B8';

            const presenceLabel =
              member.presence === 'on_duty'
                ? 'ON DUTY'
                : member.presence === 'break'
                ? 'ON BREAK'
                : 'OFFLINE';

            return (
              <Animated.View
                key={member.id}
                entering={FadeInDown.duration(260).delay(index * 40)}>
                <Card density="comfortable" style={styles.memberCard}>
                  <CardContent style={styles.cardInner}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`View details for ${member.name}`}
                      onPress={() =>
                        router.push({
                          pathname: '/profile/team-detail',
                          params: { id: member.id },
                        } as any)
                      }
                      style={styles.cardHeaderPressable}>
                      <View style={styles.memberTopRow}>
                        <View style={styles.memberInfoRow}>
                          <View style={styles.avatarContainer}>
                            <Avatar name={member.name} size="md" />
                            <View
                              style={[
                                styles.presenceIndicator,
                                {
                                  backgroundColor: presenceColor,
                                  borderColor: theme.surface,
                                },
                              ]}
                            />
                          </View>
                          <View style={{ gap: 2, flex: 1 }}>
                            <View style={styles.nameBadgeRow}>
                              <AppText weight="bold" variant="body">
                                {member.name}
                              </AppText>
                              <View style={styles.badgeGroup}>
                                <Badge
                                  label={member.role.replace('_', ' ').toUpperCase()}
                                  variant={member.role === 'admin' ? 'primary' : 'outline'}
                                  size="sm"
                                />
                                <Badge
                                  label={member.status.toUpperCase()}
                                  variant={member.status === 'active' ? 'success' : 'default'}
                                  size="sm"
                                />
                              </View>
                            </View>
                            <AppText variant="caption" color="secondary" numberOfLines={1}>
                              {member.title || 'Booth Representative'} • {member.email}
                            </AppText>
                          </View>
                        </View>
                        <Icon name="ChevronRight" size={18} color={theme.textMuted} />
                      </View>
                    </Pressable>

                    {/* Station Attribution */}
                    {member.boothStation && (
                      <View
                        style={[
                          styles.stationBadge,
                          { backgroundColor: theme.surfaceSubtle },
                        ]}>
                        <Icon name="MapPin" size={12} color={theme.textMuted} />
                        <AppText variant="caption" color="secondary" numberOfLines={1}>
                          Station: {member.boothStation}
                        </AppText>
                      </View>
                    )}

                    <Divider />

                    {/* Bottom Workload Metrics & Presence Cycle */}
                    <View style={styles.memberFooter}>
                      <View style={styles.footerStats}>
                        <View style={styles.statMetricItem}>
                          <AppText variant="caption" weight="bold" tabular>
                            {member.leadsCapturedCount}
                          </AppText>
                          <AppText variant="caption" color="muted" style={{ fontSize: 10 }}>
                            Captured
                          </AppText>
                        </View>
                        <AppText variant="caption" color="muted">
                          •
                        </AppText>
                        <View style={styles.statMetricItem}>
                          <AppText variant="caption" weight="bold" color="primary" tabular>
                            {member.hotLeadsCount || 0}
                          </AppText>
                          <AppText variant="caption" color="primary" style={{ fontSize: 10 }}>
                            Hot
                          </AppText>
                        </View>
                        <AppText variant="caption" color="muted">
                          •
                        </AppText>
                        <View style={styles.statMetricItem}>
                          <AppText variant="caption" weight="bold" tabular>
                            {member.meetingsCount || 0}
                          </AppText>
                          <AppText variant="caption" color="muted" style={{ fontSize: 10 }}>
                            Meetings
                          </AppText>
                        </View>
                      </View>

                      <View style={styles.footerActions}>
                        <Button
                          label={presenceLabel}
                          variant="ghost"
                          size="sm"
                          onPress={() => handleCyclePresence(member)}
                        />
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      {/* 5. Invite Team Member Modal */}
      <Modal
        visible={inviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              Shadows.modal,
            ]}>
            <View style={styles.modalHeader}>
              <CardTitle level={2}>Invite Booth Staff</CardTitle>
              <IconButton
                icon="X"
                size="sm"
                variant="ghost"
                accessibilityLabel="Close invite dialog"
                onPress={() => setInviteModalVisible(false)}
              />
            </View>

            <AppText variant="caption" color="secondary">
              Provision mobile scanner access credentials for a new team member:
            </AppText>

            <View style={styles.formGroup}>
              <AppText variant="caption" weight="semibold">
                Full Name
              </AppText>
              <TextInput
                value={inviteName}
                onChangeText={setInviteName}
                placeholder="e.g. Jordan Hayes"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>

            <View style={styles.formGroup}>
              <AppText variant="caption" weight="semibold">
                Work Email Address
              </AppText>
              <TextInput
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="jordan@company.com"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>

            <View style={styles.formGroup}>
              <AppText variant="caption" weight="semibold">
                Job Title
              </AppText>
              <TextInput
                value={inviteTitle}
                onChangeText={setInviteTitle}
                placeholder="e.g. Senior Solutions Architect"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.formInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>

            <View style={styles.formGroup}>
              <AppText variant="caption" weight="semibold">
                Role & Scanner Privileges
              </AppText>
              <View style={styles.chipsRow}>
                {(['field_staff', 'manager', 'admin'] as const).map((r) => (
                  <Chip
                    key={r}
                    label={r.replace('_', ' ').toUpperCase()}
                    selected={inviteRole === r}
                    onPress={() => setInviteRole(r)}
                    size="sm"
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                variant="outline"
                size="md"
                onPress={() => setInviteModalVisible(false)}
              />
              <Button
                label={inviteMutation.isPending ? 'Sending…' : 'Send Invite'}
                variant="primary"
                size="md"
                loading={inviteMutation.isPending}
                onPress={handleSendInvite}
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
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
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
  filtersRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  list: {
    gap: Spacing.xs + 4,
    paddingBottom: Spacing.xl,
  },
  memberCard: {
    borderWidth: 1,
  },
  cardInner: {
    gap: Spacing.xs + 2,
  },
  cardHeaderPressable: {
    width: '100%',
  },
  memberTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  presenceIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  memberFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  footerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  formGroup: {
    gap: 4,
  },
  formInput: {
    height: 42,
    borderRadius: Radius.medium,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
