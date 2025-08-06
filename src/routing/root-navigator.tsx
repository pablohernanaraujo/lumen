import React, { type FC } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts';
import { makeStyles, useTheme } from '../theme';
import { AppStack } from './app-stack';
import { AuthStack } from './auth-stack';

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

  // Render based on authentication state
  if (isAuthenticated) {
    return <AppStack />;
  }

  return <AuthStack />;
};
