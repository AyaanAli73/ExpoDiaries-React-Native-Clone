import React, { useMemo } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
  CardHeader,
  CardTitle,
  Divider,
  Icon,
  IconButton,
  Skeleton,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLeads } from '@/hooks/use-leads';
import { useTeamMember } from '@/hooks/use-team';
import { Colors, Radius, Spacing } from '@/theme';
import { Lead } from '@/types/lead';
import { ROLE_DEFAULT_PERMISSIONS, TeamPermission } from '@/types/team';

const ALL_SYSTEM_PERMISSIONS: { key: TeamPermission; label: string; desc: string }[] = [
  { key: 'leads:scan', label: 'Badge & Card Scanning', desc: 'Capture attendee badges via QR & OCR' },
  { key: 'leads:assign', label: 'Lead Routing & Assignment', desc: 'Assign and reassign accounts' },
  { key: 'leads:edit', label: 'Qualification & Notes', desc: 'Modify temperature, scores, and tags' },
  { key: 'leads:export', label: 'Data Export Authority', desc: 'Download CSV, JSON, and TSV files' },
  { key: 'team:invite', label: 'Staff Provisioning', desc: 'Invite new booth representatives' },
  { key: 'analytics:view_roi', label: 'ROI & Telemetry Visibility', desc: 'Access financial pipeline metrics' },
  { key: 'crm:sync', label: 'CRM Pipeline Synchronization', desc: 'Dispatch leads to Salesforce / HubSpot' },
];

