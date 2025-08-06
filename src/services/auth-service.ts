import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes,
  type User,
} from '@react-native-google-signin/google-signin';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@lumen_access_token',
  USER_DATA: '@lumen_user_data',
} as const;

export interface AuthTokens {
  accessToken: string;
  idToken?: string;
}

export interface SignInResult {
  user: User;
  tokens: AuthTokens;
}

export class AuthService {
  static configure(): void {
    if (Platform.OS === 'ios') {
      // iOS requires explicit webClientId configuration
      GoogleSignin.configure({
        webClientId:
          '259221570110-cd04uq0dtecglu54k8aisolpa7tkmd7p.apps.googleusercontent.com',
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
        scopes: ['profile', 'email'],
      });
    } else {
      // Android uses google-services.json automatically
      // webClientId should match the web client from google-services.json
      GoogleSignin.configure({
        webClientId:
          '259221570110-1519kivsgr525cq718g6nneba66o3p3i.apps.googleusercontent.com',
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
        scopes: ['profile', 'email'],
      });
    }
  }

  static async getStoredAuthData(): Promise<{
    token: string | null;
    user: User | null;
  }> {
    try {
      const [storedToken, storedUserData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      const user = storedUserData ? (JSON.parse(storedUserData) as User) : null;

      return {
        token: storedToken,
        user,
      };
    } catch (error) {
      console.error('Error getting stored auth data:', error);
      return {
        token: null,
        user: null,
      };
    }
  }

  static async storeAuthData(tokens: AuthTokens, user: User): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  static async clearStoredAuthData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      ]);
    } catch (error) {
      console.error('Error clearing stored auth data:', error);
    }
  }

  static async signInWithGoogle(): Promise<SignInResult> {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();

      if (signInResult.type === 'cancelled') {
        throw new Error('Sign-in was cancelled by the user');
      }

      const tokens = await GoogleSignin.getTokens();
      const authTokens: AuthTokens = {
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
      };

      await this.storeAuthData(authTokens, signInResult.data);

      return {
        user: signInResult.data,
        tokens: authTokens,
      };
    } catch (error: unknown) {
      this.handleSignInError(error);
    }
  }

  private static handleSignInError(error: unknown): never {
    console.error('Google Sign-In error:', error);

    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code;

      switch (errorCode) {
        case statusCodes.SIGN_IN_CANCELLED:
          throw new Error('Sign-in was cancelled by the user');
        case statusCodes.IN_PROGRESS:
          throw new Error('Sign-in is already in progress');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error('Google Play Services not available or outdated');
        default:
          throw new Error(`Google Sign-In failed: ${errorCode}`);
      }
    }

    throw new Error('Google Sign-In failed');
  }

  static async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      await this.clearStoredAuthData();
    } catch (error) {
      console.error('Sign out error:', error);

      // Always clear local data even if Google sign-out fails
      await this.clearStoredAuthData();
      throw new Error('Sign out failed');
    }
  }

  static async isSignedIn(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      try {
        await GoogleSignin.signInSilently();
        return true;
      } catch {
        return false;
      }
    } else {
      // Android: Use simple getCurrentUser check
      try {
        const currentUser = GoogleSignin.getCurrentUser();
        return currentUser !== null;
      } catch {
        return false;
      }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    if (Platform.OS === 'ios') {
      try {
        const result = await GoogleSignin.signInSilently();
        return result.data;
      } catch {
        return null;
      }
    } else {
      // Android: Use simple getCurrentUser
      try {
        const currentUser = GoogleSignin.getCurrentUser();
        return currentUser;
      } catch {
        return null;
      }
    }
  }

  static async restoreSignInSilently(): Promise<User | null> {
    return await (Platform.OS === 'ios'
      ? this.restoreSignInIOS()
      : this.restoreSignInAndroid());
  }

  private static async restoreSignInIOS(): Promise<User | null> {
    try {
      const result = await GoogleSignin.signInSilently();
      console.log('[iOS] Silent sign-in successful');
      return result.data;
    } catch {
      console.log('[iOS] Silent sign-in failed - no valid Keychain session');
      // iOS: If signInSilently fails, there's no valid session in Keychain
      return null;
    }
  }

  private static async restoreSignInAndroid(): Promise<User | null> {
    console.log(
      '[Android] Using legacy method - getCurrentUser + AsyncStorage',
    );

    try {
      const currentUser = GoogleSignin.getCurrentUser();
      if (currentUser) {
        return await this.processAndroidUser(currentUser);
      } else {
        await this.cleanupStaleAndroidData();
        return null;
      }
    } catch (error) {
      console.error('[Android] Error during session restore:', error);
      return null;
    }
  }

  private static async processAndroidUser(currentUser: User): Promise<User> {
    console.log('[Android] Found current user in Google Play Services');

    const tokens = await this.refreshTokens();
    if (tokens) {
      await this.storeAuthData(tokens, currentUser);
      console.log('[Android] Session restored successfully');
    } else {
      console.log(
        '[Android] Token refresh failed, but user exists in Play Services',
      );
    }
    return currentUser;
  }

  private static async cleanupStaleAndroidData(): Promise<void> {
    console.log('[Android] No current user in Google Play Services');

    const { token, user } = await this.getStoredAuthData();
    if (token || user) {
      console.log('[Android] Cleaning up stale AsyncStorage data');
      await this.clearStoredAuthData();
    }
  }

  static async refreshTokens(): Promise<AuthTokens | null> {
    try {
      // Check if user is signed in first
      const currentUser = GoogleSignin.getCurrentUser();
      if (!currentUser) {
        console.warn('Cannot refresh tokens: user not signed in');
        return null;
      }

      const tokens = await GoogleSignin.getTokens();

      const authTokens: AuthTokens = {
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
      };

      // Update stored access token
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);

      return authTokens;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      // If token refresh fails, the user needs to sign in again
      await this.clearStoredAuthData();
      return null;
    }
  }
}
