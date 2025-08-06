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
  static async configure(): Promise<void> {
    GoogleSignin.configure({
      webClientId:
        '259221570110-cd04uq0dtecglu54k8aisolpa7tkmd7p.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
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
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      return currentUser !== null;
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async refreshTokens(): Promise<AuthTokens | null> {
    try {
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
      return null;
    }
  }
}
