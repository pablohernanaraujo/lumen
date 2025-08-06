import React, { type FC } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '../../../contexts';
import type { AuthNavigationProp } from '../../../routing';
import { makeStyles } from '../../../theme';
import {
  Body1,
  ButtonRegular,
  ContentWrapper,
  H1,
  ScreenWrapper,
  VStack,
} from '../../../ui';

const useStyles = makeStyles((theme) => ({
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.size.md,
    color: theme.colors.text.primary,
    minHeight: 44,
    width: '100%',
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    minHeight: 44,
  },
  googleButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    minHeight: 44,
  },
}));

interface LoginScreenProps {
  navigation: AuthNavigationProp;
}

export const LoginScreen: FC<LoginScreenProps> = () => {
  const styles = useStyles();
  const { signInWithGoogle, isLoading } = useAuth();

  const handleLogin = (): void => {
    // TODO: Implement email/password login logic
    Alert.alert(
      'Info',
      'Email/password login not implemented yet. Use Google Sign-In.',
    );
  };

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
          <H1>Lumen</H1>
          <Body1 emphasis="medium">Crypto Tracker</Body1>
        </VStack>
      </ContentWrapper>

      <ContentWrapper variant="body">
        <VStack spacing="sm">
          <H1>Welcome Back</H1>
          <Body1 emphasis="medium">Sign in to your account</Body1>
        </VStack>
      </ContentWrapper>

      <ContentWrapper variant="footer">
        <VStack spacing="md">
          <ButtonRegular
            onPress={handleGoogleSignIn}
            testID="google-signin-button"
            disabled={isLoading}
            style={styles.googleButton}
          >
            {isLoading ? 'Signing In...' : 'Sign in with Google'}
          </ButtonRegular>

          <ButtonRegular
            onPress={handleLogin}
            testID="email-login-button"
            disabled={isLoading}
          >
            Sign In with Email
          </ButtonRegular>
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
