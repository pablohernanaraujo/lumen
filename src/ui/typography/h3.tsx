import React, { type FC } from 'react';
import { Text } from 'react-native';

import { useTheme } from '../../theme';
import { getColorOpacity } from '../../theme/utils';
import type { H3Props } from './types';

export const H3: FC<H3Props> = ({
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
          fontSize: theme.typography.size.xl,
          fontWeight: theme.typography.weight.medium,
          lineHeight:
            theme.typography.lineHeight.normal * theme.typography.size.xl,
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
