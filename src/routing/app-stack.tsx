import React, { type FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CryptoDetailScreen } from '../screens/crypto/crypto-detail';
import { FavoritesScreen, HistoryScreen } from '../screens/history';
import { useTheme } from '../theme';
import { TabNavigator } from './tab-navigator';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack: FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          title: 'Portafolio cripto',
        }}
      />
      <Stack.Screen
        name="CryptoDetail"
        component={CryptoDetailScreen}
        options={{
          title: 'Detalles de cripto',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Historial de escaneos',
          headerShown: true,
          headerTitleStyle: {
            color: theme.colors.text.primary,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.primary.main,
        }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Direcciones favoritas',
          headerShown: true,
          headerTitleStyle: {
            color: theme.colors.text.primary,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.primary.main,
        }}
      />
    </Stack.Navigator>
  );
};
