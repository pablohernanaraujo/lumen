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
      // If the last page is empty or has no data, no more pages
      if (!lastPage || lastPage.length === 0) {
        return;
      }

      // If the last page has fewer items than requested, it's likely the last page
      // But allow one more request to be sure (API might return exactly per_page on last page)
      if (lastPage.length < per_page) {
        return;
      }

      // Add safety limit to prevent infinite pagination (max 20 pages = 1000 cryptos)
      if (allPages.length >= 20) {
        console.warn('[useCryptoList] Reached maximum page limit (20 pages)');
        return;
      }

      const nextPage = allPages.length + 1;
      if (__DEV__) {
        console.log(
          `[useCryptoList] Loading page ${nextPage}, last page had ${lastPage.length} items`,
        );
      }
      return nextPage;
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
    if (!infiniteQuery.hasNextPage) {
      if (__DEV__) {
        console.log(
          '[useCryptoList] loadMore called but no more pages available',
        );
      }
      return;
    }

    if (infiniteQuery.isFetchingNextPage) {
      if (__DEV__) {
        console.log(
          '[useCryptoList] loadMore called but already fetching next page',
        );
      }
      return;
    }

    if (__DEV__) {
      const currentPages = infiniteQuery.data?.pages.length || 0;
      console.log(
        `[useCryptoList] loadMore triggered - fetching page ${currentPages + 1}`,
      );
    }

    infiniteQuery.fetchNextPage();
  }, [infiniteQuery]);

  // Preload next page for infinite scroll (DISABLED - was causing loading issues)
  // This automatic preloading was interfering with manual load-more functionality
  // and triggering rate limiting. Manual loadMore() via onEndReached is preferred.
  useEffect(() => {
    // Preloading disabled to prevent interference with manual scroll loading
    // and to avoid triggering rate limiting
    if (__DEV__ && enableInfiniteScroll && infiniteQuery.data) {
      const allPages = infiniteQuery.data.pages;
      const totalItems = allPages.reduce((sum, page) => sum + page.length, 0);
      console.log(
        `[useCryptoList] ${allPages.length} pages loaded, ${totalItems} total items, hasNext: ${infiniteQuery.hasNextPage}`,
      );
    }
  }, [enableInfiniteScroll, infiniteQuery.data, infiniteQuery.hasNextPage]);

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
