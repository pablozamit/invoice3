import { InvoiceData } from '../types/invoice';
import { CurrencyService } from './currencyService';

export class DataExtractor {
  private static instance: DataExtractor;
  private currencyService = CurrencyService.getInstance();

  private constructor() {}

  static getInstance(): DataExtractor {
    if (!DataExtractor.instance) {
      DataExtractor.instance = new DataExtractor();
    }
    return DataExtractor.instance;
  }

  async extractInvoiceData(text: string): Promise<InvoiceData> {
    const data: Partial<InvoiceData> = {};

    // Extract date
    data.fecha = this.extractDate(text);

    // Extract invoice number
    data.numeroFactura = this.extractInvoiceNumber(text);

    // Extract company name
    data.empresa = this.extractCompanyName(text);

    // Extract concept
    data.concepto = this.extractConcept(text);

    // Extract amounts
    const amounts = this.extractAmounts(text);
    data.baseImponible = amounts.baseImponible;
    data.iva = amounts.iva;
    data.retencionIRPF = amounts.retencionIRPF;
    data.importeTotal = amounts.importeTotal;

    // Detect and convert currency
    const detectedCurrency = this.currencyService.detectCurrency(text);
    if (detectedCurrency !== 'EUR') {
      data.monedaOriginal = detectedCurrency;
      data.importeOriginal = data.importeTotal;
      
      // Convert to EUR
      const numericAmount = this.parseAmount(data.importeTotal || '0');
      const convertedAmount = await this.currencyService.convertToEUR(numericAmount, detectedCurrency);
      data.importeTotal = this.formatCurrency(convertedAmount);
    }

    return data as InvoiceData;
  }

  private extractDate(text: string): string {
    // Multiple date patterns for Spanish invoices
    const datePatterns = [
      /(?:fecha|date|fecha de emisión|fecha factura)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
      /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return this.formatDate(match[1]);
      }
    }

    return this.formatDate(new Date().toLocaleDateString('es-ES'));
  }

  private extractInvoiceNumber(text: string): string {
    const patterns = [
      /(?:factura|invoice|nº|n°|número|number)[:\s#]*([A-Z0-9\-\/]+)/i,
      /(?:FAC|INV|F)[:\s\-]*(\d+)/i,
      /([A-Z]{2,}\-?\d{3,})/g
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return `FAC-${Date.now().toString().slice(-6)}`;
  }

  private extractCompanyName(text: string): string {
    // Look for company patterns
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Usually company name is in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      
      // Skip common headers
      if (!/^(factura|invoice|fecha|date|nº)/i.test(line) && 
          line.length > 3 && 
          line.length < 100) {
        
        // Clean up the company name
        const cleaned = line.replace(/[^\w\s\.\,\-]/g, '').trim();
        if (cleaned.length > 3) {
          return cleaned;
        }
      }
    }

    return 'Empresa no identificada';
  }

  private extractConcept(text: string): string {
    const conceptPatterns = [
      /(?:concepto|descripción|description|servicio|producto)[:\s]*(.*?)(?:\n|total|importe)/i,
      /(?:por|for)[:\s]*(.*?)(?:\n|total|importe)/i
    ];

    for (const pattern of conceptPatterns) {
      const match = text.match(pattern);
      if (match && match[1].trim().length > 0) {
        return match[1].trim().substring(0, 100);
      }
    }

    return 'Servicios profesionales';
  }

  private extractAmounts(text: string): {
    baseImponible: string;
    iva: string;
    retencionIRPF: string;
    importeTotal: string;
  } {
    // Amount patterns for Spanish invoices
    const amounts = {
      baseImponible: '0,00',
      iva: '0,00',
      retencionIRPF: '0,00',
      importeTotal: '0,00'
    };

    // Base imponible patterns
    const basePatterns = [
      /(?:base\s+imponible|subtotal|base)[:\s]*([0-9.,]+)/i,
      /(?:neto|net)[:\s]*([0-9.,]+)/i
    ];

    // IVA patterns
    const ivaPatterns = [
      /(?:iva|vat|tax)[:\s]*([0-9.,]+)/i,
      /(?:21%|iva\s*21)[:\s]*([0-9.,]+)/i
    ];

    // IRPF patterns
    const irpfPatterns = [
      /(?:irpf|retención|retencion)[:\s]*([0-9.,]+)/i,
      /(?:15%|irpf\s*15)[:\s]*([0-9.,]+)/i
    ];

    // Total patterns
    const totalPatterns = [
      /(?:total|importe\s+total|amount)[:\s]*([0-9.,]+)/i,
      /(?:total\s+factura|invoice\s+total)[:\s]*([0-9.,]+)/i,
      /(?:€|EUR)[:\s]*([0-9.,]+)/i
    ];

    // Extract base imponible
    for (const pattern of basePatterns) {
      const match = text.match(pattern);
      if (match) {
        amounts.baseImponible = this.formatAmount(match[1]);
        break;
      }
    }

    // Extract IVA
    for (const pattern of ivaPatterns) {
      const match = text.match(pattern);
      if (match) {
        amounts.iva = this.formatAmount(match[1]);
        break;
      }
    }

    // Extract IRPF
    for (const pattern of irpfPatterns) {
      const match = text.match(pattern);
      if (match) {
        amounts.retencionIRPF = this.formatAmount(match[1]);
        break;
      }
    }

    // Extract total
    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        amounts.importeTotal = this.formatAmount(match[1]);
        break;
      }
    }

    // If no total found, calculate it
    if (amounts.importeTotal === '0,00' && amounts.baseImponible !== '0,00') {
      const base = this.parseAmount(amounts.baseImponible);
      const iva = this.parseAmount(amounts.iva);
      const irpf = this.parseAmount(amounts.retencionIRPF);
      const total = base + iva - irpf;
      amounts.importeTotal = this.formatCurrency(total);
    }

    return amounts;
  }

  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');
    } catch {
      return new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    }
  }

  private formatAmount(amount: string): string {
    // Clean and format amount to Spanish format (comma for decimals)
    const cleaned = amount.replace(/[^\d.,]/g, '');
    const number = parseFloat(cleaned.replace(',', '.'));
    return isNaN(number) ? '0,00' : number.toFixed(2).replace('.', ',');
  }

  private parseAmount(amount: string): number {
    const cleaned = amount.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  private formatCurrency(amount: number): string {
    return amount.toFixed(2).replace('.', ',');
  }
}