import React, { type FC } from 'react';
import { View } from 'react-native';

import { makeStyles } from '../../theme';
import type { ContentWrapperProps, ContentWrapperVariant } from './types';

const useStyles = makeStyles((theme) => ({
  base: {
    paddingHorizontal: theme.spacing.md,
  },
  screen: {
    paddingVertical: theme.spacing.lg,
  },
  header: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  body: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
  },
  footer: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  borderless: {
    paddingHorizontal: 0,
  },
}));

const getVariantStyle = (
  styles: ReturnType<typeof useStyles>,
  variant: ContentWrapperVariant,
): ReturnType<typeof useStyles>[keyof ReturnType<typeof useStyles>] => {
  switch (variant) {
    case 'screen':
      return styles.screen;
    case 'header':
      return styles.header;
    case 'body':
      return styles.body;
    case 'footer':
      return styles.footer;
    default:
      return styles.screen;
  }
};

export const ContentWrapper: FC<ContentWrapperProps> = ({
  children,
  variant = 'screen',
  borderless = false,
  style,
}) => {
  const styles = useStyles();

  const variantStyle = getVariantStyle(styles, variant);

  return (
    <View
      style={[
        styles.base,
        variantStyle,
        borderless && styles.borderless,
        style,
      ]}
    >
      {children}
    </View>
  );
};
