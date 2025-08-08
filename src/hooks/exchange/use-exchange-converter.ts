/* eslint-disable max-statements */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiService, type CryptoCurrency } from '../../services/api-service';
import type { FiatCurrencyItem } from '../api/use-supported-fiats';

export interface SelectedCurrency {
  type: 'crypto' | 'fiat';
  code: string;
  name: string;
  symbol?: string;
  image?: string;
  decimals: number;
}

export interface ConversionState {
  sourceAmount: string;
  destinationAmount: string;
  sourceCurrency: SelectedCurrency;
  destinationCurrency: SelectedCurrency;
  conversionRate: number | null;
  lastEditedField: 'source' | 'destination';
}

export interface UseExchangeConverterReturn {
  // State
  sourceAmount: string;
  destinationAmount: string;
  sourceCurrency: SelectedCurrency;
  destinationCurrency: SelectedCurrency;
  conversionRate: number | null;
  isLoadingRate: boolean;
  rateError: string | null;

  // Actions
  setSourceAmount: (amount: string) => void;
  setDestinationAmount: (amount: string) => void;
  setSourceCurrency: (currency: SelectedCurrency) => void;
  setDestinationCurrency: (currency: SelectedCurrency) => void;
  swapCurrencies: () => void;

  // Computed values
  rateDisplay: string;
  isValidSourceAmount: boolean;
  isValidDestinationAmount: boolean;
}

const DEFAULT_SOURCE_CURRENCY: SelectedCurrency = {
  type: 'crypto',
  code: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'BTC',
  decimals: 8,
};

const DEFAULT_DESTINATION_CURRENCY: SelectedCurrency = {
  type: 'fiat',
  code: 'usd',
  name: 'US Dollar',
  symbol: 'USD',
  decimals: 2,
};

export const createCurrencyFromCrypto = (
  crypto: CryptoCurrency,
): SelectedCurrency => ({
  type: 'crypto',
  code: crypto.id,
  name: crypto.name,
  symbol: crypto.symbol.toUpperCase(),
  image: crypto.image,
  decimals: 8, // Most cryptos support 8 decimals
});

export const createCurrencyFromFiat = (
  fiat: FiatCurrencyItem,
): SelectedCurrency => ({
  type: 'fiat',
  code: fiat.code,
  name: fiat.name || fiat.code.toUpperCase(),
  symbol: fiat.code.toUpperCase(),
  decimals: 2, // Most fiats use 2 decimals
});

