import { create } from 'zustand';

import { crmService } from '@/services/crm/crm.service';
import { CrmIntegration, CrmProvider, CrmSyncResult } from '@/types/crm';

interface CrmStoreState {
  integrations: CrmIntegration[];
  isLoading: boolean;
  isSyncing: boolean;
  syncingProvider: CrmProvider | null;
  syncProgress: number;
  lastSyncResult: CrmSyncResult | null;
  activeLogs: string[];

  // Actions
  loadIntegrations: () => Promise<void>;
  connectProvider: (provider: CrmProvider, config?: Partial<CrmIntegration>) => Promise<void>;
  disconnectProvider: (provider: CrmProvider) => Promise<void>;
  toggleAutoSync: (provider: CrmProvider, enabled: boolean) => Promise<void>;
  syncNow: (provider: CrmProvider, eventId?: string) => Promise<CrmSyncResult>;
  testConnection: (provider: CrmProvider) => Promise<{ success: boolean; message: string }>;
  updateWebhook: (url: string) => Promise<void>;
}

export const useCrmStore = create<CrmStoreState>((set, get) => ({
  integrations: [],
  isLoading: false,
  isSyncing: false,
  syncingProvider: null,
  syncProgress: 0,
  lastSyncResult: null,
  activeLogs: [],

  loadIntegrations: async () => {
    set({ isLoading: true });
    try {
      const integrations = await crmService.getIntegrations();
      set({ integrations, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  connectProvider: async (provider, config) => {
    const updated = await crmService.connectProvider(provider, config);
    set({
      integrations: get().integrations.map((i) => (i.provider === provider ? updated : i)),
    });
  },

  disconnectProvider: async (provider) => {
    await crmService.disconnectProvider(provider);
    set({
      integrations: get().integrations.map((i) =>
        i.provider === provider ? { ...i, status: 'disconnected', autoSync: false } : i
      ),
    });
  },

  toggleAutoSync: async (provider, enabled) => {
    const updated = await crmService.toggleAutoSync(provider, enabled);
    set({
      integrations: get().integrations.map((i) => (i.provider === provider ? updated : i)),
    });
  },

  syncNow: async (provider, eventId) => {
    set({
      isSyncing: true,
      syncingProvider: provider,
      syncProgress: 15,
      activeLogs: [`[INIT] Starting synchronization with ${provider.toUpperCase()}...`],
    });

    const pTimer = setInterval(() => {
      set((s) => ({ syncProgress: Math.min(85, s.syncProgress + 25) }));
    }, 150);

    try {
      const result = await crmService.syncLeads(provider, eventId);
      clearInterval(pTimer);
      set({
        isSyncing: false,
        syncingProvider: null,
        syncProgress: 100,
        lastSyncResult: result,
        activeLogs: result.logs,
      });

      // Refresh integrations state
      const refreshed = await crmService.getIntegrations();
      set({ integrations: refreshed });
      return result;
    } catch (err) {
      clearInterval(pTimer);
      set({
        isSyncing: false,
        syncingProvider: null,
        syncProgress: 0,
        activeLogs: [`[ERROR] Sync failed: ${String(err)}`],
      });
      throw err;
    }
  },

  testConnection: async (provider) => {
    return crmService.testConnection(provider);
  },

  updateWebhook: async (url) => {
    const updated = await crmService.updateWebhookEndpoint(url);
    set({
      integrations: get().integrations.map((i) => (i.provider === 'webhook' ? updated : i)),
    });
  },
}));
