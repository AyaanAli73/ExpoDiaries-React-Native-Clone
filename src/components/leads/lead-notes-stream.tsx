import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

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
  Icon,
  Input,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAddLeadNote, useLeadNotes } from '@/hooks/use-leads';
import { Colors, Radius, Spacing } from '@/theme';

interface LeadNotesStreamProps {
  leadId: string;
}

const NOTE_MACROS = [
  'Met at booth #N-408',
  'Send enterprise pricing deck',
  'Requested Zoom demo next week',
  'High buying intent - follow up ASAP',
  'Needs SOC2 compliance package',
];

export function LeadNotesStream({ leadId }: LeadNotesStreamProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const { data: notes = [] } = useLeadNotes(leadId);
  const addNoteMutation = useAddLeadNote();

  const [newNoteText, setNewNoteText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleAddNote = async (text?: string) => {
    const content = text || newNoteText;
    if (!content.trim()) return;

    await addNoteMutation.mutateAsync({
      leadId,
      authorId: 'usr-1',
      authorName: 'Alex Mercer',
      content: content.trim(),
      isPrivate,
    });

    setNewNoteText('');
  };

  const formatNoteTime = (isoString: string) => {
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
          <Icon name="FileText" size={18} color={theme.primary} />
          <CardTitle level={2}>Field Notes & Observations</CardTitle>
          <Badge label={`${notes.length}`} variant="outline" size="sm" />
        </View>
      </CardHeader>

      <CardContent style={styles.content}>
        {/* Quick Macro Note Chips for Sub-Second Trade Show Notation */}
        <View style={styles.macrosSection}>
          <AppText variant="caption" color="secondary">
            Quick 1-Tap Trade-Show Notes:
          </AppText>
          <View style={styles.macrosWrapRow}>
            {NOTE_MACROS.map((macro) => (
              <Chip
                key={macro}
                label={macro}
                onPress={() => handleAddNote(macro)}
                size="sm"
              />
            ))}
          </View>
        </View>

        {/* Note Composer */}
        <View style={styles.composerBox}>
          <Input
            placeholder="Add detailed on-floor note or observation…"
            value={newNoteText}
            onChangeText={setNewNoteText}
            multiline
            numberOfLines={2}
          />
          <View style={styles.composerActionsRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isPrivate }}
              accessibilityLabel="Mark note as private"
              onPress={() => setIsPrivate(!isPrivate)}
              style={styles.privateToggle}>
              <Icon
                name={isPrivate ? 'Lock' : 'Unlock'}
                size={14}
                color={isPrivate ? theme.warning : theme.textMuted}
              />
              <AppText variant="caption" color={isPrivate ? undefined : 'secondary'}>
                {isPrivate ? 'Internal / Private' : 'Shared Note'}
              </AppText>
            </Pressable>

            <Button
              label={addNoteMutation.isPending ? 'Saving…' : 'Post Note'}
              variant="primary"
              size="sm"
              disabled={!newNoteText.trim() || addNoteMutation.isPending}
              loading={addNoteMutation.isPending}
              onPress={() => handleAddNote()}
            />
          </View>
        </View>

        {/* Notes Stream */}
        {notes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText variant="caption" color="secondary">
              No notes recorded yet. Tap a quick-note chip above to capture observations.
            </AppText>
          </View>
        ) : (
          <View style={styles.notesList}>
            {notes.map((note) => (
              <View
                key={note.id}
                style={[
                  styles.noteItem,
                  { backgroundColor: theme.secondary, borderColor: theme.border },
                ]}>
                <View style={styles.noteAuthorRow}>
                  <View style={styles.authorGroup}>
                    <Avatar name={note.authorName} size="xs" />
                    <AppText weight="bold" variant="caption">
                      {note.authorName}
                    </AppText>
                  </View>
                  <View style={styles.noteMetaRow}>
                    {note.isPrivate && (
                      <Badge label="PRIVATE" variant="warning" size="sm" />
                    )}
                    <AppText variant="caption" color="muted" style={{ fontSize: 11 }}>
                      {formatNoteTime(note.createdAt)}
                    </AppText>
                  </View>
                </View>

                <AppText variant="body" style={styles.noteContentText}>
                  {note.content}
                </AppText>
              </View>
            ))}
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
    gap: Spacing.md,
  },
  macrosSection: {
    gap: Spacing.xs,
  },
  macrosWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  composerBox: {
    gap: Spacing.xs,
  },
  composerActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  privateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  notesList: {
    gap: Spacing.sm,
  },
  noteItem: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: 6,
  },
  noteAuthorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteContentText: {
    lineHeight: 20,
  },
});
