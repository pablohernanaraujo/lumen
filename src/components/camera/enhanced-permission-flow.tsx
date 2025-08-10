/* eslint-disable max-statements */
import React, { type FC, type ReactNode, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useEnhancedCameraPermissions } from '../../hooks';
import type { RootNavigationProp } from '../../routing/types';
import { makeStyles } from '../../theme';
import { ButtonRegular } from '../../ui/buttons';
import { VStack } from '../../ui/layout';
import { Body1 } from '../../ui/typography';
import { PermissionDeniedRecoveryModal } from './permission-denied-recovery-modal';
import { PermissionRequestModal } from './permission-request-modal';
import { SettingsGuideModal } from './settings-guide-modal';

interface EnhancedPermissionFlowProps {
  children: ReactNode;
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
  /** What to render when permission is not granted */
  fallbackComponent?: ReactNode;
  /** Called when permission is granted */
  onPermissionGranted?: () => void;
  /** Called when permission flow is cancelled */
  onPermissionCancelled?: () => void;
}

const useStyles = makeStyles((theme) => ({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
}));

export const EnhancedPermissionFlow: FC<EnhancedPermissionFlowProps> = ({
  children,
  showEducation = true,
  showSuccessConfirmation = false,
  customMessages,
  fallbackComponent,
  onPermissionGranted,
  onPermissionCancelled,
}) => {
  const navigation = useNavigation<RootNavigationProp>();
  const styles = useStyles();
  const {
    // Permission state
    permissionStatus,
    flowStep,

    // Permission actions
    startPermissionFlow,
    requestPermission,
    openSettings,

    // Flow control
    handleEducationContinue,
    handleEducationCancel,

    // Modals state
    isEducationModalVisible,
    isDeniedModalVisible,
    isSettingsModalVisible,

    // Modal actions
    hideDeniedModal,
    hideSettingsModal,

    // Convenience checks
    canShowCamera,
    needsPermissionFlow,

    // Reset flow
    resetFlow,
  } = useEnhancedCameraPermissions({
    showEducation,
    showSuccessConfirmation,
    customMessages,
  });

  const handlePermissionSuccess = (): void => {
    resetFlow();
    onPermissionGranted?.();
  };

  const handlePermissionCancel = (): void => {
    resetFlow();
    onPermissionCancelled?.();
  };

  const handleTryAgain = async (): Promise<void> => {
    hideDeniedModal();
    const granted = await requestPermission();
    if (granted) {
      handlePermissionSuccess();
    }
  };

  const handleOpenSettings = (): void => {
    hideSettingsModal();
    openSettings();
  };

  const handleCheckPermissionFromSettings = async (): Promise<void> => {
    hideSettingsModal();
    const granted = await requestPermission();
    if (granted) {
      handlePermissionSuccess();
    }
  };

  // Handle education modal navigation
  useEffect(() => {
    if (isEducationModalVisible) {
      navigation.navigate('PermissionEducationModal', {
        onRequestPermission: handleEducationContinue,
        onCancel: handleEducationCancel,
      });
    }
  }, [
    isEducationModalVisible,
    navigation,
    handleEducationContinue,
    handleEducationCancel,
  ]);

  // If we need to start the permission flow
  if (needsPermissionFlow) {
    return (
      <>
        {fallbackComponent || (
          <VStack style={styles.fallbackContainer} spacing="lg" align="center">
            <Body1>Camera access is required for QR scanning</Body1>
            <ButtonRegular
              onPress={startPermissionFlow}
              testID="enable-camera-access-button-1"
            >
              Enable Camera Access
            </ButtonRegular>
          </VStack>
        )}

        {/* Permission Request Modal (system) */}
        <PermissionRequestModal
          visible={flowStep === 'requesting'}
          onAllow={() => {}} // System handles this
          onDeny={() => {}} // System handles this
          isRequesting={true}
        />

        {/* Permission Denied Recovery Modal */}
        <PermissionDeniedRecoveryModal
          visible={isDeniedModalVisible}
          onTryAgain={handleTryAgain}
          onOpenSettings={handleOpenSettings}
          onCancel={handlePermissionCancel}
          isBlocked={permissionStatus === 'blocked'}
        />

        {/* Settings Guide Modal */}
        <SettingsGuideModal
          visible={isSettingsModalVisible}
          onClose={handlePermissionCancel}
          onCheckPermission={handleCheckPermissionFromSettings}
          onOpenSettings={handleOpenSettings}
        />
      </>
    );
  }

  // If camera can be shown, render children
  if (canShowCamera) {
    return <>{children}</>;
  }

  // Default fallback
  return (
    <>
      {fallbackComponent || (
        <VStack style={styles.fallbackContainer} spacing="lg" align="center">
          <Body1>Camera access is required</Body1>
          <ButtonRegular
            onPress={startPermissionFlow}
            testID="request-permission-button-1"
          >
            Request Permission
          </ButtonRegular>
        </VStack>
      )}

      <PermissionRequestModal
        visible={flowStep === 'requesting'}
        onAllow={() => {}}
        onDeny={() => {}}
        isRequesting={true}
      />

      <PermissionDeniedRecoveryModal
        visible={isDeniedModalVisible}
        onTryAgain={handleTryAgain}
        onOpenSettings={handleOpenSettings}
        onCancel={handlePermissionCancel}
        isBlocked={permissionStatus === 'blocked'}
      />

      <SettingsGuideModal
        visible={isSettingsModalVisible}
        onClose={handlePermissionCancel}
        onCheckPermission={handleCheckPermissionFromSettings}
        onOpenSettings={handleOpenSettings}
      />
    </>
  );
};
