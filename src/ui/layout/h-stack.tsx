import React, {
  Children,
  cloneElement,
  type FC,
  isValidElement,
  ReactElement,
} from 'react';
import { View } from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import type { HStackProps } from './types';

const useStyles = makeStyles(() => ({
  container: {
    flexDirection: 'row',
  },
}));

export const HStack: FC<HStackProps> = ({
  children,
  spacing = 'md',
  align = 'center',
  style,
}) => {
  const styles = useStyles();
  const { theme } = useTheme();

  const spacingValue = theme.spacing[spacing];

  const childrenArray = Children.toArray(children);

  return (
    <View style={[styles.container, { alignItems: align }, style]}>
      {childrenArray.map((child, index) => {
        const isLastChild = index === childrenArray.length - 1;

        if (isValidElement(child)) {
          return cloneElement(child as ReactElement<{ style?: object }>, {
            key: child.key || index,
            style: [
              (child.props as { style?: object }).style,
              !isLastChild && { marginRight: spacingValue },
            ],
          });
        }

        return (
          <View
            key={index}
            style={!isLastChild ? { marginRight: spacingValue } : undefined}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
};
