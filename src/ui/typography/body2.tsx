import React, { type FC } from 'react';
import { Text } from 'react-native';

import { useTheme } from '../../theme';
import { getColorOpacity } from '../../theme/utils';
import type { Body2Props } from './types';

export const Body2: FC<Body2Props> = ({
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
          fontSize: theme.typography.size.sm,
          fontWeight: theme.typography.weight.regular,
          lineHeight:
            theme.typography.lineHeight.normal * theme.typography.size.sm,
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
