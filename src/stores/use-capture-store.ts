import { create } from 'zustand';

import { CreateLeadInput, LeadCaptureSource } from '@/types/lead';

interface CaptureState {
  activeMode: LeadCaptureSource;
  setActiveMode: (mode: LeadCaptureSource) => void;
  pendingQueue: CreateLeadInput[];
  addToQueue: (lead: CreateLeadInput) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  isSyncing: boolean;
  setIsSyncing: (syncing: boolean) => void;
  lastSyncTime: string | null;
  setLastSyncTime: (time: string) => void;
}

export const useCaptureStore = create<CaptureState>((set) => ({
  activeMode: 'badge_scan',
  setActiveMode: (mode) => set({ activeMode: mode }),
  pendingQueue: [],
  addToQueue: (lead) =>
    set((state) => ({ pendingQueue: [lead, ...state.pendingQueue] })),
  removeFromQueue: (index) =>
    set((state) => ({
      pendingQueue: state.pendingQueue.filter((_, i) => i !== index),
    })),
  clearQueue: () => set({ pendingQueue: [] }),
  isScanning: false,
  setIsScanning: (scanning) => set({ isScanning: scanning }),
  isSyncing: false,
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  lastSyncTime: null,
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
}));
