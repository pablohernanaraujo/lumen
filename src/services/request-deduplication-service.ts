/* eslint-disable max-statements */
export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, unknown>;
  data?: unknown;
}

export interface PendingRequest<T = unknown> {
  promise: Promise<T>;
  timestamp: number;
  abortController: AbortController;
  requestCount: number;
}

export interface DeduplicationMetrics {
  totalRequests: number;
  deduplicatedRequests: number;
  savedRequests: number;
  activeRequests: number;
}

class RequestDeduplicationService {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute

  // Metrics tracking
  private totalRequests = 0;
  private deduplicatedRequests = 0;
  private savedRequests = 0;

  constructor() {
    this.startCleanupTimer();
  }

  private generateRequestKey(config: RequestConfig): string {
    const { url, method, params, data } = config;

    // Create a consistent key based on request characteristics
    const keyParts = [
      method,
      url,
      params ? JSON.stringify(this.sortObject(params)) : '',
      data ? JSON.stringify(this.sortObject(data)) : '',
    ];

    return keyParts.join('|');
  }

  private sortObject(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sortObject(item));
    }

    const sortedObj: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sortedObj[key] = this.sortObject((obj as Record<string, unknown>)[key]);
    }

    return sortedObj;
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredRequests();
    }, this.CLEANUP_INTERVAL);
  }

  private cleanupExpiredRequests(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, request] of this.pendingRequests) {
      if (now - request.timestamp > this.REQUEST_TIMEOUT) {
        // Abort expired request
        request.abortController.abort();
        expiredKeys.push(key);
      }
    }

    // Remove expired requests
    for (const key of expiredKeys) this.pendingRequests.delete(key);

    if (expiredKeys.length > 0) {
      console.log(
        `[RequestDeduplication] Cleaned up ${expiredKeys.length} expired requests`,
      );
    }
  }

  async deduplicate<T>(
    config: RequestConfig,
    requestExecutor: (abortSignal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    this.totalRequests++;

    const requestKey = this.generateRequestKey(config);
    const existingRequest = this.pendingRequests.get(requestKey);

    // If identical request is already in flight, return existing promise
    if (existingRequest) {
      this.deduplicatedRequests++;
      this.savedRequests++;

      existingRequest.requestCount++;

      console.log(
        `[RequestDeduplication] Deduplicating request: ${config.method} ${config.url} (count: ${existingRequest.requestCount})`,
      );

      try {
        return (await existingRequest.promise) as T;
      } catch (error) {
        // If the original request failed, remove it from pending
        this.pendingRequests.delete(requestKey);
        throw error;
      }
    }

    // Create new request with abort controller
    const abortController = new AbortController();
    const promise = requestExecutor(abortController.signal);

    const pendingRequest: PendingRequest<T> = {
      promise,
      timestamp: Date.now(),
      abortController,
      requestCount: 1,
    };

    // Store the pending request
    this.pendingRequests.set(requestKey, pendingRequest);

    console.log(
      `[RequestDeduplication] New request: ${config.method} ${config.url}`,
    );

    try {
      const result = await promise;

      // Remove from pending requests on success
      this.pendingRequests.delete(requestKey);

      return result;
    } catch (error) {
      // Remove from pending requests on failure
      this.pendingRequests.delete(requestKey);
      throw error;
    }
  }

  // Cancel all pending requests (useful for cleanup)
  cancelAllRequests(): void {
    console.log(
      `[RequestDeduplication] Cancelling ${this.pendingRequests.size} pending requests`,
    );

    for (const request of this.pendingRequests.values()) {
      request.abortController.abort();
    }

    this.pendingRequests.clear();
  }

  // Cancel specific request by config
  cancelRequest(config: RequestConfig): boolean {
    const requestKey = this.generateRequestKey(config);
    const request = this.pendingRequests.get(requestKey);

    if (request) {
      request.abortController.abort();
      this.pendingRequests.delete(requestKey);
      console.log(
        `[RequestDeduplication] Cancelled request: ${config.method} ${config.url}`,
      );
      return true;
    }

    return false;
  }

  // Check if a request is currently pending
  isPending(config: RequestConfig): boolean {
    const requestKey = this.generateRequestKey(config);
    return this.pendingRequests.has(requestKey);
  }

  // Get metrics
  getMetrics(): DeduplicationMetrics {
    return {
      totalRequests: this.totalRequests,
      deduplicatedRequests: this.deduplicatedRequests,
      savedRequests: this.savedRequests,
      activeRequests: this.pendingRequests.size,
    };
  }

  // Reset metrics (useful for testing)
  resetMetrics(): void {
    this.totalRequests = 0;
    this.deduplicatedRequests = 0;
    this.savedRequests = 0;
  }

  // Get detailed information about pending requests
  getPendingRequests(): Array<{
    key: string;
    timestamp: number;
    requestCount: number;
    age: number;
  }> {
    const now = Date.now();
    return Array.from(this.pendingRequests.entries()).map(([key, request]) => ({
      key,
      timestamp: request.timestamp,
      requestCount: request.requestCount,
      age: now - request.timestamp,
    }));
  }

  // Manual cleanup method
  cleanup(): void {
    this.cleanupExpiredRequests();
  }
}

export const requestDeduplicationService = new RequestDeduplicationService();
