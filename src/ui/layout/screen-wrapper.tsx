import React, { type FC } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { makeStyles } from '../../theme';
import type { ScreenWrapperProps } from './types';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
}));

export const ScreenWrapper: FC<ScreenWrapperProps> = ({
  children,
  style,
  disableSafeArea = false,
  testID,
}) => {
  const styles = useStyles();

  if (disableSafeArea) {
    return (
      <View style={[styles.container, style]} testID={testID}>
        <View style={styles.safeArea}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {children}
      </SafeAreaView>
    </View>
  );
};
