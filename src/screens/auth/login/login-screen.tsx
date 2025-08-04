import React, { type FC, useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';

import type { RootNavigationProp } from '../../../routing';
import { makeStyles } from '../../../theme';
import {
  Body1,
  Container,
  ContentWrapper,
  H1,
  HStack,
  Icon,
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

  const handleRegister = (): void => {
    navigation.navigate('Auth');
  };

  return (
    <Container>
      <ContentWrapper variant="header">
        <VStack spacing="sm">
          <H1>Welcome Back</H1>
          <Body1 emphasis="medium">Sign in to your account</Body1>
        </VStack>
      </ContentWrapper>

      <ContentWrapper variant="body">
        <VStack spacing="lg">
          <Icon
            name="account-circle"
            family="MaterialIcons"
            size="xxxl"
            testID="login-icon"
          />

          <VStack spacing="md">
            <Body1 emphasis="medium">Email</Body1>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  email: text,
                })
              }
              placeholder="Enter your email"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              testID="email-input"
            />

            <Body1 emphasis="medium">Password</Body1>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  password: text,
                })
              }
              placeholder="Enter your password"
              placeholderTextColor="#6B7280"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              testID="password-input"
            />
          </VStack>
        </VStack>
      </ContentWrapper>

      <ContentWrapper variant="footer">
        <VStack spacing="md">
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            testID="login-button"
          >
            <Body1 emphasis="medium">Sign In</Body1>
          </TouchableOpacity>

          <HStack spacing="sm">
            <Body1 emphasis="medium">Don't have an account?</Body1>
            <TouchableOpacity onPress={handleRegister} testID="register-link">
              <Body1 emphasis="medium" color="link">
                Sign Up
              </Body1>
            </TouchableOpacity>
          </HStack>
        </VStack>
      </ContentWrapper>
    </Container>
  );
};
