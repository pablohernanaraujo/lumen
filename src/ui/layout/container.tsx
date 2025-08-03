import React, { type FC } from 'react';
import { ScrollView } from 'react-native';

import { makeStyles } from '../../theme';
import { ScreenWrapper } from './screen-wrapper';
import type { ContainerProps } from './types';

const useStyles = makeStyles((theme) => ({
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
}));

export const Container: FC<ContainerProps> = ({
  children,
  style,
  scrollViewProps = {},
  keyboardShouldPersistTaps = 'handled',
}) => {
  const styles = useStyles();

  return (
    <ScreenWrapper style={style}>
      <ScrollView
        style={[styles.scrollView, style]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </ScreenWrapper>
  );
};
