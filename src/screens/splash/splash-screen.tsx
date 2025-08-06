import React, { type FC } from 'react';
import { View } from 'react-native';

import type { SplashScreenProps } from '../../routing';
import { makeStyles } from '../../theme';
import { H1, ScreenWrapper } from '../../ui';

const useStyles = makeStyles(() => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

export const SplashScreen: FC<SplashScreenProps> = () => {
  const styles = useStyles();

  // Note: This splash screen is not used in the current auth flow
  // Navigation is handled by the RootNavigator based on auth state

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <H1>Lumen</H1>
      </View>
    </ScreenWrapper>
  );
};
