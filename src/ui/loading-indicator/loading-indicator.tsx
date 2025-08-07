import React, { type FC } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import { VStack } from '../layout';
import type { LoadingIndicatorProps } from './types';

const useStyles = makeStyles((theme) => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.regular,
    fontFamily: theme.typography.family.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
}));

const getIndicatorSize = (
  size: LoadingIndicatorProps['size'],
): 'small' | 'large' => {
  switch (size) {
    case 'small':
      return 'small';
    case 'medium':
    case 'large':
    default:
      return 'large';
  }
};

export const LoadingIndicator: FC<LoadingIndicatorProps> = ({
  size = 'medium',
  color,
  style,
  testID = 'loading-indicator',
  label = 'Cargando...',
  showLabel = false,
}) => {
  const styles = useStyles();
  const { theme } = useTheme();

  const indicatorColor = color || theme.colors.primary.main;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <VStack spacing="sm" style={{ alignItems: 'center' }}>
        <ActivityIndicator
          size={getIndicatorSize(size)}
          color={indicatorColor}
          testID={`${testID}-spinner`}
        />
        {showLabel && (
          <Text style={styles.label} testID={`${testID}-label`}>
            {label}
          </Text>
        )}
      </VStack>
    </View>
  );
};
