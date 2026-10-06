import { create } from 'zustand';

interface EventStoreState {
  bookmarkedSessionIds: Set<string>;
  toggleBookmark: (sessionId: string) => void;
  isBookmarked: (sessionId: string) => boolean;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  bookmarkedSessionIds: new Set(['itin-1', 'itin-2', 'itin-4']),
  toggleBookmark: (sessionId) =>
    set((state) => {
      const next = new Set(state.bookmarkedSessionIds);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return { bookmarkedSessionIds: next };
    }),
  isBookmarked: (sessionId) => get().bookmarkedSessionIds.has(sessionId),
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
