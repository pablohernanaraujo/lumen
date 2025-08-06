import React, {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { type User } from '@react-native-google-signin/google-signin';

import { AuthService } from '../services/auth-service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Configure Google Sign-In
  useEffect(() => {
    AuthService.configure();
  }, []);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuthState = async (): Promise<void> => {
      try {
        const { token, user } = await AuthService.getStoredAuthData();

        if (token && user) {
          // Check if Google Sign-In is still valid
          const isSignedIn = await AuthService.isSignedIn();

          if (isSignedIn) {
            setAuthState({
              user,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            // Token exists but Google Sign-In is not valid, clear storage
            await AuthService.clearStoredAuthData();
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        await AuthService.clearStoredAuthData();
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuthState();
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setAuthState((prev) => ({
        ...prev,
        isLoading: true,
      }));

      const { user } = await AuthService.signInWithGoogle();

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error: unknown) {
      console.error('Google Sign-In error:', error);

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
      }));

      // Re-throw the error for UI handling
      const error_ =
        error instanceof Error ? error : new Error('Google Sign-In failed');
      throw error_;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setAuthState((prev) => ({
        ...prev,
        isLoading: true,
      }));

      await AuthService.signOut();

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Sign out error:', error);

      // Even if sign-out fails, clear local state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
