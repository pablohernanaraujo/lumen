/* eslint-disable max-statements */
import React, { type FC, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { useTheme } from '../../theme';
import { FallbackImage } from './fallback-image';
import { computeImageStyle, createPlaceholderStyles } from './image-helpers';
import type { ImageProps } from './types';

const styles = StyleSheet.create({
  circularContainer: {
    overflow: 'hidden',
  },
});

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
  circular = false,
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
        <View style={[computedStyle, circular && styles.circularContainer]}>
          <FastImage
            {...props}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            source={fallbackSource as any}
            style={circular ? StyleSheet.absoluteFill : computedStyle}
            resizeMode={resizeMode}
          />
        </View>
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
    const containerStyle = [
      computedStyle,
      circular && styles.circularContainer,
    ];
    const imageStyle = StyleSheet.absoluteFill;

    return (
      <View style={containerStyle}>
        {renderPlaceholder()}
        <FastImage
          {...props}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          source={source as any}
          style={imageStyle}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      </View>
    );
  }

  function renderPlaceholder(): React.JSX.Element | null {
    if (!isLoading || !showPlaceholder) {
      return null;
    }

    const flattenedStyle = StyleSheet.flatten(computedStyle);
    const borderRadius = flattenedStyle?.borderRadius;
    const placeholderStyle = [
      StyleSheet.absoluteFill,
      placeholderStyles.container,
      circular && { borderRadius: borderRadius || (width || height || 40) / 2 },
    ];

    return (
      <View style={placeholderStyle}>
        <FallbackImage size={(width || height || 40) * 0.6} />
      </View>
    );
  }
};

export const Image = ImageComponent;
