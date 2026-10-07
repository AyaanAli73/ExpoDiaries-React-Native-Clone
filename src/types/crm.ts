import { z } from 'zod';

export const CrmProviderSchema = z.enum([
  'salesforce',
  'hubspot',
  'dynamics',
  'custom_api',
  'zoho',
  'webhook',
]);
export type CrmProvider = z.infer<typeof CrmProviderSchema>;

export const CrmConnectionStatusSchema = z.enum(['connected', 'disconnected', 'syncing', 'error']);
export type CrmConnectionStatus = z.infer<typeof CrmConnectionStatusSchema>;

export const CrmFieldMappingSchema = z.object({
  appField: z.string(),
  crmField: z.string(),
  required: z.boolean().default(false),
});
export type CrmFieldMapping = z.infer<typeof CrmFieldMappingSchema>;

export const CrmIntegrationSchema = z.object({
  id: z.string(),
  provider: CrmProviderSchema,
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  status: CrmConnectionStatusSchema.default('disconnected'),
  autoSync: z.boolean().default(false),
  lastSyncedAt: z.string().nullable().optional(),
  totalSyncedCount: z.number().default(0),
  pendingSyncCount: z.number().default(0),
  webhookEndpoint: z.string().optional(),
  customHeaders: z.record(z.string(), z.string()).optional(),
  fieldMappings: z.array(CrmFieldMappingSchema).default([]),
});
export type CrmIntegration = z.infer<typeof CrmIntegrationSchema>;

export const CrmSyncResultSchema = z.object({
  provider: CrmProviderSchema,
  success: z.boolean(),
  totalProcessed: z.number(),
  successCount: z.number(),
  errorCount: z.number(),
  durationMs: z.number(),
  timestamp: z.string(),
  logs: z.array(z.string()),
});
export type CrmSyncResult = z.infer<typeof CrmSyncResultSchema>;

export interface ICrmIntegrationService {
  getIntegrations(): Promise<CrmIntegration[]>;
  connectProvider(provider: CrmProvider, config?: Partial<CrmIntegration>): Promise<CrmIntegration>;
  disconnectProvider(provider: CrmProvider): Promise<void>;
  toggleAutoSync(provider: CrmProvider, enabled: boolean): Promise<CrmIntegration>;
  updateWebhookEndpoint(url: string, headers?: Record<string, string>): Promise<CrmIntegration>;
  syncLeads(provider: CrmProvider, eventId?: string): Promise<CrmSyncResult>;
  testConnection(provider: CrmProvider): Promise<{ success: boolean; message: string }>;
}
