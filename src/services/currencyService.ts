import axios from 'axios';

interface ExchangeRates {
  [key: string]: number;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private rates: ExchangeRates = {};
  private lastUpdate: Date | null = null;
  private readonly API_URL = 'https://api.exchangerate-api.com/v4/latest/EUR';

  private constructor() {}

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  async updateRates(): Promise<void> {
    try {
      const response = await axios.get(this.API_URL);
      this.rates = response.data.rates;
      this.lastUpdate = new Date();
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      // Fallback rates if API fails
      this.rates = {
        USD: 1.08,
        GBP: 0.86,
        CHF: 0.93,
        JPY: 161.50,
        CAD: 1.47,
        AUD: 1.65
      };
    }
  }

  async convertToEUR(amount: number, fromCurrency: string): Promise<number> {
    if (fromCurrency === 'EUR' || fromCurrency === '€') {
      return amount;
    }

    // Update rates if they're older than 1 hour or don't exist
    if (!this.lastUpdate || Date.now() - this.lastUpdate.getTime() > 3600000) {
      await this.updateRates();
    }

    const rate = this.rates[fromCurrency.toUpperCase()];
    if (!rate) {
      console.warn(`Exchange rate not found for ${fromCurrency}, using original amount`);
      return amount;
    }

    // Convert from EUR to target currency rate to target currency to EUR rate
    return amount / rate;
  }

  detectCurrency(text: string): string {
    const currencyPatterns = {
      'USD': /\$|USD|dollar/i,
      'GBP': /£|GBP|pound/i,
      'CHF': /CHF|franc/i,
      'JPY': /¥|JPY|yen/i,
      'EUR': /€|EUR|euro/i
    };

    for (const [currency, pattern] of Object.entries(currencyPatterns)) {
      if (pattern.test(text)) {
        return currency;
      }
    }

    return 'EUR'; // Default to EUR
  }
}