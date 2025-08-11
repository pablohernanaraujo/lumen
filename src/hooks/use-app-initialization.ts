import { useEffect, useState } from 'react';

import { AddressStorageService } from '../services/address-storage-service';

interface AppInitializationState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
}

export const useAppInitialization = (): AppInitializationState => {
  const [state, setState] = useState<AppInitializationState>({
    isInitialized: false,
    isInitializing: true,
    error: null,
  });

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        console.log('[AppInitialization] Starting app initialization...');

        // Initialize storage services
        await AddressStorageService.initialize();

        console.log('[AppInitialization] App initialization completed');

        setState({
          isInitialized: true,
          isInitializing: false,
          error: null,
        });
      } catch (initError) {
        console.error(
          '[AppInitialization] Failed to initialize app:',
          initError,
        );

        setState({
          isInitialized: false,
          isInitializing: false,
          error:
            initError instanceof Error
              ? initError.message
              : 'Unknown initialization error',
        });
      }
    };

    initializeApp();
  }, []);

  return state;
};
