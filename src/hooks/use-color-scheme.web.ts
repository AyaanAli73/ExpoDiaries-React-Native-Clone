import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppStore } from '@/stores';

const emptySubscribe = () => () => {};

/**
 * Hydration-safe color scheme resolver for Web
 * Uses useSyncExternalStore to eliminate cascading renders and ESLint warnings.
 */
export function useColorScheme(): 'light' | 'dark' {
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const deviceScheme = useRNColorScheme();
  const themePreference = useAppStore((state) => state.themePreference);

  if (!hasHydrated) {
    return 'light';
  }

  if (themePreference === 'system') {
    return deviceScheme === 'dark' ? 'dark' : 'light';
  }

  return themePreference;
}
