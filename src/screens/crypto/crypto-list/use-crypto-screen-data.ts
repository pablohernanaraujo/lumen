import { useCryptoList, useSearchCryptos } from '../../../hooks';
import { useCryptoFilters } from '../../../screens/modals/filter-modal';
import type { CryptoCurrency } from '../../../services/api-service';

// Type for navigation prop (better than any)
interface NavigationProp {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
}

// Return type of the hook
interface UseCryptoScreenDataReturn {
  cryptos: CryptoCurrency[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  searchResults: CryptoCurrency[];
  isSearching: boolean;
  searchError: Error | null;
  hasSearchQuery: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  displayData: CryptoCurrency[] | undefined;
  isDataLoading: boolean;
  handleCryptoPress: (cryptoId: string) => void;
  handleInputChange: (query: string) => void;
  handleClearSearch: () => void;
  filteredData: CryptoCurrency[] | undefined;
}

export const useCryptoScreenData = (
  navigation: NavigationProp,
  filters: ReturnType<typeof useCryptoFilters>,
): UseCryptoScreenDataReturn => {
  const { cryptos, isLoading, isError, refetch } = useCryptoList({
    per_page: 20,
    order: 'market_cap_desc',
  });

  const {
    searchResults,
    isSearching,
    searchError,
    hasSearchQuery,
    searchQuery,
    setSearchQuery,
    clearSearch,
  } = useSearchCryptos({
    allCryptos: cryptos || [],
  });

  // Apply filters to data
  const baseData = hasSearchQuery ? searchResults : cryptos;
  const filteredData = baseData
    ? filters.applyFiltersToData(baseData)
    : undefined;
  const displayData = filteredData;
  const isDataLoading = hasSearchQuery ? isSearching : isLoading;

  const handleCryptoPress = (cryptoId: string): void => {
    navigation.navigate('CryptoDetail', { cryptoId });
  };

  const handleInputChange = (query: string): void => {
    setSearchQuery(query);
  };

  const handleClearSearch = (): void => {
    clearSearch();
  };

  return {
    cryptos,
    isLoading,
    isError,
    refetch,
    searchResults,
    isSearching,
    searchError,
    hasSearchQuery,
    searchQuery,
    setSearchQuery,
    displayData,
    isDataLoading,
    handleCryptoPress,
    handleInputChange,
    handleClearSearch,
    filteredData,
  };
};
