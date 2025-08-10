/* eslint-disable max-statements */
import { useCallback, useRef, useState } from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface UseQrScannerOptions {
  onScanSuccess: (data: string) => void;
  debounceDelay?: number;
  enableHapticFeedback?: boolean;
}

interface UseQrScannerReturn {
  isScanning: boolean;
  lastScannedData: string | null;
  lastScanTime: number | null;
  onBarCodeRead: (data: string) => void;
  resetScanner: () => void;
  pauseScanning: () => void;
  resumeScanning: () => void;
}

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const useQrScanner = ({
  onScanSuccess,
  debounceDelay = 1500,
  enableHapticFeedback = true,
}: UseQrScannerOptions): UseQrScannerReturn => {
  const [isScanning, setIsScanning] = useState(true);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number | null>(null);

  const lastScanRef = useRef<{ data: string; time: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerHapticFeedback = useCallback((): void => {
    if (!enableHapticFeedback) return;

    try {
      ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }, [enableHapticFeedback]);

  const isValidQrData = useCallback((data: string): boolean => {
    if (!data || typeof data !== 'string') return false;

    // Basic validation for common QR patterns
    // Can be extended based on specific requirements
    const trimmedData = data.trim();
    return trimmedData.length > 0;
  }, []);

  const isDuplicateScan = useCallback(
    (data: string, currentTime: number): boolean => {
      if (!lastScanRef.current) return false;

      const { data: lastData, time: lastTime } = lastScanRef.current;
      const timeDiff = currentTime - lastTime;

      // Check if same data within debounce period
      return lastData === data && timeDiff < debounceDelay;
    },
    [debounceDelay],
  );

  const onBarCodeRead = useCallback(
    (data: string): void => {
      if (!isScanning) return;

      const currentTime = Date.now();

      // Validate QR data
      if (!isValidQrData(data)) {
        console.warn('Invalid QR data received:', data);
        return;
      }

      // Check for duplicate scan within debounce period
      if (isDuplicateScan(data, currentTime)) {
        console.log('Duplicate scan ignored:', data);
        return;
      }

      // Update scan tracking
      lastScanRef.current = {
        data,
        time: currentTime,
      };
      setLastScannedData(data);
      setLastScanTime(currentTime);

      // Trigger haptic feedback
      triggerHapticFeedback();

      // Temporarily pause scanning to prevent rapid successive scans
      setIsScanning(false);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Resume scanning after debounce delay
      timeoutRef.current = setTimeout(() => {
        setIsScanning(true);
        timeoutRef.current = null;
      }, debounceDelay);

      // Call success callback
      console.log('QR Code scanned:', data);
      onScanSuccess(data);
    },
    [
      isScanning,
      isValidQrData,
      isDuplicateScan,
      triggerHapticFeedback,
      debounceDelay,
      onScanSuccess,
    ],
  );

  const resetScanner = useCallback((): void => {
    lastScanRef.current = null;
    setLastScannedData(null);
    setLastScanTime(null);
    setIsScanning(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const pauseScanning = useCallback((): void => {
    setIsScanning(false);
  }, []);

  const resumeScanning = useCallback((): void => {
    setIsScanning(true);
  }, []);

  return {
    isScanning,
    lastScannedData,
    lastScanTime,
    onBarCodeRead,
    resetScanner,
    pauseScanning,
    resumeScanning,
  };
};
