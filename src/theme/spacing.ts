import { Platform } from 'react-native';

import { SpacingTokens } from './tokens';

export const Breakpoints = {
  phone: 0,
  phoneLarge: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

export const Spacing = {
  // Primary tokens
  xs: SpacingTokens.xs,
  sm: SpacingTokens.sm,
  md: SpacingTokens.md,
  lg: SpacingTokens.lg,
  xl: SpacingTokens.xl,
  '2xl': SpacingTokens['2xl'],

  // Numeric and legacy aliases
  half: 2,
  one: SpacingTokens.xs,
  two: SpacingTokens.sm,
  three: SpacingTokens.md,
  four: SpacingTokens.lg,
  five: SpacingTokens.xl,
  six: SpacingTokens['2xl'],
  seven: 64,
} as const;

export type SpacingKey = keyof typeof SpacingTokens;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 1200;
