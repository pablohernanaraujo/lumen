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
import type { CryptoListScreenProps } from '../../../routing';
import { useCryptoFilters } from '../../../screens/modals/filter-modal';
import type { CryptoCurrency } from '../../../services/api-service';
import { makeStyles } from '../../../theme';
import {
  ContentWrapper,
  CryptoItem,
  EmptyState,
  ErrorState,
  LoadingIndicator,
  ScreenWrapper,
  SearchBar,
  SkeletonList,
  VStack,
} from '../../../ui';
import { useCryptoScreenData } from './use-crypto-screen-data';

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
    sortBy,
    setSortBy,
  } = useCryptoScreenData(navigation, filters);

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
      if (isSearching) {
        return (
          <LoadingIndicator
            size="large"
            showLabel
            label="Buscando criptomonedas..."
            testID="search-loading"
          />
        );
      }

      if (searchError) {
        return (
          <EmptyState
            icon="search-off"
            title="Error al buscar"
            message="No se pudo completar la búsqueda. Inténtalo de nuevo."
            variant="search"
            testID="search-error"
          />
        );
      }

      return (
        <EmptyState
          variant="search"
          message={`No se encontraron criptomonedas para "${searchQuery}"`}
          testID="search-empty"
        />
      );
    }

    if (filters.hasActiveFilters) {
      return (
        <EmptyState
          variant="filter"
          actionText="Limpiar filtros"
          onAction={() => filters.clearFilters()}
          testID="filter-empty"
        />
      );
    }

    return (
      <EmptyState
        title="Sin criptomonedas"
        message="No hay criptomonedas disponibles en este momento."
        testID="list-empty"
      />
    );
  };

  if (isLoading && !cryptos) {
    return (
      <ScreenWrapper>
        <Header
          showFilterButton
          activeFilterCount={filters.getActiveFilterCount()}
          showSortButton
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <ContentWrapper variant="body">
          <VStack>
            <SearchBar
              value={searchQuery}
              onChangeText={handleInputChange}
              onClear={handleClearSearch}
              placeholder="Buscar criptomonedas..."
              testID="crypto-search-bar"
            />
            {renderFilterBadges()}
          </VStack>
        </ContentWrapper>
        <SkeletonList
          count={10}
          variant="crypto-item"
          testID="crypto-skeleton-list"
        />
      </ScreenWrapper>
    );
  }

  if (isError && !cryptos) {
    return (
      <ScreenWrapper>
        <Header
          showFilterButton
          activeFilterCount={filters.getActiveFilterCount()}
          showSortButton
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <ErrorState
          title="Error de conexión"
          message="No se pudieron cargar las criptomonedas. Verifica tu conexión a internet e intenta nuevamente."
          onRetry={() => refetch()}
          testID="crypto-error-state"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        showFilterButton
        activeFilterCount={filters.getActiveFilterCount()}
        showSortButton
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <ContentWrapper variant="body">
        <VStack>
          <SearchBar
            value={searchQuery}
            onChangeText={handleInputChange}
            onClear={handleClearSearch}
            placeholder="Buscar criptomonedas..."
            testID="crypto-search-bar"
          />
          {renderFilterBadges()}
        </VStack>
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
