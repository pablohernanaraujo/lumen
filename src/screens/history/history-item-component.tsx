/* eslint-disable max-statements */
import React, { type FC, useCallback, useRef, useState } from 'react';
import { Alert, Animated, TouchableOpacity, View } from 'react-native';
import {
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import HapticFeedback from 'react-native-haptic-feedback';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { makeStyles } from '../../theme';
import type { StoredAddress } from '../../types/address-history-types';
import { Body2, Body3 } from '../../ui/typography';
import { shortenAddress } from '../../utils/blockchain-utils';

const SWIPE_THRESHOLD = 100;
const ICON_AREA_WIDTH = 80;

interface HistoryItemProps {
  item: StoredAddress;
  onPress: (item: StoredAddress) => void;
  onFavoriteToggle: (item: StoredAddress) => Promise<void>;
  onDelete: (item: StoredAddress) => Promise<void>;
  onLabelEdit: (item: StoredAddress) => void;
  showSwipeActions?: boolean;
  testID?: string;
}

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xs,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    minHeight: 80,
  },
  contentContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  networkBadge: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  networkText: {
    color: theme.colors.surface,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  favoriteIcon: {
    marginLeft: 'auto',
  },
  addressText: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: 'monospace',
  },
  labelText: {
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: theme.colors.text.tertiary,
  },
  usageText: {
    color: theme.colors.text.tertiary,
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error.main,
    paddingHorizontal: theme.spacing.md,
  },
  actionButton: {
    width: ICON_AREA_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    backgroundColor: theme.colors.error.main,
  },
  editAction: {
    backgroundColor: theme.colors.warning.main,
  },
}));

export const HistoryItemComponent: FC<HistoryItemProps> = ({
  item,
  onPress,
  onFavoriteToggle,
  onDelete,
  onLabelEdit,
  showSwipeActions = true,
  testID,
}) => {
  const styles = useStyles();
  const [isProcessing, setIsProcessing] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffsetValue = useRef(0);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  const handleFavoriteToggle = useCallback(async (): Promise<void> => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      HapticFeedback.trigger('impactLight');
      await onFavoriteToggle(item);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    } finally {
      setIsProcessing(false);
    }
  }, [item, onFavoriteToggle, isProcessing]);

  const handleDelete = useCallback((): void => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete this address?\n\n${shortenAddress(item.address)}`,
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
              setIsProcessing(true);
              HapticFeedback.trigger('impactMedium');
              await onDelete(item);
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    );
  }, [item, onDelete]);

  const handlePress = useCallback((): void => {
    if (isProcessing) return;
    HapticFeedback.trigger('selection');
    onPress(item);
  }, [item, onPress, isProcessing]);

  const handleLabelEdit = useCallback((): void => {
    if (isProcessing) return;
    onLabelEdit(item);
  }, [item, onLabelEdit, isProcessing]);

  const onGestureEvent = useCallback(
    (event: PanGestureHandlerGestureEvent): void => {
      if (!showSwipeActions) return;

      const { translationX } = event.nativeEvent;
      const newTranslateX = lastOffsetValue.current + translationX;

      // Limit swipe to the left only
      const clampedTranslateX = Math.min(
        0,
        Math.max(-ICON_AREA_WIDTH * 2, newTranslateX),
      );
      translateX.setValue(clampedTranslateX);
    },
    [showSwipeActions, translateX],
  );

  const onHandlerStateChange = useCallback(
    (event: PanGestureHandlerGestureEvent): void => {
      if (!showSwipeActions) return;

      if (event.nativeEvent.state === State.END) {
        const { translationX, velocityX } = event.nativeEvent;
        const currentOffset = lastOffsetValue.current + translationX;

        let finalOffset = 0;

        // Determine final position based on swipe distance and velocity
        if (currentOffset < -SWIPE_THRESHOLD || velocityX < -500) {
          finalOffset = -ICON_AREA_WIDTH * 2; // Show both action buttons
          HapticFeedback.trigger('impactLight');
        }

        lastOffsetValue.current = finalOffset;
        Animated.spring(translateX, {
          toValue: finalOffset,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    },
    [showSwipeActions, translateX],
  );

  const getNetworkColor = useCallback(
    (network: string): string => {
      switch (network.toLowerCase()) {
        case 'bitcoin':
          return '#f7931a';
        case 'ethereum':
          return '#627eea';
        default:
          return styles.networkBadge.backgroundColor as string;
      }
    },
    [styles.networkBadge.backgroundColor],
  );

  const networkBadgeStyle = {
    ...styles.networkBadge,
    backgroundColor: getNetworkColor(item.network),
  };

  return (
    <View style={styles.container} testID={testID}>
      <PanGestureHandler
        enabled={showSwipeActions}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View>
          {/* Action buttons (shown when swiped) */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editAction]}
              onPress={handleLabelEdit}
              testID={`${testID}-edit-button`}
            >
              <Icon name="edit" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteAction]}
              onPress={handleDelete}
              testID={`${testID}-delete-button`}
            >
              <Icon name="delete" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Main item content */}
          <Animated.View
            style={[
              styles.itemContainer,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.contentContainer}
              onPress={handlePress}
              disabled={isProcessing}
              testID={`${testID}-content`}
            >
              <View style={styles.headerRow}>
                <View style={networkBadgeStyle}>
                  <Body3 style={styles.networkText}>{item.network}</Body3>
                </View>
                <TouchableOpacity
                  onPress={handleFavoriteToggle}
                  disabled={isProcessing}
                  style={styles.favoriteIcon}
                  testID={`${testID}-favorite-button`}
                >
                  <Icon
                    name={item.isFavorite ? 'star' : 'star-border'}
                    size={20}
                    color={item.isFavorite ? '#ffd700' : '#666'}
                  />
                </TouchableOpacity>
              </View>

              <Body2 style={styles.addressText}>
                {shortenAddress(item.address, 12, 8)}
              </Body2>

              {item.label && (
                <Body3 style={styles.labelText}>"{item.label}"</Body3>
              )}

              <View style={styles.metaRow}>
                <Body3 style={styles.dateText}>
                  {formatDate(item.dateLastUsed)}
                </Body3>
                <Body3 style={styles.usageText}>
                  Used {item.usageCount} time{item.usageCount !== 1 ? 's' : ''}
                </Body3>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};
