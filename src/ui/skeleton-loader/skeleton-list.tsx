import React, { type FC } from 'react';
import { View } from 'react-native';

import { makeStyles } from '../../theme';
import { SkeletonLoader } from './skeleton-loader';
import type { SkeletonListProps } from './types';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing.md,
  },
  item: {
    marginBottom: theme.spacing.sm,
  },
  lastItem: {
    marginBottom: 0,
  },
}));

export const SkeletonList: FC<SkeletonListProps> = ({
  count = 5,
  variant = 'default',
  style,
  itemStyle,
  testID = 'skeleton-list',
}) => {
  const styles = useStyles();

  return (
    <View style={[styles.container, style]} testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            variant !== 'crypto-item' && styles.item,
            index === count - 1 && styles.lastItem,
            itemStyle,
          ]}
        >
          {variant === 'crypto-item' ? (
            <SkeletonLoader
              variant="crypto-item"
              testID={`${testID}-item-${index}`}
            />
          ) : (
            <SkeletonLoader
              variant="rectangle"
              height={60}
              testID={`${testID}-item-${index}`}
            />
          )}
        </View>
      ))}
    </View>
  );
};
