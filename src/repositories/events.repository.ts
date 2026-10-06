import { apiClient } from '@/lib/api-client';
import { mockBooths, mockHalls } from '@/repositories/mocks/booths.mock';
import { mockEvents } from '@/repositories/mocks/events.mock';
import { mockExhibitors } from '@/repositories/mocks/exhibitors.mock';
import { mockItineraryItems } from '@/repositories/mocks/itinerary.mock';
import { Booth } from '@/types/booth';
import { PaginatedResult, PaginationParams } from '@/types/common';
import { CreateEventInput, Event, UpdateEventInput } from '@/types/event';
import { Exhibitor } from '@/types/exhibitor';
import { FloorMapHall } from '@/types/floor-map';
import {
  CreateItineraryItemInput,
  ItineraryItem,
  UpdateItineraryItemInput,
} from '@/types/itinerary';
import { storageService } from '@/services/storage.service';

export interface EventFilterParams extends Partial<PaginationParams> {
  query?: string;
  status?: string;
  category?: string;
  bookmarkedOnly?: boolean;
}

export interface IEventsRepository {
  getEvents(filters?: EventFilterParams): Promise<PaginatedResult<Event>>;
  getEventById(id: string): Promise<Event | null>;
  getActiveEvent(): Promise<Event | null>;
  createEvent(input: CreateEventInput): Promise<Event>;
  updateEvent(id: string, updates: UpdateEventInput): Promise<Event>;
  toggleBookmarkEvent(eventId: string): Promise<Event>;
  toggleJoinEvent(eventId: string): Promise<Event>;
  getExhibitors(eventId: string): Promise<Exhibitor[]>;
  getExhibitorById(eventId: string, exhibitorId: string): Promise<Exhibitor | null>;
  toggleBookmarkExhibitor(exhibitorId: string): Promise<Exhibitor>;
  toggleExhibitorItinerary(
    eventId: string,
    exhibitorId: string
  ): Promise<{ exhibitor: Exhibitor; inItinerary: boolean }>;
  getItinerary(eventId: string): Promise<ItineraryItem[]>;
  createItineraryItem(input: CreateItineraryItemInput): Promise<ItineraryItem>;
  updateItineraryItem(id: string, updates: UpdateItineraryItemInput): Promise<ItineraryItem>;
  deleteItineraryItem(id: string): Promise<boolean>;
  reorderItineraryItems(eventId: string, itemIds: string[]): Promise<ItineraryItem[]>;
  toggleBookmarkItineraryItem(itemId: string): Promise<ItineraryItem>;
  getHalls(eventId: string): Promise<FloorMapHall[]>;
  getBooths(eventId: string, hall?: string): Promise<Booth[]>;
  tagUserLocation(
    eventId: string,
    boothId: string
  ): Promise<{ booth: Booth; taggedAt: string }>;
  getUserTaggedLocation(eventId: string): Promise<Booth | null>;
}

class EventsRepository implements IEventsRepository {
  private events: Event[] = [...mockEvents];
  private exhibitors: Exhibitor[] = [...mockExhibitors];
  private itinerary: ItineraryItem[] = [...mockItineraryItems];
  private booths: Booth[] = [...mockBooths];

  async getEvents(
    filters: EventFilterParams = { page: 1, pageSize: 20 }
  ): Promise<PaginatedResult<Event>> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(200);

      let filtered = [...this.events];

