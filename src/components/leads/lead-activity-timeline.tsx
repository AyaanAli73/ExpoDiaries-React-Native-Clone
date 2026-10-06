import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  IconName,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing } from '@/theme';
import { LeadActivity, LeadActivityType } from '@/types/lead-activity';

interface LeadActivityTimelineProps {
  activities: LeadActivity[];
}

export function LeadActivityTimeline({ activities }: LeadActivityTimelineProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const getActivityConfig = (
    type: LeadActivityType
  ): { icon: IconName; color: string; badgeVariant: 'primary' | 'success' | 'warning' | 'outline' } => {
    switch (type) {
      case 'created':
      case 'scanned':
        return { icon: 'Scan', color: theme.primary, badgeVariant: 'primary' };
      case 'status_changed':
        return { icon: 'CheckCircle2', color: theme.success, badgeVariant: 'success' };
      case 'assigned':
        return { icon: 'UserCheck', color: '#6366F1', badgeVariant: 'outline' };
      case 'note_added':
        return { icon: 'FileText', color: '#8B5CF6', badgeVariant: 'outline' };
      case 'priority_changed':
        return { icon: 'Zap', color: theme.warning, badgeVariant: 'warning' };
      case 'meeting_scheduled':
        return { icon: 'Calendar', color: theme.primary, badgeVariant: 'primary' };
      case 'email_sent':
      case 'called':
        return { icon: 'PhoneCall', color: theme.success, badgeVariant: 'success' };
      default:
        return { icon: 'Activity', color: theme.textMuted, badgeVariant: 'outline' };
    }
  };

  const formatActivityTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <Card variant="outline" density="comfortable" style={styles.card}>
      <CardHeader style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="History" size={18} color={theme.primary} />
          <CardTitle level={2}>Lead Activity & Audit Trail</CardTitle>
          <Badge label={`${activities.length} EVENTS`} variant="outline" size="sm" />
        </View>
      </CardHeader>

      <CardContent style={styles.content}>
        {activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="Activity" size={24} color={theme.textMuted} />
            <AppText variant="caption" color="secondary">
              No field activities recorded for this lead yet.
            </AppText>
          </View>
        ) : (
          <View style={styles.timelineList}>
            {activities.map((act, index) => {
              const { icon, color, badgeVariant } = getActivityConfig(act.type);
              const isLast = index === activities.length - 1;

              return (
                <View key={act.id} style={styles.timelineItem}>
                  {/* Left Column: Icon & Connector Line */}
                  <View style={styles.leftCol}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.secondary, borderColor: color }]}>
                      <Icon name={icon} size={14} color={color} />
                    </View>
                    {!isLast && <View style={[styles.connectorLine, { backgroundColor: theme.border }]} />}
                  </View>

                  {/* Right Column: Activity Content */}
                  <View style={styles.rightCol}>
                    <View style={styles.activityHeaderRow}>
                      <Badge
                        label={act.type.replace('_', ' ').toUpperCase()}
                        variant={badgeVariant}
                        size="sm"
                      />
                      <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
                        {formatActivityTime(act.timestamp)}
                      </AppText>
                    </View>

                    <AppText weight="medium" variant="body" style={styles.descriptionText}>
                      {act.description}
                    </AppText>

                    <AppText variant="caption" color="secondary">
                      By {act.actorName}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
  },
  header: {
    paddingBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  content: {
    paddingTop: Spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: 6,
  },
  timelineList: {
    gap: Spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  leftCol: {
    alignItems: 'center',
    width: 28,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
    marginBottom: -8,
  },
  rightCol: {
    flex: 1,
    gap: 3,
    paddingBottom: Spacing.sm,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptionText: {
    marginTop: 1,
  },
});
