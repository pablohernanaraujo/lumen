/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-statements */
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

import { AddressStorageService } from '../../services/address-storage-service';
import { analyticsService } from '../../services/analytics-service';
import { makeStyles } from '../../theme';
import type {
  AddressFilter,
  AddressSort,
  StoredAddress,
} from '../../types/address-history-types';
import {
  ContentWrapper,
  EmptyState,
  ErrorState,
  Icon,
  LoadingIndicator,
  ScreenWrapper,
  SearchBar,
} from '../../ui';
import { HistoryFilterModal } from './history-filter-modal';
import { HistoryItemComponent } from './history-item-component';
import { LabelEditModal } from './label-edit-modal';

interface HistoryScreenProps {
  navigation: NavigationProp<Record<string, object | undefined>>;
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: theme.spacing.xs,
  },
}));

export const HistoryScreen: FC<HistoryScreenProps> = ({ navigation }) => {
  const styles = useStyles();

  // State
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<AddressFilter>({});
  const [sort, setSort] = useState<AddressSort>({
    field: 'dateLastUsed',
    order: 'desc',
  });

  // Modal states
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [labelEditItem, setLabelEditItem] = useState<StoredAddress | null>(
    null,
  );

  // Load addresses
  const loadAddresses = useCallback(
    async (showRefreshIndicator = false): Promise<void> => {
      try {
        if (showRefreshIndicator) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const currentFilter = { ...filter };
        if (searchQuery.trim()) {
          currentFilter.searchQuery = searchQuery.trim();
        }

        const loadedAddresses = await AddressStorageService.getAddresses(
          currentFilter,
          sort,
        );

        setAddresses(loadedAddresses);
        console.log('[HistoryScreen] Loaded addresses:', {
          count: loadedAddresses.length,
          filter: currentFilter,
          sort,
        });
      } catch (loadError) {
        console.error('[HistoryScreen] Failed to load addresses:', loadError);
        setError('Failed to load address history');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filter, sort, searchQuery],
  );

  // Load addresses on screen focus
  useFocusEffect(
    useCallback(() => {
      loadAddresses().then(() => {
        // Track history opened event after addresses are loaded
        const favoriteCount = addresses.filter(
          (addr) => addr.isFavorite,
        ).length;
        analyticsService.track('history_opened', {
          source_screen: 'tab_navigation',
          total_addresses: addresses.length,
          favorites_count: favoriteCount,
        });
      });
    }, [loadAddresses, addresses.length]),
  );

  // Reload when filter or sort changes
  useEffect(() => {
    if (!isLoading) {
      loadAddresses();
    }
  }, [filter, sort]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLoading) {
        loadAddresses().then(() => {
          // Track search event if there's a search query
          if (searchQuery.trim()) {
            analyticsService.track('history_searched', {
              query_length: searchQuery.trim().length,
              results_count: addresses.length,
            });
          }
        });
      }
    }, 300);

    return (): void => clearTimeout(timeoutId);
  }, [searchQuery, addresses.length, isLoading, loadAddresses]);

  // Event handlers
  const handleRefresh = useCallback((): void => {
    loadAddresses(true);
  }, [loadAddresses]);

  const handleAddressPress = useCallback((item: StoredAddress): void => {
    // Track address details view
    analyticsService.track('address_details_viewed', {
      blockchain_type: item.network,
      usage_count: item.usageCount,
      has_label: !!item.label,
      is_favorite: item.isFavorite,
    });

    Alert.alert(
      'Address Details',
      `Network: ${item.network}\nAddress: ${item.address}\n${
        item.label ? `Label: ${item.label}\n` : ''
      }Used: ${item.usageCount} times\nLast used: ${new Date(item.dateLastUsed).toLocaleString()}`,
      [
        {
          text: 'Copy Address',
          onPress: (): void => {
            // TODO: Implement clipboard copy
            console.log('Copy address:', item.address);
          },
        },
        {
          text: 'Close',
          style: 'cancel',
        },
      ],
    );
  }, []);

  const handleFavoriteToggle = useCallback(
    async (item: StoredAddress): Promise<void> => {
      try {
        const newFavoriteStatus = await AddressStorageService.toggleFavorite(
          item.id,
        );

        // Update local state
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === item.id
              ? {
                  ...addr,
                  isFavorite: newFavoriteStatus,
                }
              : addr,
          ),
        );

        console.log('[HistoryScreen] Favorite toggled:', {
          id: item.id,
          isFavorite: newFavoriteStatus,
        });
      } catch (toggleError) {
        console.error(
          '[HistoryScreen] Failed to toggle favorite:',
          toggleError,
        );
        Alert.alert('Error', 'Failed to update favorite status');
      }
    },
    [],
  );

  const handleDelete = useCallback(
    async (item: StoredAddress): Promise<void> => {
      try {
        await AddressStorageService.deleteAddress(item.id);

        // Remove from local state
        setAddresses((prev) => prev.filter((addr) => addr.id !== item.id));

        console.log('[HistoryScreen] Address deleted:', item.id);
      } catch (deleteError) {
        console.error('[HistoryScreen] Failed to delete address:', deleteError);
        throw deleteError; // Re-throw to show error in component
      }
    },
    [],
  );

  const handleLabelEdit = useCallback((item: StoredAddress): void => {
    setLabelEditItem(item);
  }, []);

  const handleLabelSave = useCallback(
    async (item: StoredAddress, newLabel: string): Promise<void> => {
      try {
        await AddressStorageService.updateLabel(item.id, newLabel);

        // Update local state
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === item.id
              ? {
                  ...addr,
                  label: newLabel.trim() || undefined,
                }
              : addr,
          ),
        );

        setLabelEditItem(null);

        console.log('[HistoryScreen] Label updated:', {
          id: item.id,
          label: newLabel,
        });
      } catch (labelError) {
        console.error('[HistoryScreen] Failed to update label:', labelError);
        throw labelError; // Re-throw to show error in modal
      }
    },
    [],
  );

  const handleFilterPress = useCallback((): void => {
    setIsFilterModalVisible(true);
  }, []);

  const handleFilterApply = useCallback(
    (newFilter: AddressFilter): void => {
      // Determine filter type
      const filterTypes: string[] = [];
      if (newFilter.network) filterTypes.push('network');
      if (newFilter.isFavorite !== undefined) filterTypes.push('favorite');
      if (newFilter.dateFrom || newFilter.dateTo)
        filterTypes.push('date_range');

      const filterType =
        filterTypes.length > 1 ? 'combined' : filterTypes[0] || 'none';

      // Track filter application
      if (filterType !== 'none') {
        analyticsService.track('history_filtered', {
          filter_type: filterType,
          results_count: addresses.length, // This will be updated after the filter is applied
        });
      }

      setFilter(newFilter);
      setIsFilterModalVisible(false);
    },
    [addresses.length],
  );

  const handleSortChange = useCallback((newSort: AddressSort): void => {
    setSort(newSort);
  }, []);

  const handleClearFilters = useCallback((): void => {
    setFilter({});
    setSearchQuery('');
  }, []);

  // Computed values
  const hasActiveFilters = useMemo(
    (): boolean =>
      !!(
        searchQuery ||
        filter.network ||
        filter.isFavorite !== undefined ||
        filter.dateFrom ||
        filter.dateTo
      ),
    [searchQuery, filter],
  );

  const filteredCount = addresses.length;

  // Render methods
  const renderItem = useCallback(
    ({ item, index }: { item: StoredAddress; index: number }) => (
      <HistoryItemComponent
        item={item}
        onPress={handleAddressPress}
        onFavoriteToggle={handleFavoriteToggle}
        onDelete={handleDelete}
        onLabelEdit={handleLabelEdit}
        testID={`history-item-${index}`}
      />
    ),
    [handleAddressPress, handleFavoriteToggle, handleDelete, handleLabelEdit],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [styles.separator],
  );

  const renderEmptyState = useCallback(() => {
    if (hasActiveFilters) {
      return (
        <EmptyState
          title="No hay direcciones que coincidan"
          message="Intentá ajustar tu búsqueda o criterios de filtro"
          actionText="Limpiar filtros"
          onAction={handleClearFilters}
          testID="empty-filtered-state"
        />
      );
    }

    return (
      <EmptyState
        title="No hay historial de escaneos"
        message="Tus direcciones criptográficas escaneadas aparecerán aquí"
        actionText="Comenzar escaneo"
        onAction={(): void => navigation.navigate('Scanner' as any)}
        testID="empty-history-state"
      />
    );
  }, [hasActiveFilters, handleClearFilters, navigation]);

  if (error) {
    return (
      <ErrorState
        title="Error al cargar"
        message={error}
        retryText="Reintentar"
        onRetry={(): void => {
          loadAddresses();
        }}
        testID="history-error-state"
      />
    );
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <LoadingIndicator label="Cargando historial..." showLabel />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper disableSafeArea>
      {/* Search and Filter Bar */}
      <ContentWrapper variant="body">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar direcciones, etiquetas o redes..."
              testID="history-search-bar"
            />
          </View>
          <TouchableOpacity
            onPress={handleFilterPress}
            style={{
              padding: 12,
              backgroundColor: hasActiveFilters ? '#e3f2fd' : 'transparent',
              borderRadius: 8,
            }}
            testID="filter-button"
          >
            <Icon
              name="filter-list"
              family="MaterialIcons"
              size={24}
              color={hasActiveFilters ? '#1976d2' : '#666'}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item): string => item.id}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              testID="history-refresh-control"
            />
          }
          removeClippedSubviews
          maxToRenderPerBatch={10}
          initialNumToRender={20}
          windowSize={10}
          testID="history-list"
        />
      </ContentWrapper>

      {/* Filter Modal */}
      <HistoryFilterModal
        visible={isFilterModalVisible}
        filter={filter}
        sort={sort}
        onApply={handleFilterApply}
        onClose={(): void => setIsFilterModalVisible(false)}
        onSortChange={handleSortChange}
      />

      {/* Label Edit Modal */}
      {labelEditItem && (
        <LabelEditModal
          visible={true}
          item={labelEditItem}
          onSave={handleLabelSave}
          onClose={(): void => setLabelEditItem(null)}
        />
      )}
    </ScreenWrapper>
  );
};
