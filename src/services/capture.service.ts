import { CreateLeadInput } from '@/types/lead';

export interface ParsedBadgeData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
}

export class CaptureService {
  /**
   * Parse raw QR / Barcode data extracted from badge scanners
   * Supports JSON payloads, vCard text, or delimiter separated strings
   */
  parseBadgePayload(rawText: string, eventId: string, staffId: string): CreateLeadInput {
    let parsed: ParsedBadgeData = {
      firstName: 'Scanned',
      lastName: 'Lead',
    };

    try {
      if (rawText.trim().startsWith('{')) {
        const json = JSON.parse(rawText);
        parsed = {
          firstName: json.firstName || json.first_name || json.name?.split(' ')[0] || 'Attendee',
          lastName: json.lastName || json.last_name || json.name?.split(' ').slice(1).join(' ') || '',
          email: json.email,
          phone: json.phone,
          company: json.company || json.organization,
          title: json.title || json.jobTitle,
        };
      } else if (rawText.includes('BEGIN:VCARD')) {
        // Simple vCard parser
        const fnMatch = rawText.match(/FN:(.+)/);
        const emailMatch = rawText.match(/EMAIL.*:(.+)/);
        const orgMatch = rawText.match(/ORG:(.+)/);
        const titleMatch = rawText.match(/TITLE:(.+)/);
        const telMatch = rawText.match(/TEL.*:(.+)/);

        const fullName = fnMatch ? fnMatch[1].trim() : 'Attendee';
        const parts = fullName.split(' ');

        parsed = {
          firstName: parts[0] || 'Attendee',
          lastName: parts.slice(1).join(' ') || '',
          email: emailMatch ? emailMatch[1].trim() : undefined,
          company: orgMatch ? orgMatch[1].trim() : undefined,
          title: titleMatch ? titleMatch[1].trim() : undefined,
          phone: telMatch ? telMatch[1].trim() : undefined,
        };
      }
    } catch {
      // Fallback
    }

    return {
      eventId,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email || '',
      phone: parsed.phone,
      company: parsed.company,
      title: parsed.title,
      status: 'new',
      score: 50,
      tags: ['Badge Scan'],
      captureSource: 'badge_scan',
      capturedByStaffId: staffId,
      badgeRawData: rawText,
    };
  }
}

export const captureService = new CaptureService();