      if (filters.query?.trim()) {
        const q = filters.query.toLowerCase().trim();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.city?.toLowerCase().includes(q) ||
            e.country?.toLowerCase().includes(q) ||
            e.venue?.toLowerCase().includes(q) ||
            e.category?.toLowerCase().includes(q) ||
            e.industry?.toLowerCase().includes(q) ||
            e.boothNumber?.toLowerCase().includes(q)
        );
      }

      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter((e) => e.status === filters.status);
      }

      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(
          (e) =>
            e.category?.toLowerCase() === filters.category?.toLowerCase() ||
            e.industry?.toLowerCase() === filters.category?.toLowerCase()
        );
      }

      if (filters.bookmarkedOnly) {
        filtered = filtered.filter((e) => e.isBookmarked);
      }

      const page = filters.page || 1;
      const pageSize = filters.pageSize || 20;
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);

      return {
        items,
        total: filtered.length,
        page,
        pageSize,
        hasMore: start + pageSize < filtered.length,
      };
    }

    const queryParams = new URLSearchParams({
      page: String(filters.page || 1),
      pageSize: String(filters.pageSize || 20),
      ...(filters.query && { query: filters.query }),
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category }),
      ...(filters.bookmarkedOnly && { bookmarkedOnly: 'true' }),
    });

    return apiClient.request<PaginatedResult<Event>>(`/events?${queryParams.toString()}`);
  }

  async getEventById(id: string): Promise<Event | null> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      return this.events.find((e) => e.id === id) || null;
    }
    return apiClient.request<Event>(`/events/${id}`);
  }

  async getActiveEvent(): Promise<Event | null> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      return this.events.find((e) => e.status === 'active') || this.events[0] || null;
    }
    return apiClient.request<Event>('/events/active');
  }

  async createEvent(input: CreateEventInput): Promise<Event> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(350);
      const newEvent: Event = {
        id: `evt-${Date.now()}`,
        companyId: input.companyId || 'comp-acme-1',
        organizationId: input.organizationId || 'org-acme',
        name: input.name,
        description: input.description,
        location: input.location,
        city: input.city || input.location.split(',')[0]?.trim() || 'Las Vegas',
        country: input.country || 'United States',
        venue: input.venue,
        boothNumber: input.boothNumber,
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.status || 'active',
        leadGoal: input.leadGoal || 100,
        activeStaffCount: input.activeStaffCount || 1,
        bannerUrl: input.bannerUrl,
        category: input.category || 'Enterprise Tech',
        industry: input.industry || input.category || 'Enterprise Tech',
        isBookmarked: false,
        isJoined: true,
        joinedState: 'joined',
        isFeatured: false,
        isNearby: false,
        totalExhibitorsCount: 1,
        exhibitorCount: 1,
        totalSessionsCount: 0,
        floorPlanZone: 'Main Hall',
        totalLeadsCaptured: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.events.unshift(newEvent);
      return newEvent;
    }
    return apiClient.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateEvent(id: string, updates: UpdateEventInput): Promise<Event> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(250);
      const index = this.events.findIndex((e) => e.id === id);
      if (index === -1) throw new Error(`Event ${id} not found`);
      this.events[index] = {
        ...this.events[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return this.events[index];
    }
    return apiClient.request<Event>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async toggleBookmarkEvent(eventId: string): Promise<Event> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(120);
      const event = this.events.find((e) => e.id === eventId);
      if (!event) throw new Error(`Event ${eventId} not found`);
      event.isBookmarked = !event.isBookmarked;
      return { ...event };
    }
    return apiClient.request<Event>(`/events/${eventId}/bookmark`, {
      method: 'POST',
    });
  }

  async toggleJoinEvent(eventId: string): Promise<Event> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(120);
      const event = this.events.find((e) => e.id === eventId);
      if (!event) throw new Error(`Event ${eventId} not found`);
      event.isJoined = !event.isJoined;
      event.joinedState = event.isJoined ? 'joined' : 'not_joined';
      return { ...event };
    }
    return apiClient.request<Event>(`/events/${eventId}/join`, {
      method: 'POST',
    });
  }

  async getExhibitors(eventId: string): Promise<Exhibitor[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(180);
      return this.exhibitors.filter((ex) => ex.eventId === eventId);
    }
    return apiClient.request<Exhibitor[]>(`/events/${eventId}/exhibitors`);
  }

  async getExhibitorById(eventId: string, exhibitorId: string): Promise<Exhibitor | null> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(120);
      return (
        this.exhibitors.find((ex) => ex.eventId === eventId && ex.id === exhibitorId) ||
        this.exhibitors.find((ex) => ex.id === exhibitorId) ||
        null
      );
    }
    return apiClient.request<Exhibitor>(`/events/${eventId}/exhibitors/${exhibitorId}`);
  }

  async toggleBookmarkExhibitor(exhibitorId: string): Promise<Exhibitor> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(120);
      const exhibitor = this.exhibitors.find((ex) => ex.id === exhibitorId);
      if (!exhibitor) throw new Error(`Exhibitor ${exhibitorId} not found`);
      exhibitor.isBookmarked = !exhibitor.isBookmarked;
      return { ...exhibitor };
    }
    return apiClient.request<Exhibitor>(`/exhibitors/${exhibitorId}/bookmark`, {
      method: 'POST',
    });
  }

  private async persistItineraryForEvent(eventId: string): Promise<void> {
    try {
      const items = this.itinerary.filter((it) => it.eventId === eventId);
      await storageService.setItem(`expo_itinerary_${eventId}`, items);
    } catch {
      // Storage fallback
    }
  }

  async toggleExhibitorItinerary(
    eventId: string,
    exhibitorId: string
  ): Promise<{ exhibitor: Exhibitor; inItinerary: boolean }> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(120);
      const exhibitor = this.exhibitors.find((e) => e.id === exhibitorId);
      if (!exhibitor) throw new Error(`Exhibitor ${exhibitorId} not found`);

      exhibitor.isInItinerary = !exhibitor.isInItinerary;

      // Also sync with this.itinerary list
      const existingItemIndex = this.itinerary.findIndex(
        (i) => i.id === `itin-exh-${exhibitor.id}`
      );

      if (exhibitor.isInItinerary) {
        if (existingItemIndex === -1) {
          const newItem: ItineraryItem = {
            id: `itin-exh-${exhibitor.id}`,
            eventId: exhibitor.eventId || eventId,
            title: `Visit ${exhibitor.name} (${exhibitor.boothNumber})`,
            description: `Scheduled booth meeting & product demo for ${exhibitor.category}.`,
            location: `${exhibitor.boothNumber} • ${exhibitor.hall || 'North Hall'}`,
            startTime: '2026-10-05T14:00:00.000Z',
            endTime: '2026-10-05T14:45:00.000Z',
            category: 'booth_visit',
            company: exhibitor.name,
            booth: exhibitor.boothNumber,
            hall: exhibitor.hall || 'North Hall',
            notes: `Explore featured products: ${(exhibitor.products || []).slice(0, 2).join(', ')}.`,
            isBookmarked: true,
            remindersEnabled: true,
            isCompleted: false,
            speakerName: exhibitor.name,
            speakerTitle: 'Exhibitor Booth Presence',
            registeredCount: 1,
            order: this.itinerary.length + 1,
            createdAt: new Date().toISOString(),
          };
          this.itinerary.push(newItem);
        }
      } else {
        if (existingItemIndex !== -1) {
          this.itinerary.splice(existingItemIndex, 1);
        }
      }

      await this.persistItineraryForEvent(exhibitor.eventId || eventId);
      return { exhibitor: { ...exhibitor }, inItinerary: Boolean(exhibitor.isInItinerary) };
    }

    return apiClient.request<{ exhibitor: Exhibitor; inItinerary: boolean }>(
      `/events/${eventId}/exhibitors/${exhibitorId}/itinerary`,
      { method: 'POST' }
    );
  }

  async getItinerary(eventId: string): Promise<ItineraryItem[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);

      // Check if there is cached/persisted itinerary in local storage
      const stored = await storageService.getItem<ItineraryItem[]>(`expo_itinerary_${eventId}`);
      if (stored && Array.isArray(stored) && stored.length > 0) {
        this.itinerary = [
          ...this.itinerary.filter((it) => it.eventId !== eventId),
          ...stored,
        ];
        return [...stored].sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined && a.startTime === b.startTime) {
            return a.order - b.order;
          }
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
      }

      const current = this.itinerary.filter((it) => it.eventId === eventId);
      await this.persistItineraryForEvent(eventId);
      return current;
    }
    return apiClient.request<ItineraryItem[]>(`/events/${eventId}/itinerary`);
  }

  async createItineraryItem(input: CreateItineraryItemInput): Promise<ItineraryItem> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(180);
      const eventItems = this.itinerary.filter((it) => it.eventId === input.eventId);
      const newItem: ItineraryItem = {
        id: input.id || `itin-custom-${Date.now()}`,
        eventId: input.eventId,
        title: input.title,
        description: input.description,
        location:
          input.location ||
          (input.booth ? `${input.booth} • ${input.hall || 'Convention Hall'}` : 'Convention Floor'),
        startTime: input.startTime,
        endTime: input.endTime,
        category: input.category || 'meeting',
        company: input.company,
        booth: input.booth,
        hall: input.hall,
        notes: input.notes,
        speakerName: input.speakerName,
        speakerTitle: input.speakerTitle,
        isBookmarked: input.isBookmarked ?? true,
        remindersEnabled: input.remindersEnabled ?? true,
        isCompleted: input.isCompleted ?? false,
        capacity: input.capacity,
        registeredCount: input.registeredCount ?? 1,
        order: input.order ?? (eventItems.length + 1),
        createdAt: new Date().toISOString(),
      };

      this.itinerary.push(newItem);

      // If tied to an exhibitor by company name or id, update exhibitor state
      if (newItem.company) {
        const exh = this.exhibitors.find(
          (e) => e.name.toLowerCase() === newItem.company?.toLowerCase()
        );
        if (exh) exh.isInItinerary = true;
      }

      await this.persistItineraryForEvent(input.eventId);
      return newItem;
    }

    return apiClient.request<ItineraryItem>(`/events/${input.eventId}/itinerary`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateItineraryItem(id: string, updates: UpdateItineraryItemInput): Promise<ItineraryItem> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(160);
      const index = this.itinerary.findIndex((it) => it.id === id);
      if (index === -1) throw new Error(`Itinerary item ${id} not found`);

      const updated: ItineraryItem = {
        ...this.itinerary[index],
        ...updates,
      };

      if (updates.booth || updates.hall) {
        updated.location = `${updated.booth || ''}${updated.booth && updated.hall ? ' • ' : ''}${updated.hall || ''}`.trim() || updated.location;
      }

      this.itinerary[index] = updated;
      await this.persistItineraryForEvent(updated.eventId);
      return updated;
    }

    return apiClient.request<ItineraryItem>(`/itinerary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteItineraryItem(id: string): Promise<boolean> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(140);
      const item = this.itinerary.find((it) => it.id === id);
      if (!item) return false;

      this.itinerary = this.itinerary.filter((it) => it.id !== id);

      if (id.startsWith('itin-exh-')) {
        const exhId = id.replace('itin-exh-', '');
        const exh = this.exhibitors.find((e) => e.id === exhId);
        if (exh) exh.isInItinerary = false;
      } else if (item.company) {
        const remainingForCompany = this.itinerary.some(
          (it) => it.company?.toLowerCase() === item.company?.toLowerCase()
        );
        if (!remainingForCompany) {
          const exh = this.exhibitors.find(
            (e) => e.name.toLowerCase() === item.company?.toLowerCase()
          );
          if (exh) exh.isInItinerary = false;
        }
      }

      await this.persistItineraryForEvent(item.eventId);
      return true;
    }

    await apiClient.request(`/itinerary/${id}`, { method: 'DELETE' });
    return true;
  }

  async reorderItineraryItems(eventId: string, itemIds: string[]): Promise<ItineraryItem[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(120);
      const eventItems = this.itinerary.filter((it) => it.eventId === eventId);
      const otherItems = this.itinerary.filter((it) => it.eventId !== eventId);

      const reordered: ItineraryItem[] = [];
      itemIds.forEach((id, index) => {
        const found = eventItems.find((it) => it.id === id);
        if (found) {
          found.order = index;
          reordered.push(found);
        }
      });

      // Keep any unmentioned items at the end
      eventItems.forEach((it) => {
        if (!itemIds.includes(it.id)) {
          it.order = reordered.length;
          reordered.push(it);
        }
      });

      this.itinerary = [...otherItems, ...reordered];
      await this.persistItineraryForEvent(eventId);
      return reordered;
    }

    return apiClient.request<ItineraryItem[]>(`/events/${eventId}/itinerary/reorder`, {
      method: 'POST',
      body: JSON.stringify({ itemIds }),
    });
  }

  async toggleBookmarkItineraryItem(itemId: string): Promise<ItineraryItem> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(120);
      const item = this.itinerary.find((i) => i.id === itemId);
      if (!item) throw new Error('Itinerary item not found');
      item.isBookmarked = !item.isBookmarked;
      await this.persistItineraryForEvent(item.eventId);
      return { ...item };
    }
    return apiClient.request<ItineraryItem>(`/itinerary/${itemId}/bookmark`, {
      method: 'POST',
    });
  }

  async getHalls(eventId: string): Promise<FloorMapHall[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(120);
      return [...mockHalls];
    }
    return apiClient.request<FloorMapHall[]>(`/events/${eventId}/halls`);
  }

  async getBooths(eventId: string, hall?: string): Promise<Booth[]> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(150);
      let list = this.booths.filter((b) => b.eventId === eventId);
      if (hall && hall !== 'All Halls') {
        list = list.filter((b) => b.hall === hall || b.hall.toLowerCase().includes(hall.toLowerCase()));
      }
      return list;
    }
    return apiClient.request<Booth[]>(`/events/${eventId}/booths${hall ? `?hall=${hall}` : ''}`);
  }

  async tagUserLocation(
    eventId: string,
    boothId: string
  ): Promise<{ booth: Booth; taggedAt: string }> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(120);
      this.booths.forEach((b) => {
        if (b.eventId === eventId) {
          b.isTaggedLocation = b.id === boothId;
        }
      });
      const taggedBooth = this.booths.find((b) => b.id === boothId);
      if (!taggedBooth) throw new Error('Booth not found');

      await storageService.setItem(`expo_tagged_location_${eventId}`, taggedBooth.id);
      return { booth: { ...taggedBooth }, taggedAt: new Date().toISOString() };
    }
    return apiClient.request(`/events/${eventId}/booths/${boothId}/tag`, { method: 'POST' });
  }

  async getUserTaggedLocation(eventId: string): Promise<Booth | null> {
    if (apiClient.isMock) {
      await apiClient.simulateLatency(100);
      const storedBoothId = await storageService.getItem<string>(`expo_tagged_location_${eventId}`);
      if (storedBoothId) {
        const match = this.booths.find((b) => b.id === storedBoothId);
        if (match) {
          match.isTaggedLocation = true;
          return match;
        }
      }
      return this.booths.find((b) => b.eventId === eventId && b.isTaggedLocation) || null;
    }
    return apiClient.request(`/events/${eventId}/tagged-location`);
  }
}

export const eventsRepository = new EventsRepository();
