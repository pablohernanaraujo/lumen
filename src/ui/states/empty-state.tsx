import React, { type FC } from 'react';
import { Text, View } from 'react-native';

import { makeStyles } from '../../theme';
import { ButtonRegular } from '../buttons';
import { Icon } from '../icon';
import { VStack } from '../layout';
import type { EmptyStateProps } from './types';

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
  actionButton: {
    minWidth: 150,
  },
}));

const getDefaultContent = (
  variant: EmptyStateProps['variant'],
): {
  icon: string;
  title: string;
  message: string;
} => {
  switch (variant) {
    case 'search':
      return {
        icon: 'search-off',
        title: 'Sin resultados',
        message:
          'No se encontraron resultados para tu búsqueda. Intenta con otros términos.',
      };
    case 'filter':
      return {
        icon: 'filter-list-off',
        title: 'Sin coincidencias',
        message:
          'No hay elementos que coincidan con los filtros seleccionados.',
      };
    default:
      return {
        icon: 'inbox',
        title: 'No hay datos',
        message: 'No hay información disponible en este momento.',
      };
  }
};

export const EmptyState: FC<EmptyStateProps> = ({
  message,
  title,
  icon,
  iconFamily = 'MaterialIcons',
  actionText,
  onAction,
  style,
  testID = 'empty-state',
  variant = 'default',
}) => {
  const styles = useStyles();
  const defaults = getDefaultContent(variant);

  const displayIcon = icon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayMessage = message || defaults.message;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <VStack spacing="lg" style={{ alignItems: 'center' }}>
        <View style={styles.iconContainer}>
          <Icon
            name={displayIcon}
            family={iconFamily}
            size="xxxl"
            color="secondary"
            testID={`${testID}-icon`}
          />
        </View>

        <Text style={styles.title} testID={`${testID}-title`}>
          {displayTitle}
        </Text>

        <Text style={styles.message} testID={`${testID}-message`}>
          {displayMessage}
        </Text>

        {onAction && actionText && (
          <View style={styles.actionButton}>
            <ButtonRegular
              onPress={onAction}
              size="md"
              testID={`${testID}-action-button`}
            >
              {actionText}
            </ButtonRegular>
          </View>
        )}
      </VStack>
    </View>
  );
};
