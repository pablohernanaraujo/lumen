import React, { type FC } from 'react';
import { Text } from 'react-native';

import { useTheme } from '../../theme';
import { getColorOpacity } from '../../theme/utils';
import type { H1Props } from './types';

export const H1: FC<H1Props> = ({
  children,
  emphasis = 'high',
  color,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const textColor = color
    ? theme.colors.text[color]
    : theme.colors.text.primary;
  const emphasisOpacity = theme.emphasis[emphasis];
  const finalColor = getColorOpacity(textColor, emphasisOpacity);

  return (
    <Text
      testID={testID}
      style={[
        {
          fontSize: theme.typography.size.xxxl,
          fontWeight: theme.typography.weight.bold,
          lineHeight:
            theme.typography.lineHeight.tight * theme.typography.size.xxxl,
          color: finalColor,
          fontFamily: theme.typography.family.regular,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
