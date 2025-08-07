import React, { type FC, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: ReactNode;
}

// Create a client with optimized settings for React Native
const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes
        staleTime: 1000 * 60 * 5,
        // Keep data in cache for 10 minutes
        gcTime: 1000 * 60 * 10,
        // Retry failed requests up to 2 times
        retry: (failureCount, error) => {
          // Don't retry on client errors (4xx)
          if (error && typeof error === 'object' && 'response' in error) {
            const response = (error as { response?: { status?: number } })
              .response;
            if (
              response?.status &&
              response.status >= 400 &&
              response.status < 500
            ) {
              return false;
            }
          }
          return failureCount < 2;
        },
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus only in development
        refetchOnWindowFocus: __DEV__,
        // Always refetch when network reconnects
        refetchOnReconnect: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: 'always',
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
        // Retry delay for mutations
        retryDelay: 1000,
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

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
