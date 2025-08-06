import React, { type FC } from 'react';
import { Image as RNImage } from 'react-native';

import { ImageProps } from './types';

export const Image: FC<ImageProps> = ({ width, height, style, ...props }) => {
  const computedStyle = [
    width !== undefined && { width },
    height !== undefined && { height },
    style,
  ].filter(Boolean);

  return <RNImage {...props} style={computedStyle} />;
};
