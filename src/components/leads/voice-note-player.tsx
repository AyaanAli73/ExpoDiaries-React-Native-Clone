import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { AppText, Icon, IconButton } from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Radius, Spacing } from '@/theme';

interface VoiceNotePlayerProps {
  audioUri: string;
  durationSeconds?: number;
  waveform?: number[];
  transcript?: string;
  onDelete?: () => void;
  showDelete?: boolean;
}

export function VoiceNotePlayer({
  audioUri,
  durationSeconds = 15,
  waveform,
  transcript,
  onDelete,
  showDelete = false,
}: VoiceNotePlayerProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  // Initialize native Expo Audio player
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);
  const playerStatus = useAudioPlayerStatus(player);

  const [fallbackPlaying, setFallbackPlaying] = useState(false);
  const [fallbackTime, setFallbackTime] = useState(0);
  const fallbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isNativePlaying = Boolean(playerStatus?.playing);
  const isPlaying = isNativePlaying || fallbackPlaying;

  const currentSeconds = playerStatus?.currentTime
    ? Math.floor(playerStatus.currentTime)
    : fallbackTime;

  const totalDuration = playerStatus?.duration
    ? Math.floor(playerStatus.duration)
    : durationSeconds;

  // Cleanup fallback timer
  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      try {
        player.pause();
      } catch {
        // Fallback
      }
      setFallbackPlaying(false);
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
    } else {
      try {
        if (currentSeconds >= totalDuration) {
          player.seekTo(0);
        }
        player.play();
      } catch {
        // Fallback simulation when audio is mock uri
        setFallbackPlaying(true);
        if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = setInterval(() => {
          setFallbackTime((prev) => {
            if (prev >= totalDuration) {
              if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
              setFallbackPlaying(false);
              return 0;
            }
            return prev + 1;
          });
        }, 1000);
      }
    }
  };

  const handleReplay = () => {
    try {
      player.seekTo(0);
      player.play();
    } catch {
      setFallbackTime(0);
      setFallbackPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 18 default bars for consistent waveform look
  const bars = waveform && waveform.length > 0
    ? waveform
    : [12, 22, 36, 18, 44, 28, 50, 32, 20, 42, 26, 48, 16, 38, 24, 30, 18, 12];

  const progressFraction = totalDuration > 0 ? Math.min(1, currentSeconds / totalDuration) : 0;
  const activeBarIndex = Math.floor(progressFraction * bars.length);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.playerBar,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}>
        {/* Play / Pause Toggle Button */}
        <IconButton
          icon={isPlaying ? 'Pause' : 'Play'}
          size="md"
          variant="primary"
          accessibilityLabel={isPlaying ? 'Pause voice memo' : 'Play voice memo'}
          onPress={handleTogglePlay}
        />

        {/* Dynamic Waveform Display */}
        <View style={styles.waveformWrap}>
          {bars.map((sampleHeight, index) => {
            const isPlayed = index <= activeBarIndex;
            return (
              <View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height: Math.max(6, Math.min(36, sampleHeight * 0.7)),
                    backgroundColor: isPlayed
                      ? theme.primary
                      : theme.border,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Duration / Progress Text */}
        <AppText variant="caption" weight="semibold" style={styles.timeLabel}>
          {formatTime(currentSeconds)} / {formatTime(totalDuration)}
        </AppText>

        {/* Replay Button */}
        <IconButton
          icon="RotateCcw"
          size="sm"
          variant="ghost"
          accessibilityLabel="Replay audio memo"
          onPress={handleReplay}
        />

        {/* Delete Button */}
        {showDelete && onDelete && (
          <IconButton
            icon="Trash2"
            size="sm"
            variant="ghost"
            accessibilityLabel="Delete voice memo"
            onPress={onDelete}
          />
        )}
      </View>

      {/* AI Transcript if available */}
      {Boolean(transcript) && (
        <View
          style={[
            styles.transcriptBox,
            { backgroundColor: theme.secondary, borderColor: theme.border },
          ]}>
          <View style={styles.transcriptHeader}>
            <Icon name="Sparkles" size={13} color={theme.primary} />
            <AppText variant="caption" weight="bold" style={{ color: theme.primary }}>
              AI Voice Note Transcript
            </AppText>
          </View>
          <AppText variant="caption" color="secondary" style={styles.transcriptText}>
            “{transcript}”
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
    width: '100%',
  },
  playerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  waveformWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    gap: 3,
    paddingHorizontal: 4,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
  },
  timeLabel: {
    fontVariant: ['tabular-nums'],
    minWidth: 70,
    textAlign: 'center',
  },
  transcriptBox: {
    padding: Spacing.sm,
    borderRadius: Radius.medium,
    borderWidth: 1,
    gap: 4,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transcriptText: {
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
