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
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing } from '@/theme';
import { VoiceNotePlayer } from './voice-note-player';

interface LeadVoiceNoteCardProps {
  voiceNoteUri: string;
  durationSeconds?: number;
  waveform?: number[];
  transcript?: string;
  recordedAt?: string;
  attachmentId?: string;
  fileName?: string;
  onDelete?: () => void;
}

export function LeadVoiceNoteCard({
  voiceNoteUri,
  durationSeconds = 14,
  waveform,
  transcript,
  recordedAt,
  fileName = 'Audio Memo',
  onDelete,
}: LeadVoiceNoteCardProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formattedDate = React.useMemo(() => {
    if (!recordedAt) return null;
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(recordedAt));
    } catch {
      return null;
    }
  }, [recordedAt]);

  return (
    <Card variant="outline" density="comfortable" style={styles.card}>
      <CardHeader style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="Mic" size={18} color={theme.primary} />
          <View style={{ flex: 1, gap: 1 }}>
            <CardTitle level={2}>{fileName}</CardTitle>
            {formattedDate && (
              <AppText variant="caption" color="secondary">
                Recorded {formattedDate}
              </AppText>
            )}
          </View>
          <Badge label={formatDuration(durationSeconds)} variant="primary" size="sm" />
        </View>
      </CardHeader>

      <CardContent style={styles.content}>
        <VoiceNotePlayer
          audioUri={voiceNoteUri}
          durationSeconds={durationSeconds}
          waveform={waveform}
          transcript={transcript}
          onDelete={onDelete}
          showDelete={Boolean(onDelete)}
        />
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    width: '100%',
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
    gap: Spacing.sm,
  },
});
