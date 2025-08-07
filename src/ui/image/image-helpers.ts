/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ImageStyle, StyleProp } from 'react-native';
import { StyleSheet } from 'react-native';

export const createPlaceholderStyles = (
  placeholderColor: string,
  borderColor: string,
): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    container: {
      backgroundColor: placeholderColor || borderColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export const computeImageStyle = (
  width?: number,
  height?: number,
  style?: StyleProp<ImageStyle>,
): any[] =>
  [
    width !== undefined && { width },
    height !== undefined && { height },
    style,
  ].filter(Boolean);
