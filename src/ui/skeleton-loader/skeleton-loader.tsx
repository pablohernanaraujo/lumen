import React, { type FC, useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { makeStyles } from '../../theme';
import type { SkeletonLoaderProps } from './types';

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cryptoItemContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 80,
  },
  cryptoItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  cryptoItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
  },
  cryptoItemContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  cryptoItemTitle: {
    height: 20,
    width: '60%',
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.xs,
  },
  cryptoItemSubtitle: {
    height: 16,
    width: '40%',
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.sm,
  },
  cryptoItemRightContent: {
    alignItems: 'flex-end',
  },
  cryptoItemPrice: {
    height: 20,
    width: 80,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.xs,
  },
  cryptoItemChange: {
    height: 16,
    width: 60,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.sm,
  },
}));

/* eslint-disable complexity */
export const SkeletonLoader: FC<SkeletonLoaderProps> = ({
  variant = 'rectangle',
  width = '100%',
  height = 20,
  borderRadius,
  style,
  animate = true,
  testID = 'skeleton-loader',
}) => {
  const styles = useStyles();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animate, shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.5, 0.3],
  });

  if (variant === 'crypto-item') {
    return (
      <View style={[styles.cryptoItemContainer, style]} testID={testID}>
        <View style={styles.cryptoItemRow}>
          <Animated.View
            style={[styles.cryptoItemAvatar, animate && { opacity }]}
          />
          <View style={styles.cryptoItemContent}>
            <Animated.View
              style={[styles.cryptoItemTitle, animate && { opacity }]}
            />
            <Animated.View
              style={[styles.cryptoItemSubtitle, animate && { opacity }]}
            />
          </View>
          <View style={styles.cryptoItemRightContent}>
            <Animated.View
              style={[styles.cryptoItemPrice, animate && { opacity }]}
            />
            <Animated.View
              style={[styles.cryptoItemChange, animate && { opacity }]}
            />
          </View>
        </View>
      </View>
    );
  }

  const getVariantStyles = (): object => {
    switch (variant) {
      case 'circle':
        return {
          width: typeof width === 'number' ? width : 40,
          height: typeof height === 'number' ? height : 40,
          borderRadius: typeof width === 'number' ? width / 2 : 20,
        };
      case 'text':
        return {
          width,
          height: 16,
          borderRadius: borderRadius || 4,
        };
      default:
        return {
          width,
          height,
          borderRadius: borderRadius || 4,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getVariantStyles(),
        style,
        animate && { opacity },
      ]}
      testID={testID}
    >
      {animate && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX }],
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          ]}
        />
      )}
    </Animated.View>
  );
};
