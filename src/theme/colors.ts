import { ColorTokens } from './tokens';

export const Colors = {
  light: {
    // Primary requested tokens
    background: ColorTokens.light.background,
    surface: ColorTokens.light.surface,
    surfaceElevated: ColorTokens.light.surfaceElevated,
    primary: ColorTokens.light.primary,
    primarySubtle: ColorTokens.light.primarySubtle,
    secondary: ColorTokens.light.secondary,
    textPrimary: ColorTokens.light.textPrimary,
    textSecondary: ColorTokens.light.textSecondary,
    textMuted: ColorTokens.light.textMuted,
    border: ColorTokens.light.border,
    success: ColorTokens.light.success,
    warning: ColorTokens.light.warning,
    danger: ColorTokens.light.danger,
    info: ColorTokens.light.info,

    // Backward-compatibility aliases
    text: ColorTokens.light.textPrimary,
    card: ColorTokens.light.surface,
    backgroundElement: ColorTokens.light.secondary,
    backgroundSelected: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    primaryForeground: '#FFFFFF',
    primaryHover: '#4338CA',
    successBackground: '#ECFDF5',
    warningBackground: '#FFFBEB',
    dangerBackground: '#FEF2F2',
    infoBackground: '#F0F9FF',
    successSubtle: '#ECFDF5',
    warningSubtle: '#FFFBEB',
    dangerSubtle: '#FEF2F2',
  },
  dark: {
    // Primary requested tokens
    background: ColorTokens.dark.background,
    surface: ColorTokens.dark.surface,
    surfaceElevated: ColorTokens.dark.surfaceElevated,
    primary: ColorTokens.dark.primary,
    primarySubtle: ColorTokens.dark.primarySubtle,
    secondary: ColorTokens.dark.secondary,
    textPrimary: ColorTokens.dark.textPrimary,
    textSecondary: ColorTokens.dark.textSecondary,
    textMuted: ColorTokens.dark.textMuted,
    border: ColorTokens.dark.border,
    success: ColorTokens.dark.success,
    warning: ColorTokens.dark.warning,
    danger: ColorTokens.dark.danger,
    info: ColorTokens.dark.info,

    // Backward-compatibility aliases
    text: ColorTokens.dark.textPrimary,
    card: ColorTokens.dark.surface,
    backgroundElement: '#131B2B',
    backgroundSelected: ColorTokens.dark.surfaceElevated,
    borderSubtle: '#162032',
    primaryForeground: '#FFFFFF',
    primaryHover: '#4F46E5',
    successBackground: '#064E3B33',
    warningBackground: '#78350F33',
    dangerBackground: '#7F1D1D33',
    infoBackground: '#0C4A6E33',
    successSubtle: '#064E3B33',
    warningSubtle: '#78350F33',
    dangerSubtle: '#7F1D1D33',
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = Record<keyof typeof Colors.light, string>;
export type ColorKey = keyof typeof Colors.light;
export type SemanticColorKey = keyof typeof ColorTokens.light;
