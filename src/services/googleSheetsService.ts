import { InvoiceData } from '../types/invoice';
import { GoogleAuthService } from './googleAuth';
import { loadSheetId } from './configService';

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private authService = GoogleAuthService.getInstance();

  private constructor() {}

  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  async saveInvoiceData(data: InvoiceData): Promise<void> {
    try {
      await this.authService.signIn();
      const client = this.authService.getClient();

      if (!client) {
        throw new Error('Google API client not initialized');
      }

      const userDefinedSheetId = loadSheetId();
      const spreadsheetId = userDefinedSheetId || import.meta.env.VITE_GOOGLE_SHEETS_ID;

      if (!spreadsheetId) {
        throw new Error('Google Sheet ID is not configured. Please set it in the .env file or in the application settings.');
      }

      // First, check for duplicates
      const isDuplicate = await this.checkForDuplicate(data.numeroFactura, data.empresa, spreadsheetId);
      if (isDuplicate) {
        throw new Error(`Ya existe una factura con el número ${data.numeroFactura} de la empresa ${data.empresa}`);
      }

      // Prepare the row data
      const values = [
        [
          data.fecha,
          data.numeroFactura,
          data.empresa,
          data.concepto,
          data.baseImponible,
          data.iva,
          data.retencionIRPF,
          data.importeTotal,
          data.monedaOriginal || 'EUR',
          data.importeOriginal || data.importeTotal,
          new Date().toLocaleString('es-ES')
        ]
      ];

      // Append the data to the sheet
      const response = await client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'A:K', // Adjust range as needed
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values
        }
      });

      console.log('Data saved to Google Sheets:', response);
    } catch (error) {
      console.error('Error saving to Google Sheets:', error);
      throw error;
    }
  }

  private async checkForDuplicate(invoiceNumber: string, company: string, sheetId: string): Promise<boolean> {
    // sheetId is now passed as a parameter, already resolved by the calling function
    try {
      const client = this.authService.getClient();
      // const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID; // No longer needed here

      const response = await client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A:C' // Check columns A (fecha), B (numeroFactura), C (empresa)
      });

      const rows = response.result.values || [];
      
      // Skip header row and check for duplicates
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[1] === invoiceNumber && row[2] === company) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false; // If we can't check, proceed with saving
    }
  }

  async initializeSheet(): Promise<void> {
    try {
      await this.authService.signIn();
      const client = this.authService.getClient();

      const userDefinedSheetId = loadSheetId();
      const spreadsheetId = userDefinedSheetId || import.meta.env.VITE_GOOGLE_SHEETS_ID;

      if (!spreadsheetId) {
        // For initialization, we might not want to throw an error hard,
        // as the app might load before .env or config is fully set.
        // However, other operations will fail. For now, let's log and return.
        // Or, decide if init should also throw if no ID. For consistency, let's throw.
        console.error('Google Sheet ID is not configured. Cannot initialize sheet.');
        throw new Error('Google Sheet ID is not configured. Please set it in the .env file or in the application settings.');
      }

      // Check if headers exist, if not, add them
      const response = await client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A1:K1'
      });

      if (!response.result.values || response.result.values.length === 0) {
        // Add headers
        const headers = [
          'Fecha',
          'Nº Factura',
          'Empresa',
          'Concepto',
          'Base Imponible',
          'IVA',
          'Retención IRPF',
          'Importe Total',
          'Moneda Original',
          'Importe Original',
          'Fecha Procesamiento'
        ];

        await client.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'A1:K1', // Ensure this matches your header length
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [headers]
          }
        });
      }
    } catch (error) {
      console.error('Error initializing sheet:', error);
    }
  }
}