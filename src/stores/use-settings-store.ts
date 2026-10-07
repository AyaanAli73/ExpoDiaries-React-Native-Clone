import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';
export type DefaultLeadTemperature = 'hot' | 'warm' | 'cold';

interface SettingsState {
  themeMode: ThemeMode;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  autoFlashEnabled: boolean;
  autoCropEnabled: boolean;
  defaultTemperature: DefaultLeadTemperature;
  followUpSlaDays: number;
  anonymizeExports: boolean;
  telemetryEnabled: boolean;
  cacheSizeBytes: number;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleHaptics: () => void;
  toggleSound: () => void;
  toggleAutoFlash: () => void;
  toggleAutoCrop: () => void;
  setDefaultTemperature: (temp: DefaultLeadTemperature) => void;
  setFollowUpSlaDays: (days: number) => void;
  toggleAnonymizeExports: () => void;
  toggleTelemetry: () => void;
  clearCache: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'system',
  hapticsEnabled: true,
  soundEnabled: true,
  autoFlashEnabled: false,
  autoCropEnabled: true,
  defaultTemperature: 'warm',
  followUpSlaDays: 2,
  anonymizeExports: false,
  telemetryEnabled: true,
  cacheSizeBytes: 15480000, // ~15.4 MB

  setThemeMode: (themeMode) => set({ themeMode }),
  toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleAutoFlash: () => set((s) => ({ autoFlashEnabled: !s.autoFlashEnabled })),
  toggleAutoCrop: () => set((s) => ({ autoCropEnabled: !s.autoCropEnabled })),
  setDefaultTemperature: (defaultTemperature) => set({ defaultTemperature }),
  setFollowUpSlaDays: (followUpSlaDays) => set({ followUpSlaDays }),
  toggleAnonymizeExports: () => set((s) => ({ anonymizeExports: !s.anonymizeExports })),
  toggleTelemetry: () => set((s) => ({ telemetryEnabled: !s.telemetryEnabled })),
  clearCache: async () => {
    await new Promise((r) => setTimeout(r, 400));
    set({ cacheSizeBytes: 0 });
  },
}));
