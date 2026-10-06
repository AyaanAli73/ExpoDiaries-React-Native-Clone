export interface ExtractedCardFields {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
}

export interface OCRResult {
  /**
   * Indicates whether this extraction is simulated by a mock service or a real provider.
   * NEVER false when using mock providers.
   */
  isMock: boolean;
  /**
   * Overall extraction confidence score between 0 and 1.
   */
  confidence: number;
  /**
   * Structured contact fields parsed from the business card.
   */
  fields: ExtractedCardFields;
  /**
   * Per-field confidence scores (0.0 to 1.0).
   */
  fieldConfidences: Record<keyof ExtractedCardFields, number>;
  /**
   * Complete raw OCR text detected by the vision model.
   */
  rawText: string;
  /**
   * Transparent notice acknowledging the provider implementation.
   */
  providerNotice: string;
  /**
   * Simulated or actual processing latency in milliseconds.
   */
  processingTimeMs: number;
  /**
   * Bounding box information for UI overlays if available.
   */
  boundingBlocks?: {
    text: string;
    confidence: number;
    box: { x: number; y: number; width: number; height: number };
  }[];
}

export interface OCROptions {
  detectOrientation?: boolean;
  enhanceContrast?: boolean;
  languageHint?: string;
}

/**
 * Pluggable OCR Provider Interface
 * Allows seamless drop-in replacement with Google Cloud Vision, AWS Textract,
 * Mindee, or native on-device Apple Vision / Google ML Kit engines.
 */
export interface IBusinessCardOCRProvider {
  readonly name: string;
  readonly isMock: boolean;
  processCardImage(imageUri: string, options?: OCROptions): Promise<OCRResult>;
}

export interface LeadDraft {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  cardImageUri: string;
  cardBackImageUri?: string;
  notes?: string;
  temperature: 'hot' | 'warm' | 'cold';
  intent?: 'buying' | 'partnership' | 'information' | 'follow_up' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  fieldConfidences: Record<keyof ExtractedCardFields, number>;
  rawText: string;
  isMock: boolean;
  providerNotice: string;
  eventId?: string;
  eventName?: string;
  boothNumber?: string;
  hall?: string;
  assignedToId?: string;
  assignedToName?: string;
  followUpStatus?: 'none' | 'pending' | 'scheduled' | 'completed';
  followUpDueDate?: string;
}

export function createLeadDraftFromOCR(
  ocrResult: OCRResult,
  imageUri: string,
  defaults?: {
    eventId?: string;
    eventName?: string;
    boothNumber?: string;
    hall?: string;
    temperature?: 'hot' | 'warm' | 'cold';
    intent?: 'buying' | 'partnership' | 'information' | 'follow_up' | 'other';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }
): LeadDraft {
  const f = ocrResult.fields;
  const fullName = `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'Attendee';
  return {
    name: fullName,
    firstName: f.firstName || '',
    lastName: f.lastName || '',
    title: f.title || '',
    company: f.company || '',
    email: f.email || '',
    phone: f.phone || '',
    address: f.address || '',
    website: f.website || '',
    cardImageUri: imageUri,
    temperature: defaults?.temperature || 'warm',
    confidence: ocrResult.confidence,
    fieldConfidences: ocrResult.fieldConfidences,
    rawText: ocrResult.rawText,
    isMock: ocrResult.isMock,
    providerNotice: ocrResult.providerNotice,
    eventId: defaults?.eventId || 'evt-2026-ces',
    eventName: defaults?.eventName || 'CES 2026 International',
    boothNumber: defaults?.boothNumber || 'North Hall #N-408',
    followUpStatus: 'pending',
  };
}
