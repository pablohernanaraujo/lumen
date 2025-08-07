/* eslint-disable max-statements */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from 'axios';

import { metricsTracker } from '../hooks/api/use-api-metrics';
import { apiCacheService } from './api-cache-service';
import { requestDeduplicationService } from './request-deduplication-service';
import { requestQueueService } from './request-queue-service';

export const API_CONFIG = {
  BASE_URL: 'https://api.coingecko.com/api/v3',
  TIMEOUT: 10000,
} as const;

export interface CoinGeckoError {
  error: string;
  error_code?: number;
}

export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number;
  fully_diluted_valuation?: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_24h: number | null;
  market_cap_change_percentage_24h: number | null;
  circulating_supply: number | null;
  total_supply?: number | null;
  max_supply?: number | null;
  ath: number | null;
  ath_change_percentage: number | null;
  ath_date: string;
  atl: number | null;
  atl_change_percentage: number | null;
  atl_date: string;
  roi?: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
}

export interface CryptoCurrencyDetail extends CryptoCurrency {
  description?: {
    en: string;
  };
  links?: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: {
      github: string[];
      bitbucket: string[];
    };
  };
  market_data?: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    total_volume: Record<string, number>;
  };
}

export interface CoinsMarketsParams {
  vs_currency?: string;
  ids?: string;
  category?: string;
  order?:
    | 'market_cap_desc'
    | 'market_cap_asc'
    | 'volume_desc'
    | 'volume_asc'
    | 'id_asc'
    | 'id_desc';
  per_page?: number;
  page?: number;
  sparkline?: boolean;
  price_change_percentage?: string;
}