export default function TeamMemberDetailScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: member, isLoading } = useTeamMember(id || '');
  const { data: leadsResult } = useLeads();

  // Find leads assigned to or captured by this team member
  const assignedLeads: Lead[] = useMemo(() => {
    if (!leadsResult?.items || !member) return [];
    return leadsResult.items.filter(
      (l) =>
        l.assignedToId === member.userId ||
        l.assignedToId === member.id ||
        l.capturedByStaffId === member.userId
    );
  }, [leadsResult, member]);

  if (isLoading || !member) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Team Member Detail"
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
        <View style={{ gap: Spacing.md }}>
          <Skeleton width="100%" height={160} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={100} style={{ borderRadius: Radius.large }} />
          <Skeleton width="100%" height={240} style={{ borderRadius: Radius.large }} />
        </View>
      </ScreenContainer>
    );
  }

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

  const memberPermissions =
    member.permissions?.length > 0
      ? member.permissions
      : ROLE_DEFAULT_PERMISSIONS[member.role] || [];

  return (
    <ScreenContainer
      header={
        <AppHeader
          title={member.name}
          subtitle={`${member.title || 'Booth Representative'} • ${member.email}`}
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* ============================================================ */}
        {/* 1. PROFILE & IDENTITY HERO CARD                              */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260)}>
          <Card density="comfortable">
            <CardContent style={styles.heroContent}>
              <View style={styles.heroTopRow}>
                <View style={styles.avatarWrapper}>
                  <Avatar name={member.name} source={member.avatarUrl ? { uri: member.avatarUrl } : undefined} size="xl" />
                  <View
                    style={[
                      styles.presenceDot,
                      { backgroundColor: presenceColor, borderColor: theme.surface },
                    ]}
                  />
                </View>

                <View style={styles.heroInfoCol}>
                  <View style={styles.nameBadgeRow}>
                    <CardTitle level={2}>{member.name}</CardTitle>
                    <Badge label={presenceLabel} variant={member.presence === 'on_duty' ? 'success' : 'outline'} size="sm" showDot />
                  </View>
                  <AppText variant="body" weight="medium" color="secondary">
                    {member.title || 'Solutions Representative'}
                  </AppText>
                  <View style={styles.roleRow}>
                    <Badge
                      label={member.role.replace('_', ' ').toUpperCase()}
                      variant={member.role === 'admin' ? 'primary' : 'outline'}
                      size="sm"
                    />
                    <Badge label={`STATUS: ${member.status.toUpperCase()}`} variant="default" size="sm" />
                  </View>
                </View>
              </View>

              {member.bio && (
                <AppText variant="caption" color="secondary" style={styles.bioText}>
                  {member.bio}
                </AppText>
              )}

              {member.boothStation && (
                <View style={[styles.stationBanner, { backgroundColor: theme.surfaceSubtle }]}>
                  <Icon name="MapPin" size={14} color={theme.primary} />
                  <AppText variant="caption" weight="semibold">
                    Current Station: {member.boothStation}
                  </AppText>
                </View>
              )}

              <Divider />

              {/* Direct Communication Channels */}
              <View style={styles.channelsRow}>
                {member.phone && (
                  <Button
                    label="Call Representative"
                    variant="outline"
                    size="sm"
                    leftIcon="Phone"
                    onPress={() => Linking.openURL(`tel:${member.phone}`)}
                  />
                )}
                {member.email && (
                  <Button
                    label="Send Email"
                    variant="outline"
                    size="sm"
                    leftIcon="Mail"
                    onPress={() => Linking.openURL(`mailto:${member.email}`)}
                  />
                )}
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* 2. PERFORMANCE & WORKLOAD METRICS BAR                        */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(50)}>
          <Card density="comfortable">
            <CardContent style={styles.metricsBar}>
              <View style={styles.metricItem}>
                <AppText variant="caption" color="secondary">
                  Captured
                </AppText>
                <AppText variant="title" weight="bold" tabular>
                  {member.leadsCapturedCount}
                </AppText>
                <AppText variant="caption" color="muted">
                  leads
                </AppText>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <AppText variant="caption" color="secondary">
                  Hot Leads
                </AppText>
                <AppText variant="title" weight="bold" color="primary" tabular>
                  {member.hotLeadsCount || 0}
                </AppText>
                <Badge label="HIGH INTENT" variant="primary" size="sm" />
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <AppText variant="caption" color="secondary">
                  Meetings
                </AppText>
                <AppText variant="title" weight="bold" tabular>
                  {member.meetingsCount || 0}
                </AppText>
                <AppText variant="caption" color="muted">
                  demos logged
                </AppText>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <AppText variant="caption" color="secondary">
                  Assigned
                </AppText>
                <AppText variant="title" weight="bold" color="success" tabular>
                  {assignedLeads.length}
                </AppText>
                <AppText variant="caption" color="muted">
                  accounts
                </AppText>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* 3. ASSIGNED LEADS STREAM                                     */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(100)}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerWithBadge}>
                <CardTitle level={2}>Assigned Accounts & Leads ({assignedLeads.length})</CardTitle>
                <Badge label="ACTIVE PIPELINE" variant="primary" size="sm" />
              </View>
            </CardHeader>
            <CardContent style={styles.assignedList}>
              {assignedLeads.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Icon name="Users" size={24} color={theme.textMuted} />
                  <AppText variant="caption" color="secondary">
                    No active leads currently assigned to {member.name}.
                  </AppText>
                </View>
              ) : (
                assignedLeads.map((lead) => {
                  const temp = lead.temperature || 'warm';
                  const tempVariant = temp === 'hot' ? 'danger' : temp === 'warm' ? 'warning' : 'outline';

                  return (
                    <Pressable
                      key={lead.id}
                      accessibilityRole="button"
                      accessibilityLabel={`View lead ${lead.firstName} ${lead.lastName}`}
                      onPress={() => router.push(`/leads/${lead.id}` as any)}
                      style={({ pressed }) => [
                        styles.leadItemRow,
                        {
                          backgroundColor: theme.surfaceSubtle,
                          borderColor: theme.border,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}>
                      <View style={{ gap: 2, flex: 1 }}>
                        <View style={styles.leadNameRow}>
                          <AppText weight="bold" variant="body">
                            {lead.firstName} {lead.lastName}
                          </AppText>
                          <Badge label={temp.toUpperCase()} variant={tempVariant as any} size="sm" />
                        </View>
                        <AppText variant="caption" color="secondary">
                          {lead.title || 'Decision Maker'} • {lead.company || 'Enterprise Account'}
                        </AppText>
                        <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
                          Score: {lead.score} pts • {lead.status.toUpperCase()}
                        </AppText>
                      </View>
                      <IconButton
                        icon="ChevronRight"
                        size="sm"
                        variant="ghost"
                        accessibilityLabel="View lead details"
                        onPress={() => router.push(`/leads/${lead.id}` as any)}
                      />
                    </Pressable>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* 4. RECENT FIELD ACTIVITY LOG                                 */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(150)}>
          <Card density="comfortable">
            <CardHeader>
              <CardTitle level={2}>Recent Field Activity</CardTitle>
            </CardHeader>
            <CardContent style={styles.activityList}>
              {member.recentActivities && member.recentActivities.length > 0 ? (
                member.recentActivities.map((act) => (
                  <View key={act.id} style={styles.activityRow}>
                    <View style={[styles.activityDot, { backgroundColor: theme.primary }]} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText weight="bold" variant="body">
                        {act.title}
                      </AppText>
                      <AppText variant="caption" color="secondary">
                        {act.description}
                      </AppText>
                      <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
                        {new Intl.DateTimeFormat(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(act.timestamp))}
                      </AppText>
                    </View>
                  </View>
                ))
              ) : (
                <AppText variant="caption" color="secondary">
                  No activity entries recorded for this session.
                </AppText>
              )}
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* 5. EVENT ACTIVITY & BOOTH TELEMETRY                          */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(200)}>
          <Card density="comfortable">
            <CardHeader>
              <CardTitle level={2}>Trade-Show Event Deployments</CardTitle>
            </CardHeader>
            <CardContent style={styles.eventActivityList}>
              {member.eventActivities && member.eventActivities.length > 0 ? (
                member.eventActivities.map((evt) => (
                  <View
                    key={evt.eventId}
                    style={[
                      styles.eventCard,
                      { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                    ]}>
                    <View style={styles.eventCardHeader}>
                      <View style={{ gap: 2 }}>
                        <AppText weight="bold" variant="body">
                          {evt.eventName}
                        </AppText>
                        <AppText variant="caption" color="secondary">
                          📍 {evt.boothStation}
                        </AppText>
                      </View>
                      <Badge
                        label={evt.status.toUpperCase()}
                        variant={evt.status === 'active' ? 'primary' : 'outline'}
                        size="sm"
                      />
                    </View>
                    <Divider />
                    <View style={styles.eventStatsRow}>
                      <AppText variant="caption" weight="medium">
                        {evt.leadsCaptured} captured
                      </AppText>
                      <AppText variant="caption" color="muted">
                        •
                      </AppText>
                      <AppText variant="caption" weight="medium" color="primary">
                        {evt.hotLeadsCount} hot leads
                      </AppText>
                      <AppText variant="caption" color="muted">
                        •
                      </AppText>
                      <AppText variant="caption" weight="medium">
                        {evt.meetingsCount} meetings
                      </AppText>
                    </View>
                  </View>
                ))
              ) : (
                <AppText variant="caption" color="secondary">
                  No event records available.
                </AppText>
              )}
            </CardContent>
          </Card>
        </Animated.View>

        {/* ============================================================ */}
        {/* 6. ROLE & PERMISSIONS ARCHITECTURE MATRIX                   */}
        {/* ============================================================ */}
        <Animated.View entering={FadeInDown.duration(260).delay(250)}>
          <Card density="comfortable">
            <CardHeader>
              <View style={styles.headerWithBadge}>
                <CardTitle level={2}>Role & Scanner Privileges</CardTitle>
                <Badge label="RBAC READY" variant="outline" size="sm" />
              </View>
            </CardHeader>
            <CardContent style={styles.permList}>
              <AppText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
                Granted privileges for {member.role.replace('_', ' ').toUpperCase()} role:
              </AppText>
              {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                const isGranted = memberPermissions.includes(perm.key);
                return (
                  <View key={perm.key} style={styles.permRow}>
                    <Icon
                      name={isGranted ? 'CheckCircle2' : 'Circle'}
                      size={18}
                      color={isGranted ? theme.primary : theme.textMuted}
                    />
                    <View style={{ flex: 1, gap: 1 }}>
                      <AppText
                        variant="body"
                        weight={isGranted ? 'semibold' : 'normal'}
                        color={isGranted ? 'primary' : 'muted'}>
                        {perm.label}
                      </AppText>
                      <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
                        {perm.desc}
                      </AppText>
                    </View>
                    <Badge
                      label={isGranted ? 'ACTIVE' : 'LOCKED'}
                      variant={isGranted ? 'success' : 'outline'}
                      size="sm"
                    />
                  </View>
                );
              })}
            </CardContent>
          </Card>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  heroContent: {
    gap: Spacing.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  presenceDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  heroInfoCol: {
    flex: 1,
    gap: 4,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 2,
  },
  bioText: {
    lineHeight: 18,
  },
  stationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs + 2,
    borderRadius: Radius.medium,
  },
  channelsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  headerWithBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignedList: {
    gap: Spacing.xs + 2,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  leadItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  leadNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityList: {
    gap: Spacing.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  eventActivityList: {
    gap: Spacing.sm,
  },
  eventCard: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  permList: {
    gap: Spacing.sm,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
});