const isValidAmount = (amount: string, decimals: number): boolean => {
  if (!amount || amount === '0' || amount === '') return true;

  const regex = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`);
  return (
    regex.test(amount) && !Number.isNaN(Number(amount)) && Number(amount) >= 0
  );
};

const formatAmount = (amount: number, decimals: number): string => {
  if (amount === 0) return '0';

  // Remove trailing zeros and format to appropriate decimals
  const formatted = amount.toFixed(decimals);
  return formatted.replace(/\.?0+$/, '');
};

// Helper to fetch crypto-to-fiat rate
const fetchCryptoToFiatRate = async (
  cryptoCode: string,
  fiatCode: string,
): Promise<number> => {
  const markets = await apiService.getCoinsMarkets({
    ids: cryptoCode,
    vs_currency: fiatCode,
    per_page: 1,
  });

  if (markets && markets.length > 0 && markets[0].current_price) {
    return markets[0].current_price;
  }

  throw new Error(`Unable to fetch ${cryptoCode} to ${fiatCode} rate`);
};

// Helper to fetch fiat-to-crypto rate
const fetchFiatToCryptoRate = async (
  fiatCode: string,
  cryptoCode: string,
): Promise<number> => {
  const markets = await apiService.getCoinsMarkets({
    ids: cryptoCode,
    vs_currency: fiatCode,
    per_page: 1,
  });

  if (markets && markets.length > 0 && markets[0].current_price) {
    return 1 / markets[0].current_price;
  }

  throw new Error(`Unable to fetch ${fiatCode} to ${cryptoCode} rate`);
};

// Helper to fetch crypto-to-crypto rate
const fetchCryptoToCryptoRate = async (
  sourceCryptoCode: string,
  destCryptoCode: string,
): Promise<number> => {
  const [sourceMarkets, destMarkets] = await Promise.all([
    apiService.getCoinsMarkets({
      ids: sourceCryptoCode,
      vs_currency: 'usd',
      per_page: 1,
    }),
    apiService.getCoinsMarkets({
      ids: destCryptoCode,
      vs_currency: 'usd',
      per_page: 1,
    }),
  ]);

  if (sourceMarkets?.[0]?.current_price && destMarkets?.[0]?.current_price) {
    return sourceMarkets[0].current_price / destMarkets[0].current_price;
  }

  throw new Error(
    `Unable to fetch ${sourceCryptoCode} to ${destCryptoCode} rate`,
  );
};

// Main conversion rate fetcher
const fetchConversionRate = async (
  sourceCurrency: SelectedCurrency,
  destinationCurrency: SelectedCurrency,
): Promise<number> => {
  // Same currency = 1:1 rate
  if (sourceCurrency.code === destinationCurrency.code) {
    return 1;
  }

  if (sourceCurrency.type === 'crypto' && destinationCurrency.type === 'fiat') {
    return fetchCryptoToFiatRate(sourceCurrency.code, destinationCurrency.code);
  }

  if (sourceCurrency.type === 'fiat' && destinationCurrency.type === 'crypto') {
    return fetchFiatToCryptoRate(sourceCurrency.code, destinationCurrency.code);
  }

  if (
    sourceCurrency.type === 'crypto' &&
    destinationCurrency.type === 'crypto'
  ) {
    return fetchCryptoToCryptoRate(
      sourceCurrency.code,
      destinationCurrency.code,
    );
  }

  // Fiat to fiat - would need exchange rate API
  // For now, throw error as CoinGecko doesn't directly support this
  throw new Error('Fiat-to-fiat conversion not supported yet');
};

export const useExchangeConverter = (): UseExchangeConverterReturn => {
  const [state, setState] = useState<ConversionState>({
    sourceAmount: '0',
    destinationAmount: '0',
    sourceCurrency: DEFAULT_SOURCE_CURRENCY,
    destinationCurrency: DEFAULT_DESTINATION_CURRENCY,
    conversionRate: null,
    lastEditedField: 'source',
  });

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Fetch conversion rate
  const {
    data: rateData,
    isLoading: isLoadingRate,
    error: rateError,
  } = useQuery({
    queryKey: [
      'conversion-rate',
      state.sourceCurrency.code,
      state.destinationCurrency.code,
      state.sourceCurrency.type,
      state.destinationCurrency.type,
    ],
    queryFn: () =>
      fetchConversionRate(state.sourceCurrency, state.destinationCurrency),
    enabled: Boolean(
      state.sourceCurrency.code && state.destinationCurrency.code,
    ),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update conversion rate when data changes
  useEffect(() => {
    if (rateData && typeof rateData === 'number') {
      setState((prev) => ({
        ...prev,
        conversionRate: rateData,
      }));
    }
  }, [rateData]);

  // Perform conversion calculation
  const calculateConversion = useCallback(
    (amount: string, rate: number | null, toDecimals: number): string => {
      if (!rate || !amount || amount === '0' || amount === '') {
        return '0';
      }

      const numAmount = Number(amount);
      if (Number.isNaN(numAmount) || numAmount <= 0) {
        return '0';
      }

      const converted = numAmount * rate;
      return formatAmount(converted, toDecimals);
    },
    [],
  );

  // Update amounts when rate changes
  useEffect(() => {
    if (
      state.conversionRate &&
      (state.sourceAmount !== '0' || state.destinationAmount !== '0')
    ) {
      if (state.lastEditedField === 'source' && state.sourceAmount !== '0') {
        const newDestAmount = calculateConversion(
          state.sourceAmount,
          state.conversionRate,
          state.destinationCurrency.decimals,
        );
        setState((prev) => ({
          ...prev,
          destinationAmount: newDestAmount,
        }));
      } else if (
        state.lastEditedField === 'destination' &&
        state.destinationAmount !== '0'
      ) {
        const newSourceAmount = calculateConversion(
          state.destinationAmount,
          state.conversionRate ? 1 / state.conversionRate : null,
          state.sourceCurrency.decimals,
        );
        setState((prev) => ({
          ...prev,
          sourceAmount: newSourceAmount,
        }));
      }
    }
  }, [
    state.conversionRate,
    state.sourceAmount,
    state.destinationAmount,
    state.lastEditedField,
    state.sourceCurrency.decimals,
    state.destinationCurrency.decimals,
    calculateConversion,
  ]);

  const setSourceAmount = useCallback(
    (amount: string) => {
      // Clear debounce timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      setState((prev) => ({
        ...prev,
        sourceAmount: amount,
        lastEditedField: 'source',
      }));

      // Debounce the conversion calculation
      const timeout = setTimeout(() => {
        setState((prev) => {
          if (prev.conversionRate && amount && amount !== '0') {
            const newDestAmount = calculateConversion(
              amount,
              prev.conversionRate,
              prev.destinationCurrency.decimals,
            );
            return {
              ...prev,
              destinationAmount: newDestAmount,
            };
          }
          return {
            ...prev,
            destinationAmount: '0',
          };
        });
      }, 300);

      setDebounceTimeout(timeout);
    },
    [debounceTimeout, calculateConversion],
  );

  const setDestinationAmount = useCallback(
    (amount: string) => {
      // Clear debounce timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      setState((prev) => ({
        ...prev,
        destinationAmount: amount,
        lastEditedField: 'destination',
      }));

      // Debounce the conversion calculation
      const timeout = setTimeout(() => {
        setState((prev) => {
          if (prev.conversionRate && amount && amount !== '0') {
            const newSourceAmount = calculateConversion(
              amount,
              prev.conversionRate ? 1 / prev.conversionRate : null,
              prev.sourceCurrency.decimals,
            );
            return {
              ...prev,
              sourceAmount: newSourceAmount,
            };
          }
          return {
            ...prev,
            sourceAmount: '0',
          };
        });
      }, 300);

      setDebounceTimeout(timeout);
    },
    [debounceTimeout, calculateConversion],
  );

  const setSourceCurrency = useCallback((currency: SelectedCurrency) => {
    setState((prev) => ({
      ...prev,
      sourceCurrency: currency,
      conversionRate: null, // Reset rate to trigger refetch
    }));
  }, []);

  const setDestinationCurrency = useCallback((currency: SelectedCurrency) => {
    setState((prev) => ({
      ...prev,
      destinationCurrency: currency,
      conversionRate: null, // Reset rate to trigger refetch
    }));
  }, []);

  const swapCurrencies = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sourceCurrency: prev.destinationCurrency,
      destinationCurrency: prev.sourceCurrency,
      sourceAmount: prev.destinationAmount,
      destinationAmount: prev.sourceAmount,
      conversionRate: prev.conversionRate ? 1 / prev.conversionRate : null,
      lastEditedField:
        prev.lastEditedField === 'source' ? 'destination' : 'source',
    }));
  }, []);

  // Cleanup timeout on unmount
  useEffect(
    () => () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    },
    [debounceTimeout],
  );

  // Computed values
  const rateDisplay = useMemo(() => {
    if (!state.conversionRate || isLoadingRate) {
      return `1 ${state.sourceCurrency.symbol} ≈ —`;
    }

    const formattedRate = formatAmount(
      state.conversionRate,
      state.destinationCurrency.decimals,
    );
    return `1 ${state.sourceCurrency.symbol} ≈ ${formattedRate} ${state.destinationCurrency.symbol}`;
  }, [
    state.conversionRate,
    state.sourceCurrency,
    state.destinationCurrency,
    isLoadingRate,
  ]);

  const isValidSourceAmount = useMemo(
    () => isValidAmount(state.sourceAmount, state.sourceCurrency.decimals),
    [state.sourceAmount, state.sourceCurrency.decimals],
  );

  const isValidDestinationAmount = useMemo(
    () =>
      isValidAmount(
        state.destinationAmount,
        state.destinationCurrency.decimals,
      ),
    [state.destinationAmount, state.destinationCurrency.decimals],
  );

  return {
    // State
    sourceAmount: state.sourceAmount,
    destinationAmount: state.destinationAmount,
    sourceCurrency: state.sourceCurrency,
    destinationCurrency: state.destinationCurrency,
    conversionRate: state.conversionRate,
    isLoadingRate,
    rateError: rateError ? rateError.message : null,

    // Actions
    setSourceAmount,
    setDestinationAmount,
    setSourceCurrency,
    setDestinationCurrency,
    swapCurrencies,

    // Computed values
    rateDisplay,
    isValidSourceAmount,
    isValidDestinationAmount,
  };
};
