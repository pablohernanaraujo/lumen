/* eslint-disable complexity */
/* eslint-disable max-statements */
import React, { type FC, type ReactElement, useCallback, useMemo } from 'react';
import {
  FlatList,
  type ListRenderItem,
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

// FlatList optimization constants
const ITEM_HEIGHT = 80; // Fixed height from CryptoItem
const ITEM_MARGIN_BOTTOM = 8; // margin from theme.spacing.sm
const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN_BOTTOM;
const INITIAL_NUM_TO_RENDER = 10;
const WINDOW_SIZE = 10;
const MAX_TO_RENDER_PER_BATCH = 10;
const UPDATE_CELLS_BATCHING_PERIOD = 50;
const ON_END_REACHED_THRESHOLD = 0.5;

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
  footerContainer: {
    paddingVertical: theme.spacing.lg,
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
    loadMore,
    isFetchingNextPage,
  } = useCryptoScreenData(navigation, filters);

  const renderFilterBadges = useMemo((): ReactElement | null => {
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
  }, [filters, styles]);

  const renderCryptoItem: ListRenderItem<CryptoCurrency> = useCallback(
    ({ item }) => (
      <CryptoItem
        crypto={item}
        onPress={handleCryptoPress}
        testID={`crypto-item-${item.id}`}
      />
    ),
    [handleCryptoPress],
  );

  const renderEmptyComponent = useCallback((): ReactElement => {
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
            message={
              searchError.message === 'Search timeout'
                ? 'La búsqueda tardó demasiado. Intenta con un término más corto.'
                : 'No se pudo conectar con el servidor. Mostrando resultados locales.'
            }
            variant="search"
            actionText="Reintentar"
            onAction={() => {
              // Clear and retry search
              handleClearSearch();
              // Force a new search after clearing
              setTimeout(() => handleInputChange(searchQuery), 100);
            }}
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
  }, [
    hasSearchQuery,
    isSearching,
    searchError,
    searchQuery,
    filters,
    handleClearSearch,
    handleInputChange,
  ]);

  const getItemLayout = useCallback(
    (_: ArrayLike<CryptoCurrency> | null | undefined, index: number) => ({
      length: TOTAL_ITEM_HEIGHT,
      offset: TOTAL_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item: CryptoCurrency) => item.id, []);

  const handleEndReached = useCallback(() => {
    if (hasSearchQuery || !loadMore) {
      if (__DEV__ && hasSearchQuery) {
        console.log('[CryptoListScreen] onEndReached skipped - search active');
      }
      return;
    }

    if (__DEV__) {
      console.log(
        '[CryptoListScreen] onEndReached triggered - calling loadMore()',
      );
    }

    loadMore();
  }, [hasSearchQuery, loadMore]);

  const renderFooter = useCallback((): ReactElement | null => {
    if (hasSearchQuery) return null;

    // Show loading indicator when fetching next page
    if (isFetchingNextPage) {
      if (__DEV__) {
        console.log('[CryptoListScreen] Showing load-more indicator');
      }
      return (
        <LoadingIndicator
          size="small"
          showLabel
          label="Cargando más criptomonedas..."
          testID="load-more-indicator"
          style={styles.footerContainer}
        />
      );
    }

    // Show "end of list" message if no more pages and we have data
    if (displayData && displayData.length > 20 && loadMore) {
      // Check if we actually tried to load more but there are no more pages
      // This helps indicate we've reached the end instead of infinite loading
      return (
        <View style={[styles.footerContainer, { alignItems: 'center' }]}>
          <Text style={styles.emptyState}>
            {displayData.length >= 1000
              ? 'Mostrando top 1000 criptomonedas'
              : ''}
          </Text>
        </View>
      );
    }

    return null;
  }, [
    hasSearchQuery,
    isFetchingNextPage,
    displayData,
    loadMore,
    styles.footerContainer,
    styles.emptyState,
  ]);

  const viewabilityConfig = useMemo(
    () => ({
      viewAreaCoveragePercentThreshold: 50,
      minimumViewTime: 100,
      waitForInteraction: true,
    }),
    [],
  );

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
            {renderFilterBadges}
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
          {renderFilterBadges}
        </VStack>
      </ContentWrapper>

      <FlatList
        data={displayData}
        renderItem={renderCryptoItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={INITIAL_NUM_TO_RENDER}
        windowSize={WINDOW_SIZE}
        removeClippedSubviews
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        updateCellsBatchingPeriod={UPDATE_CELLS_BATCHING_PERIOD}
        onEndReached={handleEndReached}
        onEndReachedThreshold={ON_END_REACHED_THRESHOLD}
        ListFooterComponent={renderFooter}
        viewabilityConfig={viewabilityConfig}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          !hasSearchQuery ? (
            <RefreshControl
              refreshing={isLoading && !isFetchingNextPage}
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
