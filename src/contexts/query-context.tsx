/* eslint-disable max-statements */
/* eslint-disable complexity */
import React, { type FC, type ReactNode, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

interface QueryProviderProps {
  children: ReactNode;
}

// Network-aware retry function
const networkAwareRetry = (failureCount: number, error: unknown): boolean => {
  // Don't retry on client errors (4xx) except 429 (rate limit)
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    if (response?.status) {
      const status = response.status;
      // Don't retry on 4xx errors except 429 (Too Many Requests)
      if (status >= 400 && status < 500 && status !== 429) {
        return false;
      }
      // Always retry on 5xx server errors
      if (status >= 500) {
        return failureCount < 3; // More retries for server errors
      }
    }
  }

  // Retry on network errors, timeouts, etc.
  if (error && typeof error === 'object') {
    const errorName = (error as { name?: string }).name;
    const errorCode = (error as { code?: string }).code;

    if (
      errorName === 'NetworkError' ||
      errorName === 'TimeoutError' ||
      errorCode === 'ECONNABORTED' ||
      errorCode === 'ENOTFOUND'
    ) {
      return failureCount < 3;
    }
  }

  return failureCount < 2; // Default retry count
};

// Smart stale time based on data type
const getStaleTime = (queryKey: readonly unknown[]): number => {
  const key = String(queryKey[0] || '');

  // Market data - 2 minutes (frequently changing prices)
  if (key.includes('crypto-list') || key.includes('price')) {
    return 2 * 60 * 1000;
  }

  // Detailed coin data - 5 minutes (less frequently changing)
  if (key.includes('crypto-detail')) {
    return 5 * 60 * 1000;
  }

  // Search results - 10 minutes (rarely changing)
  if (key.includes('crypto-search')) {
    return 10 * 60 * 1000;
  }

  // User-specific data - 1 minute (frequently changing)
  if (key.includes('user') || key.includes('portfolio')) {
    return 1 * 60 * 1000;
  }

  // Default - 5 minutes
  return 5 * 60 * 1000;
};

// Smart cache time based on data type and network conditions
const getCacheTime = (queryKey: readonly unknown[]): number => {
  const key = String(queryKey[0] || '');

  // Critical data - keep longer in cache
  if (key.includes('crypto-list') || key.includes('crypto-detail')) {
    return 30 * 60 * 1000; // 30 minutes
  }

  // Search results - medium cache time
  if (key.includes('crypto-search')) {
    return 20 * 60 * 1000; // 20 minutes
  }

  // User data - shorter cache time
  if (key.includes('user') || key.includes('portfolio')) {
    return 5 * 60 * 1000; // 5 minutes
  }

  // Default - 15 minutes
  return 15 * 60 * 1000;
};

// Create a client with optimized settings for React Native
const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time (will be overridden in individual hooks)
        staleTime: 5 * 60 * 1000, // 5 minutes default
        // Default cache time (will be overridden in individual hooks)
        gcTime: 15 * 60 * 1000, // 15 minutes default
        // Network-aware retry logic
        retry: networkAwareRetry,
        // Progressive retry delay with jitter
        retryDelay: (attemptIndex, error) => {
          const baseDelay = Math.min(1000 * Math.pow(2, attemptIndex), 30000);
          const jitter = Math.random() * 1000;

          // Longer delays for rate limit errors
          if (error && typeof error === 'object' && 'response' in error) {
            const response = (error as { response?: { status?: number } })
              .response;
            if (response?.status === 429) {
              return baseDelay * 2 + jitter; // Double delay for rate limits
            }
          }

          return baseDelay + jitter;
        },
        // Smart refetch behavior
        refetchOnWindowFocus: false, // Disabled for mobile app
        refetchOnReconnect: 'always', // Always refetch when network reconnects
        refetchOnMount: (query: {
          queryKey: readonly unknown[];
          state: { dataUpdatedAt: number };
        }) => {
          // Only refetch on mount if data is stale
          const now = Date.now();
          const staleTime = getStaleTime(query.queryKey);
          const dataUpdatedAt = query.state.dataUpdatedAt;

          return now - dataUpdatedAt > staleTime;
        },
        // Background refetch settings
        refetchInterval: false, // Disabled by default
        refetchIntervalInBackground: false,
        // Network mode for offline support
        networkMode: 'offlineFirst',
      },
      mutations: {
        // More aggressive retry for mutations
        retry: (failureCount, error) => {
          // Don't retry client errors except rate limits
          if (error && typeof error === 'object' && 'response' in error) {
            const response = (error as { response?: { status?: number } })
              .response;
            if (
              response?.status &&
              response.status >= 400 &&
              response.status < 500 &&
              response.status !== 429
            ) {
              return false;
            }
          }
          return failureCount < 2;
        },
        // Progressive retry delay for mutations
        retryDelay: (attemptIndex) =>
          Math.min(1000 * Math.pow(2, attemptIndex), 10000),
        // Network mode for mutations
        networkMode: 'online',
      },
    },
  });

