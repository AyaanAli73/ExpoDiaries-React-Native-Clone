import { create } from 'zustand';

import { Workspace } from '@/types/user';

export type ThemePreference = 'system' | 'light' | 'dark';
export type DensityPreference = 'compact' | 'comfortable';

interface AppState {
  // Theme & Appearance
  themePreference: ThemePreference;
  density: DensityPreference;
  setThemePreference: (pref: ThemePreference) => void;
  setDensity: (density: DensityPreference) => void;

  // Active Context
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  activeWorkspace: Workspace;
  setActiveWorkspace: (ws: Workspace) => void;

  // Layout & Navigation State
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;

  // Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  themePreference: 'system',
  density: 'compact',
  setThemePreference: (pref) => set({ themePreference: pref }),
  setDensity: (density) => set({ density }),

  activeEventId: 'evt-2026-ces',
  setActiveEventId: (id) => set({ activeEventId: id }),

  activeWorkspace: {
    id: 'ws-acme',
    name: 'Acme Systems Core',
    slug: 'acme-systems',
    plan: 'enterprise',
    memberCount: 18,
  },
  setActiveWorkspace: (ws) => set({ activeWorkspace: ws }),

  isSidebarExpanded: true,
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: null,
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
}));
