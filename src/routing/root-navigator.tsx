import React, { type FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '../theme';
import { KeyboardAwareScrollView } from '../ui/layout';
import { AppStack } from './app-stack';
import { AuthStack } from './auth-stack';
import { SplashScreen } from './screens/splash';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: FC = () => {
  const { theme } = useTheme();

  return (
    <KeyboardAwareScrollView>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            title: 'Lumen',
          }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{
            title: 'Authentication',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="App"
          component={AppStack}
          options={{
            title: 'Lumen App',
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </KeyboardAwareScrollView>
  );
};
