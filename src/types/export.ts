import { z } from 'zod';

export const ExportFormatSchema = z.enum(['csv', 'xlsx', 'json']);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const ExportScopeSchema = z.enum(['all_event', 'selected', 'hot', 'qualified']);
export type ExportScope = z.infer<typeof ExportScopeSchema>;

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  eventId?: string;
  selectedLeadIds?: string[];
  fields?: string[];
  simulateFailure?: boolean;
}

export type ExportStatus =
  | 'idle'
  | 'preparing'
  | 'processing'
  | 'formatting'
  | 'success'
  | 'failure';

export interface ExportProgressEvent {
  status: ExportStatus;
  progressPercent: number; // 0 to 100
  currentStep: string;
  totalRecords: number;
  processedRecords: number;
  format: ExportFormat;
  fileName?: string;
  fileContent?: string;
  fileSizeFormatted?: string;
  mimeType?: string;
  completedAt?: string;
  error?: string;
}

export interface IExportService {
  exportLeads(
    options: ExportOptions,
    onProgress?: (event: ExportProgressEvent) => void
  ): Promise<ExportProgressEvent>;
}
