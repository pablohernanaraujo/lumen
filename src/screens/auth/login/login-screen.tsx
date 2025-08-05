import React, { type FC, useState } from 'react';
import { TextInput } from 'react-native';

import type { RootNavigationProp } from '../../../routing';
import { makeStyles } from '../../../theme';
import {
  Body1,
  ButtonRegular,
  ContentWrapper,
  H1,
  Icon,
  ScreenWrapper,
  VStack,
} from '../../../ui';
import type { LoginFormData } from './types';

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
}));

interface LoginScreenProps {
  navigation: RootNavigationProp;
}

export const LoginScreen: FC<LoginScreenProps> = ({ navigation }) => {
  const styles = useStyles();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleLogin = (): void => {
    // TODO: Implement login logic
    console.log('Login:', formData);
    navigation.navigate('App');
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
          <ButtonRegular onPress={handleLogin} testID="login-button">
            Sign In
          </ButtonRegular>
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
