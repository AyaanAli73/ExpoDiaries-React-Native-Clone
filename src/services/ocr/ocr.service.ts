import { MockCardOCRProvider } from './mock-card-ocr.provider';
import { IBusinessCardOCRProvider, OCROptions, OCRResult } from './ocr.types';

export class OCRService {
  private activeProvider: IBusinessCardOCRProvider;

  constructor(provider?: IBusinessCardOCRProvider) {
    this.activeProvider = provider || new MockCardOCRProvider();
  }

  /**
   * Set or swap active OCR engine (e.g. swap to CloudVisionOCRProvider when API key is provided)
   */
  setProvider(provider: IBusinessCardOCRProvider) {
    this.activeProvider = provider;
  }

  getProviderName(): string {
    return this.activeProvider.name;
  }

  isMock(): boolean {
    return this.activeProvider.isMock;
  }

  /**
   * Process a captured business card image through the active OCR pipeline
   */
  async processCardImage(imageUri: string, options?: OCROptions): Promise<OCRResult> {
    return this.activeProvider.processCardImage(imageUri, options);
  }

  async processCard(imageUri: string, options?: OCROptions): Promise<OCRResult> {
    return this.processCardImage(imageUri, options);
  }
}

export const ocrService = new OCRService();
