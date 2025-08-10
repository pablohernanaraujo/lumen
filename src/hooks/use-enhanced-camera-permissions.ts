import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

export type PermissionFlowStep =
  | 'not-started'
  | 'education'
  | 'requesting'
  | 'granted'
  | 'denied-first-time'
  | 'denied-blocked'
  | 'settings-redirect'
  | 'success-confirmation';

export type CameraPermissionStatus =
  | 'not-requested'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'requesting';

interface UseEnhancedCameraPermissionsConfig {
  /** Whether to show education modal before requesting permission */
  showEducation?: boolean;
  /** Whether to show success confirmation after permission granted */
  showSuccessConfirmation?: boolean;
  /** Custom messages for different states */
  customMessages?: {
    educationTitle?: string;
    deniedTitle?: string;
    blockedTitle?: string;
  };
}

interface UseEnhancedCameraPermissionsReturn {
  // Permission state
  permissionStatus: CameraPermissionStatus;
  flowStep: PermissionFlowStep;

  // Permission actions
  startPermissionFlow: () => void;
  requestPermission: () => Promise<boolean>;
  openSettings: () => void;

  // Flow control
  showEducationModal: () => void;
  hideEducationModal: () => void;
  handleEducationContinue: () => void;
  handleEducationCancel: () => void;

  // Modals state
  isEducationModalVisible: boolean;
  isDeniedModalVisible: boolean;
  isSettingsModalVisible: boolean;

  // Modal actions
  showDeniedModal: () => void;
  hideDeniedModal: () => void;
  showSettingsModal: () => void;
  hideSettingsModal: () => void;

  // Convenience checks
  isPermissionGranted: boolean;
  isPermissionDenied: boolean;
  isPermissionBlocked: boolean;
  canShowCamera: boolean;
  needsPermissionFlow: boolean;

  // Reset flow
  resetFlow: () => void;
}

