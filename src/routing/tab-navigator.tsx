import React, { type FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CryptoListScreen } from '../screens/crypto/crypto-list';
import { ExchangeScreen } from '../screens/exchange';
import { ScannerScreen } from '../screens/scanner';
import { useTheme } from '../theme';
import { Image } from '../ui';
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
          backgroundColor: theme.colors.surface,
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
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/images/tabs/portfolio-selected.png')
                  : require('../assets/images/tabs/portfolio-unselected.png')
              }
              width={36}
              height={36}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Exchange"
        component={ExchangeScreen}
        options={{
          title: 'Exchange',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/images/tabs/exchange-selected.png')
                  : require('../assets/images/tabs/exchange-unselected.png')
              }
              width={36}
              height={36}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Scanner',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/images/tabs/scanner-selected.png')
                  : require('../assets/images/tabs/scanner-unselected.png')
              }
              width={36}
              height={36}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
