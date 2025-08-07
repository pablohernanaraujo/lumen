/* eslint-disable max-statements */
import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { apiCacheService } from '../../services/api-cache-service';
import { requestDeduplicationService } from '../../services/request-deduplication-service';
import { requestQueueService } from '../../services/request-queue-service';

export interface ApiMetrics {
  cache: {
    hitRate: number;
    missRate: number;
    totalRequests: number;
    cacheSize: number;
    memoryUsage: number;
  };
  deduplication: {
    totalRequests: number;
    deduplicatedRequests: number;
    savedRequests: number;
    activeRequests: number;
    deduplicationRate: number;
  };
  queue: {
    queueSize: number;
    processingCount: number;
    completedRequests: number;
    failedRequests: number;
    rateLimitHits: number;
    averageWaitTime: number;
    throughput: number;
  };
  performance: {
    requestsPerMinute: number;
    errorRate: number;
    averageResponseTime: number;
    rateLimitUtilization: number;
  };
}

export interface UseApiMetricsOptions {
  updateInterval?: number; // Update interval in milliseconds
  trackPerformance?: boolean;
  autoReset?: boolean; // Reset metrics periodically
  resetInterval?: number; // Reset interval in milliseconds
}

export interface ApiMetricsResult {
  metrics: ApiMetrics;
  isTracking: boolean;
  reset: () => void;
  exportMetrics: () => string;
  getOptimizationSuggestions: () => string[];
}

class ApiMetricsTracker {
  private performanceData: Array<{
    timestamp: number;
    duration: number;
    success: boolean;
    endpoint: string;
  }> = [];

  private readonly MAX_PERFORMANCE_ENTRIES = 1000;

  addPerformanceEntry(
    endpoint: string,
    duration: number,
    success: boolean,
  ): void {
    this.performanceData.push({
      timestamp: Date.now(),
      duration,
      success,
      endpoint,
    });

    // Keep only recent entries
    if (this.performanceData.length > this.MAX_PERFORMANCE_ENTRIES) {
      this.performanceData = this.performanceData.slice(
        -this.MAX_PERFORMANCE_ENTRIES,
      );
    }
  }

  getPerformanceMetrics(): {
    requestsPerMinute: number;
    errorRate: number;
    averageResponseTime: number;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    const recentEntries = this.performanceData.filter(
      (entry) => entry.timestamp > oneMinuteAgo,
    );

    if (recentEntries.length === 0) {
      return {
        requestsPerMinute: 0,
        errorRate: 0,
        averageResponseTime: 0,
      };
    }

    const requestsPerMinute = recentEntries.length;
    const errorCount = recentEntries.filter((entry) => !entry.success).length;
    const errorRate = errorCount / recentEntries.length;
    const averageResponseTime =
      recentEntries.reduce((sum, entry) => sum + entry.duration, 0) /
      recentEntries.length;

    return {
      requestsPerMinute,
      errorRate,
      averageResponseTime,
    };
  }

  reset(): void {
    this.performanceData = [];
  }

  getEndpointStats(): Record<
    string,
    {
      count: number;
      averageTime: number;
      errorRate: number;
    }
  > {
    const endpointMap = new Map<
      string,
      {
        count: number;
        totalTime: number;
        errors: number;
      }
    >();

    for (const entry of this.performanceData) {
      const existing = endpointMap.get(entry.endpoint) || {
        count: 0,
        totalTime: 0,
        errors: 0,
      };

      existing.count++;
      existing.totalTime += entry.duration;
      if (!entry.success) existing.errors++;

      endpointMap.set(entry.endpoint, existing);
    }

    const result: Record<
      string,
      {
        count: number;
        averageTime: number;
        errorRate: number;
      }
    > = {};

    for (const [endpoint, stats] of endpointMap.entries()) {
      result[endpoint] = {
        count: stats.count,
        averageTime: stats.totalTime / stats.count,
        errorRate: stats.errors / stats.count,
      };
    }

    return result;
  }
}

const metricsTracker = new ApiMetricsTracker();

