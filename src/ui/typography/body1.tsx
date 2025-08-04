import React, { type FC } from 'react';
import { Text } from 'react-native';

import { useTheme } from '../../theme';
import { getColorOpacity } from '../../theme/utils';
import type { Body1Props } from './types';

export const Body1: FC<Body1Props> = ({
  children,
  emphasis = 'high',
  color,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const textColor = color || theme.colors.text.primary;
  const emphasisOpacity = theme.emphasis[emphasis];
  const finalColor = getColorOpacity(textColor, emphasisOpacity);

  return (
    <Text
      testID={testID}
      style={[
        {
          fontSize: theme.typography.size.md,
          fontWeight: theme.typography.weight.regular,
          lineHeight:
            theme.typography.lineHeight.normal * theme.typography.size.md,
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
