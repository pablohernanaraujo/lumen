/* eslint-disable max-statements */
/* eslint-disable complexity */
import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CryptoFilters } from '../screens/modals/filter-modal/types';

const FILTERS_STORAGE_KEY = '@lumen_crypto_filters';

const DEFAULT_FILTERS: CryptoFilters = {
  price: {
    enabled: false,
    min: undefined,
    max: undefined,
  },
  marketCap: {
    enabled: false,
    category: undefined,
    min: undefined,
    max: undefined,
  },
  volume: {
    enabled: false,
    min: undefined,
    max: undefined,
  },
  change24h: {
    enabled: false,
    type: undefined,
    min: undefined,
    max: undefined,
  },
  ranking: {
    enabled: false,
    topN: undefined,
  },
  quickFilters: {
    trending: false,
    recentlyAdded: false,
    highVolume: false,
  },
};

interface FilterContextType {
  filters: CryptoFilters;
  isLoading: boolean;
  hasActiveFilters: boolean;
  clearFilters: () => Promise<void>;
  updatePriceFilter: (min?: number, max?: number) => void;
  updateMarketCapFilter: (
    category?: 'small' | 'mid' | 'large' | 'custom',
    min?: number,
    max?: number,
  ) => void;
  updateVolumeFilter: (min?: number, max?: number) => void;
  updateChange24hFilter: (
    type?: 'gainers' | 'losers' | 'custom',
    min?: number,
    max?: number,
  ) => void;
  updateRankingFilter: (topN?: 10 | 50 | 100 | 500) => void;
  toggleQuickFilter: (
    filterName: 'trending' | 'recentlyAdded' | 'highVolume',
  ) => void;
  getActiveFilterCount: () => number;
  applyFiltersToData: <
    T extends {
      current_price: number;
      market_cap: number;
      total_volume: number;
      price_change_percentage_24h: number;
      market_cap_rank: number;
    },
  >(
    data: T[],
  ) => T[];
  saveFilters: (newFilters: CryptoFilters) => Promise<void>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<CryptoFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Load saved filters on mount
  useEffect(() => {
    loadFilters();
  }, []);

  // Update hasActiveFilters when filters change
  useEffect(() => {
    const active = checkActiveFilters(filters);
    setHasActiveFilters(active);
  }, [filters]);

