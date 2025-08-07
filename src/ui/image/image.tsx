/* eslint-disable max-statements */
import React, { type FC, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { useTheme } from '../../theme';
import { FallbackImage } from './fallback-image';
import { computeImageStyle, createPlaceholderStyles } from './image-helpers';
import type { ImageProps } from './types';

const ImageComponent: FC<ImageProps> = ({
  width,
  height,
  style,
  fallbackSource,
  enableFallback = true,
  priority = FastImage.priority.high,
  cache = FastImage.cacheControl.web,
  resizeMode = FastImage.resizeMode.cover,
  showPlaceholder = true,
  placeholderColor,
  onError,
  onLoadStart,
  onLoadEnd,
  source,
  ...props
}) => {
  const { theme } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const computedStyle = useMemo(
    () => computeImageStyle(width, height, style),
    [width, height, style],
  );

  const placeholderStyles = createPlaceholderStyles(
    placeholderColor || '',
    theme.colors.border,
  );

  const handleLoadStart = (): void => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleLoadEnd = (): void => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleError = (): void => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  // Show fallback if there's an error and fallback is enabled
  if (hasError && enableFallback) {
    return renderFallback();
  }

  return renderMainImage();

  function renderFallback(): React.JSX.Element {
    if (fallbackSource) {
      return (
        <FastImage
          {...props}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          source={fallbackSource as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={computedStyle as any}
          resizeMode={resizeMode}
        />
      );
    }

    return (
      <FallbackImage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={computedStyle[0] as any}
        size={width || height || 40}
      />
    );
  }

  function renderMainImage(): React.JSX.Element {
    return (
      <View style={computedStyle}>
        {/* Show placeholder while loading */}
        {isLoading && showPlaceholder && (
          <View
            style={[
              StyleSheet.absoluteFill,
              placeholderStyles.container,
              { borderRadius: (width || height || 40) / 2 },
            ]}
          >
            <FallbackImage size={(width || height || 40) * 0.6} />
          </View>
        )}

        <FastImage
          {...props}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          source={source as any}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      </View>
    );
  }
};

export const Image = ImageComponent;