export const useApiMetrics = (
  options: UseApiMetricsOptions = {},
): ApiMetricsResult => {
  const {
    updateInterval = 5000, // 5 seconds
    autoReset = false,
    resetInterval = 3600000, // 1 hour
  } = options;

  const [metrics, setMetrics] = useState<ApiMetrics>({
    cache: {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      cacheSize: 0,
      memoryUsage: 0,
    },
    deduplication: {
      totalRequests: 0,
      deduplicatedRequests: 0,
      savedRequests: 0,
      activeRequests: 0,
      deduplicationRate: 0,
    },
    queue: {
      queueSize: 0,
      processingCount: 0,
      completedRequests: 0,
      failedRequests: 0,
      rateLimitHits: 0,
      averageWaitTime: 0,
      throughput: 0,
    },
    performance: {
      requestsPerMinute: 0,
      errorRate: 0,
      averageResponseTime: 0,
      rateLimitUtilization: 0,
    },
  });

  const [isTracking, setIsTracking] = useState(true);

  const collectMetrics = (): void => {
    const cacheMetrics = apiCacheService.getMetrics();
    const deduplicationMetrics = requestDeduplicationService.getMetrics();
    const queueMetrics = requestQueueService.getMetrics();
    const performanceMetrics = metricsTracker.getPerformanceMetrics();

    // Calculate derived metrics
    const deduplicationRate =
      deduplicationMetrics.totalRequests > 0
        ? deduplicationMetrics.deduplicatedRequests /
          deduplicationMetrics.totalRequests
        : 0;

    const rateLimitUtilization = performanceMetrics.requestsPerMinute / 50; // Assuming 50 req/min limit

    setMetrics({
      cache: cacheMetrics,
      deduplication: {
        ...deduplicationMetrics,
        deduplicationRate,
      },
      queue: queueMetrics,
      performance: {
        ...performanceMetrics,
        rateLimitUtilization: Math.min(rateLimitUtilization, 1),
      },
    });
  };

  const reset = (): void => {
    metricsTracker.reset();
    requestDeduplicationService.resetMetrics();
    requestQueueService.resetMetrics();
    // Note: Cache service doesn't have reset as it would clear valuable data
  };

  const exportMetrics = (): string => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      endpointStats: metricsTracker.getEndpointStats(),
      queueStatus: requestQueueService.getQueueStatus(),
      pendingRequests: requestDeduplicationService.getPendingRequests(),
    };

    return JSON.stringify(exportData, null, 2);
  };

  const getOptimizationSuggestions = (): string[] => {
    const suggestions: string[] = [];

    // Cache optimization suggestions
    if (metrics.cache.hitRate < 0.6) {
      suggestions.push(
        'Cache hit rate is below 60%. Consider increasing cache TTL for stable data.',
      );
    }

    if (metrics.cache.memoryUsage > 10 * 1024 * 1024) {
      // 10MB
      suggestions.push(
        'Memory cache is using significant memory. Consider reducing cache size or implementing LRU eviction.',
      );
    }

    // Deduplication suggestions
    if (metrics.deduplication.deduplicationRate > 0.3) {
      suggestions.push(
        'High request deduplication rate detected. Review if components are making redundant API calls.',
      );
    }

    // Queue suggestions
    if (metrics.queue.averageWaitTime > 2000) {
      suggestions.push(
        'High average wait time in queue. Consider increasing concurrent request limit or optimizing slow endpoints.',
      );
    }

    if (metrics.queue.rateLimitHits > 10) {
      suggestions.push(
        'Frequent rate limit hits detected. Consider implementing more aggressive request throttling.',
      );
    }

    // Performance suggestions
    if (metrics.performance.errorRate > 0.05) {
      suggestions.push(
        'Error rate is above 5%. Review failing endpoints and implement better error handling.',
      );
    }

    if (metrics.performance.rateLimitUtilization > 0.8) {
      suggestions.push(
        'Rate limit utilization is above 80%. Consider caching more aggressively or reducing request frequency.',
      );
    }

    if (metrics.performance.averageResponseTime > 5000) {
      suggestions.push(
        'Average response time is above 5 seconds. Review slow endpoints and consider pagination or data reduction.',
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        'API usage looks optimized! All metrics are within acceptable ranges.',
      );
    }

    return suggestions;
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let resetIntervalId: NodeJS.Timeout;

    if (isTracking) {
      // Initial collection
      collectMetrics();

      // Set up periodic collection
      intervalId = setInterval(collectMetrics, updateInterval);

      // Set up auto reset if enabled
      if (autoReset) {
        resetIntervalId = setInterval(reset, resetInterval);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (resetIntervalId) clearInterval(resetIntervalId);
    };
  }, [isTracking, updateInterval, autoReset, resetInterval]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus): void => {
      if (nextAppState === 'background') {
        setIsTracking(false);
      } else if (nextAppState === 'active') {
        setIsTracking(true);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    metrics,
    isTracking,
    reset,
    exportMetrics,
    getOptimizationSuggestions,
  };
};

// Export the tracker for external use
export { metricsTracker };
