import React, { type FC, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  Camera,
  type Code,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

interface CameraViewProps {
  onBarCodeRead: (data: string) => void;
  flashMode: 'off' | 'on';
  isScanning: boolean;
  isActive?: boolean;
  style?: object;
}

export const CameraView: FC<CameraViewProps> = ({
  onBarCodeRead,
  flashMode,
  isScanning,
  isActive = true,
  style,
}) => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr',
      'code-128',
      'code-39',
      'code-93',
      'codabar',
      'data-matrix',
      'ean-13',
      'ean-8',
      'itf',
      'pdf-417',
      'upc-a',
      'upc-e',
      'aztec',
    ],
    onCodeScanned: (codes: Code[]) => {
      if (isScanning && codes.length > 0) {
        const code = codes[0];
        if (code.value) {
          onBarCodeRead(code.value);
        }
      }
    },
  });

  if (!device || !hasPermission) {
    return null;
  }

  return (
    <Camera
      ref={cameraRef}
      style={[StyleSheet.absoluteFill, style]}
      device={device}
      isActive={isActive}
      codeScanner={codeScanner}
      torch={flashMode}
      photo={false}
      video={false}
      audio={false}
    />
  );
};
