import React, { type FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CryptoDetailScreen } from '../screens/crypto/crypto-detail';
import { CryptoListScreen } from '../screens/crypto/crypto-list';
import { useTheme } from '../theme';
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
        name="CryptoList"
        component={CryptoListScreen}
        options={{
          title: 'Crypto Portfolio',
        }}
      />
      <Stack.Screen
        name="CryptoDetail"
        component={CryptoDetailScreen}
        options={{
          title: 'Crypto Details',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