  const loadFilters = async (): Promise<void> => {
    try {
      const savedFilters = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
      if (savedFilters) {
        setFilters(JSON.parse(savedFilters));
      }
    } catch (error) {
      console.error('Error loading filters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFilters = async (newFilters: CryptoFilters): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify(newFilters),
      );
      setFilters(newFilters);
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  const checkActiveFilters = (currentFilters: CryptoFilters): boolean => {
    if (currentFilters.price?.enabled) return true;
    if (currentFilters.marketCap?.enabled) return true;
    if (currentFilters.volume?.enabled) return true;
    if (currentFilters.change24h?.enabled) return true;
    if (currentFilters.ranking?.enabled) return true;
    if (currentFilters.quickFilters?.trending) return true;
    if (currentFilters.quickFilters?.recentlyAdded) return true;
    if (currentFilters.quickFilters?.highVolume) return true;
    return false;
  };

  const clearFilters = async (): Promise<void> => {
    await saveFilters(DEFAULT_FILTERS);
  };

  const updatePriceFilter = (min?: number, max?: number): void => {
    const newFilters = {
      ...filters,
      price: {
        enabled: min !== undefined || max !== undefined,
        min,
        max,
      },
    };
    saveFilters(newFilters);
  };

  const updateMarketCapFilter = (
    category?: 'small' | 'mid' | 'large' | 'custom',
    min?: number,
    max?: number,
  ): void => {
    const newFilters = {
      ...filters,
      marketCap: {
        enabled: true,
        category,
        min,
        max,
      },
    };
    saveFilters(newFilters);
  };

  const updateVolumeFilter = (min?: number, max?: number): void => {
    const newFilters = {
      ...filters,
      volume: {
        enabled: min !== undefined || max !== undefined,
        min,
        max,
      },
    };
    saveFilters(newFilters);
  };

  const updateChange24hFilter = (
    type?: 'gainers' | 'losers' | 'custom',
    min?: number,
    max?: number,
  ): void => {
    const newFilters = {
      ...filters,
      change24h: {
        enabled: true,
        type,
        min,
        max,
      },
    };
    saveFilters(newFilters);
  };

  const updateRankingFilter = (topN?: 10 | 50 | 100 | 500): void => {
    const newFilters = {
      ...filters,
      ranking: {
        enabled: topN !== undefined,
        topN,
      },
    };
    saveFilters(newFilters);
  };

  const toggleQuickFilter = (
    filterName: 'trending' | 'recentlyAdded' | 'highVolume',
  ): void => {
    const newFilters = {
      ...filters,
      quickFilters: {
        ...filters.quickFilters,
        [filterName]: !filters.quickFilters?.[filterName],
      },
    };
    saveFilters(newFilters);
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.price?.enabled) count++;
    if (filters.marketCap?.enabled) count++;
    if (filters.volume?.enabled) count++;
    if (filters.change24h?.enabled) count++;
    if (filters.ranking?.enabled) count++;
    if (filters.quickFilters?.trending) count++;
    if (filters.quickFilters?.recentlyAdded) count++;
    if (filters.quickFilters?.highVolume) count++;
    return count;
  };

  const applyFiltersToData = <
    T extends {
      current_price: number;
      market_cap: number;
      total_volume: number;
      price_change_percentage_24h: number;
      market_cap_rank: number;
    },
  >(
    data: T[],
  ): T[] => {
    let filteredData = [...data];

    // Apply price filter
    if (filters.price?.enabled) {
      filteredData = filteredData.filter((item) => {
        if (
          filters.price?.min !== undefined &&
          item.current_price < filters.price.min
        ) {
          return false;
        }
        if (
          filters.price?.max !== undefined &&
          item.current_price > filters.price.max
        ) {
          return false;
        }
        return true;
      });
    }

    // Apply market cap filter
    if (filters.marketCap?.enabled) {
      filteredData = filteredData.filter((item) => {
        if (filters.marketCap?.category) {
          switch (filters.marketCap.category) {
            case 'small':
              return item.market_cap < 1000000000; // < $1B
            case 'mid':
              return (
                item.market_cap >= 1000000000 && item.market_cap < 10000000000
              ); // $1B - $10B
            case 'large':
              return item.market_cap >= 10000000000; // >= $10B
            case 'custom':
              if (
                filters.marketCap?.min !== undefined &&
                item.market_cap < filters.marketCap.min
              ) {
                return false;
              }
              if (
                filters.marketCap?.max !== undefined &&
                item.market_cap > filters.marketCap.max
              ) {
                return false;
              }
              return true;
            default:
              return true;
          }
        }
        return true;
      });
    }

    // Apply volume filter
    if (filters.volume?.enabled) {
      filteredData = filteredData.filter((item) => {
        if (
          filters.volume?.min !== undefined &&
          item.total_volume < filters.volume.min
        ) {
          return false;
        }
        if (
          filters.volume?.max !== undefined &&
          item.total_volume > filters.volume.max
        ) {
          return false;
        }
        return true;
      });
    }

    // Apply 24h change filter
    if (filters.change24h?.enabled) {
      filteredData = filteredData.filter((item) => {
        if (filters.change24h?.type) {
          switch (filters.change24h.type) {
            case 'gainers':
              return item.price_change_percentage_24h > 0;
            case 'losers':
              return item.price_change_percentage_24h < 0;
            case 'custom':
              if (
                filters.change24h?.min !== undefined &&
                item.price_change_percentage_24h < filters.change24h.min
              ) {
                return false;
              }
              if (
                filters.change24h?.max !== undefined &&
                item.price_change_percentage_24h > filters.change24h.max
              ) {
                return false;
              }
              return true;
            default:
              return true;
          }
        }
        return true;
      });
    }

    // Apply ranking filter
    if (filters.ranking?.enabled && filters.ranking?.topN) {
      filteredData = filteredData.filter(
        (item) => item.market_cap_rank <= (filters.ranking?.topN || 100),
      );
    }

    // Apply quick filters
    if (filters.quickFilters?.highVolume) {
      // Filter for high volume (top 20% by volume)
      const sortedByVolume = [...filteredData].sort(
        (a, b) => b.total_volume - a.total_volume,
      );
      const top20Percent = Math.ceil(sortedByVolume.length * 0.2);
      const highVolumeThreshold =
        sortedByVolume[top20Percent - 1]?.total_volume || 0;
      filteredData = filteredData.filter(
        (item) => item.total_volume >= highVolumeThreshold,
      );
    }

    return filteredData;
  };

  const value: FilterContextType = {
    filters,
    isLoading,
    hasActiveFilters,
    clearFilters,
    updatePriceFilter,
    updateMarketCapFilter,
    updateVolumeFilter,
    updateChange24hFilter,
    updateRankingFilter,
    toggleQuickFilter,
    getActiveFilterCount,
    applyFiltersToData,
    saveFilters,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
