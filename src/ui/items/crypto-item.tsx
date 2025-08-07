/* eslint-disable react-native/no-unused-styles */
import React, { type FC, memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../theme';
import { Image } from '../image';
import type { CryptoItemProps, CryptoItemShimmerProps } from './types';

const formatPrice = (price: number | null): string => {
  if (price === null || price === undefined) {
    return '--';
  }

  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(2)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(2)}K`;
  }
  if (price < 1) {
    return `$${price.toFixed(6)}`;
  }
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatChange = (change: number | null): string => {
  if (change === null || change === undefined) {
    return 'N/A';
  }

  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

const isPositiveChange = (change: number | null): boolean => {
  if (change === null || change === undefined) {
    return false; // Default to negative styling for null values
  }
  return change >= 0;
};

const CryptoItemShimmer: FC<CryptoItemShimmerProps> = ({ style, testID }) => {
  const { theme } = useTheme();

  const shimmerStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: 80,
      ...theme.shadows.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    shimmerElement: {
      backgroundColor: theme.colors.border,
      borderRadius: theme.radii.sm,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    leftContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    rightContent: {
      alignItems: 'flex-end',
    },
    textLarge: {
      height: 20,
      width: 120,
    },
    textMedium: {
      height: 16,
      width: 80,
    },
    textSmall: {
      height: 14,
      width: 60,
    },
    textSpacing: {
      marginBottom: theme.spacing.xs,
    },
  });

  return (
    <View style={[shimmerStyles.container, style]} testID={testID}>
      <View style={shimmerStyles.row}>
        <View style={[shimmerStyles.shimmerElement, shimmerStyles.avatar]} />
        <View style={shimmerStyles.leftContent}>
          <View
            style={[
              shimmerStyles.shimmerElement,
              shimmerStyles.textLarge,
              shimmerStyles.textSpacing,
            ]}
          />
          <View
            style={[shimmerStyles.shimmerElement, shimmerStyles.textMedium]}
          />
        </View>
        <View style={shimmerStyles.rightContent}>
          <View
            style={[
              shimmerStyles.shimmerElement,
              shimmerStyles.textLarge,
              shimmerStyles.textSpacing,
            ]}
          />
          <View
            style={[shimmerStyles.shimmerElement, shimmerStyles.textSmall]}
          />
        </View>
      </View>
    </View>
  );
};

const CryptoItemComponent: FC<CryptoItemProps> = ({
  crypto,
  onPress,
  showShimmer = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border,
          height: 80,
          ...theme.shadows.sm,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          height: '100%',
        },
        cryptoImage: {
          width: 40,
          height: 40,
          borderRadius: 20,
        },
        leftContent: {
          flex: 1,
          marginLeft: theme.spacing.md,
        },
        rightContent: {
          alignItems: 'flex-end',
        },
        nameText: {
          color: theme.colors.text.primary,
          fontSize: theme.typography.size.lg,
          fontWeight: theme.typography.weight.bold,
          fontFamily: theme.typography.family.bold,
        },
        symbolText: {
          color: theme.colors.text.secondary,
          fontSize: theme.typography.size.sm,
          fontWeight: theme.typography.weight.medium,
          fontFamily: theme.typography.family.medium,
          textTransform: 'uppercase',
        },
        priceText: {
          color: theme.colors.text.primary,
          fontSize: theme.typography.size.lg,
          fontWeight: theme.typography.weight.bold,
          fontFamily: theme.typography.family.bold,
          textAlign: 'right',
        },
        changeText: {
          fontSize: theme.typography.size.sm,
          fontWeight: theme.typography.weight.semibold,
          fontFamily: theme.typography.family.semibold,
          textAlign: 'right',
        },
        positiveChange: {
          color: theme.colors.success.main,
        },
        negativeChange: {
          color: theme.colors.error.main,
        },
      }),
    [theme],
  );

  const handlePress = (): void => {
    onPress?.(crypto.id);
  };

  const changeIsPositive = isPositiveChange(crypto.price_change_percentage_24h);
  const formattedPrice = useMemo(
    () => formatPrice(crypto.current_price),
    [crypto.current_price],
  );
  const formattedChange = useMemo(
    () => formatChange(crypto.price_change_percentage_24h),
    [crypto.price_change_percentage_24h],
  );

  if (showShimmer) {
    return <CryptoItemShimmer style={style} testID={testID} />;
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      testID={testID}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <Image
          source={{ uri: crypto.image }}
          style={styles.cryptoImage}
          testID={testID ? `${testID}-image` : undefined}
          enableFallback={true}
          showPlaceholder={true}
          width={40}
          height={40}
        />

        <View style={styles.leftContent}>
          <Text
            style={styles.nameText}
            numberOfLines={1}
            testID={testID ? `${testID}-name` : undefined}
          >
            {crypto.name}
          </Text>
          <Text
            style={styles.symbolText}
            testID={testID ? `${testID}-symbol` : undefined}
          >
            #{crypto.market_cap_rank} • {crypto.symbol.toUpperCase()}
          </Text>
        </View>

        <View style={styles.rightContent}>
          <Text
            style={styles.priceText}
            testID={testID ? `${testID}-price` : undefined}
          >
            {formattedPrice}
          </Text>

          <Text
            style={[
              styles.changeText,
              changeIsPositive ? styles.positiveChange : styles.negativeChange,
            ]}
            testID={testID ? `${testID}-change` : undefined}
          >
            {formattedChange}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const CryptoItem = memo(CryptoItemComponent, (prevProps, nextProps) => {
  // Custom comparison for better memoization with null safety
  const prevCrypto = prevProps.crypto;
  const nextCrypto = nextProps.crypto;

  return (
    prevCrypto.id === nextCrypto.id &&
    prevCrypto.current_price === nextCrypto.current_price &&
    prevCrypto.price_change_percentage_24h ===
      nextCrypto.price_change_percentage_24h &&
    prevCrypto.market_cap_rank === nextCrypto.market_cap_rank &&
    prevCrypto.name === nextCrypto.name &&
    prevCrypto.symbol === nextCrypto.symbol &&
    prevCrypto.image === nextCrypto.image &&
    prevProps.showShimmer === nextProps.showShimmer &&
    prevProps.testID === nextProps.testID
  );
});
