import React, { type FC } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';

interface FallbackImageProps {
  style?: ViewStyle;
  size?: number;
}

export const FallbackImage: FC<FallbackImageProps> = ({ style, size = 40 }) => {
  const { theme } = useTheme();

  const fallbackStyles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      width: size * 0.6,
      height: size * 0.6,
      backgroundColor: theme.colors.text.secondary,
      borderRadius: (size * 0.6) / 2,
    },
  });

  return (
    <View style={[fallbackStyles.container, style]}>
      <View style={fallbackStyles.icon} />
    </View>
  );
};
