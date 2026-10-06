import {
  EventFilterParams,
  eventsRepository,
  IEventsRepository,
} from '@/repositories/events.repository';
import { Booth } from '@/types/booth';
import { PaginatedResult } from '@/types/common';
import { CreateEventInput, Event, UpdateEventInput } from '@/types/event';
import { Exhibitor } from '@/types/exhibitor';
import { FloorMapHall } from '@/types/floor-map';
import {
  CreateItineraryItemInput,
  ItineraryItem,
  UpdateItineraryItemInput,
} from '@/types/itinerary';

export class EventsService {
  constructor(private repo: IEventsRepository = eventsRepository) {}

  async getEvents(filters?: EventFilterParams): Promise<PaginatedResult<Event>> {
    return this.repo.getEvents(filters);
  }

  // Compatibility aliases
  async listEvents(filters?: EventFilterParams): Promise<PaginatedResult<Event>> {
    return this.getEvents(filters);
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.repo.getEventById(id);
  }

  async getEvent(id: string): Promise<Event | null> {
    return this.getEventById(id);
  }

  async getActiveEvent(): Promise<Event | null> {
    return this.repo.getActiveEvent();
  }

  async createEvent(input: CreateEventInput): Promise<Event> {
    return this.repo.createEvent(input);
  }

  async updateEvent(id: string, updates: UpdateEventInput): Promise<Event> {
    return this.repo.updateEvent(id, updates);
  }

  async toggleBookmarkEvent(eventId: string): Promise<Event> {
    return this.repo.toggleBookmarkEvent(eventId);
  }

  async toggleJoinEvent(eventId: string): Promise<Event> {
    return this.repo.toggleJoinEvent(eventId);
  }

  async getExhibitors(eventId: string): Promise<Exhibitor[]> {
    return this.repo.getExhibitors(eventId);
  }

  async getExhibitorById(eventId: string, exhibitorId: string): Promise<Exhibitor | null> {
    return this.repo.getExhibitorById(eventId, exhibitorId);
  }

  async toggleBookmarkExhibitor(exhibitorId: string): Promise<Exhibitor> {
    return this.repo.toggleBookmarkExhibitor(exhibitorId);
  }

  async toggleExhibitorItinerary(
    eventId: string,
    exhibitorId: string
  ): Promise<{ exhibitor: Exhibitor; inItinerary: boolean }> {
    return this.repo.toggleExhibitorItinerary(eventId, exhibitorId);
  }

  async getItinerary(eventId: string): Promise<ItineraryItem[]> {
    return this.repo.getItinerary(eventId);
  }

  async createItineraryItem(input: CreateItineraryItemInput): Promise<ItineraryItem> {
    return this.repo.createItineraryItem(input);
  }

  async updateItineraryItem(id: string, updates: UpdateItineraryItemInput): Promise<ItineraryItem> {
    return this.repo.updateItineraryItem(id, updates);
  }

  async deleteItineraryItem(id: string): Promise<boolean> {
    return this.repo.deleteItineraryItem(id);
  }

  async reorderItineraryItems(eventId: string, itemIds: string[]): Promise<ItineraryItem[]> {
    return this.repo.reorderItineraryItems(eventId, itemIds);
  }

  async toggleBookmarkItineraryItem(itemId: string): Promise<ItineraryItem> {
    return this.repo.toggleBookmarkItineraryItem(itemId);
  }

  async getHalls(eventId: string): Promise<FloorMapHall[]> {
    return this.repo.getHalls(eventId);
  }

  async getBooths(eventId: string, hall?: string): Promise<Booth[]> {
    return this.repo.getBooths(eventId, hall);
  }

  async tagUserLocation(
    eventId: string,
    boothId: string
  ): Promise<{ booth: Booth; taggedAt: string }> {
    return this.repo.tagUserLocation(eventId, boothId);
  }

  async getUserTaggedLocation(eventId: string): Promise<Booth | null> {
    return this.repo.getUserTaggedLocation(eventId);
  }
}

export const eventsService = new EventsService();
