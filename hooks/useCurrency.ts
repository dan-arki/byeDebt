import { useState, useEffect } from 'react';
import { Currency, ExchangeRates, DEFAULT_CURRENCY } from '../types/currency';
import { CurrencyService } from '../services/currencyService';

export function useCurrency() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurrency = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currency = await CurrencyService.getSelectedCurrency();
      setSelectedCurrency(currency);
      
      // Load exchange rates
      const rates = await CurrencyService.getExchangeRates();
      setExchangeRates(rates);
    } catch (err) {
      console.error('Error loading currency:', err);
      setError('Failed to load currency settings');
    } finally {
      setLoading(false);
    }
  };

  const changeCurrency = async (currency: Currency) => {
    try {
      await CurrencyService.setSelectedCurrency(currency);
      setSelectedCurrency(currency);
      
      // Refresh exchange rates for new base currency
      const rates = await CurrencyService.getExchangeRates(currency.code);
      setExchangeRates(rates);
    } catch (err) {
      console.error('Error changing currency:', err);
      setError('Failed to change currency');
    }
  };

  const convertAmount = async (
    amount: number,
    fromCurrency: string,
    toCurrency?: string
  ): Promise<number> => {
    const targetCurrency = toCurrency || selectedCurrency.code;
    return await CurrencyService.convertAmount(amount, fromCurrency, targetCurrency);
  };

  const formatAmount = (amount: number, currency?: Currency): string => {
    const targetCurrency = currency || selectedCurrency;
    return CurrencyService.formatAmount(amount, targetCurrency);
  };

  const refreshRates = async () => {
    try {
      setError(null);
      const rates = await CurrencyService.getExchangeRates(selectedCurrency.code);
      setExchangeRates(rates);
    } catch (err) {
      console.error('Error refreshing rates:', err);
      setError('Failed to refresh exchange rates');
    }
  };

  useEffect(() => {
    loadCurrency();
  }, []);

  return {
    selectedCurrency,
    exchangeRates,
    loading,
    error,
    changeCurrency,
    convertAmount,
    formatAmount,
    refreshRates,
  };
}