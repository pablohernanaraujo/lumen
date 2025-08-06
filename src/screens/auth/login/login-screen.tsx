import React, { type FC } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '../../../contexts';
import type { RootNavigationProp } from '../../../routing';
import {
  Body1,
  ButtonLink,
  ButtonRegular,
  ContentWrapper,
  H1,
  HStack,
  Image,
  ScreenWrapper,
  VStack,
} from '../../../ui';

interface LoginScreenProps {
  navigation: RootNavigationProp;
}

export const LoginScreen: FC<LoginScreenProps> = ({ navigation }) => {
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

  const handleTermsPress = (): void => {
    navigation.navigate('TermsModal');
  };

  const handlePrivacyPress = (): void => {
    navigation.navigate('PrivacyModal');
  };

  return (
    <ScreenWrapper>
      <ContentWrapper variant="header">
        <VStack spacing="none">
          <H1>¡Bienvenido a Lumen!</H1>
          <Body1>Tu billetera cripto en un toque</Body1>
        </VStack>
      </ContentWrapper>

      <ContentWrapper variant="body">
        <VStack spacing="sm">
          <Image
            source={require('../../../assets/images/lumen-wallet-02.png')}
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
            iconName="google"
            iconFamily="FontAwesome5"
            iconSize={24}
            iconColor="white"
            fullWidth
          >
            {isLoading ? 'Entrando...' : 'Entrar con Google'}
          </ButtonRegular>
          <VStack spacing="none">
            <HStack spacing="xs">
              <Body1>Al continuar aceptás nuestros</Body1>
              <ButtonLink
                inline
                onPress={handleTermsPress}
                testID="terms-link-1"
              >
                Términos
              </ButtonLink>
            </HStack>
            <HStack spacing="xs">
              <Body1>y</Body1>
              <ButtonLink
                inline
                onPress={handlePrivacyPress}
                testID="privacy-link-1"
              >
                Política de privacidad.
              </ButtonLink>
            </HStack>
          </VStack>
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
