import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  AppText,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  IconButton,
} from '@/components/ui';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing } from '@/theme';
import { VoiceNotePlayer } from './voice-note-player';

interface VoiceNoteRecorderProps {
  onSaveVoiceNote: (
    audioUri: string,
    durationSeconds: number,
    transcript?: string,
    waveform?: number[]
  ) => void;
  onCancel?: () => void;
  title?: string;
}

const SAMPLE_TRANSCRIPTS = [
  'Spoke with attendee at booth. Strong interest in enterprise tier with 150+ seats by end of quarter. Requesting technical security compliance pack and pricing proposal by Monday.',
  'VP of Technology confirmed active RFP. Budget approved up to $150k. Wants demo meeting with sales engineer next Tuesday at 2 PM.',
  'Lead attended our stage keynote. Looking to migrate legacy SAP data into our cloud platform. Follow up with case studies in automotive manufacturing.',
  'Quick booth conversation regarding APAC distribution rights. Connect with VP of Global Partnerships before Friday.',
];

export function VoiceNoteRecorder({
  onSaveVoiceNote,
  onCancel,
  title = 'Voice Note Memo',
}: VoiceNoteRecorderProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const {
    isRecording,
    isPaused,
    durationSeconds,
    waveformSamples,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [finalDuration, setFinalDuration] = useState(0);
  const [finalWaveform, setFinalWaveform] = useState<number[]>([]);
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Pulse animation for recording ring
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.25, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleStart = async () => {
    setHasRecorded(false);
    setRecordedUri(null);
    setTranscript('');
    await startRecording();
  };

  const handlePause = async () => {
    await pauseRecording();
  };

  const handleResume = async () => {
    await resumeRecording();
  };

  const handleStop = async () => {
    const uri = await stopRecording();
    const dur = Math.max(durationSeconds, 2);
    setFinalDuration(dur);
    setRecordedUri(uri);
    setHasRecorded(true);

    const capturedWave = waveformSamples.length > 0
      ? waveformSamples
      : [14, 28, 44, 20, 56, 78, 38, 62, 28, 48, 70, 34, 52, 22, 42, 66, 30, 24, 40, 16];
    setFinalWaveform(capturedWave);

    // AI speech-to-text transcript simulation
    setIsTranscribing(true);
    setTimeout(() => {
      setIsTranscribing(false);
      const randomTranscript =
        SAMPLE_TRANSCRIPTS[Math.floor(Math.random() * SAMPLE_TRANSCRIPTS.length)];
      setTranscript(randomTranscript);
    }, 700);
  };

  const handleDeleteOrDiscard = () => {
    Alert.alert(
      'Discard Recording?',
      'Are you sure you want to discard this voice memo?',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            resetRecording();
            setHasRecorded(false);
            setRecordedUri(null);
            setTranscript('');
          },
        },
      ]
    );
  };

  const handleSave = () => {
    if (!recordedUri) return;
    onSaveVoiceNote(recordedUri, finalDuration, transcript, finalWaveform);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // State Badge Label and Variant
  const stateBadge = isRecording
    ? { label: 'RECORDING', variant: 'danger' as const, showDot: true }
    : isPaused
      ? { label: 'PAUSED', variant: 'warning' as const, showDot: false }
      : hasRecorded
        ? { label: 'REVIEW READY', variant: 'success' as const, showDot: false }
        : { label: 'IDLE', variant: 'outline' as const, showDot: false };

  return (
    <Card variant="elevated" density="comfortable" style={styles.recorderCard}>
      <CardHeader style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Icon
            name="Mic"
            size={18}
            color={isRecording ? theme.danger : isPaused ? theme.warning : theme.primary}
          />
          <CardTitle level={2}>{title}</CardTitle>
        </View>
        <Badge
          label={stateBadge.label}
          variant={stateBadge.variant}
          showDot={stateBadge.showDot}
          size="sm"
        />
      </CardHeader>

      <CardContent style={styles.cardContent}>
        {/* ============================================================ */}
        {/* VIEW 1: RECORDING IN PROGRESS OR IDLE                        */}
        {/* ============================================================ */}
        {!hasRecorded ? (
          <View style={styles.recordingCenter}>
            {/* Center Mic Button with Pulse Ring */}
            <View style={styles.micCircleWrapper}>
              {isRecording && (
                <Animated.View
                  style={[
                    styles.pulseRing,
                    { borderColor: theme.danger, backgroundColor: theme.dangerSubtle },
                    pulseStyle,
                  ]}
                />
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  isRecording
                    ? 'Recording in progress'
                    : isPaused
                      ? 'Resume recording'
                      : 'Start recording'
                }
                onPress={
                  isRecording
                    ? handlePause
                    : isPaused
                      ? handleResume
                      : handleStart
                }
                style={({ pressed }) => [
                  styles.recordButton,
                  {
                    backgroundColor: isRecording
                      ? theme.danger
                      : isPaused
                        ? theme.warning
                        : theme.primary,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}>
                <Icon
                  name={isRecording ? 'Pause' : isPaused ? 'Play' : 'Mic'}
                  size={32}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            {/* Live Timer Display */}
            <AppText
              variant="heading"
              weight="bold"
              style={[
                styles.timerText,
                { color: isRecording ? theme.danger : isPaused ? theme.warning : theme.text },
              ]}>
              {formatTime(durationSeconds)}
            </AppText>

            {/* Status Guidance Subtext */}
            <AppText variant="caption" color="secondary" style={styles.statusSubtext}>
              {isRecording
                ? 'Speaking… Tap pause to pause or square below to finish'
                : isPaused
                  ? 'Recording paused. Tap microphone to resume'
                  : 'Tap the blue microphone to speak booth observations'}
            </AppText>

            {/* Live Dynamic Waveform Representation */}
            <View style={styles.waveformContainer}>
              {(waveformSamples.length > 0
                ? waveformSamples
                : [10, 16, 24, 14, 20, 28, 12, 18, 22, 14, 26, 16, 20, 12, 18, 10]
              ).map((height, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: isRecording || isPaused ? Math.max(8, height) : 6,
                      backgroundColor: isRecording
                        ? theme.danger
                        : isPaused
                          ? theme.warning
                          : theme.border,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Controls Bar */}
            <View style={styles.recordControlsRow}>
              {isRecording || isPaused ? (
                <>
                  <IconButton
                    icon="Trash2"
                    size="md"
                    variant="outline"
                    accessibilityLabel="Discard recording"
                    onPress={handleDeleteOrDiscard}
                  />

                  {isRecording ? (
                    <Button
                      label="Pause"
                      variant="outline"
                      size="md"
                      leftIcon="Pause"
                      onPress={handlePause}
                    />
                  ) : (
                    <Button
                      label="Resume"
                      variant="outline"
                      size="md"
                      leftIcon="Play"
                      onPress={handleResume}
                    />
                  )}

                  <Button
                    label="Done"
                    variant="primary"
                    size="md"
                    leftIcon="Square"
                    onPress={handleStop}
                  />
                </>
              ) : (
                onCancel && (
                  <Button
                    label="Cancel"
                    variant="ghost"
                    size="sm"
                    onPress={onCancel}
                    style={{ width: '100%' }}
                  />
                )
              )}
            </View>
          </View>
        ) : (
          /* ============================================================ */
          /* VIEW 2: COMPLETED RECORDING PLAYBACK & REVIEW                */
          /* ============================================================ */
          <View style={styles.reviewCenter}>
            {recordedUri && (
              <VoiceNotePlayer
                audioUri={recordedUri}
                durationSeconds={finalDuration}
                waveform={finalWaveform}
                transcript={isTranscribing ? 'Generating speech-to-text transcript…' : transcript}
              />
            )}

            {/* Review Action Controls */}
            <View style={styles.reviewActionsRow}>
              <IconButton
                icon="Trash2"
                size="md"
                variant="outline"
                accessibilityLabel="Delete recorded memo"
                onPress={handleDeleteOrDiscard}
              />

              <Button
                label="Re-record"
                variant="outline"
                size="sm"
                leftIcon="RotateCcw"
                onPress={handleStart}
              />

              <Button
                label="Save & Attach"
                variant="primary"
                size="sm"
                leftIcon="Check"
                onPress={handleSave}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  recorderCard: {
    borderRadius: Radius.large,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardContent: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  recordingCenter: {
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
    paddingVertical: Spacing.xs,
  },
  micCircleWrapper: {
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: Spacing.xs,
  },
  pulseRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
  },
  recordButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  timerText: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  statusSubtext: {
    textAlign: 'center',
    maxWidth: 280,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    gap: 3.5,
    width: '100%',
    paddingHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
  },
  recordControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    paddingTop: Spacing.xs,
  },
  reviewCenter: {
    width: '100%',
    gap: Spacing.md,
  },
  reviewActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
});
