import type { FC } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { IconFamily } from '../icon';

export interface ErrorStateProps {
  message?: string;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: string;
  iconFamily?: IconFamily;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  isRetrying?: boolean;
}

export interface EmptyStateProps {
  message?: string;
  title?: string;
  icon?: string;
  iconFamily?: IconFamily;
  actionText?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  variant?: 'default' | 'search' | 'filter';
}

export type ErrorStateComponent = FC<ErrorStateProps>;
export type EmptyStateComponent = FC<EmptyStateProps>;
