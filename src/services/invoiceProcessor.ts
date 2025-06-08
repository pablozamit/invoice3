import { InvoiceData, ProcessingStatus } from '../types/invoice';
import { OCRService } from './ocrService';
import { DataExtractor } from './dataExtractor';
import { GoogleSheetsService } from './googleSheetsService';
import { GoogleDriveService } from './googleDriveService';
import { GoogleAuthService } from './googleAuth';

export class InvoiceProcessor {
  private static instance: InvoiceProcessor;
  private ocrService = OCRService.getInstance();
  private dataExtractor = DataExtractor.getInstance();
  private sheetsService = GoogleSheetsService.getInstance();
  private driveService = GoogleDriveService.getInstance();
  private authService = GoogleAuthService.getInstance();
  
  private constructor() {}
  
  static getInstance(): InvoiceProcessor {
    if (!InvoiceProcessor.instance) {
      InvoiceProcessor.instance = new InvoiceProcessor();
    }
    return InvoiceProcessor.instance;
  }

  async processFile(
    file: File,
    onStatusUpdate: (status: ProcessingStatus) => void
  ): Promise<InvoiceData> {
    try {
      // Step 1: Initialize Google APIs
      onStatusUpdate({
        status: 'uploading',
        progress: 5,
        message: 'Inicializando servicios de Google...'
      });

      await this.authService.initialize();
      await this.sheetsService.initializeSheet();

      // Step 2: Extract text from file
      onStatusUpdate({
        status: 'processing',
        progress: 20,
        message: 'Extrayendo texto del documento...'
      });

      let extractedText: string;
      
      if (file.type === 'application/pdf') {
        extractedText = await this.ocrService.extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        extractedText = await this.ocrService.extractTextFromImage(file);
      } else {
        throw new Error('Tipo de archivo no soportado');
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No se pudo extraer texto del documento');
      }

      // Step 3: Extract invoice data
      onStatusUpdate({
        status: 'extracting',
        progress: 40,
        message: 'Analizando datos de la factura...'
      });

      const invoiceData = await this.dataExtractor.extractInvoiceData(extractedText);

      // Step 4: Currency conversion (handled in data extraction)
      onStatusUpdate({
        status: 'converting',
        progress: 60,
        message: 'Procesando conversión de moneda...'
      });

      // Step 5: Upload to Google Drive
      onStatusUpdate({
        status: 'saving',
        progress: 75,
        message: 'Subiendo archivo a Google Drive...'
      });

      const fileName = this.driveService.generateFileName(
        invoiceData.empresa,
        invoiceData.fecha,
        invoiceData.importeTotal
      );

      const driveUrl = await this.driveService.uploadFile(file, fileName);
      console.log('File uploaded to Drive:', driveUrl);

      // Step 6: Save to Google Sheets
      onStatusUpdate({
        status: 'saving',
        progress: 90,
        message: 'Guardando datos en Google Sheets...'
      });

      await this.sheetsService.saveInvoiceData(invoiceData);

      // Step 7: Complete
      onStatusUpdate({
        status: 'completed',
        progress: 100,
        message: 'Procesamiento completado exitosamente'
      });

      return invoiceData;

    } catch (error) {
      console.error('Processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      onStatusUpdate({
        status: 'error',
        progress: 0,
        message: 'Error en el procesamiento',
        error: errorMessage
      });
      
      throw error;
    }
  }

  async checkGoogleAuth(): Promise<boolean> {
    try {
      await this.authService.initialize();
      return this.authService.isSignedIn();
    } catch (error) {
      console.error('Google Auth check failed:', error);
      return false;
    }
  }

  async signInToGoogle(): Promise<void> {
    await this.authService.signIn();
  }
}