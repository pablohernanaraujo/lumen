import type {
  ImageProps as RNImageProps,
  ImageStyle,
  StyleProp,
} from 'react-native';

export interface ImageProps extends Omit<RNImageProps, 'style'> {
  style?: StyleProp<ImageStyle>;
  width?: number;
  height?: number;
}
