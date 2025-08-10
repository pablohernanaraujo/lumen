import React, { type FC } from 'react';
import { View } from 'react-native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import { useAuth } from '../contexts';
import { CurrencyPickerModalScreen } from '../screens/modals/currency-picker';
import { FilterModalScreen } from '../screens/modals/filter-modal';
import { PermissionEducationModalScreen } from '../screens/modals/permission-education-modal';
import { PrivacyModalScreen } from '../screens/modals/privacy-modal';
import { ProfileModalScreen } from '../screens/modals/profile-modal';
import { TermsModalScreen } from '../screens/modals/terms-modal';
import { makeStyles, useTheme } from '../theme';
import { Icon, Image } from '../ui';
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
        <Image
          source={require('../assets/images/lumen-logo-02.png')}
          width={80}
          height={80}
        />
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
          animation: 'slide_from_bottom',
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
                name="close"
                family="MaterialIcons"
                size={32}
                color={theme.colors.text.primary}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Cerrar"
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
                name="close"
                family="MaterialIcons"
                size={32}
                color={theme.colors.text.primary}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Cerrar"
                testID="back-button-2"
              />
            ),
          })}
        />
        <Stack.Screen
          name="ProfileModal"
          component={ProfileModalScreen}
          options={({ navigation }): NativeStackNavigationOptions => ({
            title: 'Mi Perfil',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text.primary,
            headerLeft: () => (
              <Icon
                name="close"
                family="MaterialIcons"
                size={32}
                color={theme.colors.text.primary}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Cerrar"
                testID="back-button-3"
              />
            ),
          })}
        />
        <Stack.Screen
          name="FilterModal"
          component={FilterModalScreen}
          options={({ navigation }): NativeStackNavigationOptions => ({
            title: 'Filtros',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text.primary,
            headerLeft: () => (
              <Icon
                name="close"
                family="MaterialIcons"
                size={32}
                color={theme.colors.text.primary}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Cerrar"
                testID="back-button-4"
              />
            ),
          })}
        />
        <Stack.Screen
          name="CurrencyPickerModal"
          component={CurrencyPickerModalScreen}
          options={({ navigation }): NativeStackNavigationOptions => ({
            title: 'Elegir moneda',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text.primary,
            headerLeft: () => (
              <Icon
                name="close"
                family="MaterialIcons"
                size={32}
                color={theme.colors.text.primary}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Cerrar"
                testID="back-button-5"
              />
            ),
          })}
        />
        <Stack.Screen
          name="PermissionEducationModal"
          component={PermissionEducationModalScreen}
          options={({ navigation }): NativeStackNavigationOptions => ({
            title: 'Camera Permission',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text.primary,
            headerLeft: () => (
              <Icon
                name="close"
                family="MaterialIcons"
                size={32}
                color={theme.colors.text.primary}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Cerrar"
                testID="back-button-6"
              />
            ),
          })}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};
