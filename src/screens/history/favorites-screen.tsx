/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-statements */
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

import { AddressStorageService } from '../../services/address-storage-service';
import { makeStyles } from '../../theme';
import type {
  AddressSort,
  StoredAddress,
} from '../../types/address-history-types';
import {
  Body1,
  ContentWrapper,
  EmptyState,
  ErrorState,
  H2,
  LoadingIndicator,
  ScreenWrapper,
  VStack,
} from '../../ui';
import { HistoryItemComponent } from './history-item-component';
import { LabelEditModal } from './label-edit-modal';

interface FavoritesScreenProps {
  navigation: NavigationProp<Record<string, object | undefined>>;
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
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

export const FavoritesScreen: FC<FavoritesScreenProps> = ({ navigation }) => {
  const styles = useStyles();

  // State
  const [favorites, setFavorites] = useState<StoredAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<AddressSort>({
    field: 'dateLastUsed',
    order: 'desc',
  });

  // Modal states
  const [labelEditItem, setLabelEditItem] = useState<StoredAddress | null>(
    null,
  );

  // Load favorites
  const loadFavorites = useCallback(
    async (showRefreshIndicator = false): Promise<void> => {
      try {
        if (showRefreshIndicator) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const loadedFavorites =
          await AddressStorageService.getFavoriteAddresses(sort);

        setFavorites(loadedFavorites);
        console.log('[FavoritesScreen] Loaded favorites:', {
          count: loadedFavorites.length,
          sort,
        });
      } catch (loadError) {
        console.error('[FavoritesScreen] Failed to load favorites:', loadError);
        setError('Failed to load favorite addresses');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [sort],
  );

  // Load favorites on screen focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  // Reload when sort changes
  useEffect(() => {
    if (!isLoading) {
      loadFavorites();
    }
  }, [sort]);

  // Event handlers
  const handleRefresh = useCallback((): void => {
    loadFavorites(true);
  }, [loadFavorites]);

  const handleAddressPress = useCallback(
    (item: StoredAddress): void => {
      Alert.alert(
        'Favorite Address Details',
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
            text: 'View in History',
            onPress: (): void => {
              // Navigate to history screen with this item focused
              navigation.navigate('History' as any);
            },
          },
          {
            text: 'Close',
            style: 'cancel',
          },
        ],
      );
    },
    [navigation],
  );

  const handleFavoriteToggle = useCallback(
    async (item: StoredAddress): Promise<void> => {
      try {
        const newFavoriteStatus = await AddressStorageService.toggleFavorite(
          item.id,
        );

        if (!newFavoriteStatus) {
          // If unfavorited, remove from favorites list
          setFavorites((prev) => prev.filter((fav) => fav.id !== item.id));
        } else {
          // If favorited (shouldn't happen in this screen), update the item
          setFavorites((prev) =>
            prev.map((fav) =>
              fav.id === item.id
                ? {
                    ...fav,
                    isFavorite: newFavoriteStatus,
                  }
                : fav,
            ),
          );
        }

        console.log('[FavoritesScreen] Favorite toggled:', {
          id: item.id,
          isFavorite: newFavoriteStatus,
        });
      } catch (toggleError) {
        console.error(
          '[FavoritesScreen] Failed to toggle favorite:',
          toggleError,
        );
        Alert.alert('Error', 'Failed to update favorite status');
      }
    },
    [],
  );

  const handleDelete = useCallback(
    async (item: StoredAddress): Promise<void> => {
      Alert.alert(
        'Delete Favorite',
        `Are you sure you want to delete this favorite address?\n\n${item.address.slice(0, 20)}...\n\nThis will also remove it from your scan history.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async (): Promise<void> => {
              try {
                await AddressStorageService.deleteAddress(item.id);

                // Remove from local state
                setFavorites((prev) =>
                  prev.filter((fav) => fav.id !== item.id),
                );

                console.log('[FavoritesScreen] Favorite deleted:', item.id);
              } catch (deleteError) {
                console.error(
                  '[FavoritesScreen] Failed to delete favorite:',
                  deleteError,
                );
                Alert.alert('Error', 'Failed to delete favorite address');
              }
            },
          },
        ],
      );
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
        setFavorites((prev) =>
          prev.map((fav) =>
            fav.id === item.id
              ? {
                  ...fav,
                  label: newLabel.trim() || undefined,
                }
              : fav,
          ),
        );

        setLabelEditItem(null);

        console.log('[FavoritesScreen] Favorite label updated:', {
          id: item.id,
          label: newLabel,
        });
      } catch (labelError) {
        console.error(
          '[FavoritesScreen] Failed to update favorite label:',
          labelError,
        );
        throw labelError; // Re-throw to show error in modal
      }
    },
    [],
  );

  const handleSortChange = useCallback((newSort: AddressSort): void => {
    setSort(newSort);
  }, []);

  // Render methods
  const renderItem = useCallback(
    ({ item, index }: { item: StoredAddress; index: number }) => (
      <HistoryItemComponent
        item={item}
        onPress={handleAddressPress}
        onFavoriteToggle={handleFavoriteToggle}
        onDelete={handleDelete}
        onLabelEdit={handleLabelEdit}
        showSwipeActions={true}
        testID={`favorite-item-${index}`}
      />
    ),
    [handleAddressPress, handleFavoriteToggle, handleDelete, handleLabelEdit],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [styles.separator],
  );

  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        title="Aún no tenés favoritos"
        message="Marcá direcciones en tu historial de escaneos para tenerlas a mano acá"
        actionText="Ver Historial"
        onAction={(): void => navigation.navigate('History' as any)}
        testID="empty-favorites-state"
      />
    ),
    [navigation],
  );

  if (error) {
    return (
      <ScreenWrapper>
        <ErrorState
          title="Error al cargar"
          message={error}
          retryText="Reintentar"
          onRetry={(): void => {
            loadFavorites();
          }}
          testID="favorites-error-state"
        />
      </ScreenWrapper>
    );
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <LoadingIndicator label="Cargando favoritos..." showLabel />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.container}>
      {/* Favorites List */}
      <ContentWrapper variant="body">
        <VStack spacing="lg">
          <VStack spacing="sm" align="flex-start" fullWidth>
            <H2>Favoritos</H2>
            <Body1 emphasis="medium">
              Guardá tus direcciones favoritas para acceder rápidamente.
            </Body1>
          </VStack>
        </VStack>
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item): string => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              testID="favorites-refresh-control"
            />
          }
          removeClippedSubviews
          maxToRenderPerBatch={10}
          initialNumToRender={20}
          windowSize={10}
          testID="favorites-list"
        />
      </ContentWrapper>

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
