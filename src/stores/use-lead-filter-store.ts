import { create } from 'zustand';

import { LeadFilter, LeadPriority, LeadStatus } from '@/types/lead';

interface LeadFilterState {
  filter: LeadFilter;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status?: LeadStatus) => void;
  setPriorityFilter: (priority?: LeadPriority) => void;
  setTagFilter: (tag?: string) => void;
  setSortBy: (sortBy: 'createdAt' | 'score' | 'company' | 'name' | 'priority', order?: 'asc' | 'desc') => void;
  setEventId: (eventId?: string) => void;
  resetFilters: () => void;
}

const initialFilter: LeadFilter = {
  eventId: 'evt-2026-ces',
  query: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useLeadFilterStore = create<LeadFilterState>((set) => ({
  filter: initialFilter,
  setSearchQuery: (query) =>
    set((state) => ({ filter: { ...state.filter, query: query || undefined } })),
  setStatusFilter: (status) =>
    set((state) => ({ filter: { ...state.filter, status } })),
  setPriorityFilter: (priority) =>
    set((state) => ({ filter: { ...state.filter, priority } })),
  setTagFilter: (tag) =>
    set((state) => ({ filter: { ...state.filter, tag } })),
  setSortBy: (sortBy, order = 'desc') =>
    set((state) => ({ filter: { ...state.filter, sortBy, sortOrder: order } })),
  setEventId: (eventId) =>
    set((state) => ({ filter: { ...state.filter, eventId } })),
  resetFilters: () => set({ filter: initialFilter }),
}));
