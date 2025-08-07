import { type FC, StrictMode } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider, FilterProvider, QueryProvider } from './contexts';
import { RootNavigator } from './routing';
import { navigationRef } from './routing/routing-service';
import { ThemeProvider, useTheme } from './theme';

const AppContent: FC = () => {
  const { theme, mode } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export const App: FC = () => (
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <FilterProvider>
            <AppContent />
          </FilterProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>
);
