import { RadiusTokens } from './tokens';

export const Radius = {
  // Primary tokens
  small: RadiusTokens.small,
  medium: RadiusTokens.medium,
  large: RadiusTokens.large,
  pill: RadiusTokens.pill,

  // Size scale aliases
  xs: 4,
  sm: RadiusTokens.small,
  md: RadiusTokens.medium,
  lg: RadiusTokens.large,
  xl: 20,
  full: RadiusTokens.pill,
} as const;

export const Radii = Radius;

export type RadiusKey = keyof typeof RadiusTokens;
