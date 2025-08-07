/* eslint-disable max-statements */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getCacheTime, getStaleTime } from '../../contexts/query-context';
import { apiService, type CryptoCurrency } from '../../services/api-service';
import { useDebounce } from '../../ui/search/use-debounce';

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}

export interface UseSearchCryptosOptions {
  allCryptos?: CryptoCurrency[];
  enabled?: boolean;
}

export interface SearchCryptosResult {
  searchResults: CryptoCurrency[];
  isSearching: boolean;
  searchError: Error | null;
  hasSearchQuery: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

const SEARCH_QUERY_KEY = 'crypto-search';
const MIN_SEARCH_LENGTH = 2;

export const useSearchCryptos = (
  options: UseSearchCryptosOptions = {},
): SearchCryptosResult => {
  const { allCryptos = [], enabled = true } = options;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchTimeout, setIsSearchTimeout] = useState<boolean>(false);

  // Debounce search query to reduce API calls
  const { debouncedValue: debouncedSearchQuery, isDebouncing } = useDebounce(
    searchQuery,
    {
      delay: 500, // Increased to 500ms to reduce API calls
    },
  );

  const hasSearchQuery = searchQuery.length > 0;
  const shouldSearchRemote = debouncedSearchQuery.length >= MIN_SEARCH_LENGTH;

  const searchQueryKey = [SEARCH_QUERY_KEY, debouncedSearchQuery];

  // Remote search using API with error handling
  const {
    data: remoteSearchData,
    isLoading: isRemoteSearchLoading,
    error: remoteSearchError,
    isError: isRemoteSearchError,
  } = useQuery({
    queryKey: searchQueryKey,
    queryFn: async () => {
      if (!shouldSearchRemote) return null;

      try {
        if (__DEV__) {
          console.log(
            `[SearchCryptos] Searching for: "${debouncedSearchQuery}"`,
          );
        }

        const response = await apiService.searchCoins(debouncedSearchQuery);

        if (__DEV__) {
          console.log(
            `[SearchCryptos] Found ${response.coins?.length || 0} results`,
          );
        }

        return response.coins;
      } catch (error) {
        console.error('[SearchCryptos] Search API error:', error);
        // Return null to fallback to local search
        return null;
      }
    },
    enabled: enabled && shouldSearchRemote && !isDebouncing,
    staleTime: getStaleTime(searchQueryKey),
    gcTime: getCacheTime(searchQueryKey),
    // Search-specific optimizations
    refetchOnMount: false, // Don't refetch search results on mount
    refetchOnWindowFocus: false,
    refetchOnReconnect: false, // Don't refetch search on reconnect
    retry: 1, // Only retry once for searches
    retryDelay: 1000, // 1 second retry delay
    meta: {
      errorMessage: `Failed to search for "${debouncedSearchQuery}"`,
      persist: true, // Cache search results
    },
  });

  // Reset timeout when search query changes
  useEffect(() => {
    setIsSearchTimeout(false);
  }, [debouncedSearchQuery]);

