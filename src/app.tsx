import { type FC, StrictMode } from 'react';
import { StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import {
  AuthProvider,
  FilterProvider,
  NetworkProvider,
  QueryProvider,
} from './contexts';
import { useAppInitialization } from './hooks/use-app-initialization';
import { RootNavigator } from './routing';
import { navigationRef } from './routing/routing-service';
import { ThemeProvider, useTheme } from './theme';
import { ErrorState, LoadingIndicator, NetworkBanner } from './ui';

const AppContent: FC = () => {
  const { theme, mode } = useTheme();
  const { isInitialized, isInitializing, error } = useAppInitialization();

  if (isInitializing) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar
            barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.background}
          />
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.colors.background,
            }}
          >
            <LoadingIndicator label="Initializing app..." showLabel />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (error) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar
            barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.background}
          />
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.background,
            }}
          >
            <ErrorState
              title="Initialization Failed"
              message={error}
              retryText="Retry"
              onRetry={(): void => {
                // Force app reload by reloading the bundle
                console.log(
                  'User requested app restart after initialization failure',
                );
              }}
            />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (!isInitialized) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar
            barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.background}
          />
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.background,
            }}
          >
            <ErrorState
              title="App Not Ready"
              message="App initialization incomplete"
              retryText="Retry"
              onRetry={(): void => {
                console.log(
                  'User requested retry after incomplete initialization',
                );
              }}
            />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
        </NavigationContainer>
        <NetworkBanner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export const App: FC = () => (
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <NetworkProvider>
          <AuthProvider>
            <FilterProvider>
              <AppContent />
            </FilterProvider>
          </AuthProvider>
        </NetworkProvider>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>
);
