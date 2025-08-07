import { useQuery } from '@tanstack/react-query';

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
    staleTime: 1000 * 60 * 3, // 3 minutes - detailed data can be cached a bit longer
    gcTime: 1000 * 60 * 10, // 10 minutes cache time
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
