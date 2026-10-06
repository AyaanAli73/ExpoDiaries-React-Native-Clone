import { AnimationTokens } from './tokens';

export const Animation = {
  // Primary duration tokens (ms)
  fast: AnimationTokens.duration.fast,
  normal: AnimationTokens.duration.normal,
  slow: AnimationTokens.duration.slow,

  duration: AnimationTokens.duration,
  easing: AnimationTokens.easing,

  // Reanimated presets
  spring: {
    snappy: { damping: 20, stiffness: 350 },
    gentle: { damping: 15, stiffness: 200 },
    bouncy: { damping: 12, stiffness: 250 },
  },
} as const;

export type AnimationDuration = keyof typeof AnimationTokens.duration;
