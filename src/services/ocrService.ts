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
    const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      throw new Error('Google Cloud API key is missing.');
    }

    // Helper function to convert ArrayBuffer to Base64 in browser environment
    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    };

    const base64Pdf = arrayBufferToBase64(pdfArrayBuffer);
    const requestUrl = `https://vision.googleapis.com/v1/files:annotate?key=${apiKey}`;

    const requestBody = {
      requests: [
        {
          inputConfig: {
            mimeType: 'application/pdf',
            content: base64Pdf,
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error('Google Vision API Error:', errorBody);
        throw new Error(`Google Vision API request failed: ${response.statusText} - ${errorBody?.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      if (data.responses && data.responses.length > 0 && data.responses[0].fullTextAnnotation) {
        return data.responses[0].fullTextAnnotation.text;
      } else {
        // Handle cases where Vision API succeeds but doesn't find text or response format is unexpected
        console.warn('Vision API did not return text, or response format was unexpected:', data);
        throw new Error('No text found by Google Vision API or unexpected response format.');
      }
    } catch (error) {
      console.error('Error calling Google Vision API:', error);
      if (error instanceof Error && error.message.startsWith('Google Vision API request failed')) {
        throw error; // Re-throw specific Vision API errors
      }
      throw new Error('Failed to process PDF with Google Vision API.');
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}