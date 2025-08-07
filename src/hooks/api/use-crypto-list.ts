import { useQuery } from '@tanstack/react-query';

import {
  apiService,
  type CoinsMarketsParams,
  type CryptoCurrency,
} from '../../services/api-service';

export interface UseCryptoListOptions extends CoinsMarketsParams {
  enabled?: boolean;
}

export interface CryptoListQueryResult {
  cryptos: CryptoCurrency[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  data: CryptoCurrency[] | undefined;
  status: 'pending' | 'error' | 'success';
}

export const CRYPTO_LIST_QUERY_KEY = 'crypto-list';

export const useCryptoList = (
  options: UseCryptoListOptions = {},
): CryptoListQueryResult => {
  const {
    enabled = true,
    vs_currency = 'usd',
    order = 'market_cap_desc',
    per_page = 20,
    page = 1,
    sparkline = false,
    price_change_percentage = '24h',
    ...restOptions
  } = options;

  const queryKey = [
    CRYPTO_LIST_QUERY_KEY,
    {
      vs_currency,
      order,
      per_page,
      page,
      sparkline,
      price_change_percentage,
      ...restOptions,
    },
  ];

  const queryResult = useQuery<CryptoCurrency[], Error>({
    queryKey,
    queryFn: () =>
      apiService.getCoinsMarkets({
        vs_currency,
        order,
        per_page,
        page,
        sparkline,
        price_change_percentage,
        ...restOptions,
      }),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes - crypto prices change frequently
    gcTime: 1000 * 60 * 5, // 5 minutes cache time
  });

  return {
    cryptos: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    data: queryResult.data,
    status: queryResult.status,
  };
};
