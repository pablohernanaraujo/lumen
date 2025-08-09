import React, {
  Children,
  cloneElement,
  type FC,
  isValidElement,
  ReactElement,
} from 'react';
import { View } from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import type { VStackProps } from './types';

const useStyles = makeStyles(() => ({
  container: {
    flexDirection: 'column',
  },
}));

export const VStack: FC<VStackProps> = ({
  children,
  spacing = 'md',
  align = 'center',
  textAlign = 'center',
  fullWidth = false,
  style,
}) => {
  const styles = useStyles();
  const { theme } = useTheme();

  const spacingValue = theme.spacing[spacing];

  const childrenArray = Children.toArray(children);

  // Helper function to convert textAlign to justifyContent for flex layout
  const getJustifyContent = (
    textAlignValue: string,
  ): 'flex-start' | 'flex-end' | 'center' => {
    switch (textAlignValue) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'center':
      default:
        return 'center';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          alignItems: align,
          justifyContent: getJustifyContent(textAlign),
          ...(fullWidth && { width: '100%' }),
        },
        style,
      ]}
    >
      {childrenArray.map((child, index) => {
        const isLastChild = index === childrenArray.length - 1;

        if (isValidElement(child)) {
          return cloneElement(child as ReactElement<{ style?: object }>, {
            key: child.key || index,
            style: [
              (child.props as { style?: object }).style,
              !isLastChild && { marginBottom: spacingValue },
            ],
          });
        }

        return (
          <View
            key={index}
            style={!isLastChild ? { marginBottom: spacingValue } : undefined}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
};
