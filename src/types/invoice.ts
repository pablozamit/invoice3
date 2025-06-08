export interface InvoiceData {
  fecha: string;
  numeroFactura: string;
  empresa: string;
  concepto: string;
  baseImponible: string;
  iva: string;
  retencionIRPF: string;
  importeTotal: string;
  monedaOriginal?: string;
  importeOriginal?: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'extracting' | 'converting' | 'saving' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: ProcessingStatus;
  extractedData?: InvoiceData;
}