  // Set timeout for search (10 seconds max)
  useEffect(() => {
    if (!shouldSearchRemote || !enabled) return;

    const timeoutId = setTimeout(() => {
      if (isRemoteSearchLoading) {
        console.warn('[SearchCryptos] Search timeout after 10 seconds');
        setIsSearchTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [shouldSearchRemote, enabled, isRemoteSearchLoading]);

  // Local search for short queries with improved matching
  const localSearchResults = useMemo(() => {
    if (!hasSearchQuery || shouldSearchRemote) return [];

    const query = debouncedSearchQuery.toLowerCase().trim();
    if (!query) return [];

    // Enhanced search algorithm with scoring
    const scoredResults = allCryptos
      .map((crypto) => {
        let score = 0;
        const name = crypto.name.toLowerCase();
        const symbol = crypto.symbol.toLowerCase();
        const id = crypto.id.toLowerCase();

        // Exact matches get highest score
        if (symbol === query) score += 100;
        else if (name === query) score += 90;
        else if (id === query) score += 80;
        // Starts with matches
        else if (symbol.startsWith(query)) score += 70;
        else if (name.startsWith(query)) score += 60;
        else if (id.startsWith(query)) score += 50;
        // Contains matches
        else if (symbol.includes(query)) score += 30;
        else if (name.includes(query)) score += 20;
        else if (id.includes(query)) score += 10;

        return {
          crypto,
          score,
        };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20) // Limit to top 20 results
      .map(({ crypto }) => crypto);

    return scoredResults;
  }, [debouncedSearchQuery, allCryptos, hasSearchQuery, shouldSearchRemote]);

  // Convert remote search results to CryptoCurrency format
  const convertedRemoteResults = useMemo(() => {
    if (!remoteSearchData) return [];

    return remoteSearchData.map(
      (coin): CryptoCurrency => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.large || coin.thumb,
        current_price: 0, // Will be fetched separately if needed
        market_cap: 0,
        market_cap_rank: coin.market_cap_rank || 0,
        fully_diluted_valuation: 0,
        total_volume: 0,
        high_24h: 0,
        low_24h: 0,
        price_change_24h: 0,
        price_change_percentage_24h: 0,
        market_cap_change_24h: 0,
        market_cap_change_percentage_24h: 0,
        circulating_supply: 0,
        total_supply: 0,
        max_supply: 0,
        ath: 0,
        ath_change_percentage: 0,
        ath_date: '',
        atl: 0,
        atl_change_percentage: 0,
        atl_date: '',
        last_updated: new Date().toISOString(),
      }),
    );
  }, [remoteSearchData]);

  // Determine which results to show with fallback logic
  const searchResults = useMemo(() => {
    if (!hasSearchQuery) return [];

    // If search timed out or errored, use local search as fallback
    if (isSearchTimeout || (isRemoteSearchError && shouldSearchRemote)) {
      if (__DEV__) {
        console.log('[SearchCryptos] Using local search as fallback');
      }
      return localSearchResults;
    }

    if (shouldSearchRemote && !isDebouncing) {
      // If remote search returned results, use them
      if (convertedRemoteResults.length > 0) {
        return convertedRemoteResults;
      }

      // If remote search returned empty but not loading, show empty
      if (!isRemoteSearchLoading && remoteSearchData !== undefined) {
        return [];
      }
    }

    // Show local results while debouncing or for short queries
    return localSearchResults;
  }, [
    hasSearchQuery,
    shouldSearchRemote,
    isDebouncing,
    convertedRemoteResults,
    localSearchResults,
    isSearchTimeout,
    isRemoteSearchError,
    isRemoteSearchLoading,
    remoteSearchData,
  ]);

  const clearSearch = useCallback((): void => {
    setSearchQuery('');
    setIsSearchTimeout(false);
  }, []);

  // Disabled popular search preloading to prevent rate limits
  // Will only search when user actively searches
  useEffect(() => {
    if (enabled && AppState.currentState === 'active') {
      // Preloading disabled to prevent rate limit issues
      console.log(
        '[SearchCryptos] Popular search preloading disabled to prevent rate limits',
      );
    }
  }, [enabled]);

  // Calculate isSearching with timeout protection
  const isSearching = useMemo(() => {
    // If timed out, not searching anymore
    if (isSearchTimeout) return false;

    // If debouncing, show as searching
    if (isDebouncing) return true;

    // If should search remotely and is loading
    if (shouldSearchRemote && isRemoteSearchLoading) return true;

    return false;
  }, [
    isSearchTimeout,
    isDebouncing,
    shouldSearchRemote,
    isRemoteSearchLoading,
  ]);

  return {
    searchResults,
    isSearching,
    searchError: (isSearchTimeout
      ? new Error('Search timeout')
      : remoteSearchError) as Error | null,
    hasSearchQuery,
    searchQuery,
    setSearchQuery,
    clearSearch,
  };
};
