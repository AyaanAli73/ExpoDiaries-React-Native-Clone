import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  Chip,
  Icon,
} from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  useAddLeadAttachment,
  useDeleteLeadAttachment,
} from '@/hooks/use-leads';
import { Colors, Radius, Spacing } from '@/theme';
import { Attachment, CreateAttachmentInput } from '@/types/attachment';
import { LeadPhotoAttachmentManager } from './lead-photo-attachment-manager';
import { LeadVoiceNoteCard } from './lead-voice-note-card';
import { VoiceNoteRecorder } from './voice-note-recorder';

interface LeadAttachmentsHubProps {
  leadId: string;
  eventId?: string;
  attachments: Attachment[];
  cardImageUri?: string;
  cardBackImageUri?: string;
  onToastMessage?: (msg: string) => void;
}

export function LeadAttachmentsHub({
  leadId,
  eventId,
  attachments,
  cardImageUri,
  cardBackImageUri,
  onToastMessage,
}: LeadAttachmentsHubProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const addAttachmentMutation = useAddLeadAttachment();
  const deleteAttachmentMutation = useDeleteLeadAttachment();

  const [activeTab, setActiveTab] = useState<'all' | 'audio' | 'photo'>('all');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const audioAttachments = attachments.filter((a) => a.fileType === 'audio');
  const photoAttachments = attachments.filter((a) => a.fileType === 'image');
  const totalAttachmentsCount = attachments.length + (cardImageUri ? 1 : 0);

  // 1. SAVE VOICE NOTE ATTACHMENT
  const handleSaveVoiceNote = async (
    audioUri: string,
    durationSeconds: number,
    transcript?: string,
    waveform?: number[]
  ) => {
    try {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: 'numeric',
      }).format(now);
      const fileName = `Audio Memo (${timeStr})`;

      await addAttachmentMutation.mutateAsync({
        leadId,
        eventId,
        fileName,
        fileType: 'audio',
        fileUri: audioUri,
        durationSeconds,
        waveform,
        transcript,
        mimeType: 'audio/m4a',
        fileSize: Math.round(durationSeconds * 32000), // ~32KB/sec AAC
        uploadedBy: 'Sales Representative',
        source: 'microphone',
      });

      setShowVoiceRecorder(false);
      onToastMessage?.('Voice note attached to lead profile.');
    } catch {
      onToastMessage?.('Failed to save voice memo.');
    }
  };

  // 2. ATTACH PHOTO
  const handleAttachPhoto = async (input: CreateAttachmentInput) => {
    try {
      await addAttachmentMutation.mutateAsync(input);
      onToastMessage?.(`Attached photo: ${input.fileName}`);
    } catch {
      onToastMessage?.('Failed to attach photo.');
    }
  };

  // 3. DELETE ATTACHMENT
  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachmentMutation.mutateAsync({ attachmentId, leadId });
      onToastMessage?.('Attachment deleted.');
    } catch {
      onToastMessage?.('Failed to delete attachment.');
    }
  };

  return (
    <View style={styles.container}>
      {/* ============================================================ */}
      {/* SECTION HEADER BAR                                           */}
      {/* ============================================================ */}
      <View style={styles.hubHeader}>
        <View style={styles.hubTitleGroup}>
          <Icon name="Paperclip" size={20} color={theme.primary} />
          <View style={{ gap: 1 }}>
            <AppText weight="bold" variant="body">
              Lead Attachments
            </AppText>
            <AppText variant="caption" color="secondary">
              Voice memos, captured photos & business card scans
            </AppText>
          </View>
        </View>
        <Badge
          label={`${totalAttachmentsCount} ITEMS`}
          variant="primary"
          size="sm"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        <Chip
          label={`All (${totalAttachmentsCount})`}
          selected={activeTab === 'all'}
          onPress={() => setActiveTab('all')}
          size="sm"
        />
        <Chip
          label={`🎙️ Voice Memos (${audioAttachments.length})`}
          selected={activeTab === 'audio'}
          onPress={() => setActiveTab('audio')}
          size="sm"
        />
        <Chip
          label={`📷 Photos (${photoAttachments.length + (cardImageUri ? 1 : 0)})`}
          selected={activeTab === 'photo'}
          onPress={() => setActiveTab('photo')}
          size="sm"
        />
      </View>

      {/* ============================================================ */}
      {/* 1. VOICE RECORDING ACTION OR ACTIVE RECORDER                 */}
      {/* ============================================================ */}
      {(activeTab === 'all' || activeTab === 'audio') && (
        <Animated.View entering={FadeInDown.duration(200)}>
          {showVoiceRecorder ? (
            <VoiceNoteRecorder
              onSaveVoiceNote={handleSaveVoiceNote}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          ) : (
            <Card
              variant="outline"
              density="comfortable"
              style={[
                styles.voiceTriggerCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}>
              <CardContent style={styles.voiceTriggerContent}>
                <View style={styles.voiceTriggerInfo}>
                  <View
                    style={[
                      styles.micIconCircle,
                      { backgroundColor: theme.primarySubtle },
                    ]}>
                    <Icon name="Mic" size={20} color={theme.primary} />
                  </View>
                  <View style={{ gap: 2, flex: 1 }}>
                    <AppText weight="bold" variant="body">
                      Record On-Floor Voice Memo
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      Capture high-speed spoken context with pause, playback & AI speech transcript.
                    </AppText>
                  </View>
                </View>
                <Button
                  label="Record Memo"
                  variant="primary"
                  size="sm"
                  leftIcon="Mic"
                  onPress={() => setShowVoiceRecorder(true)}
                />
              </CardContent>
            </Card>
          )}

          {/* List of existing saved voice note attachments */}
          {audioAttachments.length > 0 && (
            <View style={styles.voiceNotesList}>
              <AppText variant="caption" weight="bold" color="secondary">
                SAVED VOICE MEMOS ({audioAttachments.length})
              </AppText>
              {audioAttachments.map((att) => (
                <LeadVoiceNoteCard
                  key={att.id}
                  attachmentId={att.id}
                  fileName={att.fileName}
                  voiceNoteUri={att.fileUri}
                  durationSeconds={att.durationSeconds || 14}
                  waveform={att.waveform}
                  transcript={att.transcript}
                  recordedAt={att.uploadedAt}
                  onDelete={() => {
                    Alert.alert(
                      'Delete Voice Memo',
                      `Are you sure you want to delete "${att.fileName}"?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => handleDeleteAttachment(att.id),
                        },
                      ]
                    );
                  }}
                />
              ))}
            </View>
          )}
        </Animated.View>
      )}

      {/* ============================================================ */}
      {/* 2. PHOTO ATTACHMENTS (Camera & Gallery)                      */}
      {/* ============================================================ */}
      {(activeTab === 'all' || activeTab === 'photo') && (
        <Animated.View entering={FadeInDown.duration(200).delay(60)}>
          <LeadPhotoAttachmentManager
            leadId={leadId}
            eventId={eventId}
            attachments={attachments}
            onAttachPhoto={handleAttachPhoto}
            onDeleteAttachment={handleDeleteAttachment}
            cardImageUri={cardImageUri}
            cardBackImageUri={cardBackImageUri}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    width: '100%',
  },
  hubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  hubTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  voiceTriggerCard: {
    borderRadius: Radius.large,
  },
  voiceTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  voiceTriggerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    minWidth: 220,
  },
  micIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceNotesList: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
