import { createWorker } from 'tesseract.js';

export class OCRService {
  private static instance: OCRService;
  private worker: any = null;

  private constructor() {}

  static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async initialize(): Promise<void> {
    if (this.worker) return;

    this.worker = await createWorker('spa', 1, {
      logger: m => console.log(m)
    });
  }

  async extractTextFromImage(imageFile: File): Promise<string> {
    if (!this.worker) {
      await this.initialize();
    }

    try {
      const { data: { text } } = await this.worker.recognize(imageFile);
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Error al extraer texto de la imagen');
    }
  }

  async extractTextFromPDF(pdfFile: File): Promise<string> {
    // For PDFs, we'll use a different approach
    // First try to extract text directly, if that fails, convert to image and use OCR
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      
      // Try to use pdf-parse for text extraction
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(arrayBuffer);
      
      if (data.text && data.text.trim().length > 0) {
        return data.text;
      } else {
        // If no text found, it's likely a scanned PDF
        // Convert to image and use OCR
        return await this.convertPDFToImageAndOCR(arrayBuffer);
      }
    } catch (error) {
      console.error('PDF Text Extraction Error:', error);
      throw new Error('Error al extraer texto del PDF');
    }
  }

  private async convertPDFToImageAndOCR(pdfArrayBuffer: ArrayBuffer): Promise<string> {
    // This would require pdf-to-image conversion
    // For now, we'll throw an error and suggest using Google Vision API
    throw new Error('PDF escaneado detectado. Se requiere Google Vision API para procesamiento completo.');
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}