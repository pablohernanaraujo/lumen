import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

export type CameraPermissionStatus =
  | 'not-requested'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'requesting';

interface UseCameraPermissionsReturn {
  permissionStatus: CameraPermissionStatus;
  requestPermission: () => Promise<boolean>;
  openSettings: () => void;
  isPermissionGranted: boolean;
  isPermissionDenied: boolean;
  isPermissionBlocked: boolean;
}

export const useCameraPermissions = (): UseCameraPermissionsReturn => {
  const [permissionStatus, setPermissionStatus] =
    useState<CameraPermissionStatus>('not-requested');

  const checkPermissionStatus =
    useCallback(async (): Promise<CameraPermissionStatus> => {
      try {
        const { check, PERMISSIONS, RESULTS } = await import(
          'react-native-permissions'
        );

        const permission =
          Platform.OS === 'ios'
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA;

        const status = await check(permission);

        switch (status) {
          case RESULTS.GRANTED:
            return 'granted';
          case RESULTS.DENIED:
            return 'denied';
          case RESULTS.BLOCKED:
          case RESULTS.UNAVAILABLE:
            return 'blocked';
          default:
            return 'not-requested';
        }
      } catch (error) {
        console.error('Error checking camera permission:', error);
        return 'not-requested';
      }
    }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setPermissionStatus('requesting');

    try {
      const { request, PERMISSIONS, RESULTS } = await import(
        'react-native-permissions'
      );

      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const status = await request(permission);

      switch (status) {
        case RESULTS.GRANTED:
          setPermissionStatus('granted');
          return true;
        case RESULTS.DENIED:
          setPermissionStatus('denied');
          return false;
        case RESULTS.BLOCKED:
        case RESULTS.UNAVAILABLE:
          setPermissionStatus('blocked');
          return false;
        default:
          setPermissionStatus('denied');
          return false;
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  const openSettings = useCallback((): void => {
    const title = 'Camera Permission Required';
    const message =
      'Please enable camera permission in Settings to scan QR codes.';

    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => Linking.openSettings(),
        style: 'default',
      },
    ]);
  }, []);

  useEffect(() => {
    checkPermissionStatus().then(setPermissionStatus);
  }, [checkPermissionStatus]);

  const isPermissionGranted = permissionStatus === 'granted';
  const isPermissionDenied = permissionStatus === 'denied';
  const isPermissionBlocked = permissionStatus === 'blocked';

  return {
    permissionStatus,
    requestPermission,
    openSettings,
    isPermissionGranted,
    isPermissionDenied,
    isPermissionBlocked,
  };
};
