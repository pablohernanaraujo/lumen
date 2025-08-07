import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiService, type CryptoCurrency } from '../../services/api-service';

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

  const hasSearchQuery = searchQuery.length > 0;
  const shouldSearchRemote = searchQuery.length >= MIN_SEARCH_LENGTH;

  // Remote search using API
  const {
    data: remoteSearchData,
    isLoading: isRemoteSearchLoading,
    error: remoteSearchError,
  } = useQuery({
    queryKey: [SEARCH_QUERY_KEY, searchQuery],
    queryFn: async () => {
      if (!shouldSearchRemote) return null;
      const response = await apiService.searchCoins(searchQuery);
      return response.coins;
    },
    enabled: enabled && shouldSearchRemote,
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // Local search for short queries
  const localSearchResults = useMemo(() => {
    if (!hasSearchQuery || shouldSearchRemote) return [];

    const query = searchQuery.toLowerCase().trim();
    return allCryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(query) ||
        crypto.symbol.toLowerCase().includes(query) ||
        crypto.id.toLowerCase().includes(query),
    );
  }, [searchQuery, allCryptos, hasSearchQuery, shouldSearchRemote]);

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

  // Determine which results to show
  const searchResults = useMemo(() => {
    if (!hasSearchQuery) return [];

    if (shouldSearchRemote) {
      return convertedRemoteResults;
    }

    return localSearchResults;
  }, [
    hasSearchQuery,
    shouldSearchRemote,
    convertedRemoteResults,
    localSearchResults,
  ]);

  const clearSearch = (): void => {
    setSearchQuery('');
  };

  return {
    searchResults,
    isSearching: shouldSearchRemote && isRemoteSearchLoading,
    searchError: remoteSearchError as Error | null,
    hasSearchQuery,
    searchQuery,
    setSearchQuery,
    clearSearch,
  };
};
