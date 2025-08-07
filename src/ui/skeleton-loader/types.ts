import type { FC } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type SkeletonVariant = 'text' | 'circle' | 'rectangle' | 'crypto-item';

export interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  animate?: boolean;
  testID?: string;
}

export interface SkeletonListProps {
  count?: number;
  variant?: 'crypto-item' | 'default';
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export type SkeletonLoaderComponent = FC<SkeletonLoaderProps>;
export type SkeletonListComponent = FC<SkeletonListProps>;
