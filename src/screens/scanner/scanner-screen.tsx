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
import { AddressStorageService } from '../../services/address-storage-service';
import { analyticsService } from '../../services/analytics-service';
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
          resetScanner(); // Reset scanner state when returning from manual entry
        },
        onCancel: () => {
          resetScanner(); // Reset scanner state when cancelling from timeout
        },
        onHelp: () => {
          Alert.alert(
            'QR Scanning Help',
            'Troubleshooting tips:\n\n' +
              '• Make sure the QR code is clearly visible within the scanning frame\n' +
              '• Ensure proper lighting - avoid shadows and glare\n' +
              '• Hold the device steady at 6-8 inches from the QR code\n' +
              '• Clean your camera lens if the image is blurry\n' +
              '• Try adjusting the angle or distance\n' +
              "• For cryptocurrency QRs, ensure it's a valid wallet address or URI",
            [
              {
                text: 'Got it',
                style: 'default',
              },
            ],
          );
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
    (data: string, source: 'scanner' | 'clipboard' = 'scanner') => {
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
          // Track failed scan
          if (scanStartTime) {
            analyticsService.trackFailedScan('invalid_uri', scanStartTime);
          }

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
              resetScannerRef.current?.(); // Reset scanner state when returning from manual entry
            },
            onHelp: () => {
              Alert.alert(
                'Invalid QR Code Help',
                "This QR code doesn't contain valid cryptocurrency data.\n\n" +
                  'Supported formats:\n' +
                  '• Bitcoin addresses (starting with 1, 3, or bc1)\n' +
                  '• Ethereum addresses (starting with 0x)\n' +
                  '• Bitcoin URIs (bitcoin:address)\n' +
                  '• Ethereum URIs (ethereum:address)\n\n' +
                  "Make sure you're scanning a wallet QR code, not a regular website or text QR.",
                [
                  {
                    text: 'Got it',
                    style: 'default',
                  },
                ],
              );
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
            text: 'Save & Use',
            style: 'default',
            onPress: async (): Promise<void> => {
              try {
                // Track successful scan
                if (scanStartTime) {
                  analyticsService.trackSuccessfulScan(
                    parsedUri.network!,
                    scanStartTime,
                    undefined, // No addressType for URIs
                    !!(parsedUri.amount || parsedUri.value),
                    !!parsedUri.label,
                  );
                }

                // Save to storage
                const savedAddress = await AddressStorageService.saveAddress(
                  parsedUri.address!,
                  parsedUri.network!,
                  {
                    source,
                    amount: parsedUri.amount || parsedUri.value,
                    unit:
                      parsedUri.network === BlockchainNetwork.Bitcoin
                        ? 'BTC'
                        : 'ETH',
                    message: parsedUri.message,
                    uri: data,
                    label: parsedUri.label,
                  },
                );

                // Track address saved
                analyticsService.track('address_saved', {
                  blockchain_type: parsedUri.network!,
                  source,
                  is_duplicate: savedAddress.usageCount > 1,
                  usage_count: savedAddress.usageCount,
                });

                console.log(
                  '[ScannerScreen] URI saved to storage:',
                  savedAddress,
                );

                // Show success feedback
                Alert.alert(
                  'Address Saved',
                  'The address has been saved to your scan history.',
                  [
                    {
                      text: 'View History',
                      onPress: (): void =>
                        navigation?.navigate('History' as any),
                    },
                    {
                      text: 'Scan Another',
                      style: 'default',
                    },
                  ],
                );
              } catch (saveError) {
                console.error('[ScannerScreen] Failed to save URI:', saveError);
                Alert.alert('Error', 'Failed to save address to history');
              }
            },
          },
        ]);
      } else {
        // Validate plain address
        const validation = WalletValidationService.validateAddress(data);

        if (!validation.isValid) {
          // Track failed scan
          if (scanStartTime) {
            analyticsService.trackFailedScan('invalid_address', scanStartTime);
          }

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
              resetScannerRef.current?.(); // Reset scanner state when returning from manual entry
            },
            onHelp: () => {
              Alert.alert(
                'Address Validation Help',
                'The scanned address appears to be invalid or corrupted.\n\n' +
                  'Common issues:\n' +
                  '• QR code is damaged or partially obscured\n' +
                  '• Address is incomplete or has extra characters\n' +
                  '• Wrong cryptocurrency format\n\n' +
                  'Try:\n' +
                  '• Scanning from a different angle\n' +
                  '• Getting a clearer image of the QR code\n' +
                  '• Asking for a new QR code if possible',
                [
                  {
                    text: 'Got it',
                    style: 'default',
                  },
                ],
              );
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
              text: 'Save & Use',
              style: 'default',
              onPress: async (): Promise<void> => {
                try {
                  // Track successful scan
                  if (scanStartTime) {
                    analyticsService.trackSuccessfulScan(
                      validation.network!,
                      scanStartTime,
                      validation.addressType,
                      false, // Plain addresses don't have amounts
                      false, // Plain addresses don't have labels
                    );
                  }

                  // Save to storage
                  const savedAddress = await AddressStorageService.saveAddress(
                    validation.address!,
                    validation.network!,
                    {
                      addressType: validation.addressType,
                      source,
                    },
                  );

                  // Track address saved
                  analyticsService.track('address_saved', {
                    blockchain_type: validation.network!,
                    source,
                    is_duplicate: savedAddress.usageCount > 1,
                    usage_count: savedAddress.usageCount,
                  });

                  console.log(
                    '[ScannerScreen] Address saved to storage:',
                    savedAddress,
                  );

                  // Show success feedback
                  Alert.alert(
                    'Address Saved',
                    'The address has been saved to your scan history.',
                    [
                      {
                        text: 'View History',
                        onPress: (): void =>
                          navigation?.navigate('History' as any),
                      },
                      {
                        text: 'Scan Another',
                        style: 'default',
                      },
                    ],
                  );
                } catch (saveError) {
                  console.error(
                    '[ScannerScreen] Failed to save address:',
                    saveError,
                  );
                  Alert.alert('Error', 'Failed to save address to history');
                }
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

      // Resume scanning and timer when screen gains focus
      resumeScanning();

      // Track scanner session start
      analyticsService.startScannerSession('tab_navigation');

      return () => {
        // Camera will be deactivated when screen loses focus
        console.log('Scanner screen blurred - camera will deactivate');

        // Pause scanning and timer when screen loses focus
        pauseScanning();

        // Track scanner session end
        analyticsService.endScannerSession();
      };
    }, [resumeScanning, pauseScanning]),
  );

  const handleFlashlightToggle = useCallback(() => {
    setFlashMode((prevMode) => (prevMode === 'off' ? 'on' : 'off'));
  }, []);

  const handleHistoryPress = useCallback(() => {
    console.log('History pressed');
    navigation?.navigate('History' as any);
  }, [navigation]);

  const handlePastePress = useCallback(async (): Promise<void> => {
    try {
      setIsProcessingClipboard(true);
      const clipboardData = await Clipboard.getString();

      if (clipboardData?.trim()) {
        console.log('Clipboard data:', clipboardData);
        // Create a modified version of processScanData for clipboard source
        processScanData(clipboardData.trim(), 'clipboard');
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
                resetScanner(); // Reset scanner state when returning from manual entry
              },
              onCancel: () => {
                resetScanner(); // Reset scanner state when cancelling from timeout
              },
              onHelp: () => {
                Alert.alert(
                  'QR Scanning Help',
                  'Scan timeout occurred. Try these tips:\n\n' +
                    '• Position the QR code fully within the scanning frame\n' +
                    '• Ensure adequate lighting\n' +
                    '• Hold the device steady\n' +
                    '• Clean your camera lens\n' +
                    '• Move closer or further away (6-8 inches is ideal)\n' +
                    '• Make sure the QR code is not damaged or blurry',
                  [
                    {
                      text: 'Got it',
                      style: 'default',
                    },
                  ],
                );
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
