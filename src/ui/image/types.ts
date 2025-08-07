import type {
  ImageProps as RNImageProps,
  ImageStyle,
  StyleProp,
} from 'react-native';
import type { FastImageProps } from 'react-native-fast-image';
import FastImage from 'react-native-fast-image';

export interface ImageProps extends Omit<FastImageProps, 'style'> {
  style?: StyleProp<ImageStyle>;
  width?: number;
  height?: number;
  fallbackSource?: RNImageProps['source'];
  enableFallback?: boolean;
  priority?: typeof FastImage.priority.high;
  cache?: typeof FastImage.cacheControl.web;
  resizeMode?: keyof typeof FastImage.resizeMode;
  showPlaceholder?: boolean;
  placeholderColor?: string;
  circular?: boolean;
}
