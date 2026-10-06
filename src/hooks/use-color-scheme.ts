import { useColorScheme as useDeviceColorScheme } from 'react-native';

import { useAppStore } from '@/stores';

export function useColorScheme(): 'light' | 'dark' {
  const deviceScheme = useDeviceColorScheme();
  const themePreference = useAppStore((state) => state.themePreference);

  if (themePreference === 'system') {
    return deviceScheme === 'dark' ? 'dark' : 'light';
  }

  return themePreference;
}
