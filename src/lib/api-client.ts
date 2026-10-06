/**
 * Core API Client Abstraction
 * Handles request orchestration, authorization headers, error normalization,
 * and seamless toggling between live backend endpoints and simulated mock services.
 */

import { ApiError } from '@/types/common';

export interface ApiClientConfig {
  baseUrl: string;
  useMock: boolean;
  mockLatencyMs: number;
}

export const defaultApiConfig: ApiClientConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.expodiaries.internal/v1',
  useMock: true, // Default to mock during foundation phase
  mockLatencyMs: 350, // Realistic network feel for micro-interactions
};

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...defaultApiConfig, ...config };
  }

  get isMock(): boolean {
    return this.config.useMock;
  }

  setMockMode(enabled: boolean): void {
    this.config.useMock = enabled;
  }

  async simulateLatency(latencyMs?: number): Promise<void> {
    if (this.config.useMock) {
      const delay = latencyMs ?? this.config.mockLatencyMs;
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.config.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorData: Partial<ApiError> = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        throw new Error(errorData.message || `HTTP error: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      const error = err as Error;
      throw new Error(error.message || 'Network request failed');
    }
  }
}

export const apiClient = new ApiClient();
