import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/theme';
import { TeamActivityItem } from '@/types/analytics';

interface TeamActivityChartProps {
  data: TeamActivityItem[];
}

export function TeamActivityChart({ data }: TeamActivityChartProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const maxActivity = Math.max(...data.map((d) => d.totalActivity), 1);

  return (
    <View style={styles.container}>
      {/* Chart Metric Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
          <AppText variant="caption" color="secondary">
            Scans
          </AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <AppText variant="caption" color="secondary">
            Meetings
          </AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <AppText variant="caption" color="secondary">
            Follow-ups
          </AppText>
        </View>
      </View>

      {/* Member Activity Rows */}
      <View style={styles.list}>
        {data.map((member, index) => {
          const scansWidth = (member.scans / maxActivity) * 100;
          const meetingsWidth = (member.meetings / maxActivity) * 100;
          const followUpsWidth = (member.followUps / maxActivity) * 100;

          return (
            <View key={member.memberId} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.memberLeft}>
                  <Badge
                    label={`#${index + 1}`}
                    variant={index === 0 ? 'primary' : 'outline'}
                    size="sm"
                  />
                  <Avatar name={member.name} size="sm" />
                  <View style={{ gap: 1 }}>
                    <AppText weight="bold" variant="body">
                      {member.name}
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      {member.role.replace('_', ' ').toUpperCase()}
                    </AppText>
                  </View>
                </View>

                <View style={styles.memberRight}>
                  <AppText weight="bold" variant="body" tabular>
                    {member.totalActivity}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    actions
                  </AppText>
                </View>
              </View>

              {/* Stacked Proportional Activity Bar */}
              <View style={[styles.stackedTrack, { backgroundColor: theme.surfaceSubtle }]}>
                {member.scans > 0 && (
                  <View
                    style={[
                      styles.barSegment,
                      { width: `${scansWidth}%`, backgroundColor: '#2563EB' },
                    ]}
                  />
                )}
                {member.meetings > 0 && (
                  <View
                    style={[
                      styles.barSegment,
                      { width: `${meetingsWidth}%`, backgroundColor: '#10B981' },
                    ]}
                  />
                )}
                {member.followUps > 0 && (
                  <View
                    style={[
                      styles.barSegment,
                      { width: `${followUpsWidth}%`, backgroundColor: '#F59E0B' },
                    ]}
                  />
                )}
              </View>

              {/* Sub Metrics Breakdown */}
              <View style={styles.breakdownRow}>
                <AppText variant="caption" color="muted">
                  <AppText variant="caption" weight="semibold" color="primary">
                    {member.scans}
                  </AppText>{' '}
                  scans
                </AppText>
                <AppText variant="caption" color="muted">
                  •
                </AppText>
                <AppText variant="caption" color="muted">
                  <AppText variant="caption" weight="semibold" color="success">
                    {member.meetings}
                  </AppText>{' '}
                  meetings
                </AppText>
                <AppText variant="caption" color="muted">
                  •
                </AppText>
                <AppText variant="caption" color="muted">
                  <AppText variant="caption" weight="semibold" color="warning">
                    {member.followUps}
                  </AppText>{' '}
                  follow-ups
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  list: {
    gap: Spacing.xs + 4,
  },
  memberCard: {
    gap: 6,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  memberRight: {
    alignItems: 'flex-end',
  },
  stackedTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  barSegment: {
    height: '100%',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
