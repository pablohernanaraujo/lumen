/* eslint-disable complexity */
/* eslint-disable max-statements */
import React, { type FC, type ReactElement } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Header } from '../../../components';
import { useCryptoList, useSearchCryptos } from '../../../hooks';
import type { CryptoListScreenProps } from '../../../routing';
import { useCryptoFilters } from '../../../screens/modals/filter-modal';
import type { CryptoCurrency } from '../../../services/api-service';
import { makeStyles } from '../../../theme';
import {
  ContentWrapper,
  CryptoItem,
  Icon,
  ScreenWrapper,
  SearchBar,
  VStack,
} from '../../../ui';

const useStyles = makeStyles((theme) => ({
  emptyState: {
    textAlign: 'center',
    fontSize: theme.typography.size.lg,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xl,
  },
  retryButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  retryText: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  searchContainer: {
    paddingBottom: theme.spacing.sm,
  },
  searchEmptyState: {
    textAlign: 'center',
    fontSize: theme.typography.size.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  emptyStateContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  filterBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  filterBadge: {
    backgroundColor: theme.colors.primary.light,
    borderRadius: 999,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  filterBadgeText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.weight.medium,
  },
  clearFiltersButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearFiltersText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weight.medium,
  },
}));

const SearchEmptyState: FC<{
  isSearching: boolean;
  searchError: Error | null;
  searchQuery: string;
  styles: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}> = ({ isSearching, searchError, searchQuery, styles }) => {
  if (isSearching) {
    return (
      <VStack spacing="md" style={styles.emptyStateContainer}>
        <Icon name="search" family="MaterialIcons" size="xxxl" />
        <Text style={styles.searchEmptyState}>Buscando criptomonedas...</Text>
      </VStack>
    );
  }

  if (searchError) {
    return (
      <VStack spacing="md" style={styles.emptyStateContainer}>
        <Icon name="search-off" family="MaterialIcons" size="xxxl" />
        <Text style={styles.searchEmptyState}>
          Error al buscar. Inténtalo de nuevo.
        </Text>
      </VStack>
    );
  }

  return (
    <VStack spacing="md" style={styles.emptyStateContainer}>
      <Icon name="search" family="MaterialIcons" size="xxxl" />
      <Text style={styles.searchEmptyState}>
        No se encontraron criptomonedas para "{searchQuery}"
      </Text>
    </VStack>
  );
};

const useCryptoScreenData = (
  navigation: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  filters: ReturnType<typeof useCryptoFilters>,
): {
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
} => {
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

export const CryptoListScreen: FC<CryptoListScreenProps> = ({ navigation }) => {
  const styles = useStyles();
  const filters = useCryptoFilters();

  const {
    cryptos,
    isLoading,
    isError,
    refetch,
    isSearching,
    searchError,
    hasSearchQuery,
    searchQuery,
    displayData,
    handleCryptoPress,
    handleInputChange,
    handleClearSearch,
  } = useCryptoScreenData(navigation, filters);

  const renderCryptoItem = ({
    item,
  }: {
    item: CryptoCurrency;
  }): ReactElement => (
    <CryptoItem
      crypto={item}
      onPress={handleCryptoPress}
      testID={`crypto-item-${item.id}`}
    />
  );

  const renderEmptyComponent = (): ReactElement => {
    if (hasSearchQuery) {
      return (
        <SearchEmptyState
          isSearching={isSearching}
          searchError={searchError}
          searchQuery={searchQuery}
          styles={styles}
        />
      );
    }

    return <Text style={styles.emptyState}>No cryptocurrencies found</Text>;
  };

  if (isLoading && !cryptos) {
    return (
      <ScreenWrapper>
        <ContentWrapper variant="screen">
          <VStack spacing="xl">
            <Icon name="hourglass-empty" family="MaterialIcons" size="xxxl" />
            <Text style={styles.emptyState}>Loading cryptocurrencies...</Text>
          </VStack>
        </ContentWrapper>
      </ScreenWrapper>
    );
  }

  if (isError && !cryptos) {
    return (
      <ScreenWrapper>
        <ContentWrapper variant="screen">
          <VStack spacing="xl">
            <Icon name="error-outline" family="MaterialIcons" size="xxxl" />
            <Text style={styles.emptyState}>
              Failed to load cryptocurrencies
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={styles.retryButton}
              testID="retry-button"
            >
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </VStack>
        </ContentWrapper>
      </ScreenWrapper>
    );
  }

  const renderFilterBadges = (): ReactElement | null => {
    if (!filters.hasActiveFilters) return null;

    const badges = [];

    if (filters.filters.price?.enabled) {
      const min = filters.filters.price.min;
      const max = filters.filters.price.max;
      let label = 'Precio';
      if (min !== undefined && max !== undefined) {
        label = `$${min} - $${max}`;
      } else if (min !== undefined) {
        label = `> $${min}`;
      } else if (max !== undefined) {
        label = `< $${max}`;
      }
      badges.push({
        key: 'price',
        label,
      });
    }

    if (filters.filters.marketCap?.enabled) {
      const category = filters.filters.marketCap.category;
      badges.push({
        key: 'marketCap',
        label:
          category === 'small'
            ? 'Small Cap'
            : category === 'mid'
              ? 'Mid Cap'
              : category === 'large'
                ? 'Large Cap'
                : 'Market Cap',
      });
    }

    if (filters.filters.change24h?.enabled) {
      const type = filters.filters.change24h.type;
      badges.push({
        key: 'change',
        label:
          type === 'gainers'
            ? 'Ganadores'
            : type === 'losers'
              ? 'Perdedores'
              : 'Cambio 24h',
      });
    }

    if (filters.filters.ranking?.enabled && filters.filters.ranking.topN) {
      badges.push({
        key: 'ranking',
        label: `Top ${filters.filters.ranking.topN}`,
      });
    }

    if (filters.filters.quickFilters?.trending) {
      badges.push({
        key: 'trending',
        label: 'Tendencia',
      });
    }

    if (filters.filters.quickFilters?.highVolume) {
      badges.push({
        key: 'highVolume',
        label: 'Alto Volumen',
      });
    }

    return (
      <View style={styles.filterBadgeContainer}>
        {badges.map((badge) => (
          <View key={badge.key} style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{badge.label}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={() => filters.clearFilters()}
          testID="clear-filters-badge"
        >
          <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <Header
        showFilterButton
        activeFilterCount={filters.getActiveFilterCount()}
      />
      <ContentWrapper variant="body">
        <SearchBar
          value={searchQuery}
          onChangeText={handleInputChange}
          onClear={handleClearSearch}
          placeholder="Buscar criptomonedas..."
          testID="crypto-search-bar"
        />
        {renderFilterBadges()}
      </ContentWrapper>

      <FlatList
        data={displayData}
        renderItem={renderCryptoItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          !hasSearchQuery ? (
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              testID="refresh-control"
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmptyComponent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </ScreenWrapper>
  );
};
