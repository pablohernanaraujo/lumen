import React, { type FC, useEffect } from 'react';
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

export const SplashScreen: FC<SplashScreenProps> = ({ navigation }) => {
  const styles = useStyles();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to Auth stack after 2 seconds
      navigation.replace('Auth');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <H1>Lumen</H1>
      </View>
    </ScreenWrapper>
  );
};
