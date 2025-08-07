import React, { type FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../theme';
import { Image } from '../image';
import type { CryptoItemProps, CryptoItemShimmerProps } from './types';

const formatPrice = (price: number): string => {
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

export const CryptoItem: FC<CryptoItemProps> = ({
  crypto,
  onPress,
  showShimmer = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  if (showShimmer) {
    return <CryptoItemShimmer style={style} testID={testID} />;
  }

  const handlePress = (): void => {
    onPress?.(crypto.id);
  };

  const isPositiveChange = crypto.price_change_percentage_24h >= 0;

  const styles = StyleSheet.create({
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
  });

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
            {formatPrice(crypto.current_price)}
          </Text>

          <Text
            style={[
              styles.changeText,
              isPositiveChange ? styles.positiveChange : styles.negativeChange,
            ]}
            testID={testID ? `${testID}-change` : undefined}
          >
            {`${isPositiveChange ? '+' : ''}${crypto.price_change_percentage_24h.toFixed(2)}%`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
