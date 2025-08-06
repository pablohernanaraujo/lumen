import {
  GoogleSignin,
  type User,
} from '@react-native-google-signin/google-signin';

export interface GoogleSignInService {
  configure(): void;
  signIn(): Promise<User>;
  signOut(): Promise<void>;
  isSignedIn(): Promise<boolean>;
  getCurrentUser(): Promise<User | null>;
}

class GoogleSignInServiceImpl implements GoogleSignInService {
  private isConfigured = false;

  configure(): void {
    if (this.isConfigured) return;

    GoogleSignin.configure({
      scopes: ['profile', 'email'], // Basic profile and email permissions
      offlineAccess: true, // Enable offline access for refresh tokens
      hostedDomain: '', // Restrict sign-in to specific domain (empty = any domain)
      forceCodeForRefreshToken: true, // Force getting refresh token
    });

    this.isConfigured = true;
  }

  async signIn(): Promise<User> {
    try {
      this.configure();
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.data) {
        return response.data;
      }
      throw new Error('Sign-in cancelled');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
      throw error;
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      const currentUser = GoogleSignin.getCurrentUser();
      return currentUser !== null;
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return GoogleSignin.getCurrentUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

export const googleSignInService = new GoogleSignInServiceImpl();
