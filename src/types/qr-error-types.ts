export enum QrErrorType {
  INVALID_QR_CONTENT = 'INVALID_QR_CONTENT',
  MALFORMED_ADDRESS = 'MALFORMED_ADDRESS',
  UNSUPPORTED_NETWORK = 'UNSUPPORTED_NETWORK',
  SCAN_TIMEOUT = 'SCAN_TIMEOUT',
  CAMERA_ERROR = 'CAMERA_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export enum QrErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface QrErrorDetails {
  type: QrErrorType;
  severity: QrErrorSeverity;
  title: string;
  message: string;
  suggestion?: string;
  canRetry: boolean;
  canManualEntry: boolean;
}

export interface QrErrorContext {
  scanDuration?: number;
  attemptNumber?: number;
  qrContent?: string;
  timestamp: Date;
  errorDetails?: string;
}

export interface QrErrorAction {
  label: string;
  type: 'retry' | 'manual' | 'help' | 'cancel' | 'settings';
  isPrimary?: boolean;
}

export const QR_ERROR_CONFIGS: Record<QrErrorType, QrErrorDetails> = {
  [QrErrorType.INVALID_QR_CONTENT]: {
    type: QrErrorType.INVALID_QR_CONTENT,
    severity: QrErrorSeverity.WARNING,
    title: 'Invalid QR Code',
    message:
      "This QR code doesn't contain a valid wallet address or payment URI.",
    suggestion: "Make sure you're scanning a cryptocurrency wallet QR code.",
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.MALFORMED_ADDRESS]: {
    type: QrErrorType.MALFORMED_ADDRESS,
    severity: QrErrorSeverity.WARNING,
    title: 'Invalid Address Format',
    message: 'The scanned address appears to be corrupted or incomplete.',
    suggestion: 'Try scanning again or enter the address manually.',
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.UNSUPPORTED_NETWORK]: {
    type: QrErrorType.UNSUPPORTED_NETWORK,
    severity: QrErrorSeverity.INFO,
    title: 'Unsupported Blockchain',
    message: 'This blockchain network is not supported yet.',
    suggestion: 'Currently, we support Bitcoin and Ethereum addresses.',
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.SCAN_TIMEOUT]: {
    type: QrErrorType.SCAN_TIMEOUT,
    severity: QrErrorSeverity.INFO,
    title: 'Scan Timeout',
    message: 'No QR code was detected within 30 seconds.',
    suggestion:
      'Position the QR code within the frame and ensure good lighting.',
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.CAMERA_ERROR]: {
    type: QrErrorType.CAMERA_ERROR,
    severity: QrErrorSeverity.ERROR,
    title: 'Camera Error',
    message: 'Unable to access the camera.',
    suggestion: 'Check camera permissions in your device settings.',
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.VALIDATION_ERROR]: {
    type: QrErrorType.VALIDATION_ERROR,
    severity: QrErrorSeverity.ERROR,
    title: 'Validation Failed',
    message: 'Unable to validate the scanned address.',
    suggestion: 'Please try again or enter the address manually.',
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.PERMISSION_DENIED]: {
    type: QrErrorType.PERMISSION_DENIED,
    severity: QrErrorSeverity.ERROR,
    title: 'Camera Permission Required',
    message: 'Camera access is needed to scan QR codes.',
    suggestion: 'Grant camera permission in your device settings to continue.',
    canRetry: false,
    canManualEntry: true,
  },
};

export const getErrorActions = (errorType: QrErrorType): QrErrorAction[] => {
  const config = QR_ERROR_CONFIGS[errorType];
  const actions: QrErrorAction[] = [];

  if (config.canRetry) {
    actions.push({
      label: 'Try Again',
      type: 'retry',
      isPrimary: true,
    });
  }

  if (config.canManualEntry) {
    actions.push({
      label: 'Enter Manually',
      type: 'manual',
      isPrimary: !config.canRetry,
    });
  }

  if (errorType === QrErrorType.PERMISSION_DENIED) {
    actions.push({
      label: 'Open Settings',
      type: 'settings',
    });
  }

  if (
    errorType === QrErrorType.SCAN_TIMEOUT ||
    errorType === QrErrorType.CAMERA_ERROR
  ) {
    actions.push({
      label: 'Get Help',
      type: 'help',
    });
  }

  actions.push({
    label: 'Cancel',
    type: 'cancel',
  });

  return actions;
};
