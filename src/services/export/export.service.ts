import { leadsRepository } from '@/repositories/leads.repository';
import {
  ExportOptions,
  ExportProgressEvent,
  IExportService,
} from '@/types/export';
import { Lead } from '@/types/lead';

export class ExportService implements IExportService {
  async exportLeads(
    options: ExportOptions,
    onProgress?: (event: ExportProgressEvent) => void
  ): Promise<ExportProgressEvent> {
    const { format, scope, eventId = 'evt-2026-ces', selectedLeadIds = [], simulateFailure } = options;

    const baseEvent: ExportProgressEvent = {
      status: 'preparing',
      progressPercent: 15,
      currentStep: 'Querying and filtering lead records…',
      totalRecords: 0,
      processedRecords: 0,
      format,
    };

    onProgress?.(baseEvent);

    // 1. Fetch leads from repository
    await new Promise((r) => setTimeout(r, 220));
    const leadsResult = await leadsRepository.getLeads(
      scope === 'all_event' ? { eventId } : undefined,
      { page: 1, pageSize: 250 }
    );
    let targetLeads: Lead[] = leadsResult.items;

    // Filter according to scope
    if (scope === 'selected') {
      if (selectedLeadIds.length > 0) {
        targetLeads = targetLeads.filter((l) => selectedLeadIds.includes(l.id));
      } else {
        // Fallback to top 15 leads if none explicitly passed
        targetLeads = targetLeads.slice(0, 15);
      }
    } else if (scope === 'hot') {
      targetLeads = targetLeads.filter((l) => l.temperature === 'hot');
    } else if (scope === 'qualified') {
      targetLeads = targetLeads.filter(
        (l) => l.status === 'qualified' || l.temperature === 'hot' || l.temperature === 'warm'
      );
    }
    if (targetLeads.length === 0) {
      const fallbackResult = await leadsRepository.getLeads(undefined, { page: 1, pageSize: 50 });
      targetLeads = fallbackResult.items.slice(0, 15);
    }

    if (simulateFailure) {
      await new Promise((r) => setTimeout(r, 300));
      const failEvent: ExportProgressEvent = {
        status: 'failure',
        progressPercent: 45,
        currentStep: 'Export generation aborted.',
        totalRecords: targetLeads.length,
        processedRecords: 0,
        format,
        error: 'Network timeout: Unable to compile binary spreadsheet stream.',
      };
      onProgress?.(failEvent);
      return failEvent;
    }

    // 2. Processing & Sanitization step
    const step2: ExportProgressEvent = {
      status: 'processing',
      progressPercent: 55,
      currentStep: `Extracting ${targetLeads.length} lead attributes and contact data…`,
      totalRecords: targetLeads.length,
      processedRecords: Math.round(targetLeads.length * 0.55),
      format,
    };
    onProgress?.(step2);
    await new Promise((r) => setTimeout(r, 280));

    // 3. Formatting step
    const step3: ExportProgressEvent = {
      status: 'formatting',
      progressPercent: 82,
      currentStep: `Compiling ${format.toUpperCase()} dataset structure…`,
      totalRecords: targetLeads.length,
      processedRecords: targetLeads.length,
      format,
    };
    onProgress?.(step3);
    await new Promise((r) => setTimeout(r, 260));

    // 4. Generate formatted content
    const dateTag = new Date().toISOString().slice(0, 10);
    let fileName = `expodiaries_leads_${dateTag}.${format}`;
    let fileContent = '';
    let mimeType = 'text/plain';

    if (format === 'csv') {
      fileContent = this.generateCsv(targetLeads);
      fileName = `leads_export_${dateTag}.csv`;
      mimeType = 'text/csv';
    } else if (format === 'xlsx') {
      fileContent = this.generateXlsxXml(targetLeads);
      fileName = `leads_export_${dateTag}.xlsx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      fileContent = this.generateJson(targetLeads);
      fileName = `leads_export_${dateTag}.json`;
      mimeType = 'application/json';
    }

    const byteLength = typeof Blob !== 'undefined' ? new Blob([fileContent]).size : fileContent.length;
    const fileSizeFormatted = `${(byteLength / 1024).toFixed(1)} KB`;

    const successEvent: ExportProgressEvent = {
      status: 'success',
      progressPercent: 100,
      currentStep: 'Export generated successfully!',
      totalRecords: targetLeads.length,
      processedRecords: targetLeads.length,
      format,
      fileName,
      fileContent,
      fileSizeFormatted,
      mimeType,
      completedAt: new Date().toISOString(),
    };

    onProgress?.(successEvent);
    return successEvent;
  }

  private generateCsv(leads: Lead[]): string {
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Job Title',
      'Temperature',
      'Intent',
      'Score',
      'Priority',
      'Booth',
      'Event',
      'Assigned To',
      'Notes',
      'Created At',
    ];

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = leads.map((l) =>
      [
        escapeCsv(l.id),
        escapeCsv(l.firstName),
        escapeCsv(l.lastName),
        escapeCsv(l.email),
        escapeCsv(l.phone),
        escapeCsv(l.company),
        escapeCsv(l.title),
        escapeCsv(l.temperature?.toUpperCase()),
        escapeCsv(l.intent?.toUpperCase()),
        escapeCsv(l.score),
        escapeCsv(l.priority?.toUpperCase()),
        escapeCsv(l.boothNumber),
        escapeCsv(l.eventName),
        escapeCsv(l.assignedToName || 'Unassigned'),
        escapeCsv(l.notes),
        escapeCsv(l.createdAt),
      ].join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  private generateXlsxXml(leads: Lead[]): string {
    // Generate valid Microsoft Excel XML Spreadsheet
    const escapeXml = (unsafe: string | number | undefined | null) => {
      if (unsafe === undefined || unsafe === null) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Job Title',
      'Temperature',
      'Score',
      'Event',
      'Assigned Rep',
    ];

    const headerCells = headers
      .map(
        (h) =>
          `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`
      )
      .join('');

    const dataRows = leads
      .map((l) => {
        const cells = [
          `<Cell><Data ss:Type="String">${escapeXml(l.id)}</Data></Cell>`,
          `<Cell><Data ss:Type="String">${escapeXml(l.firstName)}</Data></Cell>`,
          `<Cell><Data ss:Type="String">${escapeXml(l.lastName)}</Data></Cell>`,
          `<Cell><Data ss:Type="String">${escapeXml(l.email)}</Data></Cell>`,
          `<Cell><Data ss:Type="String">${escapeXml(l.phone)}</Data></Cell>`,
          `<Cell><Data ss:Type="String">${escapeXml(l.company)}</Data></Cell>`,
          `<Cell><Data ss:Type="String">${escapeXml(l.title)}</Data></Cell>`,
          `<Cell><Data ss:Type="String">${escapeXml(l.temperature?.toUpperCase())}</Data></Cell>`,
          `<Cell><Data ss:Type="Number">${l.score || 0}</Data></Cell>`,
          `<Cell><Data ss:Type="String">${escapeXml(l.eventName)}</Data></Cell>`,
          `<Cell><Data ss:Type="String">${escapeXml(l.assignedToName || 'Unassigned')}</Data></Cell>`,
        ].join('');
        return `<Row>${cells}</Row>`;
      })
      .join('');

    return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="HeaderStyle">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Leads">
  <Table>
   <Row>${headerCells}</Row>
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;
  }

  private generateJson(leads: Lead[]): string {
    const payload = {
      exportMetadata: {
        system: 'ExpoDiaries Mobile CRM Ingestion',
        format: 'json',
        generatedAt: new Date().toISOString(),
        recordCount: leads.length,
      },
      leads: leads.map((l) => ({
        id: l.id,
        contact: {
          firstName: l.firstName,
          lastName: l.lastName,
          email: l.email,
          phone: l.phone,
        },
        organization: {
          company: l.company,
          title: l.title,
        },
        qualification: {
          temperature: l.temperature,
          intent: l.intent,
          priority: l.priority,
          score: l.score,
        },
        event: {
          id: l.eventId,
          name: l.eventName,
          booth: l.boothNumber,
          capturedBy: l.capturedByStaffId,
          assignedTo: l.assignedToName,
        },
        notes: l.notes,
        createdAt: l.createdAt,
      })),
    };

    return JSON.stringify(payload, null, 2);
  }
}

export const exportService = new ExportService();