class ApiService {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private async executeWithOptimizations<T>(
    requestConfig: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      params?: Record<string, unknown>;
      data?: unknown;
      priority?: 'low' | 'medium' | 'high' | 'critical';
    },
    cacheKey?: string,
    cacheOptions?: {
      ttl?: number;
      priority?: 'low' | 'medium' | 'high';
      persistToDisk?: boolean;
    },
  ): Promise<T> {
    const startTime = Date.now();
    let fromCache = false;

    try {
      // Try cache first for GET requests
      if (requestConfig.method === 'GET' && cacheKey) {
        const cached = await apiCacheService.get<T>(
          cacheKey,
          requestConfig.params,
        );
        if (cached) {
          fromCache = true;
          metricsTracker.addPerformanceEntry(
            requestConfig.url,
            Date.now() - startTime,
            true,
          );
          return cached;
        }
      }

      // Use request deduplication and queue for all requests
      const result = await requestDeduplicationService.deduplicate<T>(
        requestConfig,
        async (abortSignal) =>
          requestQueueService.enqueue<T>(
            {
              ...requestConfig,
              maxRetries: 3,
            },
            async () => {
              const response = await this.axiosInstance.request<T>({
                url: requestConfig.url,
                method: requestConfig.method,
                params: requestConfig.params,
                data: requestConfig.data,
                signal: abortSignal,
              });
              return response.data;
            },
          ),
      );

      // Cache successful GET responses
      if (requestConfig.method === 'GET' && cacheKey && !fromCache) {
        await apiCacheService.set(
          cacheKey,
          result,
          requestConfig.params,
          cacheOptions,
        );
      }

      // Track performance
      metricsTracker.addPerformanceEntry(
        requestConfig.url,
        Date.now() - startTime,
        true,
      );

      return result;
    } catch (error) {
      // Track failed requests
      metricsTracker.addPerformanceEntry(
        requestConfig.url,
        Date.now() - startTime,
        false,
      );

      throw error;
    }
  }

  private setupInterceptors(): void {
    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        );
        console.log('[API Request Config]', {
          params: config.params,
          headers: config.headers,
        });
        return config;
      },
      (error: AxiosError) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor for logging and error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log(
            `[API Response] ${response.status} ${response.config.url}`,
          );
        }
        return response;
      },
      (error: AxiosError<CoinGeckoError>) => this.handleResponseError(error),
    );
  }

  private handleResponseError(
    error: AxiosError<CoinGeckoError>,
  ): Promise<never> {
    this.logResponseError(error);

    if (error.response?.data?.error) {
      return this.handleApiError(error.response.data.error);
    }

    if (!error.response) {
      return this.handleNetworkError();
    }

    if (error.code === 'ECONNABORTED') {
      return this.handleTimeoutError();
    }

    if (error.response.status === 429) {
      return this.handleRateLimitError();
    }

    return Promise.reject(error);
  }

  private logResponseError(error: AxiosError<CoinGeckoError>): void {
    if (__DEV__) {
      console.error(
        `[API Response Error] ${error.response?.status} ${error.config?.url}`,
        error.response?.data,
      );
    }
  }

  private handleApiError(errorMessage: string): Promise<never> {
    const enhancedError = new Error(errorMessage);
    enhancedError.name = 'CoinGeckoAPIError';
    return Promise.reject(enhancedError);
  }

  private handleNetworkError(): Promise<never> {
    const networkError = new Error(
      'Network error - please check your internet connection',
    );
    networkError.name = 'NetworkError';
    return Promise.reject(networkError);
  }

  private handleTimeoutError(): Promise<never> {
    const timeoutError = new Error('Request timeout - please try again');
    timeoutError.name = 'TimeoutError';
    return Promise.reject(timeoutError);
  }

  private handleRateLimitError(): Promise<never> {
    const rateLimitError = new Error(
      'Too many requests - please wait and try again',
    );
    rateLimitError.name = 'RateLimitError';
    return Promise.reject(rateLimitError);
  }

  async getCoinsMarkets(
    params: CoinsMarketsParams = {},
  ): Promise<CryptoCurrency[]> {
    const defaultParams: CoinsMarketsParams = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
      ...params,
    };

    return this.executeWithOptimizations<CryptoCurrency[]>(
      {
        url: '/coins/markets',
        method: 'GET',
        params: defaultParams as Record<string, unknown>,
        priority: 'high', // Market data is high priority
      },
      'crypto-list',
      {
        ttl: 2 * 60 * 1000, // 2 minutes for market data
        priority: 'high',
        persistToDisk: true, // Persist market data
      },
    );
  }

  async getCoinById(
    id: string,
    params: {
      localization?: boolean;
      tickers?: boolean;
      market_data?: boolean;
      community_data?: boolean;
      developer_data?: boolean;
      sparkline?: boolean;
    } = {},
  ): Promise<CryptoCurrencyDetail> {
    const defaultParams = {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: false,
      ...params,
    };

    return this.executeWithOptimizations<CryptoCurrencyDetail>(
      {
        url: `/coins/${id}`,
        method: 'GET',
        params: defaultParams as Record<string, unknown>,
        priority: 'medium', // Detail data is medium priority
      },
      'crypto-detail',
      {
        ttl: 5 * 60 * 1000, // 5 minutes for detailed data
        priority: 'medium',
        persistToDisk: true,
      },
    );
  }

  async searchCoins(query: string): Promise<{
    coins: Array<{
      id: string;
      name: string;
      symbol: string;
      market_cap_rank: number;
      thumb: string;
      large: string;
    }>;
  }> {
    return this.executeWithOptimizations<{
      coins: Array<{
        id: string;
        name: string;
        symbol: string;
        market_cap_rank: number;
        thumb: string;
        large: string;
      }>;
    }>(
      {
        url: '/search',
        method: 'GET',
        params: { query } as Record<string, unknown>,
        priority: 'high', // Changed to high priority for better UX
      },
      `crypto-search-${query}`, // Unique cache key per query
      {
        ttl: 30 * 60 * 1000, // Increased to 30 minutes for search results
        priority: 'high', // High priority cache for searches
        persistToDisk: true,
      },
    );
  }

  async getPing(): Promise<{ gecko_says: string }> {
    // Ping doesn't need caching, deduplication, or queue optimization
    const response = await this.axiosInstance.get<{ gecko_says: string }>(
      '/ping',
    );
    return response.data;
  }

  // Cache management methods
  async invalidateCache(pattern?: string): Promise<void> {
    await (pattern
      ? apiCacheService.invalidatePattern(pattern)
      : apiCacheService.clear());
  }

  // Preload critical data
  async preloadCriticalData(): Promise<void> {
    try {
      // Preload top 50 cryptocurrencies
      await apiCacheService.warmCache(
        'crypto-list',
        () =>
          this.getCoinsMarkets({
            per_page: 50,
            page: 1,
          }),
        {
          per_page: 50,
          page: 1,
        },
        {
          priority: 'high',
          persistToDisk: true,
        },
      );

      console.log('[API] Critical data preloaded successfully');
    } catch (error) {
      console.warn('[API] Failed to preload critical data:', error);
    }
  }

  // Batch request method for efficiency
  async batchRequest<T>(
    requests: Array<{
      key: string;
      requestConfig: {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        params?: Record<string, unknown>;
        data?: unknown;
        priority?: 'low' | 'medium' | 'high' | 'critical';
      };
      cacheKey?: string;
      cacheOptions?: {
        ttl?: number;
        priority?: 'low' | 'medium' | 'high';
        persistToDisk?: boolean;
      };
    }>,
  ): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};

    await Promise.allSettled(
      requests.map(async ({ key, requestConfig, cacheKey, cacheOptions }) => {
        try {
          results[key] = await this.executeWithOptimizations<T>(
            requestConfig,
            cacheKey,
            cacheOptions,
          );
        } catch (error) {
          console.warn(`[API] Batch request failed for ${key}:`, error);
          results[key] = null;
        }
      }),
    );

    return results;
  }
}

export const apiService = new ApiService();

// Disable automatic preloading to prevent rate limits
// Preloading will only happen on user-initiated actions
//
// To manually preload: apiService.preloadCriticalData(true)
console.log('[API] Automatic preloading disabled to prevent rate limits');
