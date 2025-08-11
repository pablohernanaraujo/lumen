/* eslint-disable max-params */
/**
 * Analytics Service for Scanner Feature
 *
 * Tracks scanner usage and interactions without collecting PII.
 * All events are anonymized and focused on application behavior.
 */

interface AnalyticsEvent {
  name: string;
  properties: Record<string, string | number | boolean>;
  timestamp: string;
}

interface ScannerAnalytics {
  // Scanner events
  scanner_opened: {
    source_screen: string;
    session_id: string;
  };
  qr_scanned_success: {
    blockchain_type: string;
    address_type?: string;
    scan_duration_ms: number;
    session_id: string;
    has_amount: boolean;
    has_label: boolean;
  };
  qr_scanned_error: {
    error_type: string;
    scan_duration_ms: number;
    session_id: string;
  };
  scanner_closed: {
    session_id: string;
    total_session_duration_ms: number;
    successful_scans: number;
    failed_scans: number;
  };

  // Storage events
  address_saved: {
    blockchain_type: string;
    source: string;
    is_duplicate: boolean;
    usage_count: number;
  };
  address_favorited: {
    blockchain_type: string;
    previous_usage_count: number;
    is_favoriting: boolean; // true for add, false for remove
  };
  address_labeled: {
    blockchain_type: string;
    label_length: number;
    is_editing: boolean; // true for edit, false for new
  };
  address_deleted: {
    blockchain_type: string;
    usage_count: number;
    was_favorite: boolean;
    had_label: boolean;
  };

  // History events
  history_opened: {
    source_screen: string;
    total_addresses: number;
    favorites_count: number;
  };
  history_searched: {
    query_length: number;
    results_count: number;
  };
  history_filtered: {
    filter_type: string; // 'network' | 'favorite' | 'date_range' | 'combined'
    results_count: number;
  };
  address_details_viewed: {
    blockchain_type: string;
    usage_count: number;
    has_label: boolean;
    is_favorite: boolean;
  };
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private maxStoredEvents = 1000;
  private isEnabled = true;
  private sessionId: string | null = null;
  private scannerSessionStartTime: number | null = null;
  private scannerSessionStats = {
    successfulScans: 0,
    failedScans: 0,
  };

  private constructor() {
    this.generateSessionId();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Enable or disable analytics tracking
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`[Analytics] Tracking ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Generate a new session ID for tracking related events
   */
  private generateSessionId(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Track an analytics event
   */
  public track<T extends keyof ScannerAnalytics>(
    eventName: T,
    properties: ScannerAnalytics[T],
  ): void {
    if (!this.isEnabled) {
      return;
    }

    try {
      const event: AnalyticsEvent = {
        name: eventName,
        properties: properties as Record<string, string | number | boolean>,
        timestamp: new Date().toISOString(),
      };

      this.events.push(event);

      // Keep only the most recent events
      if (this.events.length > this.maxStoredEvents) {
        this.events = this.events.slice(-this.maxStoredEvents);
      }

      console.log(`[Analytics] Tracked event: ${eventName}`, properties);

      // In a real implementation, you would send this to your analytics service
      // For now, we just log it for development purposes
      this.logEventForDevelopment(event);
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  }

  /**
   * Start a scanner session
   */
  public startScannerSession(sourceScreen: string): void {
    this.generateSessionId();
    this.scannerSessionStartTime = Date.now();
    this.scannerSessionStats = {
      successfulScans: 0,
      failedScans: 0,
    };

    this.track('scanner_opened', {
      source_screen: sourceScreen,
      session_id: this.sessionId!,
    });
  }

  /**
   * End a scanner session
   */
  public endScannerSession(): void {
    if (!this.sessionId || !this.scannerSessionStartTime) {
      return;
    }

    const sessionDuration = Date.now() - this.scannerSessionStartTime;

    this.track('scanner_closed', {
      session_id: this.sessionId,
      total_session_duration_ms: sessionDuration,
      successful_scans: this.scannerSessionStats.successfulScans,
      failed_scans: this.scannerSessionStats.failedScans,
    });

    this.sessionId = null;
    this.scannerSessionStartTime = null;
  }

  /**
   * Track a successful QR scan
   */
  public trackSuccessfulScan(
    blockchainType: string,
    scanStartTime: number,
    addressType?: string,
    hasAmount = false,
    hasLabel = false,
  ): void {
    if (!this.sessionId) {
      console.warn('[Analytics] No active scanner session for successful scan');
      return;
    }

    const scanDuration = Date.now() - scanStartTime;
    this.scannerSessionStats.successfulScans++;

    this.track('qr_scanned_success', {
      blockchain_type: blockchainType,
      address_type: addressType,
      scan_duration_ms: scanDuration,
      session_id: this.sessionId,
      has_amount: hasAmount,
      has_label: hasLabel,
    });
  }

  /**
   * Track a failed QR scan
   */
  public trackFailedScan(errorType: string, scanStartTime: number): void {
    if (!this.sessionId) {
      console.warn('[Analytics] No active scanner session for failed scan');
      return;
    }

    const scanDuration = Date.now() - scanStartTime;
    this.scannerSessionStats.failedScans++;

    this.track('qr_scanned_error', {
      error_type: errorType,
      scan_duration_ms: scanDuration,
      session_id: this.sessionId,
    });
  }

  /**
   * Get analytics summary for debugging
   */
  public getSummary(): {
    totalEvents: number;
    recentEvents: Array<{ name: string; timestamp: string }>;
    isEnabled: boolean;
    currentSession: string | null;
  } {
    return {
      totalEvents: this.events.length,
      recentEvents: this.events.slice(-10).map((event) => ({
        name: event.name,
        timestamp: event.timestamp,
      })),
      isEnabled: this.isEnabled,
      currentSession: this.sessionId,
    };
  }

  /**
   * Clear all stored events (useful for testing)
   */
  public clearEvents(): void {
    this.events = [];
    console.log('[Analytics] All events cleared');
  }

  /**
   * Export events for analysis (development/debugging)
   */
  public exportEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Development helper to log events in a readable format
   */
  private logEventForDevelopment(event: AnalyticsEvent): void {
    if (__DEV__) {
      const timestamp = new Date(event.timestamp).toLocaleTimeString();
      console.log(
        `🔍 [${timestamp}] ${event.name}:`,
        JSON.stringify(event.properties, null, 2),
      );
    }
  }

  /**
   * Batch export events for sending to analytics service
   * In a real implementation, this would handle network requests
   */
  public async flushEvents(): Promise<void> {
    if (this.events.length === 0) {
      return;
    }

    try {
      console.log(`[Analytics] Flushing ${this.events.length} events...`);

      // In a real implementation, you would:
      // 1. Send events to your analytics service
      // 2. Clear events after successful transmission
      // 3. Retry failed transmissions
      // 4. Handle offline scenarios

      // For now, we just simulate the process
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log('[Analytics] Events flushed successfully');
      // Don't clear events in development for debugging purposes
      // this.events = [];
    } catch (error) {
      console.error('[Analytics] Failed to flush events:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();

// Export types for use in components
export type { AnalyticsEvent, ScannerAnalytics };
