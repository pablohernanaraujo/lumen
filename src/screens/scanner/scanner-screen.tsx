/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
/* eslint-disable max-statements */
import React, { type FC, useCallback, useRef, useState } from 'react';
import { Alert, Clipboard, StyleSheet, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

import {
  CameraView,
  EnhancedPermissionFlow,
  ScannerOverlay,
} from '../../components/camera';
import { TimeoutIndicator } from '../../components/scanner';
import { useQrScanner } from '../../hooks';
import { qrErrorService } from '../../services/qr-error-service';
import { WalletValidationService } from '../../services/wallet-validation-service';
import { BlockchainNetwork } from '../../services/wallet-validation-types';
import { makeStyles } from '../../theme';
import { QrErrorType } from '../../types/qr-error-types';
import { LoadingIndicator, ScreenWrapper } from '../../ui';
import { shortenAddress } from '../../utils/blockchain-utils';

interface ScannerScreenProps {
  navigation?: NavigationProp<Record<string, object | undefined>>;
}

const useStyles = makeStyles(() => ({
  container: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
}));

export const ScannerScreen: FC<ScannerScreenProps> = ({ navigation }) => {
  const styles = useStyles();
  const isFocused = useIsFocused();

  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [isProcessingClipboard, setIsProcessingClipboard] = useState(false);

  // Forward declare resetScanner for use in callbacks
  const resetScannerRef = useRef<(() => void) | null>(null);

  // The EnhancedPermissionFlow component will handle all permission logic

  // Forward declaration for scan data processing
  const processScanDataRef = useRef<((data: string) => void) | null>(null);

  const {
    isScanning,
    scanStartTime,
    attemptNumber,
    hasTimedOut,
    onBarCodeRead,
    resetScanner,
    pauseScanning,
    resumeScanning,
  } = useQrScanner({
    onScanSuccess: (data: string) => processScanDataRef.current?.(data),
    onTimeout: () => {
      navigation?.navigate('ScannerErrorModal' as any, {
        errorType: QrErrorType.SCAN_TIMEOUT,
        scanDuration: 30000,
        attemptNumber,
        onRetry: () => resetScanner(),
        onManualEntry: () => {
          console.log('Navigate to manual entry');
        },
      });
    },
    debounceDelay: 1500,
    enableHapticFeedback: true,
    timeoutDuration: 30,
  });

  // Store resetScanner reference for use in callbacks
  resetScannerRef.current = resetScanner;

  // Create the scan processing function after hook initialization
  const processScanData = useCallback(
    (data: string) => {
      console.log('Processing scan data:', data);

      // Record successful scan duration
      const scanDuration = scanStartTime
        ? Date.now() - scanStartTime
        : undefined;

      // Check if it's a URI or plain address
      const isUri = data.includes(':');

      if (isUri) {
        // Parse URI
        const parsedUri = WalletValidationService.parseURI(data);

        if (!parsedUri.isValid) {
          // Navigate to error modal instead of showing alert
          navigation?.navigate('ScannerErrorModal' as any, {
            errorType: QrErrorType.INVALID_QR_CONTENT,
            errorMessage: parsedUri.errorMessage,
            errorDetails: data.slice(0, 100),
            scanDuration,
            attemptNumber,
            onRetry: () => resetScannerRef.current?.(),
            onManualEntry: () => {
              // Navigate to manual entry screen
              console.log('Navigate to manual entry');
            },
          });
          return;
        }

        const networkName =
          parsedUri.network === BlockchainNetwork.Bitcoin
            ? 'Bitcoin'
            : 'Ethereum';
        const shortAddress = shortenAddress(parsedUri.address || '');

        let message = `Network: ${networkName}\nAddress: ${shortAddress}`;

        if (parsedUri.amount || parsedUri.value) {
          const amount = parsedUri.amount || parsedUri.value;
          const unit =
            parsedUri.network === BlockchainNetwork.Bitcoin ? 'BTC' : 'WEI';
          message += `\nAmount: ${amount} ${unit}`;
        }

        if (parsedUri.label) {
          message += `\nLabel: ${parsedUri.label}`;
        }

        if (parsedUri.message) {
          message += `\nMessage: ${parsedUri.message}`;
        }

        Alert.alert('Valid Blockchain URI', message, [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Process',
            style: 'default',
            onPress: () => {
              // Navigate to appropriate screen based on network
              // navigation?.navigate('SendTransaction', { uri: parsedUri });
              console.log('Processing URI:', parsedUri);
            },
          },
        ]);
      } else {
        // Validate plain address
        const validation = WalletValidationService.validateAddress(data);

        if (!validation.isValid) {
          // Determine specific error type
          let errorType = QrErrorType.INVALID_QR_CONTENT;
          if (data.match(/^[13bc]/i) || data.match(/^0x/i)) {
            errorType = QrErrorType.MALFORMED_ADDRESS;
          }

          // Navigate to error modal
          navigation?.navigate('ScannerErrorModal' as any, {
            errorType,
            errorMessage: validation.errorMessage,
            errorDetails: data.slice(0, 100),
            scanDuration,
            attemptNumber,
            onRetry: () => resetScannerRef.current?.(),
            onManualEntry: () => {
              console.log('Navigate to manual entry');
            },
          });
          return;
        }

        const networkName =
          validation.network === BlockchainNetwork.Bitcoin
            ? 'Bitcoin'
            : 'Ethereum';
        const shortAddress = shortenAddress(validation.address || '');

        let addressType = '';
        if (
          validation.network === BlockchainNetwork.Bitcoin &&
          validation.addressType
        ) {
          addressType = `\nType: ${validation.addressType}`;
        }

        // Log successful scan
        qrErrorService.logSuccess(scanDuration);

        Alert.alert(
          'Valid Blockchain Address',
          `Network: ${networkName}${addressType}\nAddress: ${shortAddress}`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Use Address',
              style: 'default',
              onPress: () => {
                // Navigate to appropriate screen based on network
                // navigation?.navigate('SendTransaction', { address: validation.address, network: validation.network });
                console.log('Using address:', validation);
              },
            },
          ],
        );
      }
    },
    [navigation, scanStartTime, attemptNumber],
  );

  // Store the function reference
  processScanDataRef.current = processScanData;

  // Camera lifecycle management
  useFocusEffect(
    useCallback(() => {
      // Camera will be activated when screen gains focus
      console.log('Scanner screen focused - camera will activate');

      return () => {
        // Camera will be deactivated when screen loses focus
        console.log('Scanner screen blurred - camera will deactivate');
      };
    }, []),
  );

  const handleFlashlightToggle = useCallback(() => {
    setFlashMode((prevMode) => (prevMode === 'off' ? 'on' : 'off'));
  }, []);

  const handleHistoryPress = useCallback(() => {
    console.log('History pressed');
    // navigation?.navigate('ScanHistory');
    Alert.alert('History', 'Scan history feature coming soon!');
  }, []);

  const handlePastePress = useCallback(async (): Promise<void> => {
    try {
      setIsProcessingClipboard(true);
      const clipboardData = await Clipboard.getString();

      if (clipboardData?.trim()) {
        console.log('Clipboard data:', clipboardData);
        processScanData(clipboardData.trim());
      } else {
        Alert.alert('Clipboard Empty', 'No data found in clipboard');
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
      Alert.alert('Error', 'Could not access clipboard');
    } finally {
      setIsProcessingClipboard(false);
    }
  }, [processScanData]);

  const handlePermissionGranted = useCallback(() => {
    resetScanner();
  }, [resetScanner]);

  const handlePermissionCancelled = useCallback(() => {
    // Navigate back or show alternative UI
    navigation?.goBack();
  }, [navigation]);

  return (
    <EnhancedPermissionFlow
      showEducation={true}
      onPermissionGranted={handlePermissionGranted}
      onPermissionCancelled={handlePermissionCancelled}
    >
      <ScreenWrapper>
        <CameraView
          onBarCodeRead={onBarCodeRead}
          flashMode={flashMode}
          isScanning={isScanning}
          isActive={isFocused}
          style={styles.container}
        />

        <ScannerOverlay
          onFlashlightToggle={handleFlashlightToggle}
          onHistoryPress={handleHistoryPress}
          onPastePress={handlePastePress}
          isFlashlightOn={flashMode === 'on'}
          isScanning={isScanning}
        />

        <TimeoutIndicator
          duration={30}
          isActive={isScanning && !hasTimedOut}
          isPaused={isProcessingClipboard}
          onTimeout={() => {
            navigation?.navigate('ScannerErrorModal' as any, {
              errorType: QrErrorType.SCAN_TIMEOUT,
              scanDuration: 30000,
              attemptNumber,
              onRetry: () => resetScanner(),
              onManualEntry: () => {
                console.log('Navigate to manual entry');
              },
            });
          }}
        />

        {isProcessingClipboard && (
          <View style={styles.loadingContainer}>
            <LoadingIndicator label="Processing clipboard..." showLabel />
          </View>
        )}
      </ScreenWrapper>
    </EnhancedPermissionFlow>
  );
};
