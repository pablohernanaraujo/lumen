import React, { type FC } from 'react';
import { Text } from 'react-native';

import { useTheme } from '../../theme';
import { getColorOpacity } from '../../theme/utils';
import type { Body3Props } from './types';

export const Body3: FC<Body3Props> = ({
  children,
  emphasis = 'high',
  color,
  fontWeight = 'regular',
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
          fontSize: theme.typography.size.xs,
          fontWeight: theme.typography.weight[fontWeight],
          lineHeight:
            theme.typography.lineHeight.normal * theme.typography.size.xs,
          color: finalColor,
          fontFamily: theme.typography.family[fontWeight],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
