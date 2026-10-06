import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import {
  AppText,
  Avatar,
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Icon,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing } from '@/theme';
import { Lead } from '@/types/lead';

interface LeadCardProps {
  lead: Lead;
  onPress?: () => void;
}

export function LeadCard({ lead, onPress }: LeadCardProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/leads/${lead.id}`);
    }
  };

  // Format captured time with Intl.DateTimeFormat
  const formattedCapturedTime = React.useMemo(() => {
    try {
      const date = new Date(lead.createdAt);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const timeFormatter = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: 'numeric',
      });

      if (isToday) {
        return `Today, ${timeFormatter.format(date)}`;
      }

      const dateFormatter = new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
      return dateFormatter.format(date);
    } catch {
      return lead.createdAt;
    }
  }, [lead.createdAt]);

  // Temperature configuration
  const temp = lead.temperature || (lead.score >= 75 ? 'hot' : lead.score >= 40 ? 'warm' : 'cold');
  const tempConfig = {
    hot: { label: '🔥 HOT', variant: 'danger' as const },
    warm: { label: '⚡ WARM', variant: 'warning' as const },
    cold: { label: '❄️ COLD', variant: 'outline' as const },
  }[temp];

  // Follow-up status configuration
  const followUpConfig = React.useMemo(() => {
    switch (lead.followUpStatus) {
      case 'scheduled':
        return {
          label: '🗓️ Meeting Set',
          variant: 'primary' as const,
        };
      case 'pending':
        return {
          label: '⏳ Follow-up Due',
          variant: 'warning' as const,
        };
      case 'completed':
        return {
          label: '✅ Contacted',
          variant: 'success' as const,
        };
      default:
        return null;
    }
  }, [lead.followUpStatus]);

  const scoreVariant = lead.score >= 75 ? 'success' : lead.score >= 40 ? 'warning' : 'outline';

  return (
    <Card
      interactive
      density="comfortable"
      onPress={handlePress}
      style={styles.card}>
      <CardHeader style={styles.header}>
        <View style={styles.attendeeRow}>
          <Avatar
            name={`${lead.firstName} ${lead.lastName}`}
            source={lead.avatarUrl ? { uri: lead.avatarUrl } : undefined}
            size="md"
          />
          <View style={styles.identityCol}>
            <View style={styles.nameRow}>
              <CardTitle level={3} numberOfLines={1} style={styles.nameText}>
                {lead.firstName} {lead.lastName}
              </CardTitle>
            </View>
            <AppText variant="caption" color="secondary" numberOfLines={1}>
              {lead.title ? `${lead.title} • ` : ''}
              <AppText variant="caption" weight="semibold" color="primary">
                {lead.company || 'Enterprise Attendee'}
              </AppText>
            </AppText>
          </View>
        </View>

        <Badge
          label={`SCORE ${lead.score}`}
          variant={scoreVariant}
          size="sm"
        />
      </CardHeader>

      <CardContent style={styles.content}>
        {/* Event & Booth Context */}
        <View style={styles.contextRow}>
          <View style={styles.contextPill}>
            <Icon name="Calendar" size={12} color={theme.textMuted} />
            <AppText variant="caption" color="secondary" numberOfLines={1} style={styles.contextText}>
              {lead.eventName || 'CES 2026 International'}
            </AppText>
          </View>

          {lead.boothNumber && (
            <View style={styles.contextPill}>
              <Icon name="MapPin" size={12} color={theme.primary} />
              <AppText variant="caption" color="primary" numberOfLines={1} style={[styles.contextText, { color: theme.primary, fontWeight: '600' }]}>
                {lead.boothNumber}
              </AppText>
            </View>
          )}
        </View>

        {/* Lead Notes Snippet if available */}
        {Boolean(lead.notes) && (
          <View style={[styles.notesContainer, { backgroundColor: theme.secondary }]}>
            <AppText
              variant="caption"
              color="secondary"
              numberOfLines={2}
              style={styles.notesText}>
              “{lead.notes}”
            </AppText>
          </View>
        )}
      </CardContent>

      <CardFooter style={styles.footer}>
        {/* Status Indicators & Temperature */}
        <View style={styles.badgesRow}>
          <Badge
            label={tempConfig.label}
            variant={tempConfig.variant}
            size="sm"
          />

          {followUpConfig && (
            <Badge
              label={followUpConfig.label}
              variant={followUpConfig.variant}
              size="sm"
            />
          )}

          {Boolean(lead.intent) && (
            <Badge
              label={lead.intent === 'buying' ? '🛍️ BUYING' : lead.intent === 'partnership' ? '🤝 PARTNER' : lead.intent?.replace('_', ' ').toUpperCase()}
              variant="outline"
              size="sm"
            />
          )}

          {Boolean(lead.cardImageUri) && (
            <Badge label="📷 Card" variant="outline" size="sm" />
          )}

          {Boolean(lead.voiceNoteUri) && (
            <Badge label="🎙️ Memo" variant="outline" size="sm" />
          )}
        </View>

        {/* Captured Time & Assignee Info */}
        <View style={styles.metaCol}>
          <View style={styles.metaRow}>
            <Icon name="Clock" size={11} color={theme.textMuted} />
            <AppText variant="caption" color="secondary" style={styles.metaText}>
              {formattedCapturedTime}
            </AppText>
          </View>

          <View style={styles.metaRow}>
            <Icon name="User" size={11} color={theme.textMuted} />
            <AppText variant="caption" color="secondary" style={styles.metaText} numberOfLines={1}>
              {lead.assignedToName ? lead.assignedToName.split(' ')[0] : 'Unassigned'}
            </AppText>
          </View>
        </View>
      </CardFooter>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  attendeeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  identityCol: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    gap: Spacing.xs,
    paddingTop: 0,
    paddingBottom: Spacing.xs,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contextText: {
    fontSize: 12,
  },
  notesContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.small,
  },
  notesText: {
    fontStyle: 'italic',
    lineHeight: 16,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
  },
  metaCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});
