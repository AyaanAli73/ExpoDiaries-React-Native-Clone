import {
  CrmIntegration,
  CrmProvider,
  CrmSyncResult,
  ICrmIntegrationService,
} from '@/types/crm';

const DEFAULT_FIELD_MAPPINGS = [
  { appField: 'First Name', crmField: 'FirstName', required: true },
  { appField: 'Last Name', crmField: 'LastName', required: true },
  { appField: 'Email Address', crmField: 'Email', required: true },
  { appField: 'Company Name', crmField: 'Company', required: true },
  { appField: 'Job Title', crmField: 'Title', required: false },
  { appField: 'Phone Number', crmField: 'Phone', required: false },
  { appField: 'Lead Temperature', crmField: 'Rating', required: true },
  { appField: 'Lead Intent', crmField: 'LeadSourceDetails', required: false },
  { appField: 'Trade Show Event', crmField: 'CampaignId', required: false },
  { appField: 'Booth Note', crmField: 'Description', required: false },
];

export class MockCrmIntegrationService implements ICrmIntegrationService {
  private integrations: CrmIntegration[] = [
    {
      id: 'crm-salesforce',
      provider: 'salesforce',
      name: 'Salesforce',
      description: 'Enterprise Lead & Opportunity ingestion with campaign attribution.',
      icon: 'Cloud',
      status: 'connected',
      autoSync: false,
      lastSyncedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      totalSyncedCount: 164,
      pendingSyncCount: 0,
      fieldMappings: DEFAULT_FIELD_MAPPINGS,
    },
    {
      id: 'crm-hubspot',
      provider: 'hubspot',
      name: 'HubSpot',
      description: 'Bi-directional contact sync, pipeline deals, and automated sequences.',
      icon: 'Flame',
      status: 'connected',
      autoSync: true,
      lastSyncedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      totalSyncedCount: 142,
      pendingSyncCount: 22,
      fieldMappings: DEFAULT_FIELD_MAPPINGS,
    },
    {
      id: 'crm-dynamics',
      provider: 'dynamics',
      name: 'Microsoft Dynamics',
      description: 'Dynamics 365 Sales contact & entity lifecycle management.',
      icon: 'Layers',
      status: 'disconnected',
      autoSync: false,
      lastSyncedAt: null,
      totalSyncedCount: 0,
      pendingSyncCount: 164,
      fieldMappings: DEFAULT_FIELD_MAPPINGS,
    },
    {
      id: 'crm-custom-api',
      provider: 'custom_api',
      name: 'Custom API',
      description: 'Direct REST / GraphQL endpoint ingestion with JSON payload dispatching.',
      icon: 'Globe',
      status: 'disconnected',
      autoSync: false,
      lastSyncedAt: null,
      totalSyncedCount: 0,
      pendingSyncCount: 164,
      webhookEndpoint: 'https://api.company.com/v1/leads/ingest',
      fieldMappings: DEFAULT_FIELD_MAPPINGS,
    },
  ];

  async getIntegrations(): Promise<CrmIntegration[]> {
    await new Promise((r) => setTimeout(r, 120));
    return [...this.integrations];
  }

  async connectProvider(
    provider: CrmProvider,
    config?: Partial<CrmIntegration>
  ): Promise<CrmIntegration> {
    await new Promise((r) => setTimeout(r, 300));
    const item = this.integrations.find((i) => i.provider === provider);
    if (!item) throw new Error(`Provider ${provider} not found`);

    item.status = 'connected';
    if (config?.webhookEndpoint) item.webhookEndpoint = config.webhookEndpoint;
    if (config?.autoSync !== undefined) item.autoSync = config.autoSync;
    return { ...item };
  }

  async disconnectProvider(provider: CrmProvider): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const item = this.integrations.find((i) => i.provider === provider);
    if (item) {
      item.status = 'disconnected';
      item.autoSync = false;
    }
  }

  async toggleAutoSync(provider: CrmProvider, enabled: boolean): Promise<CrmIntegration> {
    await new Promise((r) => setTimeout(r, 100));
    const item = this.integrations.find((i) => i.provider === provider);
    if (!item) throw new Error(`Provider ${provider} not found`);
    item.autoSync = enabled;
    return { ...item };
  }

  async updateWebhookEndpoint(
    url: string,
    headers?: Record<string, string>
  ): Promise<CrmIntegration> {
    await new Promise((r) => setTimeout(r, 150));
    const item = this.integrations.find(
      (i) => i.provider === 'custom_api' || i.provider === 'webhook'
    );
    if (!item) throw new Error('Custom API provider not found');
    item.webhookEndpoint = url;
    if (headers) item.customHeaders = headers;
    item.status = 'connected';
    return { ...item };
  }

  async syncLeads(provider: CrmProvider, _eventId?: string): Promise<CrmSyncResult> {
    const item = this.integrations.find((i) => i.provider === provider);
    if (!item) throw new Error(`Provider ${provider} not found`);

    const prevPending = item.pendingSyncCount || 22;
    const countToSync = Math.max(1, prevPending);

    // Simulate batch network latency
    await new Promise((r) => setTimeout(r, 600));

    const timestamp = new Date().toISOString();
    item.lastSyncedAt = timestamp;
    item.totalSyncedCount += countToSync;
    item.pendingSyncCount = 0;

    const logs = [
      `[AUTH] Authenticated session token verified for ${item.name}`,
      `[BATCH] Dispatched batch payload with ${countToSync} lead records`,
      `[FIELD_MAPPING] Verified 10 attributes matching schema`,
      `[SUCCESS] 200 OK — ${countToSync} leads synced and assigned campaign attribution`,
    ];

    return {
      provider,
      success: true,
      totalProcessed: countToSync,
      successCount: countToSync,
      errorCount: 0,
      durationMs: 580,
      timestamp,
      logs,
    };
  }

  async testConnection(provider: CrmProvider): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 350));
    const item = this.integrations.find((i) => i.provider === provider);
    if (!item) return { success: false, message: 'Provider configuration missing' };
    return {
      success: true,
      message: `Successfully connected to ${item.name} API endpoint. Handshake valid.`,
    };
  }
}

export const crmService = new MockCrmIntegrationService();
