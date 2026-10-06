import { Colors, ThemeColors } from './colors';
import { Spacing } from './spacing';
import { Radius } from './radius';
import { Typography } from './typography';
import { Shadows } from './shadows';
import { Animation } from './animation';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
}

export function useTheme(): ThemeColors & { isDark: boolean; colorScheme: 'light' | 'dark' } {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return {
    ...colors,
    isDark: scheme === 'dark',
    colorScheme: scheme,
  };
}

export function useTokens() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return {
    colors,
    spacing: Spacing,
    radius: Radius,
    typography: Typography,
    shadows: Shadows,
    animation: Animation,
    isDark: scheme === 'dark',
    colorScheme: scheme,
  };
}
