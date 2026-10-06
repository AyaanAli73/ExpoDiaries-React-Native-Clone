/**
 * ExpoDiaries Design System Central Tokens
 * Single source of truth for Colors, Typography, Spacing, Radius, Shadows, and Animation.
 * Consumed by both TypeScript (src/theme) and NativeWind (tailwind.config.js).
 */

export const SpacingTokens = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const RadiusTokens = {
  small: 6,
  medium: 10,
  large: 16,
  pill: 9999,
} as const;

export const AnimationTokens = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: { damping: 15, stiffness: 300 },
  },
} as const;

export const TypographyTokens = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
  },
  heading: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
} as const;

export const ColorTokens = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    primary: '#4F46E5',
    primarySubtle: '#EEF2FF',
    secondary: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#0EA5E9',
  },
  dark: {
    background: '#0B0F17',
    surface: '#111827',
    surfaceElevated: '#1E293B',
    primary: '#6366F1',
    primarySubtle: '#312E814D',
    secondary: '#1F2937',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#1E293B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',
  },
} as const;
