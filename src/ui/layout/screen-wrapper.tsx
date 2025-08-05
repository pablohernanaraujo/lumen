import React, { type FC } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { makeStyles } from '../../theme';
import type { ScreenWrapperProps } from './types';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
}));

export const ScreenWrapper: FC<ScreenWrapperProps> = ({ children, style }) => {
  const styles = useStyles();

  return (
    <View style={[styles.container, style]}>
      <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>
    </View>
  );
};
