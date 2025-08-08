import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getCacheTime } from '../../contexts/query-context';
import { apiService } from '../../services/api-service';

const SUPPORTED_FIATS_QUERY_KEY = 'supported-vs-currencies';

export interface FiatCurrencyItem {
  code: string; // lowercase per API
  name?: string; // optional friendly name
}

const FIAT_NAMES: Record<string, string> = {
  usd: 'US Dollar',
  eur: 'Euro',
  ars: 'Argentine Peso',
  brl: 'Brazilian Real',
  clp: 'Chilean Peso',
  mxn: 'Mexican Peso',
  gbp: 'British Pound',
  jpy: 'Japanese Yen',
  cny: 'Chinese Yuan',
};

export const useSupportedFiats = (): {
  items: FiatCurrencyItem[];
  isSupported: (code: string) => boolean;
  isLoading: boolean;
  isError: boolean;
} => {
  const queryKey = [SUPPORTED_FIATS_QUERY_KEY];

  const query = useQuery<string[], Error>({
    queryKey,
    queryFn: () => apiService.getSupportedVsCurrencies(),
    staleTime: 24 * 60 * 60 * 1000, // 24h
    gcTime: getCacheTime(queryKey) ?? 24 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    meta: {
      persist: true,
      errorMessage: 'Failed to fetch supported fiats',
    },
  });

  const items: FiatCurrencyItem[] | undefined = useMemo(
    () =>
      query.data?.map((code) => ({
        code,
        name: FIAT_NAMES[code.toLowerCase()],
      })),
    [query.data],
  );

  return {
    ...query,
    items: items || [],
    isSupported: (code: string): boolean => {
      const normalized = code.toLowerCase();
      return (query.data || []).includes(normalized);
    },
  };
};
