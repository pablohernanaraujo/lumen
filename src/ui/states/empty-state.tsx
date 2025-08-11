import React, { type FC } from 'react';

import { ButtonRegular } from '../buttons';
import { Icon } from '../icon';
import { ContentWrapper, VStack } from '../layout';
import { Body1, H2 } from '../typography';
import type { EmptyStateProps } from './types';

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
  const defaults = getDefaultContent(variant);

  const displayIcon = icon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayMessage = message || defaults.message;

  return (
    <ContentWrapper style={[style]} testID={testID}>
      <VStack spacing="xxl" align="center" fullWidth>
        <VStack spacing="xl" align="center" fullWidth>
          <Icon
            name={displayIcon}
            family={iconFamily}
            size="xxxl"
            color="text.secondary"
            testID={`${testID}-icon`}
          />
          <VStack spacing="sm" align="center" fullWidth>
            <H2 testID={`${testID}-title`}>{displayTitle}</H2>
            <Body1
              emphasis="medium"
              testID={`${testID}-message`}
              textAlign="center"
            >
              {displayMessage}
            </Body1>
          </VStack>
        </VStack>
        {onAction && actionText && (
          <ButtonRegular
            onPress={onAction}
            size="md"
            testID={`${testID}-action-button`}
            fullWidth
          >
            {actionText}
          </ButtonRegular>
        )}
      </VStack>
    </ContentWrapper>
  );
};
