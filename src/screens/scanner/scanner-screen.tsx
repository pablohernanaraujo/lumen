import React, { type FC, useCallback, useState } from 'react';
import { Alert, Clipboard, StyleSheet, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';

import {
  CameraView,
  EnhancedPermissionFlow,
  ScannerOverlay,
} from '../../components/camera';
import { useQrScanner } from '../../hooks';
import { makeStyles } from '../../theme';
import { LoadingIndicator, ScreenWrapper } from '../../ui';

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

  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [isProcessingClipboard, setIsProcessingClipboard] = useState(false);

  // The EnhancedPermissionFlow component will handle all permission logic

  const handleScanSuccess = useCallback((data: string) => {
    console.log('QR scan successful:', data);

    // Navigate to summary screen with QR data
    // navigation?.navigate('Summary', { qrData: data });

    // For now, show alert with scanned data
    Alert.alert('QR Code Scanned', `Data: ${data}`, [
      {
        text: 'OK',
        style: 'default',
      },
    ]);
  }, []);

  const { isScanning, onBarCodeRead, resetScanner } = useQrScanner({
    onScanSuccess: handleScanSuccess,
    debounceDelay: 1500,
    enableHapticFeedback: true,
  });

  const handleFlashlightToggle = useCallback(() => {
    setFlashMode((prevMode) => (prevMode === 'off' ? 'on' : 'off'));
  }, []);

  const handleHistoryPress = useCallback(() => {
    console.log('History pressed');
    // navigation?.navigate('ScanHistory');
    Alert.alert('History', 'Scan history feature coming soon!');
  }, []);

  const handlePastePress = useCallback(async () => {
    try {
      setIsProcessingClipboard(true);
      const clipboardData = await Clipboard.getString();

      if (clipboardData && clipboardData.trim()) {
        console.log('Clipboard data:', clipboardData);
        handleScanSuccess(clipboardData.trim());
      } else {
        Alert.alert('Clipboard Empty', 'No data found in clipboard');
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
      Alert.alert('Error', 'Could not access clipboard');
    } finally {
      setIsProcessingClipboard(false);
    }
  }, [handleScanSuccess]);

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
          style={styles.container}
        />

        <ScannerOverlay
          onFlashlightToggle={handleFlashlightToggle}
          onHistoryPress={handleHistoryPress}
          onPastePress={handlePastePress}
          isFlashlightOn={flashMode === 'on'}
          isScanning={isScanning}
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
