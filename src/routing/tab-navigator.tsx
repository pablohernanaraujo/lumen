import React, { type FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CryptoListScreen } from '../screens/crypto/crypto-list';
import { ExchangeScreen } from '../screens/exchange';
import { FavoritesScreen } from '../screens/history';
import { ScannerScreen } from '../screens/scanner';
import { useTheme } from '../theme';
import { Icon } from '../ui';
import type { TabStackParamList } from './types';

const Tab = createBottomTabNavigator<TabStackParamList>();

export const TabNavigator: FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: 12 + insets.bottom,
          paddingTop: 12,
        },
      }}
    >
      <Tab.Screen
        name="CryptoListTab"
        component={CryptoListScreen}
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => (
            <Icon
              name="account-balance-wallet"
              family="MaterialIcons"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Exchange"
        component={ExchangeScreen}
        options={{
          title: 'Exchange',
          tabBarIcon: ({ color }) => (
            <Icon
              name="currency-exchange"
              family="MaterialIcons"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => (
            <Icon
              name="qr-code-scanner"
              family="MaterialIcons"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => (
            <Icon name="star" family="MaterialIcons" size={30} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
