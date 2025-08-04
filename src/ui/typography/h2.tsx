import React, { type FC } from 'react';
import { Text } from 'react-native';

import { useTheme } from '../../theme';
import { getColorOpacity } from '../../theme/utils';
import type { H2Props } from './types';

export const H2: FC<H2Props> = ({
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
          fontSize: theme.typography.size.xxl,
          fontWeight: theme.typography.weight.semibold,
          lineHeight:
            theme.typography.lineHeight.tight * theme.typography.size.xxl,
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
