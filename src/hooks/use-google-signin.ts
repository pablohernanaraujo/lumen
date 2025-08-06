import { useCallback, useEffect, useState } from 'react';
import { type User } from '@react-native-google-signin/google-signin';

import { googleSignInService } from '../services/google-signin';

interface UseGoogleSignInReturn {
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

export const useGoogleSignIn = (): UseGoogleSignInReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUserInfo = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const signedIn = await googleSignInService.isSignedIn();
      setIsSignedIn(signedIn);

      if (signedIn) {
        const currentUser = await googleSignInService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user info:', error);
      setIsSignedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const signedInUser = await googleSignInService.signIn();
      setUser(signedInUser);
      setIsSignedIn(true);
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsSignedIn(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await googleSignInService.signOut();
      setUser(null);
      setIsSignedIn(false);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    googleSignInService.configure();
    refreshUserInfo();
  }, [refreshUserInfo]);

  return {
    user,
    isSignedIn,
    isLoading,
    signIn,
    signOut,
    refreshUserInfo,
  };
};
