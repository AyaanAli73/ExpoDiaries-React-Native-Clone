import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { EventFilterParams } from '@/repositories/events.repository';
import { eventsService } from '@/services/events.service';
import { CreateEventInput, UpdateEventInput } from '@/types/event';
import { CreateItineraryItemInput, UpdateItineraryItemInput } from '@/types/itinerary';

export const eventQueryKeys = queryKeys.events;

export function useEvents(filters?: EventFilterParams) {
  return useQuery({
    queryKey: queryKeys.events.list(filters as unknown as Record<string, unknown>),
    queryFn: () => eventsService.getEvents(filters),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => eventsService.getEventById(id),
    enabled: Boolean(id),
  });
}

export function useActiveEvent() {
  return useQuery({
    queryKey: queryKeys.events.active(),
    queryFn: () => eventsService.getActiveEvent(),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => eventsService.createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateEventInput }) =>
      eventsService.updateEvent(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    },
  });
}

export function useToggleBookmarkEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsService.toggleBookmarkEvent(eventId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    },
  });
}

export function useToggleJoinEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsService.toggleJoinEvent(eventId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    },
  });
}

export function useExhibitors(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.exhibitors(eventId),
    queryFn: () => eventsService.getExhibitors(eventId),
    enabled: Boolean(eventId),
  });
}

export function useExhibitor(eventId: string, exhibitorId: string) {
  return useQuery({
    queryKey: queryKeys.events.exhibitorDetail(eventId, exhibitorId),
    queryFn: () => eventsService.getExhibitorById(eventId, exhibitorId),
    enabled: Boolean(eventId && exhibitorId),
  });
}

export function useToggleBookmarkExhibitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exhibitorId: string) => eventsService.toggleBookmarkExhibitor(exhibitorId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.exhibitors(data.eventId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.exhibitorDetail(data.eventId, data.id),
      });
    },
  });
}

export function useToggleExhibitorItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, exhibitorId }: { eventId: string; exhibitorId: string }) =>
      eventsService.toggleExhibitorItinerary(eventId, exhibitorId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.exhibitors(data.exhibitor.eventId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.exhibitorDetail(data.exhibitor.eventId, data.exhibitor.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.itinerary(data.exhibitor.eventId) });
    },
  });
}

export function useItinerary(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.itinerary(eventId),
    queryFn: () => eventsService.getItinerary(eventId),
    enabled: Boolean(eventId),
  });
}

export function useToggleBookmarkItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => eventsService.toggleBookmarkItineraryItem(itemId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.itinerary(data.eventId) });
    },
  });
}

export function useCreateItineraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateItineraryItemInput) => eventsService.createItineraryItem(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.itinerary(data.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.exhibitors(data.eventId) });
    },
  });
}

export function useUpdateItineraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateItineraryItemInput }) =>
      eventsService.updateItineraryItem(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.itinerary(data.eventId) });
    },
  });
}

export function useDeleteItineraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, eventId }: { id: string; eventId: string }) =>
      eventsService.deleteItineraryItem(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.itinerary(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.exhibitors(variables.eventId) });
    },
  });
}

export function useReorderItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, itemIds }: { eventId: string; itemIds: string[] }) =>
      eventsService.reorderItineraryItems(eventId, itemIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.itinerary(variables.eventId) });
    },
  });
}

export function useHalls(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'halls'],
    queryFn: () => eventsService.getHalls(eventId),
    enabled: Boolean(eventId),
  });
}

export function useBooths(eventId: string, hall?: string) {
  return useQuery({
    queryKey: ['events', eventId, 'booths', hall || 'all'],
    queryFn: () => eventsService.getBooths(eventId, hall),
    enabled: Boolean(eventId),
  });
}

export function useTagUserLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, boothId }: { eventId: string; boothId: string }) =>
      eventsService.tagUserLocation(eventId, boothId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'booths'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'tagged-location'] });
    },
  });
}

export function useUserTaggedLocation(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'tagged-location'],
    queryFn: () => eventsService.getUserTaggedLocation(eventId),
    enabled: Boolean(eventId),
  });
}
