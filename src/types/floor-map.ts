import { Booth } from '@/types/booth';

export interface FloorMapHall {
  id: string;
  name: string;
  code: string;
  level: string;
  totalBooths: number;
  aisles: string[];
  hasHostBooth?: boolean;
}

export interface FloorMapData {
  eventId: string;
  halls: FloorMapHall[];
  activeHallId: string;
  booths: Booth[];
  userLocationBoothId?: string | null;
}

/**
 * Clean abstraction interface for trade-show floor maps.
 * Allows switching between structured mock grid, SVG interactive map,
 * or full venue providers (Mapbox, Pointr, IndoorAtlas, etc.) without altering consumer UI.
 */
export interface IFloorMapProvider {
  getFloorMap(eventId: string): Promise<FloorMapData>;
  getBooths(eventId: string, hall?: string): Promise<Booth[]>;
  tagUserLocation(
    eventId: string,
    boothId: string
  ): Promise<{ booth: Booth; taggedAt: string }>;
  getUserTaggedLocation(eventId: string): Promise<Booth | null>;
  clearTaggedLocation(eventId: string): Promise<void>;
}