// eslint-disable-next-line max-statements
export const useEnhancedCameraPermissions = (
  config: UseEnhancedCameraPermissionsConfig = {},
): UseEnhancedCameraPermissionsReturn => {
  const {
    showEducation = true,
    showSuccessConfirmation = false,
    customMessages = {},
  } = config;

  const [permissionStatus, setPermissionStatus] =
    useState<CameraPermissionStatus>('not-requested');
  const [flowStep, setFlowStep] = useState<PermissionFlowStep>('not-started');

  // Modal visibility states
  const [isEducationModalVisible, setIsEducationModalVisible] = useState(false);
  const [isDeniedModalVisible, setIsDeniedModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

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

  const requestPermissionInternal = useCallback(async (): Promise<boolean> => {
    setPermissionStatus('requesting');
    setFlowStep('requesting');

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
          setFlowStep('granted');
          if (showSuccessConfirmation) {
            setFlowStep('success-confirmation');
          }
          return true;

        case RESULTS.DENIED:
          setPermissionStatus('denied');
          setFlowStep('denied-first-time');
          return false;

        case RESULTS.BLOCKED:
        case RESULTS.UNAVAILABLE:
          setPermissionStatus('blocked');
          setFlowStep('denied-blocked');
          return false;

        default:
          setPermissionStatus('denied');
          setFlowStep('denied-first-time');
          return false;
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setPermissionStatus('denied');
      setFlowStep('denied-first-time');
      return false;
    }
  }, [showSuccessConfirmation]);

  const startPermissionFlow = useCallback(() => {
    if (showEducation) {
      setFlowStep('education');
      setIsEducationModalVisible(true);
    } else {
      requestPermissionInternal();
    }
  }, [showEducation, requestPermissionInternal]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    // If permission already granted, return true
    if (permissionStatus === 'granted') return true;

    // Check current status first
    const currentStatus = await checkPermissionStatus();
    setPermissionStatus(currentStatus);

    if (currentStatus === 'granted') {
      setFlowStep('granted');
      return true;
    }

    // If blocked, show settings modal
    if (currentStatus === 'blocked') {
      setFlowStep('denied-blocked');
      setIsSettingsModalVisible(true);
      return false;
    }

    // Request permission
    return requestPermissionInternal();
  }, [permissionStatus, checkPermissionStatus, requestPermissionInternal]);

  const openSettings = useCallback(() => {
    const title = customMessages.blockedTitle || 'Camera Permission Required';
    const message =
      'Please enable camera permission in Settings to use QR scanning features.';

    Alert.alert(title, message, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => setIsSettingsModalVisible(false),
      },
      {
        text: 'Open Settings',
        onPress: async () => {
          setIsSettingsModalVisible(false);
          setFlowStep('settings-redirect');
          await Linking.openSettings();

          // Check permission status when user returns from settings
          setTimeout(async () => {
            const status = await checkPermissionStatus();
            setPermissionStatus(status);
            if (status === 'granted') {
              setFlowStep('granted');
            }
          }, 1000);
        },
        style: 'default',
      },
    ]);
  }, [customMessages.blockedTitle, checkPermissionStatus]);

  // Education modal handlers
  const showEducationModal = useCallback(() => {
    setIsEducationModalVisible(true);
    setFlowStep('education');
  }, []);

  const hideEducationModal = useCallback(() => {
    setIsEducationModalVisible(false);
  }, []);

  const handleEducationContinue = useCallback(() => {
    hideEducationModal();
    requestPermissionInternal();
  }, [hideEducationModal, requestPermissionInternal]);

  const handleEducationCancel = useCallback(() => {
    hideEducationModal();
    setFlowStep('not-started');
  }, [hideEducationModal]);

  // Denied modal handlers
  const showDeniedModal = useCallback(() => {
    setIsDeniedModalVisible(true);
  }, []);

  const hideDeniedModal = useCallback(() => {
    setIsDeniedModalVisible(false);
  }, []);

  // Settings modal handlers
  const showSettingsModal = useCallback(() => {
    setIsSettingsModalVisible(true);
  }, []);

  const hideSettingsModal = useCallback(() => {
    setIsSettingsModalVisible(false);
  }, []);

  const resetFlow = useCallback(() => {
    setFlowStep('not-started');
    setIsEducationModalVisible(false);
    setIsDeniedModalVisible(false);
    setIsSettingsModalVisible(false);
  }, []);

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus().then(setPermissionStatus);
  }, [checkPermissionStatus]);

  // Auto-show denied modal when permission is denied
  useEffect(() => {
    if (flowStep === 'denied-first-time') {
      setIsDeniedModalVisible(true);
    } else if (flowStep === 'denied-blocked') {
      setIsSettingsModalVisible(true);
    }
  }, [flowStep]);

  // Convenience computed values
  const isPermissionGranted = permissionStatus === 'granted';
  const isPermissionDenied = permissionStatus === 'denied';
  const isPermissionBlocked = permissionStatus === 'blocked';
  const canShowCamera = isPermissionGranted && flowStep !== 'education';
  const needsPermissionFlow =
    !isPermissionGranted && flowStep === 'not-started';

  return {
    // Permission state
    permissionStatus,
    flowStep,

    // Permission actions
    startPermissionFlow,
    requestPermission,
    openSettings,

    // Flow control
    showEducationModal,
    hideEducationModal,
    handleEducationContinue,
    handleEducationCancel,

    // Modal state
    isEducationModalVisible,
    isDeniedModalVisible,
    isSettingsModalVisible,

    // Modal actions
    showDeniedModal,
    hideDeniedModal,
    showSettingsModal,
    hideSettingsModal,

    // Convenience checks
    isPermissionGranted,
    isPermissionDenied,
    isPermissionBlocked,
    canShowCamera,
    needsPermissionFlow,

    // Reset
    resetFlow,
  };
};