// Create a single instance to avoid creating multiple clients
let queryClientInstance: QueryClient | null = null;

const getQueryClient = (): QueryClient => {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
  }
  return queryClientInstance;
};

export const QueryProvider: FC<QueryProviderProps> = ({ children }) => {
  const queryClient = getQueryClient();

  useEffect(() => {
    // Set up network state management
    const setupNetworkManagement = async (): Promise<() => void> => {
      try {
        // Subscribe to network state changes
        const unsubscribe = NetInfo.addEventListener((state) => {
          onlineManager.setOnline(
            state.isConnected != null &&
              state.isConnected &&
              Boolean(state.isInternetReachable),
          );
        });

        // Set initial network state
        const netInfoState = await NetInfo.fetch();
        onlineManager.setOnline(
          netInfoState.isConnected != null &&
            netInfoState.isConnected &&
            Boolean(netInfoState.isInternetReachable),
        );

        return unsubscribe;
      } catch {
        console.warn(
          '[QueryProvider] NetInfo not available, using default online state',
        );
        // Fallback to assuming online
        onlineManager.setOnline(true);
        return () => {};
      }
    };

    setupNetworkManagement().catch((error) => {
      console.warn(
        '[QueryProvider] Failed to setup network management:',
        error,
      );
    });
  }, []);

  useEffect(() => {
    // Set up focus management for app state changes
    const handleAppStateChange = (status: AppStateStatus): void => {
      // Disable focus manager when app goes to background
      // Enable when app becomes active
      focusManager.setFocused(status === 'active');

      // Optionally pause/resume queries based on app state
      if (status === 'background') {
        // Optionally cancel ongoing queries when app goes to background
        queryClient.cancelQueries();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Set initial focus state
    focusManager.setFocused(AppState.currentState === 'active');

    return () => subscription?.remove();
  }, [queryClient]);

  useEffect(() => {
    // Set up periodic cache cleanup
    const cleanupInterval = setInterval(
      () => {
        // Remove expired queries
        queryClient.getQueryCache().clear();

        // Optionally run garbage collection
        queryClient.invalidateQueries({
          predicate: (query: {
            queryKey: readonly unknown[];
            state: { dataUpdatedAt: number };
          }) => {
            const now = Date.now();
            const cacheTime = getCacheTime(query.queryKey);
            return now - query.state.dataUpdatedAt > cacheTime * 2; // Double the cache time for cleanup
          },
        });
      },
      15 * 60 * 1000,
    ); // Clean up every 15 minutes

    return () => clearInterval(cleanupInterval);
  }, [queryClient]);

  useEffect(() => {
    // Set up intelligent background refetch for critical data
    const backgroundRefetchInterval = setInterval(
      async () => {
        // Only refetch if app is in foreground and online
        if (AppState.currentState === 'active' && onlineManager.isOnline()) {
          try {
            const netInfo = await NetInfo.fetch();

            // More aggressive refetch on WiFi, conservative on cellular
            const isWiFi = netInfo.type === 'wifi';
            const refetchKey = isWiFi ? 'crypto-list' : null;

            if (refetchKey) {
              queryClient.invalidateQueries({
                predicate: (query: { queryKey: readonly unknown[] }) =>
                  String(query.queryKey[0] || '').includes(refetchKey),
              });
            }
          } catch {
            // Fallback behavior if NetInfo is not available
            console.warn(
              '[QueryProvider] NetInfo not available for background refetch',
            );
          }
        }
      },
      15 * 60 * 1000,
    ); // Check every 15 minutes (reduced from 5 minutes to prevent rate limits)

    return () => clearInterval(backgroundRefetchInterval);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Export utilities for external use
export { getCacheTime, getStaleTime, networkAwareRetry };
