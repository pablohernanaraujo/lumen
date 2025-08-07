/* eslint-disable complexity */
import { useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  apiService,
  type CoinsMarketsParams,
  type CryptoCurrency,
} from '../../services/api-service';

export interface UseCryptoListOptions extends CoinsMarketsParams {
  enabled?: boolean;
  enableInfiniteScroll?: boolean;
}

export interface CryptoListQueryResult {
  cryptos: CryptoCurrency[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  data: CryptoCurrency[] | undefined;
  status: 'pending' | 'error' | 'success';
  loadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export const CRYPTO_LIST_QUERY_KEY = 'crypto-list';

export const useCryptoList = (
  options: UseCryptoListOptions = {},
): CryptoListQueryResult => {
  const {
    enabled = true,
    enableInfiniteScroll = false,
    vs_currency = 'usd',
    order = 'market_cap_desc',
    per_page = 20,
    page = 1,
    sparkline = false,
    price_change_percentage = '24h',
    ...restOptions
  } = options;

  // Always call both hooks but conditionally enable them
  const infiniteQuery = useInfiniteQuery<CryptoCurrency[], Error>({
    queryKey: [
      CRYPTO_LIST_QUERY_KEY,
      'infinite',
      {
        vs_currency,
        order,
        per_page,
        sparkline,
        price_change_percentage,
        ...restOptions,
      },
    ],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getCoinsMarkets({
        vs_currency,
        order,
        per_page,
        page: pageParam as number,
        sparkline,
        price_change_percentage,
        ...restOptions,
      }),
    enabled: enabled && enableInfiniteScroll,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < per_page) {
        return;
      }
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const queryResult = useQuery<CryptoCurrency[], Error>({
    queryKey: [
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
    ],
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
    enabled: enabled && !enableInfiniteScroll,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const loadMore = useCallback(() => {
    if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
      infiniteQuery.fetchNextPage();
    }
  }, [infiniteQuery]);

  if (enableInfiniteScroll) {
    const allData = infiniteQuery.data?.pages.flat();

    return {
      cryptos: allData,
      isLoading: infiniteQuery.isLoading,
      isError: infiniteQuery.isError,
      error: infiniteQuery.error,
      refetch: infiniteQuery.refetch,
      data: allData,
      status: infiniteQuery.status,
      loadMore,
      hasNextPage: infiniteQuery.hasNextPage,
      isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    };
  }

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
