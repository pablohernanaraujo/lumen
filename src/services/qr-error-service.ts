import {
  QR_ERROR_CONFIGS,
  type QrErrorContext,
  type QrErrorDetails,
  QrErrorSeverity,
  QrErrorType,
} from '../types/qr-error-types';

export interface ErrorLog {
  id: string;
  type: QrErrorType;
  severity: QrErrorSeverity;
  timestamp: Date;
  context: QrErrorContext;
  resolved: boolean;
}

export interface QrErrorMetrics {
  totalErrors: number;
  errorsByType: Record<QrErrorType, number>;
  averageScanDuration: number;
  successRate: number;
  lastError?: ErrorLog;
}

class QrErrorService {
  private errorLogs: ErrorLog[] = [];
  private successCount: number = 0;
  private totalScans: number = 0;
  private scanDurations: number[] = [];
  private maxLogsRetained: number = 100;

  /**
   * Log an error with context for analytics
   */
  logError(
    errorType: QrErrorType,
    context: Partial<QrErrorContext> = {},
  ): ErrorLog {
    const errorConfig = QR_ERROR_CONFIGS[errorType];
    const errorLog: ErrorLog = {
      id: this.generateErrorId(),
      type: errorType,
      severity: errorConfig.severity,
      timestamp: new Date(),
      context: {
        ...context,
        timestamp: context.timestamp || new Date(),
      },
      resolved: false,
    };

    this.errorLogs.push(errorLog);
    this.totalScans++;

    // Track scan duration if provided
    if (context.scanDuration) {
      this.scanDurations.push(context.scanDuration);
    }

    // Maintain log size limit
    if (this.errorLogs.length > this.maxLogsRetained) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogsRetained);
    }

    // Log to console in development
    if (__DEV__) {
      console.warn('[QR Error]', {
        type: errorType,
        message: errorConfig.message,
        context,
      });
    }

    // Here you would send to analytics service (e.g., Firebase, Sentry)
    this.sendToAnalytics(errorLog);

    return errorLog;
  }

  /**
   * Log a successful scan
   */
  logSuccess(scanDuration?: number): void {
    this.successCount++;
    this.totalScans++;

    if (scanDuration) {
      this.scanDurations.push(scanDuration);
    }

    // Mark recent errors as resolved
    const recentErrors = this.errorLogs.filter(
      (log) => !log.resolved && Date.now() - log.timestamp.getTime() < 60000,
    );
    for (const error of recentErrors) {
      error.resolved = true;
    }
  }

  /**
   * Get error details for display
   */
  getErrorDetails(errorType: QrErrorType): QrErrorDetails {
    return QR_ERROR_CONFIGS[errorType];
  }

  /**
   * Get metrics for analytics dashboard
   */
  getMetrics(): QrErrorMetrics {
    const errorsByType: Record<QrErrorType, number> = {} as Record<
      QrErrorType,
      number
    >;
    for (const log of this.errorLogs) {
      errorsByType[log.type] = (errorsByType[log.type] || 0) + 1;
    }

    let totalDuration = 0;
    for (const duration of this.scanDurations) {
      totalDuration += duration;
    }
    const averageScanDuration =
      this.scanDurations.length > 0
        ? totalDuration / this.scanDurations.length
        : 0;

    const successRate =
      this.totalScans > 0 ? this.successCount / this.totalScans : 0;

    return {
      totalErrors: this.errorLogs.length,
      errorsByType,
      averageScanDuration,
      successRate,
      lastError: this.errorLogs[this.errorLogs.length - 1],
    };
  }

  /**
   * Clear error logs (for testing or reset)
   */
  clearLogs(): void {
    this.errorLogs = [];
    this.successCount = 0;
    this.totalScans = 0;
    this.scanDurations = [];
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.errorLogs.slice(-limit).reverse();
  }

  /**
   * Check if specific error type is recurring
   */
  isRecurringError(errorType: QrErrorType, windowMs: number = 60000): boolean {
    const now = Date.now();
    const recentErrors = this.errorLogs.filter(
      (log) =>
        log.type === errorType && now - log.timestamp.getTime() < windowMs,
    );
    return recentErrors.length >= 3;
  }

  /**
   * Get suggested action based on error pattern
   */
  getSuggestedAction(errorType: QrErrorType): string {
    if (this.isRecurringError(errorType)) {
      switch (errorType) {
        case QrErrorType.SCAN_TIMEOUT:
          return 'Consider entering the address manually or improving lighting conditions.';
        case QrErrorType.INVALID_QR_CONTENT:
          return 'The QR code might be damaged. Try entering the address manually.';
        case QrErrorType.CAMERA_ERROR:
          return 'Persistent camera issues detected. Please check device settings.';
        default:
          return QR_ERROR_CONFIGS[errorType].suggestion || '';
      }
    }
    return QR_ERROR_CONFIGS[errorType].suggestion || '';
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `qr-error-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Send error to analytics service
   */
  private sendToAnalytics(errorLog: ErrorLog): void {
    // Integration with analytics service would go here
    // Example: Firebase Analytics, Sentry, Crashlytics, etc.

    // For now, just log in development
    if (__DEV__) {
      console.log('[Analytics] QR Error tracked:', {
        type: errorLog.type,
        severity: errorLog.severity,
        timestamp: errorLog.timestamp.toISOString(),
      });
    }

    // Example integration:
    // analytics.track('qr_scan_error', {
    //   error_type: errorLog.type,
    //   severity: errorLog.severity,
    //   scan_duration: errorLog.context.scanDuration,
    //   attempt_number: errorLog.context.attemptNumber,
    // });
  }

  /**
   * Format error for user display
   */
  formatErrorForDisplay(
    errorType: QrErrorType,
    customMessage?: string,
  ): {
    title: string;
    message: string;
    suggestion?: string;
  } {
    const config = QR_ERROR_CONFIGS[errorType];
    return {
      title: config.title,
      message: customMessage || config.message,
      suggestion: this.getSuggestedAction(errorType),
    };
  }
}

// Export singleton instance
export const qrErrorService = new QrErrorService();
