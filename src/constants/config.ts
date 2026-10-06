export const AppConfig = {
  name: 'ExpoDiaries',
  slug: 'expodiaries',
  version: '1.0.0',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.expodiaries.internal/v1',
  isMockDefault: true,
  defaultPageSize: 20,
  maxUploadBytes: 15 * 1024 * 1024, // 15MB
} as const;
