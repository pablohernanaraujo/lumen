import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from 'axios';

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
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply?: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi?: {
    times: number;
    currency: string;
    percentage: number;
  };
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

    const response = await this.axiosInstance.get<CryptoCurrency[]>(
      '/coins/markets',
      {
        params: defaultParams,
      },
    );

    return response.data;
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

    const response = await this.axiosInstance.get<CryptoCurrencyDetail>(
      `/coins/${id}`,
      {
        params: defaultParams,
      },
    );

    return response.data;
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
    const response = await this.axiosInstance.get('/search', {
      params: { query },
    });

    return response.data;
  }

  async getPing(): Promise<{ gecko_says: string }> {
    const response = await this.axiosInstance.get<{ gecko_says: string }>(
      '/ping',
    );
    return response.data;
  }
}

export const apiService = new ApiService();
