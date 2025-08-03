import React, { type FC, useEffect } from 'react';
import { Text } from 'react-native';

import { makeStyles } from '../../../theme';
import { ContentWrapper, Icon, ScreenWrapper, VStack } from '../../../ui';
import type { SplashScreenProps } from '../../types';

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: theme.typography.size.xxxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
      <ContentWrapper variant="screen">
        <VStack spacing="xl">
          <Icon
            name="flash-on"
            family="MaterialIcons"
            size="xxxl"
            testID="splash-icon"
          />
          <Text style={styles.title}>Lumen</Text>
          <Text style={styles.subtitle}>Crypto Portfolio Tracker</Text>
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
