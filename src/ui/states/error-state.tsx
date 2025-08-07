import React, { type FC } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { makeStyles } from '../../theme';
import { ButtonOutline } from '../buttons';
import { Icon } from '../icon';
import { VStack } from '../layout';
import type { ErrorStateProps } from './types';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.family.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.regular,
    fontFamily: theme.typography.family.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.size.md * theme.typography.lineHeight.relaxed,
  },
  retryButton: {
    minWidth: 120,
  },
}));

export const ErrorState: FC<ErrorStateProps> = ({
  message = 'Ocurrió un error al cargar los datos',
  title = 'Error',
  onRetry,
  retryText = 'Reintentar',
  icon = 'error-outline',
  iconFamily = 'MaterialIcons',
  style,
  testID = 'error-state',
  isRetrying = false,
}) => {
  const styles = useStyles();

  return (
    <View style={[styles.container, style]} testID={testID}>
      <VStack spacing="lg" style={{ alignItems: 'center' }}>
        <View style={styles.iconContainer}>
          <Icon
            name={icon}
            family={iconFamily}
            size="xxxl"
            color="error"
            testID={`${testID}-icon`}
          />
        </View>

        <Text style={styles.title} testID={`${testID}-title`}>
          {title}
        </Text>

        <Text style={styles.message} testID={`${testID}-message`}>
          {message}
        </Text>

        {onRetry && (
          <View style={styles.retryButton}>
            {isRetrying ? (
              <ActivityIndicator size="small" testID={`${testID}-loading`} />
            ) : (
              <ButtonOutline
                onPress={onRetry}
                size="md"
                testID={`${testID}-retry-button`}
              >
                {retryText}
              </ButtonOutline>
            )}
          </View>
        )}
      </VStack>
    </View>
  );
};
