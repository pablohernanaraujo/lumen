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
    title: 'Formato de dirección inválido',
    message: 'La dirección escaneada parece estar corrupta o incompleta.',
    suggestion:
      'Intentá escanear nuevamente o ingresá la dirección manualmente.',
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.UNSUPPORTED_NETWORK]: {
    type: QrErrorType.UNSUPPORTED_NETWORK,
    severity: QrErrorSeverity.INFO,
    title: 'Red blockchain no soportada',
    message: 'Esta red blockchain no está soportada todavía.',
    suggestion: 'Actualmente, soportamos Bitcoin y Ethereum.',
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.SCAN_TIMEOUT]: {
    type: QrErrorType.SCAN_TIMEOUT,
    severity: QrErrorSeverity.INFO,
    title: 'Tiempo de escaneo agotado',
    message: 'No se detectó ningún código QR dentro de los 30 segundos.',
    suggestion:
      'Posicioná el código QR dentro del marco y asegurate de tener buena iluminación.',
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.CAMERA_ERROR]: {
    type: QrErrorType.CAMERA_ERROR,
    severity: QrErrorSeverity.ERROR,
    title: 'Error de cámara',
    message: 'No se pudo acceder a la cámara.',
    suggestion:
      'Verificá los permisos de la cámara en tus configuraciones de dispositivo.',
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.VALIDATION_ERROR]: {
    type: QrErrorType.VALIDATION_ERROR,
    severity: QrErrorSeverity.ERROR,
    title: 'Validación fallida',
    message: 'No se pudo validar la dirección escaneada.',
    suggestion:
      'Intentá escanear nuevamente o ingresá la dirección manualmente.',
    canRetry: true,
    canManualEntry: true,
  },
  [QrErrorType.PERMISSION_DENIED]: {
    type: QrErrorType.PERMISSION_DENIED,
    severity: QrErrorSeverity.ERROR,
    title: 'Permiso de cámara requerido',
    message: 'Se necesita acceso a la cámara para escanear códigos QR.',
    suggestion:
      'Otorgá permisos de cámara en tus configuraciones de dispositivo para continuar.',
    canRetry: false,
    canManualEntry: true,
  },
};

export const getErrorActions = (errorType: QrErrorType): QrErrorAction[] => {
  const config = QR_ERROR_CONFIGS[errorType];
  const actions: QrErrorAction[] = [];

  if (config.canRetry) {
    actions.push({
      label: 'Reintentar',
      type: 'retry',
      isPrimary: true,
    });
  }

  if (config.canManualEntry) {
    actions.push({
      label: 'Ingresar manualmente',
      type: 'manual',
      isPrimary: !config.canRetry,
    });
  }

  if (errorType === QrErrorType.PERMISSION_DENIED) {
    actions.push({
      label: 'Abrir configuraciones',
      type: 'settings',
    });
  }

  if (
    errorType === QrErrorType.SCAN_TIMEOUT ||
    errorType === QrErrorType.CAMERA_ERROR
  ) {
    actions.push({
      label: 'Obtener ayuda',
      type: 'help',
    });
  }

  actions.push({
    label: 'Cancelar',
    type: 'cancel',
  });

  return actions;
};
