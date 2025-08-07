/* eslint-disable complexity */
/* eslint-disable max-statements */
export interface QueuedRequest<T = unknown> {
  id: string;
  config: RequestConfig;
  executor: () => Promise<T>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  retryCount: number;
  maxRetries: number;
  abortController: AbortController;
}

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, unknown>;
  data?: unknown;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  maxRetries?: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs?: number;
}

export interface QueueMetrics {
  queueSize: number;
  processingCount: number;
  completedRequests: number;
  failedRequests: number;
  rateLimitHits: number;
  averageWaitTime: number;
  throughput: number; // Requests per second
  // Extended diagnostics
  circuitBreakerState: 'closed' | 'open' | 'half-open';
  circuitBreakerFailures: number;
  currentRateLimit: number;
  requestsInLastMinute: number;
  isProcessingPaused: boolean;
  pauseTimeRemaining: number;
  preventiveRateLimitHits: number;
  consecutiveApiRateLimits: number;
}

class RequestQueueService {
  private queue: QueuedRequest[] = [];
  private processing = new Set<string>();
  private readonly maxConcurrent: number = 5;

  // Rate limiting (relaxed for better UX)
  private requestHistory: number[] = [];
  private searchRequestHistory: number[] = []; // Separate tracking for search requests
  private readonly rateLimitConfig: RateLimitConfig = {
    maxRequests: 15, // Increased from 8 to 15 (still below CoinGecko's 50/min limit)
    windowMs: 60 * 1000, // 1 minute window
    retryAfterMs: 3000, // Reduced from 5s to 3s delay on rate limit
  };

  // Separate rate limit for search requests (more generous)
  private readonly searchRateLimitConfig: RateLimitConfig = {
    maxRequests: 30, // More generous for searches
    windowMs: 60 * 1000, // 1 minute window
    retryAfterMs: 1000, // Only 1s delay for searches
  };

  // Burst protection (relaxed)
  private readonly burstConfig = {
    maxBurstRequests: 4, // Increased from 2 to 4 requests per burst window
    burstWindowMs: 10 * 1000, // 10 second burst window
  };

  private burstHistory: number[] = [];
  private lastRequestTime = 0;
  private lastSearchRequestTime = 0; // Separate tracking for searches
  private readonly MIN_REQUEST_SPACING = 1000; // Reduced from 2s to 1s between requests
  private readonly MIN_SEARCH_SPACING = 200; // Much shorter for searches (200ms)

  // Processing state to prevent infinite loops
  private isProcessingPaused = false;
  private pauseEndTime = 0;

  // Metrics
  private completedRequests = 0;
  private failedRequests = 0;
  private rateLimitHits = 0;
  private totalWaitTime = 0;
  private throughputStart = Date.now();

