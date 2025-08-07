/* eslint-disable complexity */
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getCacheTime, getStaleTime } from '../../contexts/query-context';
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

  const infiniteQueryKey = [
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
  ];

  const regularQueryKey = [
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

  // Always call both hooks but conditionally enable them
  const infiniteQuery = useInfiniteQuery<CryptoCurrency[], Error>({
    queryKey: infiniteQueryKey,
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
    staleTime: getStaleTime(infiniteQueryKey),
    gcTime: getCacheTime(infiniteQueryKey),
    // Optimized for infinite scrolling
    refetchOnMount: false, // Don't refetch entire list on mount
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // Background refresh for market data (reduced to prevent rate limits)
    refetchInterval: 10 * 60 * 1000, // 10 minutes for market data (reduced from 3 minutes)
    refetchIntervalInBackground: false,
    meta: {
      errorMessage: 'Failed to fetch cryptocurrency list',
      persist: true,
    },
  });

  const queryResult = useQuery<CryptoCurrency[], Error>({
    queryKey: regularQueryKey,
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
    staleTime: getStaleTime(regularQueryKey),
    gcTime: getCacheTime(regularQueryKey),
    // Network-aware refetch
    refetchOnMount: (query) => {
      const isStale =
        Date.now() - query.state.dataUpdatedAt > getStaleTime(regularQueryKey);
      return isStale && AppState.currentState === 'active';
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // Background refresh for market data (reduced to prevent rate limits)
    refetchInterval: 8 * 60 * 1000, // 8 minutes for paginated market data (reduced from 2 minutes)
    refetchIntervalInBackground: false,
    meta: {
      errorMessage: 'Failed to fetch cryptocurrency list',
      persist: true,
    },
  });

  const loadMore = useCallback(() => {
    if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
      infiniteQuery.fetchNextPage();
    }
  }, [infiniteQuery]);

  // Preload next page for infinite scroll to improve UX
  useEffect(() => {
    if (
      enableInfiniteScroll &&
      infiniteQuery.data &&
      infiniteQuery.hasNextPage &&
      !infiniteQuery.isFetchingNextPage
    ) {
      const allPages = infiniteQuery.data.pages;
      const lastPage = allPages[allPages.length - 1];

      // Preload next page when user is close to the end
      if (lastPage && lastPage.length >= per_page * 0.8) {
        setTimeout(() => {
          if (AppState.currentState === 'active' && infiniteQuery.hasNextPage) {
            infiniteQuery.fetchNextPage();
          }
        }, 1000); // Small delay to avoid aggressive prefetching
      }
    }
  }, [
    enableInfiniteScroll,
    infiniteQuery.data,
    infiniteQuery.hasNextPage,
    infiniteQuery.isFetchingNextPage,
    infiniteQuery,
    per_page,
  ]);

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
