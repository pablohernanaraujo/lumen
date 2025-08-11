import type { QrErrorType } from '../../../types/qr-error-types';

export interface ScannerErrorModalParams {
  errorType: QrErrorType;
  errorMessage?: string;
  errorDetails?: string;
  scanDuration?: number;
  attemptNumber?: number;
  onRetry?: () => void;
  onManualEntry?: () => void;
  onHelp?: () => void;
  onCancel?: () => void;
}