  // Priority queues
  private readonly priorityOrder: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  constructor() {
    this.startProcessing();
    this.startCleanup();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private isSearchRequest(config: RequestConfig): boolean {
    // Check if this is a search request by URL
    return config.url.includes('/search') || config.url.includes('search');
  }

  private isRateLimited(request?: QueuedRequest): boolean {
    const now = Date.now();
    const isSearch = request && this.isSearchRequest(request.config);

    // Different spacing for search vs regular requests
    if (isSearch) {
      // Search requests have their own spacing
      if (now - this.lastSearchRequestTime < this.MIN_SEARCH_SPACING) {
        return true;
      }

      // Check search-specific rate limit
      const searchWindowStart = now - this.searchRateLimitConfig.windowMs;
      this.searchRequestHistory = this.searchRequestHistory.filter(
        (time) => time > searchWindowStart,
      );

      return (
        this.searchRequestHistory.length >=
        this.searchRateLimitConfig.maxRequests
      );
    } else {
      // Regular requests
      // Check minimum request spacing
      if (now - this.lastRequestTime < this.MIN_REQUEST_SPACING) {
        return true;
      }

      // Check burst protection (not for searches)
      const burstWindowStart = now - this.burstConfig.burstWindowMs;
      this.burstHistory = this.burstHistory.filter(
        (time) => time > burstWindowStart,
      );

      if (this.burstHistory.length >= this.burstConfig.maxBurstRequests) {
        return true;
      }

      // Check regular rate limit
      const windowStart = now - this.rateLimitConfig.windowMs;
      this.requestHistory = this.requestHistory.filter(
        (time) => time > windowStart,
      );

      return this.requestHistory.length >= this.rateLimitConfig.maxRequests;
    }
  }

  private addToRequestHistory(isSearch: boolean = false): void {
    const now = Date.now();

    if (isSearch) {
      this.searchRequestHistory.push(now);
      this.lastSearchRequestTime = now;
    } else {
      this.requestHistory.push(now);
      this.burstHistory.push(now);
      this.lastRequestTime = now;
    }
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // First by priority (higher priority first)
      const priorityDiff =
        this.priorityOrder[b.priority] - this.priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by timestamp (older first)
      return a.timestamp - b.timestamp;
    });
  }

  private rateLimitBackoffMultiplier = 1;
  private consecutiveApiRateLimits = 0; // Only count actual 429 errors
  private preventiveRateLimitHits = 0; // Count preventive rate limit checks

  // Circuit breaker pattern
  private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
  private circuitBreakerFailures = 0;
  private circuitBreakerLastFailure = 0;
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5; // Increased from 3 to 5 consecutive rate limits
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute timeout
  private readonly CIRCUIT_BREAKER_RECOVERY_TIMEOUT = 120000; // Reduced from 5min to 2min recovery

  // Emergency reset thresholds
  private readonly MAX_CONSECUTIVE_PREVENTIVE_LIMITS = 10;
  private readonly EMERGENCY_RESET_DELAY = 30000; // 30 seconds

  private async processNext(): Promise<void> {
    if (this.queue.length === 0) return;
    if (this.processing.size >= this.maxConcurrent) return;

    // Check if processing is paused due to rate limiting
    const now = Date.now();
    if (this.isProcessingPaused && now < this.pauseEndTime) {
      return; // Still in pause period, don't process anything
    } else if (this.isProcessingPaused && now >= this.pauseEndTime) {
      // Pause period ended, resume processing
      this.resumeProcessing();
    }

    // Check circuit breaker
    if (this.isCircuitBreakerOpen()) {
      const nextRequest = this.queue[0];
      if (nextRequest) {
        console.warn(
          `[RequestQueue] Circuit breaker OPEN - Failing request ${nextRequest.id} immediately`,
        );
        this.queue.shift();
        nextRequest.reject(
          new Error(
            'Circuit breaker is open - API is experiencing rate limits',
          ),
        );
        this.failedRequests++;

        // Pause processing while circuit breaker is open
        this.pauseProcessing(5000, 'Circuit breaker is open');
      }
      return;
    }

    // Check the first request in queue to determine if it's a search
    const nextRequest = this.queue[0];
    if (this.isRateLimited(nextRequest)) {
      // Different handling for search requests
      if (nextRequest && this.isSearchRequest(nextRequest.config)) {
        // For searches, use shorter delay
        this.handlePreventiveRateLimit(true);
      } else {
        this.handlePreventiveRateLimit(false);
      }
      return;
    }

    // Reset preventive rate limit tracking on successful processing
    if (this.preventiveRateLimitHits > 0) {
      this.preventiveRateLimitHits = 0;
      console.log(
        '[RequestQueue] Preventive rate limiting cleared - resuming normal processing',
      );
    }

    this.sortQueue();
    const request = this.queue.shift();

    if (!request) return;

    this.processing.add(request.id);
    const isSearch = this.isSearchRequest(request.config);
    this.addToRequestHistory(isSearch);

    const startTime = Date.now();
    const waitTime = startTime - request.timestamp;
    this.totalWaitTime += waitTime;

    if (__DEV__) {
      console.log(
        `[RequestQueue] Processing request ${request.id} (${request.config.method} ${request.config.url}) - Priority: ${request.priority}, Wait time: ${waitTime}ms, Queue size: ${this.queue.length}`,
      );
    }

    try {
      const result = await request.executor();
      request.resolve(result);
      this.completedRequests++;

      // Update circuit breaker on success
      this.updateCircuitBreaker(true);
    } catch (error) {
      // Special handling for rate limit errors
      if (this.isRateLimitError(error)) {
        console.warn(
          `[RequestQueue] Rate limit error detected for request ${request.id}, increasing backoff`,
        );
        this.handleRateLimitError();

        // Retry the request after rate limit handling
        if (request.retryCount < request.maxRetries) {
          await this.retryRequest(request, error);
        } else {
          request.reject(new Error('Rate limited: Maximum retries exceeded'));
          this.failedRequests++;
        }
      } else if (this.shouldRetry(request, error)) {
        await this.retryRequest(request, error);
      } else {
        request.reject(error);
        this.failedRequests++;
      }
    } finally {
      this.processing.delete(request.id);
      // Add small delay to prevent request spam
      setTimeout(() => this.processNext(), 100);
    }
  }

  private isRateLimitError(error: unknown): boolean {
    if (error && typeof error === 'object') {
      const axiosError = error as {
        response?: { status?: number; data?: { error_code?: number } };
        message?: string;
      };

      // Check for 429 status code
      if (axiosError.response?.status === 429) {
        return true;
      }

      // Check for CoinGecko specific error codes
      if (axiosError.response?.data?.error_code === 419) {
        return true;
      }

      // Check error message for rate limit indicators
      const message = axiosError.message?.toLowerCase() || '';
      if (
        message.includes('rate limit') ||
        message.includes('too many requests') ||
        message.includes('exceeded')
      ) {
        return true;
      }
    }

    return false;
  }

  private isCircuitBreakerOpen(): boolean {
    const now = Date.now();

    switch (this.circuitBreakerState) {
      case 'open':
        // Try to transition to half-open after timeout
        if (
          now - this.circuitBreakerLastFailure >
          this.CIRCUIT_BREAKER_RECOVERY_TIMEOUT
        ) {
          this.circuitBreakerState = 'half-open';
          console.log(
            '[RequestQueue] Circuit breaker transitioning to HALF-OPEN',
          );
          return false;
        }
        return true;

      case 'half-open':
        // Allow limited requests to test recovery
        return false;

      case 'closed':
      default:
        return false;
    }
  }

  private updateCircuitBreaker(success: boolean): void {
    const now = Date.now();

    if (success) {
      // Reset on success
      if (this.circuitBreakerState === 'half-open') {
        this.circuitBreakerState = 'closed';
        this.circuitBreakerFailures = 0;
        console.log('[RequestQueue] Circuit breaker CLOSED - API recovered');
      }
    } else {
      // Increment failures
      this.circuitBreakerFailures++;
      this.circuitBreakerLastFailure = now;

      if (this.circuitBreakerFailures >= this.CIRCUIT_BREAKER_THRESHOLD) {
        this.circuitBreakerState = 'open';
        console.error(
          `[RequestQueue] Circuit breaker OPEN - ${this.circuitBreakerFailures} consecutive rate limit failures. Will retry in ${this.CIRCUIT_BREAKER_RECOVERY_TIMEOUT / 1000}s`,
        );
      }
    }
  }

  private handlePreventiveRateLimit(isSearch: boolean = false): void {
    this.preventiveRateLimitHits++;

    // Check for emergency reset if we have too many consecutive preventive hits
    if (
      this.preventiveRateLimitHits >= this.MAX_CONSECUTIVE_PREVENTIVE_LIMITS
    ) {
      this.emergencyReset();
      return;
    }

    // Use different delays for search vs regular requests
    const config = isSearch ? this.searchRateLimitConfig : this.rateLimitConfig;
    const retryAfterMs = config.retryAfterMs ?? (isSearch ? 1000 : 5000);
    const backoffDelay = Math.min(
      retryAfterMs * (this.preventiveRateLimitHits * 0.5),
      isSearch ? 2000 : 10000, // Max 2s for searches, 10s for others
    );

    if (__DEV__) {
      const history = isSearch
        ? this.searchRequestHistory
        : this.requestHistory;
      const maxReqs = isSearch
        ? this.searchRateLimitConfig.maxRequests
        : this.rateLimitConfig.maxRequests;
      console.warn(
        `[RequestQueue] ${isSearch ? 'Search' : 'Regular'} preventive rate limit (${this.preventiveRateLimitHits} hits), pausing for ${backoffDelay}ms. Requests in window: ${history.length}/${maxReqs}`,
      );
    }

    // Pause processing instead of scheduling individual timeouts
    this.pauseProcessing(
      backoffDelay,
      `${isSearch ? 'Search' : 'Regular'} preventive rate limiting - ${this.preventiveRateLimitHits} hits`,
    );
    this.rateLimitHits++;
  }

  private handleRateLimitError(): void {
    // Update circuit breaker
    this.updateCircuitBreaker(false);

    // Count actual API rate limit errors separately
    this.consecutiveApiRateLimits++;

    // Dramatically reduce rate limits when hit
    this.rateLimitConfig.maxRequests = Math.max(
      2,
      Math.floor(this.rateLimitConfig.maxRequests * 0.5),
    );
    this.burstConfig.maxBurstRequests = 1;

    console.warn(
      `[RequestQueue] API Rate limit hit! Reducing limits - New rate: ${this.rateLimitConfig.maxRequests}/min, Burst: ${this.burstConfig.maxBurstRequests}, Consecutive API limits: ${this.consecutiveApiRateLimits}`,
    );

    // Clear history to reset counters
    this.requestHistory = [];
    this.burstHistory = [];

    // Pause processing for API rate limit recovery
    const apiBackoffDelay = Math.min(
      10000 * Math.pow(1.5, this.consecutiveApiRateLimits),
      60000,
    );
    this.pauseProcessing(
      apiBackoffDelay,
      `API rate limit recovery - ${this.consecutiveApiRateLimits} consecutive`,
    );
  }

  private pauseProcessing(delayMs: number, reason: string): void {
    this.isProcessingPaused = true;
    this.pauseEndTime = Date.now() + delayMs;

    console.log(
      `[RequestQueue] Processing PAUSED for ${delayMs}ms - Reason: ${reason}`,
    );
  }

  private resumeProcessing(): void {
    this.isProcessingPaused = false;
    this.pauseEndTime = 0;

    console.log('[RequestQueue] Processing RESUMED');
  }

  private emergencyReset(): void {
    console.error(
      `[RequestQueue] EMERGENCY RESET - ${this.preventiveRateLimitHits} consecutive preventive rate limits. Clearing all counters and pausing for ${this.EMERGENCY_RESET_DELAY}ms`,
    );

    // Reset all counters
    this.preventiveRateLimitHits = 0;
    this.consecutiveApiRateLimits = 0;
    this.rateLimitBackoffMultiplier = 1;
    this.requestHistory = [];
    this.burstHistory = [];
    this.rateLimitHits = 0;

    // Reset rate limits to original values
    this.rateLimitConfig.maxRequests = 15; // Updated to match new relaxed config
    this.burstConfig.maxBurstRequests = 4; // Updated to match new relaxed config

    // Pause for emergency reset period
    this.pauseProcessing(
      this.EMERGENCY_RESET_DELAY,
      'Emergency reset - too many consecutive preventive rate limits',
    );
  }

  private shouldRetry(request: QueuedRequest, error: unknown): boolean {
    if (request.retryCount >= request.maxRetries) return false;

    // Always retry rate limit errors with longer delays
    if (this.isRateLimitError(error)) {
      return true;
    }

    // Retry on network errors, timeouts, and 5xx status codes
    if (error && typeof error === 'object') {
      const axiosError = error as {
        response?: { status?: number };
        code?: string;
        name?: string;
      };

      // Don't retry on 4xx client errors (except 429 rate limit)
      if (axiosError.response?.status) {
        const status = axiosError.response.status;
        if (status >= 400 && status < 500 && status !== 429) {
          return false;
        }
      }

      // Retry on specific error types
      if (
        axiosError.code === 'ECONNABORTED' || // Timeout
        axiosError.name === 'NetworkError' ||
        axiosError.name === 'TimeoutError' ||
        (axiosError.response?.status && axiosError.response.status >= 500)
      ) {
        return true;
      }
    }

    return false;
  }

  private async retryRequest(
    request: QueuedRequest,
    lastError: unknown,
  ): Promise<void> {
    request.retryCount++;

    const baseDelay = this.isRateLimitError(lastError)
      ? Math.min(10000 * Math.pow(2, request.retryCount), 120000) // 10s to 2min
      : Math.min(1000 * Math.pow(2, request.retryCount), 30000); // Normal exponential backoff

    const jitter = Math.random() * 2000; // Increased jitter
    const delay = baseDelay + jitter;

    console.log(
      `[RequestQueue] Retrying request ${request.id} in ${Math.round(
        delay / 1000,
      )}s (attempt ${request.retryCount}/${request.maxRetries}) - ${
        this.isRateLimitError(lastError) ? 'Rate Limited' : 'Network Error'
      }`,
    );

    setTimeout(() => {
      // Decrease priority for retried requests, especially rate limited ones
      if (this.isRateLimitError(lastError)) {
        request.priority = 'low'; // Rate limited requests get lowest priority
      } else if (request.priority === 'high') {
        request.priority = 'medium';
      } else if (request.priority === 'medium') {
        request.priority = 'low';
      }

      // Re-add to queue
      this.queue.push(request);
    }, delay);
  }

  private startProcessing(): void {
    const processLoop = async (): Promise<void> => {
      while (true) {
        // Check if processing is paused before trying to process
        if (
          !this.isProcessingPaused &&
          this.queue.length > 0 &&
          this.processing.size < this.maxConcurrent
        ) {
          await this.processNext();
        }

        // Use longer delay when paused to reduce CPU usage
        const delayMs = this.isProcessingPaused ? 1000 : 50;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    };

    processLoop().catch((error) => {
      console.error('[RequestQueue] Processing loop error:', error);
      // Restart processing loop after delay
      setTimeout(() => this.startProcessing(), 5000);
    });
  }

  private startCleanup(): void {
    setInterval(() => {
      // Remove aborted requests
      const now = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes

      this.queue = this.queue.filter((request) => {
        const isExpired = now - request.timestamp > timeout;
        if (isExpired) {
          request.abortController.abort();
          request.reject(new Error('Request timeout'));
          return false;
        }
        return true;
      });

      // Clean old request history
      const windowStart = now - this.rateLimitConfig.windowMs;
      this.requestHistory = this.requestHistory.filter(
        (time) => time > windowStart,
      );
    }, 60000); // Cleanup every minute
  }

  async enqueue<T>(
    config: RequestConfig,
    executor: () => Promise<T>,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: this.generateRequestId(),
        config,
        executor,
        priority: config.priority ?? 'medium',
        timestamp: Date.now(),
        resolve,
        reject,
        retryCount: 0,
        maxRetries: config.maxRetries ?? 2,
        abortController: new AbortController(),
      };

      this.queue.push(request as QueuedRequest<unknown>);

      console.log(
        `[RequestQueue] Enqueued request ${request.id} (${config.method} ${config.url}) - Priority: ${request.priority}, Queue size: ${this.queue.length}`,
      );
    });
  }

  // Cancel all requests
  cancelAll(): void {
    console.log(
      `[RequestQueue] Cancelling ${this.queue.length} queued requests`,
    );

    for (const request of this.queue) {
      request.abortController.abort();
      request.reject(new Error('Request cancelled'));
    }

    this.queue = [];
  }

  // Cancel requests by URL pattern
  cancel(urlPattern: string): number {
    let cancelledCount = 0;

    this.queue = this.queue.filter((request) => {
      if (request.config.url.includes(urlPattern)) {
        request.abortController.abort();
        request.reject(new Error('Request cancelled'));
        cancelledCount++;
        return false;
      }
      return true;
    });

    console.log(
      `[RequestQueue] Cancelled ${cancelledCount} requests matching pattern: ${urlPattern}`,
    );
    return cancelledCount;
  }

  // Update rate limit configuration
  updateRateLimit(config: Partial<RateLimitConfig>): void {
    Object.assign(this.rateLimitConfig, config);
    console.log(
      '[RequestQueue] Rate limit config updated:',
      this.rateLimitConfig,
    );
  }

  // Get current metrics
  getMetrics(): QueueMetrics {
    const now = Date.now();
    const elapsedSeconds = (now - this.throughputStart) / 1000;
    const throughput =
      elapsedSeconds > 0 ? this.completedRequests / elapsedSeconds : 0;
    const averageWaitTime =
      this.completedRequests > 0
        ? this.totalWaitTime / this.completedRequests
        : 0;

    return {
      queueSize: this.queue.length,
      processingCount: this.processing.size,
      completedRequests: this.completedRequests,
      failedRequests: this.failedRequests,
      rateLimitHits: this.rateLimitHits,
      averageWaitTime,
      throughput,
      // Additional debugging info
      circuitBreakerState: this.circuitBreakerState,
      circuitBreakerFailures: this.circuitBreakerFailures,
      currentRateLimit: this.rateLimitConfig.maxRequests,
      requestsInLastMinute: this.requestHistory.length,
      // New tracking info
      isProcessingPaused: this.isProcessingPaused,
      pauseTimeRemaining: Math.max(0, this.pauseEndTime - now),
      preventiveRateLimitHits: this.preventiveRateLimitHits,
      consecutiveApiRateLimits: this.consecutiveApiRateLimits,
    };
  }

  // Reset metrics
  resetMetrics(): void {
    this.completedRequests = 0;
    this.failedRequests = 0;
    this.rateLimitHits = 0;
    this.totalWaitTime = 0;
    this.throughputStart = Date.now();
  }

  // Get queue status
  getQueueStatus(): Array<{
    id: string;
    url: string;
    method: string;
    priority: string;
    waitTime: number;
    retryCount: number;
  }> {
    const now = Date.now();
    return this.queue.map((request) => ({
      id: request.id,
      url: request.config.url,
      method: request.config.method,
      priority: request.priority,
      waitTime: now - request.timestamp,
      retryCount: request.retryCount,
    }));
  }
}

export const requestQueueService = new RequestQueueService();
