import React, { type FC, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import type { RegisterScreenProps } from '../../../routing';
import { makeStyles } from '../../../theme';
import { Container, ContentWrapper, HStack, Icon, VStack } from '../../../ui';
import type { RegisterFormData } from './types';

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

export const RegisterScreen: FC<RegisterScreenProps> = ({ navigation }) => {
  const styles = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = (): void => {
    // TODO: Implement register logic
    console.log('Register:', formData);
    navigation.replace('Login');
  };

  const handleLogin = (): void => {
    navigation.navigate('Login');
  };

  return (
    <Container>
      <ContentWrapper variant="header">
        <VStack spacing="sm">
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the crypto community</Text>
        </VStack>
      </ContentWrapper>

      <ContentWrapper variant="body">
        <VStack spacing="lg">
          <Icon
            name="person-add"
            family="MaterialIcons"
            size="xxxl"
            testID="register-icon"
          />

          <VStack spacing="md">
            <Text>Full Name</Text>
            {/* TODO: Replace with proper TextInput component */}
            <Text style={styles.input}>Name input placeholder</Text>

            <Text>Email</Text>
            {/* TODO: Replace with proper TextInput component */}
            <Text style={styles.input}>Email input placeholder</Text>

            <Text>Password</Text>
            {/* TODO: Replace with proper TextInput component */}
            <Text style={styles.input}>Password input placeholder</Text>

            <Text>Confirm Password</Text>
            {/* TODO: Replace with proper TextInput component */}
            <Text style={styles.input}>Confirm password input placeholder</Text>
          </VStack>
        </VStack>
      </ContentWrapper>

      <ContentWrapper variant="footer">
        <VStack spacing="md">
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            testID="register-button"
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <HStack spacing="sm">
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={handleLogin} testID="login-link">
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </HStack>
        </VStack>
      </ContentWrapper>
    </Container>
  );
};
