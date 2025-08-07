/* eslint-disable max-statements */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  type NetworkInfo,
  type NetworkStrategyOptions,
  networkStrategyService,
  type RefreshStrategy,
} from '../../services/network-strategy-service';

export interface UseNetworkAwareRefreshOptions {
  queryKey: unknown[];
  dataType: 'critical' | 'important' | 'nice-to-have';
  enableAutoRefresh?: boolean;
  customRefreshCondition?: (networkInfo: NetworkInfo) => boolean;
  onRefresh?: (strategy: RefreshStrategy) => void;
}

export interface NetworkAwareRefreshResult {
  networkInfo: NetworkInfo;
  shouldRefresh: boolean;
  refreshStrategy: RefreshStrategy;
  triggerRefresh: (userRequested?: boolean) => void;
  enableAutoRefresh: () => void;
  disableAutoRefresh: () => void;
  getBatchSize: (defaultSize?: number) => number;
  shouldPreload: boolean;
  isSuitableForHeavyOps: boolean;
}

export const useNetworkAwareRefresh = (
  options: UseNetworkAwareRefreshOptions,
): NetworkAwareRefreshResult => {
  const {
    queryKey,
    dataType,
    enableAutoRefresh: initialAutoRefresh = true,
    customRefreshCondition,
    onRefresh,
  } = options;

  const queryClient = useQueryClient();
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(
    networkStrategyService.getCurrentNetworkInfo(),
  );
  const [refreshStrategy, setRefreshStrategy] = useState<RefreshStrategy>({
    shouldRefresh: false,
    interval: 0,
    priority: 'low',
    reason: 'Initializing',
  });

  const [autoRefreshEnabled, setAutoRefreshEnabled] =
    useState(initialAutoRefresh);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  // Get query data age
  const getQueryAge = useCallback((): number => {
    const queryCache = queryClient.getQueryCache();
    const query = queryCache.find({ queryKey });

    if (query?.state.dataUpdatedAt) {
      return Date.now() - query.state.dataUpdatedAt;
    }

    return Infinity; // No data means infinitely old
  }, [queryClient, queryKey]);

  // Update refresh strategy based on current conditions
  const updateRefreshStrategy = useCallback(
    (userRequested = false): RefreshStrategy => {
      const queryAge = getQueryAge();
      const lastUpdated = Date.now() - queryAge;

      const strategyOptions: NetworkStrategyOptions = {
        dataType,
        lastUpdated,
        userRequested,
      };

      const strategy =
        networkStrategyService.getRefreshStrategy(strategyOptions);

      // Apply custom refresh condition if provided
      if (customRefreshCondition && !userRequested) {
        strategy.shouldRefresh =
          strategy.shouldRefresh && customRefreshCondition(networkInfo);
        if (!customRefreshCondition(networkInfo)) {
          strategy.reason = 'Custom condition not met';
        }
      }

      setRefreshStrategy(strategy);
      return strategy;
    },
    [dataType, getQueryAge, customRefreshCondition, networkInfo],
  );

  // Trigger refresh function
  const triggerRefresh = useCallback(
    (userRequested = false) => {
      const strategy = updateRefreshStrategy(userRequested);

      if (strategy.shouldRefresh) {
        queryClient.invalidateQueries({ queryKey });
        lastRefreshRef.current = Date.now();

        if (onRefresh) {
          onRefresh(strategy);
        }

        console.log(
          `[NetworkAwareRefresh] Refreshing query: ${JSON.stringify(queryKey)} - ${strategy.reason}`,
        );
      }
    },
    [updateRefreshStrategy, queryClient, queryKey, onRefresh],
  );

  // Set up automatic refresh
  const setupAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    if (!autoRefreshEnabled) return;

    const strategy = updateRefreshStrategy();

    if (strategy.interval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        // Check if we should still be auto-refreshing
        const currentStrategy = updateRefreshStrategy();
        if (currentStrategy.shouldRefresh && autoRefreshEnabled) {
          triggerRefresh(false);
        }
      }, strategy.interval);
    }
  }, [autoRefreshEnabled, updateRefreshStrategy, triggerRefresh]);

  // Enable/disable auto refresh
  const enableAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(true);
  }, []);

  const disableAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(false);
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Get batch size based on network conditions
  const getBatchSize = useCallback(
    (defaultSize = 20): number =>
      networkStrategyService.getBatchSize(defaultSize),
    [],
  );

  // Check if we should preload
  const shouldPreload = networkStrategyService.shouldPreload(dataType);

  // Check if suitable for heavy operations
  const isSuitableForHeavyOps =
    networkStrategyService.isSuitableForHeavyOperations();

  // Network change listener
  useEffect(() => {
    const unsubscribe = networkStrategyService.onNetworkChange(
      (newNetworkInfo) => {
        setNetworkInfo(newNetworkInfo);

        // Update refresh strategy when network changes
        updateRefreshStrategy();

        console.log(
          `[NetworkAwareRefresh] Network changed: ${newNetworkInfo.type}, Connected: ${newNetworkInfo.isConnected}`,
        );

        // If we just came back online, refresh immediately for critical data
        if (
          newNetworkInfo.isConnected &&
          !networkInfo.isConnected &&
          dataType === 'critical'
        ) {
          setTimeout(() => triggerRefresh(false), 1000); // Small delay to let connection stabilize
        }
      },
    );

    return unsubscribe;
  }, [updateRefreshStrategy, networkInfo, dataType, triggerRefresh]);

  // Set up auto refresh when enabled state or strategy changes
  useEffect(() => {
    setupAutoRefresh();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [setupAutoRefresh]);

  // Initial strategy calculation
  useEffect(() => {
    updateRefreshStrategy();
  }, [updateRefreshStrategy]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    },
    [],
  );

  return {
    networkInfo,
    shouldRefresh: refreshStrategy.shouldRefresh,
    refreshStrategy,
    triggerRefresh,
    enableAutoRefresh,
    disableAutoRefresh,
    getBatchSize,
    shouldPreload,
    isSuitableForHeavyOps,
  };
};
