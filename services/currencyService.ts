import AsyncStorage from '@react-native-async-storage/async-storage';
import { Currency, ExchangeRates, CurrencyPreference, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '../types/currency';

const CURRENCY_PREFERENCE_KEY = 'currency_preference';
const EXCHANGE_RATES_KEY = 'exchange_rates';
const RATES_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export class CurrencyService {
  private static exchangeRates: ExchangeRates = {};
  private static lastRatesUpdate: Date | null = null;

  static async getSelectedCurrency(): Promise<Currency> {
    try {
      const stored = await AsyncStorage.getItem(CURRENCY_PREFERENCE_KEY);
      if (stored) {
        const preference: CurrencyPreference = JSON.parse(stored);
        return preference.selectedCurrency;
      }
      return DEFAULT_CURRENCY;
    } catch (error) {
      console.error('Error loading currency preference:', error);
      return DEFAULT_CURRENCY;
    }
  }

  static async setSelectedCurrency(currency: Currency): Promise<void> {
    try {
      const preference: CurrencyPreference = {
        selectedCurrency: currency,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(CURRENCY_PREFERENCE_KEY, JSON.stringify(preference));
    } catch (error) {
      console.error('Error saving currency preference:', error);
    }
  }

  static async getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
    try {
      // Check if we have cached rates that are still valid
      const cachedRates = await this.getCachedRates();
      if (cachedRates && this.isRatesCacheValid()) {
        this.exchangeRates = cachedRates;
        return cachedRates;
      }

      // Fetch fresh rates from API
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      const rates: ExchangeRates = data.rates;

      // Cache the rates
      await this.cacheRates(rates);
      this.exchangeRates = rates;
      this.lastRatesUpdate = new Date();

      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Return cached rates if available, otherwise return fallback rates
      const cachedRates = await this.getCachedRates();
      if (cachedRates) {
        return cachedRates;
      }
      
      // Fallback rates (approximate values)
      return this.getFallbackRates();
    }
  }

  static async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const rates = await this.getExchangeRates(fromCurrency);
      const rate = rates[toCurrency];
      
      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }

      return amount * rate;
    } catch (error) {
      console.error('Error converting currency:', error);
      // Return original amount if conversion fails
      return amount;
    }
  }

  static formatAmount(amount: number, currency: Currency): string {
    try {
      // Handle special formatting for different currencies
      const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: currency.code === 'JPY' ? 0 : 2,
        maximumFractionDigits: currency.code === 'JPY' ? 0 : 2,
      };

      // Use appropriate locale for formatting
      const locale = this.getLocaleForCurrency(currency.code);
      return new Intl.NumberFormat(locale, options).format(amount);
    } catch (error) {
      console.error('Error formatting amount:', error);
      // Fallback to simple formatting
      return `${currency.symbol}${amount.toFixed(currency.code === 'JPY' ? 0 : 2)}`;
    }
  }

  private static async getCachedRates(): Promise<ExchangeRates | null> {
    try {
      const cached = await AsyncStorage.getItem(EXCHANGE_RATES_KEY);
      if (cached) {
        const { rates, timestamp } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;
        
        if (cacheAge < RATES_CACHE_DURATION) {
          return rates;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading cached rates:', error);
      return null;
    }
  }

  private static async cacheRates(rates: ExchangeRates): Promise<void> {
    try {
      const cacheData = {
        rates,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching rates:', error);
    }
  }

  private static isRatesCacheValid(): boolean {
    if (!this.lastRatesUpdate) return false;
    const cacheAge = Date.now() - this.lastRatesUpdate.getTime();
    return cacheAge < RATES_CACHE_DURATION;
  }

  private static getFallbackRates(): ExchangeRates {
    // Approximate fallback rates (should be updated periodically)
    return {
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.73,
      CAD: 1.25,
      JPY: 110.0,
      AUD: 1.35,
      CHF: 0.92,
    };
  }

  private static getLocaleForCurrency(currencyCode: string): string {
    const localeMap: { [key: string]: string } = {
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      CAD: 'en-CA',
      JPY: 'ja-JP',
      AUD: 'en-AU',
      CHF: 'de-CH',
    };
    return localeMap[currencyCode] || 'en-US';
  }

  static getCurrencyByCode(code: string): Currency | undefined {
    return SUPPORTED_CURRENCIES.find(currency => currency.code === code);
  }
}