import type { FC } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type LoadingIndicatorSize = 'small' | 'medium' | 'large';

export interface LoadingIndicatorProps {
  size?: LoadingIndicatorSize;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  label?: string;
  showLabel?: boolean;
}

export type LoadingIndicatorComponent = FC<LoadingIndicatorProps>;
