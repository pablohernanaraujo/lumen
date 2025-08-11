import { QrErrorSeverity, QrErrorType } from '../../types/qr-error-types';
import { qrErrorService } from '../qr-error-service';

describe('QrErrorService', () => {
  beforeEach(() => {
    qrErrorService.clearLogs();
  });

  describe('logError', () => {
    it('should log an error with context', () => {
      const errorLog = qrErrorService.logError(QrErrorType.INVALID_QR_CONTENT, {
        scanDuration: 5000,
        attemptNumber: 1,
        qrContent: 'invalid-data',
      });

      expect(errorLog).toBeDefined();
      expect(errorLog.type).toBe(QrErrorType.INVALID_QR_CONTENT);
      expect(errorLog.severity).toBe(QrErrorSeverity.WARNING);
      expect(errorLog.context.scanDuration).toBe(5000);
      expect(errorLog.resolved).toBe(false);
    });

    it('should maintain a maximum number of logs', () => {
      // Log more than maxLogsRetained (100)
      for (let i = 0; i < 110; i++) {
        qrErrorService.logError(QrErrorType.SCAN_TIMEOUT, {
          attemptNumber: i,
        });
      }

      const recentErrors = qrErrorService.getRecentErrors(200);
      expect(recentErrors.length).toBeLessThanOrEqual(100);
    });
  });

  describe('logSuccess', () => {
    it('should increment success count', () => {
      const initialMetrics = qrErrorService.getMetrics();
      const initialSuccessRate = initialMetrics.successRate;

      qrErrorService.logSuccess(3000);

      const updatedMetrics = qrErrorService.getMetrics();
      expect(updatedMetrics.successRate).toBeGreaterThan(initialSuccessRate);
    });

    it('should mark recent errors as resolved', () => {
      const errorLog = qrErrorService.logError(QrErrorType.MALFORMED_ADDRESS);
      expect(errorLog.resolved).toBe(false);

      qrErrorService.logSuccess();

      const recentErrors = qrErrorService.getRecentErrors(1);
      expect(recentErrors[0].resolved).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('should return correct metrics', () => {
      qrErrorService.logError(QrErrorType.INVALID_QR_CONTENT, {
        scanDuration: 1000,
      });
      qrErrorService.logError(QrErrorType.SCAN_TIMEOUT, {
        scanDuration: 30000,
      });
      qrErrorService.logError(QrErrorType.INVALID_QR_CONTENT, {
        scanDuration: 2000,
      });
      qrErrorService.logSuccess(500);

      const metrics = qrErrorService.getMetrics();

      expect(metrics.totalErrors).toBe(3);
      expect(metrics.errorsByType[QrErrorType.INVALID_QR_CONTENT]).toBe(2);
      expect(metrics.errorsByType[QrErrorType.SCAN_TIMEOUT]).toBe(1);
      expect(metrics.averageScanDuration).toBeGreaterThan(0);
      expect(metrics.successRate).toBe(0.25); // 1 success out of 4 total
    });
  });

  describe('isRecurringError', () => {
    it('should detect recurring errors', () => {
      // Log the same error type 3 times
      qrErrorService.logError(QrErrorType.CAMERA_ERROR);
      qrErrorService.logError(QrErrorType.CAMERA_ERROR);
      qrErrorService.logError(QrErrorType.CAMERA_ERROR);

      expect(qrErrorService.isRecurringError(QrErrorType.CAMERA_ERROR)).toBe(
        true,
      );
      expect(qrErrorService.isRecurringError(QrErrorType.SCAN_TIMEOUT)).toBe(
        false,
      );
    });

    it('should respect time window for recurring errors', async () => {
      qrErrorService.logError(QrErrorType.VALIDATION_ERROR);
      qrErrorService.logError(QrErrorType.VALIDATION_ERROR);

      // Wait 5ms to ensure some time passes
      await new Promise((resolve) => setTimeout(resolve, 5));

      qrErrorService.logError(QrErrorType.VALIDATION_ERROR);

      // Check with very small window (should be false)
      expect(
        qrErrorService.isRecurringError(QrErrorType.VALIDATION_ERROR, 1),
      ).toBe(false);

      // Check with large window (should be true)
      expect(
        qrErrorService.isRecurringError(QrErrorType.VALIDATION_ERROR, 600000),
      ).toBe(true);
    });
  });

  describe('getSuggestedAction', () => {
    it('should return enhanced suggestion for recurring errors', () => {
      // Make it a recurring error
      qrErrorService.logError(QrErrorType.SCAN_TIMEOUT);
      qrErrorService.logError(QrErrorType.SCAN_TIMEOUT);
      qrErrorService.logError(QrErrorType.SCAN_TIMEOUT);

      const suggestion = qrErrorService.getSuggestedAction(
        QrErrorType.SCAN_TIMEOUT,
      );
      expect(suggestion).toContain('Consider entering the address manually');
    });

    it('should return default suggestion for non-recurring errors', () => {
      qrErrorService.logError(QrErrorType.UNSUPPORTED_NETWORK);

      const suggestion = qrErrorService.getSuggestedAction(
        QrErrorType.UNSUPPORTED_NETWORK,
      );
      expect(suggestion).toContain(
        'Currently, we support Bitcoin and Ethereum',
      );
    });
  });

  describe('formatErrorForDisplay', () => {
    it('should format error with custom message', () => {
      const formatted = qrErrorService.formatErrorForDisplay(
        QrErrorType.MALFORMED_ADDRESS,
        'Custom error message',
      );

      expect(formatted.title).toBe('Invalid Address Format');
      expect(formatted.message).toBe('Custom error message');
      expect(formatted.suggestion).toBeDefined();
    });

    it('should use default message when no custom message provided', () => {
      const formatted = qrErrorService.formatErrorForDisplay(
        QrErrorType.PERMISSION_DENIED,
      );

      expect(formatted.title).toBe('Camera Permission Required');
      expect(formatted.message).toBe(
        'Camera access is needed to scan QR codes.',
      );
    });
  });

  describe('getRecentErrors', () => {
    it('should return recent errors in reverse chronological order', () => {
      qrErrorService.logError(QrErrorType.INVALID_QR_CONTENT, {
        attemptNumber: 1,
      });
      qrErrorService.logError(QrErrorType.SCAN_TIMEOUT, { attemptNumber: 2 });
      qrErrorService.logError(QrErrorType.CAMERA_ERROR, { attemptNumber: 3 });

      const recentErrors = qrErrorService.getRecentErrors(2);

      expect(recentErrors.length).toBe(2);
      expect(recentErrors[0].context.attemptNumber).toBe(3);
      expect(recentErrors[1].context.attemptNumber).toBe(2);
    });
  });
});
