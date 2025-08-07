/* eslint-disable max-statements */
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export interface NetworkInfo {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWiFi: boolean;
  isCellular: boolean;
  isExpensive: boolean;
  effectiveConnectionType?: string;
}

export interface RefreshStrategy {
  shouldRefresh: boolean;
  interval: number; // in milliseconds
  priority: 'low' | 'medium' | 'high';
  reason: string;
}

export interface NetworkStrategyOptions {
  dataType: 'critical' | 'important' | 'nice-to-have';
  lastUpdated?: number;
  userRequested?: boolean;
  isBackground?: boolean;
}

class NetworkStrategyService {
  private currentNetworkInfo: NetworkInfo = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWiFi: false,
    isCellular: false,
    isExpensive: false,
  };

  private appState: AppStateStatus = 'active';
  private listeners: Array<(info: NetworkInfo) => void> = [];

  constructor() {
    this.initializeNetworkMonitoring();
    this.initializeAppStateMonitoring();
  }

  private initializeNetworkMonitoring(): void {
    // Set up network state monitoring
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      this.updateNetworkInfo(state);
    });

    // Get initial network state
    NetInfo.fetch()
      .then((state) => {
        this.updateNetworkInfo(state);
      })
      .catch(() => {
        console.warn('[NetworkStrategy] Failed to fetch initial network state');
      });

    // Store unsubscribe function for cleanup
    this.cleanup = unsubscribe;
  }

  private cleanup = (): void => {};

  private initializeAppStateMonitoring(): void {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      this.appState = nextAppState;
    });

    this.appState = AppState.currentState;

    // Add cleanup for app state
    const originalCleanup = this.cleanup;
    this.cleanup = () => {
      originalCleanup();
      subscription?.remove();
    };
  }

  private updateNetworkInfo(state: NetInfoState): void {
    const networkInfo: NetworkInfo = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
      isWiFi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
      isExpensive: this.isExpensiveConnection(state),
      effectiveConnectionType:
        state.details && 'effectiveConnectionType' in state.details
          ? (state.details as { effectiveConnectionType?: string })
              .effectiveConnectionType
          : undefined,
    };

    this.currentNetworkInfo = networkInfo;

    // Notify listeners
    for (const listener of this.listeners) {
      try {
        listener(networkInfo);
      } catch (error) {
        console.warn('[NetworkStrategy] Listener error:', error);
      }
    }
  }

  private isExpensiveConnection(state: NetInfoState): boolean {
    // Consider cellular connections as expensive
    if (state.type === 'cellular') {
      // Check if we have details about the cellular connection
      if (state.details && 'isConnectionExpensive' in state.details) {
        return (
          (state.details as { isConnectionExpensive?: boolean })
            .isConnectionExpensive ?? true
        );
      }
      return true; // Assume cellular is expensive by default
    }

    return false; // WiFi and other connections are not expensive
  }

  getRefreshStrategy(options: NetworkStrategyOptions): RefreshStrategy {
    const {
      dataType,
      lastUpdated = 0,
      userRequested = false,
      isBackground = this.appState !== 'active',
    } = options;

    // If user explicitly requested refresh, always allow it
    if (userRequested) {
      return {
        shouldRefresh: this.currentNetworkInfo.isConnected,
        interval: 0, // Immediate
        priority: 'high',
        reason: 'User requested',
      };
    }

    // If offline, don't refresh
    if (
      !this.currentNetworkInfo.isConnected ||
      !this.currentNetworkInfo.isInternetReachable
    ) {
      return {
        shouldRefresh: false,
        interval: 0,
        priority: 'low',
        reason: 'Offline',
      };
    }

    // If app is in background, be more conservative
    if (isBackground) {
      return this.getBackgroundRefreshStrategy(dataType, lastUpdated);
    }

    // Foreground refresh strategies
    return this.getForegroundRefreshStrategy(dataType, lastUpdated);
  }

  private getForegroundRefreshStrategy(
    dataType: 'critical' | 'important' | 'nice-to-have',
    lastUpdated: number,
  ): RefreshStrategy {
    const now = Date.now();
    const age = now - lastUpdated;

    // Base intervals by data type and network
    const baseIntervals = {
      critical: {
        wifi: 1 * 60 * 1000, // 1 minute on WiFi
        cellular: 3 * 60 * 1000, // 3 minutes on cellular
      },
      important: {
        wifi: 3 * 60 * 1000, // 3 minutes on WiFi
        cellular: 5 * 60 * 1000, // 5 minutes on cellular
      },
      'nice-to-have': {
        wifi: 10 * 60 * 1000, // 10 minutes on WiFi
        cellular: 15 * 60 * 1000, // 15 minutes on cellular
      },
    };

    const networkType = this.currentNetworkInfo.isWiFi ? 'wifi' : 'cellular';
    const baseInterval = baseIntervals[dataType][networkType];

    // Adjust based on connection quality
    let adjustedInterval = baseInterval;

    if (this.currentNetworkInfo.effectiveConnectionType) {
      const connectionType = this.currentNetworkInfo.effectiveConnectionType;

      // Slow connections get longer intervals
      if (connectionType === 'slow-2g' || connectionType === '2g') {
        adjustedInterval *= 2;
      } else if (connectionType === '3g') {
        adjustedInterval *= 1.5;
      }
      // 4g and better use base interval
    }

    // If data is very stale, prioritize refresh
    const isStale = age > adjustedInterval;

    return {
      shouldRefresh: isStale,
      interval: adjustedInterval,
      priority: this.getPriority(dataType, age, adjustedInterval),
      reason: isStale
        ? `Data is ${Math.round(age / 60000)} minutes old`
        : 'Data is fresh',
    };
  }

  private getBackgroundRefreshStrategy(
    dataType: 'critical' | 'important' | 'nice-to-have',
    lastUpdated: number,
  ): RefreshStrategy {
    // Very conservative refresh in background
    const now = Date.now();
    const age = now - lastUpdated;

    // Only refresh critical data in background, and only on WiFi
    if (dataType !== 'critical' || !this.currentNetworkInfo.isWiFi) {
      return {
        shouldRefresh: false,
        interval: 0,
        priority: 'low',
        reason: 'Background refresh disabled for this data type/network',
      };
    }

    // Critical data on WiFi in background - very conservative
    const backgroundInterval = 30 * 60 * 1000; // 30 minutes
    const isStale = age > backgroundInterval;

    return {
      shouldRefresh: isStale,
      interval: backgroundInterval,
      priority: 'low',
      reason: isStale
        ? `Critical data is ${Math.round(age / 60000)} minutes old (background)`
        : 'Background data is fresh',
    };
  }

  private getPriority(
    dataType: 'critical' | 'important' | 'nice-to-have',
    age: number,
    interval: number,
  ): 'low' | 'medium' | 'high' {
    const staleness = age / interval;

    if (dataType === 'critical') {
      if (staleness > 2) return 'high';
      if (staleness > 1) return 'medium';
      return 'low';
    }

    if (dataType === 'important') {
      if (staleness > 3) return 'high';
      if (staleness > 1.5) return 'medium';
      return 'low';
    }

    // nice-to-have
    if (staleness > 5) return 'medium';
    return 'low';
  }

  // Get optimal batch size based on network conditions
  getBatchSize(defaultSize: number = 20): number {
    if (!this.currentNetworkInfo.isConnected) return 0;

    // Adjust batch size based on connection
    if (this.currentNetworkInfo.isWiFi) {
      return defaultSize; // Full batch on WiFi
    }

    if (this.currentNetworkInfo.isCellular) {
      const connectionType = this.currentNetworkInfo.effectiveConnectionType;

      if (connectionType === 'slow-2g' || connectionType === '2g') {
        return Math.max(1, Math.floor(defaultSize * 0.3)); // 30% on slow connections
      }

      if (connectionType === '3g') {
        return Math.max(1, Math.floor(defaultSize * 0.6)); // 60% on 3G
      }

      // 4G and better
      return Math.max(1, Math.floor(defaultSize * 0.8)); // 80% on good cellular
    }

    return Math.floor(defaultSize * 0.5); // 50% on unknown connections
  }

  // Check if we should preload data
  shouldPreload(dataType: 'critical' | 'important' | 'nice-to-have'): boolean {
    if (!this.currentNetworkInfo.isConnected || this.appState !== 'active') {
      return false;
    }

    // Only preload on WiFi for non-critical data
    if (dataType !== 'critical' && !this.currentNetworkInfo.isWiFi) {
      return false;
    }

    // Don't preload on slow connections
    const connectionType = this.currentNetworkInfo.effectiveConnectionType;
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      return false;
    }

    return true;
  }

  // Subscribe to network changes
  onNetworkChange(listener: (info: NetworkInfo) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current network info
  getCurrentNetworkInfo(): NetworkInfo {
    return { ...this.currentNetworkInfo };
  }

  // Check if current connection is suitable for heavy operations
  isSuitableForHeavyOperations(): boolean {
    return (
      this.currentNetworkInfo.isConnected &&
      this.currentNetworkInfo.isInternetReachable &&
      this.currentNetworkInfo.isWiFi &&
      this.appState === 'active'
    );
  }

  // Get recommended timeout for requests
  getRecommendedTimeout(): number {
    if (!this.currentNetworkInfo.isConnected) {
      return 5000; // 5 seconds for offline scenarios
    }

    const connectionType = this.currentNetworkInfo.effectiveConnectionType;

    if (connectionType === 'slow-2g') return 30000; // 30 seconds
    if (connectionType === '2g') return 20000; // 20 seconds
    if (connectionType === '3g') return 15000; // 15 seconds

    return 10000; // 10 seconds for 4G and better
  }

  // Cleanup method
  destroy(): void {
    this.cleanup();
    this.listeners = [];
  }
}

export const networkStrategyService = new NetworkStrategyService();
