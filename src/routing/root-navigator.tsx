import React, { type FC } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import { useAuth } from '../contexts';
import { PrivacyModalScreen } from '../screens/modals/privacy-modal';
import { TermsModalScreen } from '../screens/modals/terms-modal';
import { makeStyles, useTheme } from '../theme';
import { Icon } from '../ui';
import { AppStack } from './app-stack';
import { AuthStack } from './auth-stack';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const useStyles = makeStyles((theme) => ({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
}));

export const RootNavigator: FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const styles = useStyles();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
      initialRouteName={isAuthenticated ? 'App' : 'Auth'}
    >
      <Stack.Group>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="App" component={AppStack} />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: 'modal',
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="TermsModal"
          component={TermsModalScreen}
          options={({ navigation }): NativeStackNavigationOptions => ({
            title: 'Términos y Condiciones',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text.primary,
            headerLeft: () => (
              <Icon
                name="chevron-left"
                family="MaterialIcons"
                size={32}
                color={theme.colors.text.primary}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Volver"
                testID="back-button-1"
              />
            ),
          })}
        />
        <Stack.Screen
          name="PrivacyModal"
          component={PrivacyModalScreen}
          options={({ navigation }): NativeStackNavigationOptions => ({
            title: 'Política de Privacidad',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text.primary,
            headerLeft: () => (
              <Icon
                name="chevron-left"
                family="MaterialIcons"
                size={32}
                color={theme.colors.text.primary}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Volver"
                testID="back-button-2"
              />
            ),
          })}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};
