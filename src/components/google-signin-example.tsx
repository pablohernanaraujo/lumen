import React, { type FC } from 'react';
import {
  Alert,
  Image,
  type ImageStyle,
  StyleSheet,
  Text,
  type TextStyle,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { useGoogleSignIn } from '../hooks/use-google-signin';

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  title: TextStyle;
  userInfo: ViewStyle;
  avatar: ImageStyle;
  userName: TextStyle;
  userEmail: TextStyle;
  button: ViewStyle;
  signInButton: ViewStyle;
  signOutButton: ViewStyle;
  buttonText: TextStyle;
  loadingText: TextStyle;
}

export const GoogleSignInExample: FC = () => {
  const { user, isSignedIn, isLoading, signIn, signOut } = useGoogleSignIn();

  const handleSignIn = async (): Promise<void> => {
    try {
      await signIn();
      Alert.alert('Success', 'Signed in successfully!');
    } catch {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully!');
    } catch {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Google Sign-In Demo</Text>

        {isSignedIn && user ? (
          <View style={styles.userInfo}>
            {user.user.photo && (
              <Image
                source={{ uri: user.user.photo }}
                style={styles.avatar}
                testID="user-avatar-1"
              />
            )}
            <Text style={styles.userName} testID="user-name-1">
              {user.user.name}
            </Text>
            <Text style={styles.userEmail} testID="user-email-1">
              {user.user.email}
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.signOutButton]}
              onPress={handleSignOut}
              testID="sign-out-button-1"
            >
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.signInButton]}
            onPress={handleSignIn}
            testID="sign-in-button-1"
          >
            <Text style={styles.buttonText}>Sign In with Google</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 40,
    textAlign: 'center',
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButton: {
    backgroundColor: '#4285F4',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
});
