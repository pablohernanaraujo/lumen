import React, { type FC, useState } from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';

import { makeStyles } from '../../../../theme';
import {
  Container,
  ContentWrapper,
  HStack,
  Icon,
  VStack,
} from '../../../../ui';
import type { RootNavigationProp } from '../../../types';
import type { LoginFormData } from './types';

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
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold,
  },
  linkText: {
    color: theme.colors.primary.main,
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.medium,
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
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
            <Text>Email</Text>
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

            <Text>Password</Text>
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
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <HStack spacing="sm">
            <Text>Don't have an account?</Text>
            <TouchableOpacity onPress={handleRegister} testID="register-link">
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </HStack>
        </VStack>
      </ContentWrapper>
    </Container>
  );
};
