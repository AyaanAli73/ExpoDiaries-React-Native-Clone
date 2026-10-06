import {
  ExtractedCardFields,
  IBusinessCardOCRProvider,
  OCROptions,
  OCRResult,
} from './ocr.types';

export interface DemoCardPreset {
  id: string;
  name: string;
  label: string;
  badge: string;
  imageUri: string;
  fields: ExtractedCardFields;
  rawText: string;
}

export const DEMO_BUSINESS_CARDS: DemoCardPreset[] = [
  {
    id: 'card-preset-1',
    name: 'Sarah Connor',
    label: 'Cyberdyne Systems • VP Enterprise AI',
    badge: 'Enterprise VP',
    imageUri: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    fields: {
      firstName: 'Sarah',
      lastName: 'Connor',
      title: 'VP of Enterprise AI Infrastructure',
      company: 'Cyberdyne Systems Corp',
      email: 's.connor@cyberdyne.ai',
      phone: '+1 (415) 890-4421',
      website: 'www.cyberdyne.ai',
      address: '201 Mission St, Suite 1400, San Francisco, CA',
    },
    rawText: `CYBERDYNE SYSTEMS
Sarah Connor
VP of Enterprise AI Infrastructure
Direct: +1 (415) 890-4421
Email: s.connor@cyberdyne.ai
Web: www.cyberdyne.ai
201 Mission St, Suite 1400, San Francisco, CA 94105`,
  },
  {
    id: 'card-preset-2',
    name: 'Alex Rivera',
    label: 'Horizon Robotics • Founder & CEO',
    badge: 'Founder / C-Level',
    imageUri: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
    fields: {
      firstName: 'Alex',
      lastName: 'Rivera',
      title: 'Founder & Chief Executive Officer',
      company: 'Horizon Autonomous Robotics',
      email: 'alex.rivera@horizon-robotics.io',
      phone: '+1 (512) 349-8802',
      website: 'horizon-robotics.io',
      address: '700 Congress Ave, Austin, TX 78701',
    },
    rawText: `HORIZON AUTONOMOUS ROBOTICS
Alex Rivera | Founder & CEO
Mobile: +1 (512) 349-8802
alex.rivera@horizon-robotics.io
https://horizon-robotics.io
700 Congress Ave, Austin, TX`,
  },
  {
    id: 'card-preset-3',
    name: 'Dr. Emily Chen',
    label: 'BioSynth Dynamics • Chief Technology Officer',
    badge: 'Technical Buyer',
    imageUri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    fields: {
      firstName: 'Emily',
      lastName: 'Chen',
      title: 'Chief Technology Officer',
      company: 'BioSynth Dynamics Labs',
      email: 'e.chen@biosynthdynamics.com',
      phone: '+1 (617) 492-3301',
      website: 'biosynthdynamics.com',
      address: '400 Technology Square, Cambridge, MA',
    },
    rawText: `BioSynth Dynamics Labs
Dr. Emily Chen
Chief Technology Officer
Phone: +1 (617) 492-3301
e.chen@biosynthdynamics.com
biosynthdynamics.com
Cambridge, MA`,
  },
  {
    id: 'card-preset-4',
    name: 'Mateo Rossi',
    label: 'Veloce Logistics EU • Head of Global Procurement',
    badge: 'Procurement Decision Maker',
    imageUri: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=800&q=80',
    fields: {
      firstName: 'Mateo',
      lastName: 'Rossi',
      title: 'Head of Global Procurement',
      company: 'Veloce Logistics Europe',
      email: 'mateo.rossi@veloce-logistics.eu',
      phone: '+39 02 8845 2100',
      website: 'www.veloce-logistics.eu',
      address: 'Via Montenapoleone 8, Milan, Italy',
    },
    rawText: `VELOCE LOGISTICS
Mateo Rossi
Head of Global Procurement
Direct: +39 02 8845 2100
mateo.rossi@veloce-logistics.eu
Milano, Italy`,
  },
];

export class MockCardOCRProvider implements IBusinessCardOCRProvider {
  readonly name = 'Mock Vision OCR Engine';
  readonly isMock = true;

  private currentPresetIndex = 0;

  async processCardImage(imageUri: string, _options?: OCROptions): Promise<OCRResult> {
    // Realistic simulated OCR extraction latency (350ms - 550ms)
    const simulatedLatencyMs = 420;
    await new Promise((resolve) => setTimeout(resolve, simulatedLatencyMs));

    // Check if the imageUri matches a known preset, or cycle through presets
    let matchedPreset = DEMO_BUSINESS_CARDS.find((p) => p.imageUri === imageUri);

    if (!matchedPreset) {
      // Pick next preset to provide varied realistic data when testing
      matchedPreset = DEMO_BUSINESS_CARDS[this.currentPresetIndex % DEMO_BUSINESS_CARDS.length];
      this.currentPresetIndex++;
    }

    const { fields, rawText } = matchedPreset;

    return {
      isMock: true,
      confidence: 0.94,
      fields: { ...fields },
      fieldConfidences: {
        firstName: 0.98,
        lastName: 0.97,
        title: 0.93,
        company: 0.96,
        email: 0.99,
        phone: 0.95,
        website: 0.91,
        address: 0.88,
      },
      rawText,
      providerNotice:
        'Mocked OCR Service (Local Simulation) — Integration ready for Google Cloud Vision / AWS Textract / Mindee',
      processingTimeMs: simulatedLatencyMs,
      boundingBlocks: [
        { text: fields.company, confidence: 0.96, box: { x: 30, y: 35, width: 220, height: 28 } },
        {
          text: `${fields.firstName} ${fields.lastName}`,
          confidence: 0.98,
          box: { x: 30, y: 75, width: 180, height: 24 },
        },
        { text: fields.title, confidence: 0.93, box: { x: 30, y: 105, width: 240, height: 18 } },
        { text: fields.email, confidence: 0.99, box: { x: 30, y: 145, width: 210, height: 18 } },
        { text: fields.phone, confidence: 0.95, box: { x: 30, y: 170, width: 160, height: 18 } },
      ],
    };
  }

  /**
   * Helper to manually select a demo preset for trade-show walk-through demos
   */
  getPresetById(id: string): DemoCardPreset | undefined {
    return DEMO_BUSINESS_CARDS.find((p) => p.id === id);
  }
}
