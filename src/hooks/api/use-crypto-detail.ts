import { AppState } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getCacheTime, getStaleTime } from '../../contexts/query-context';
import {
  apiService,
  type CryptoCurrencyDetail,
} from '../../services/api-service';

export interface UseCryptoDetailOptions {
  cryptoId: string;
  enabled?: boolean;
  localization?: boolean;
  tickers?: boolean;
  market_data?: boolean;
  community_data?: boolean;
  developer_data?: boolean;
  sparkline?: boolean;
}

export interface CryptoDetailQueryResult {
  crypto: CryptoCurrencyDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  data: CryptoCurrencyDetail | undefined;
  status: 'pending' | 'error' | 'success';
}

export const CRYPTO_DETAIL_QUERY_KEY = 'crypto-detail';

export const useCryptoDetail = (
  options: UseCryptoDetailOptions,
): CryptoDetailQueryResult => {
  const {
    cryptoId,
    enabled = true,
    localization = false,
    tickers = false,
    market_data = true,
    community_data = false,
    developer_data = false,
    sparkline = false,
  } = options;

  const queryKey = [
    CRYPTO_DETAIL_QUERY_KEY,
    cryptoId,
    {
      localization,
      tickers,
      market_data,
      community_data,
      developer_data,
      sparkline,
    },
  ];

  const queryResult = useQuery<CryptoCurrencyDetail, Error>({
    queryKey,
    queryFn: () =>
      apiService.getCoinById(cryptoId, {
        localization,
        tickers,
        market_data,
        community_data,
        developer_data,
        sparkline,
      }),
    enabled: enabled && Boolean(cryptoId),
    staleTime: getStaleTime(queryKey), // Dynamic stale time
    gcTime: getCacheTime(queryKey), // Dynamic cache time
    // Network-aware refetch settings
    refetchOnMount: (query) => {
      // Only refetch if data is stale and app is active
      const isStale =
        Date.now() - query.state.dataUpdatedAt > getStaleTime(queryKey);
      return isStale && AppState.currentState === 'active';
    },
    refetchOnWindowFocus: false, // Disabled for mobile
    refetchOnReconnect: 'always',
    // Background refetch for critical data (reduced to prevent rate limits)
    refetchInterval: market_data ? 15 * 60 * 1000 : false, // 15 minutes if market data is needed (reduced from 5 minutes)
    refetchIntervalInBackground: false, // Don't refetch in background
    // Optimistic updates and error boundaries
    meta: {
      errorMessage: `Failed to fetch details for ${cryptoId}`,
      persist: true, // Persist this query to disk cache
    },
  });

  return {
    crypto: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    data: queryResult.data,
    status: queryResult.status,
  };
};
