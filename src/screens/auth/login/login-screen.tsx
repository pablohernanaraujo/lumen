import React, { type FC } from 'react';
import { Alert, type ImageStyle, type StyleProp } from 'react-native';

import { useAuth } from '../../../contexts';
import type { AuthNavigationProp } from '../../../routing';
import {
  Body1,
  ButtonRegular,
  ContentWrapper,
  H1,
  Image,
  ScreenWrapper,
  VStack,
} from '../../../ui';

interface LoginScreenProps {
  navigation: AuthNavigationProp;
}

export const LoginScreen: FC<LoginScreenProps> = () => {
  const { signInWithGoogle, isLoading } = useAuth();

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      await signInWithGoogle();
      // Navigation will be handled automatically by the auth state change
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Google Sign-In failed';
      Alert.alert('Sign-In Error', errorMessage);
    }
  };

  return (
    <ScreenWrapper>
      <ContentWrapper variant="header">
        <VStack spacing="sm">
          <H1>Welcome Back</H1>
          <Body1 emphasis="medium">Sign in to your account</Body1>
        </VStack>
      </ContentWrapper>

      <ContentWrapper variant="body">
        <VStack spacing="sm">
          <Image
            source={require('../../../assets/images/lumen-wallet-01.png')}
            width={300}
            height={300}
            resizeMode="contain"
          />
        </VStack>
      </ContentWrapper>

      <ContentWrapper variant="footer">
        <VStack spacing="md">
          <ButtonRegular
            onPress={handleGoogleSignIn}
            testID="google-signin-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign in with Google'}
          </ButtonRegular>
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
