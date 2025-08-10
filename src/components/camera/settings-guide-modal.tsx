import React, { type FC, useEffect, useState } from 'react';
import { AppState, Modal, Platform } from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import { ButtonGhost, ButtonOutline, ButtonRegular } from '../../ui/buttons';
import { Icon } from '../../ui/icon';
import { ContentWrapper, HStack, VStack } from '../../ui/layout';
import { Body1, Body2, H1, H2 } from '../../ui/typography';

interface SettingsGuideModalProps {
  visible: boolean;
  onClose: () => void;
  onCheckPermission: () => void;
  onOpenSettings: () => void;
}

const useStyles = makeStyles((theme) => ({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
  },
  scrollContent: {
    maxHeight: '100%',
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.info.light,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.info.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    textAlign: 'center',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.weight.bold,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  stepsContainer: {
    marginVertical: theme.spacing.md,
  },
  stepItem: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary.main,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
  },
  stepTitle: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semibold,
    flex: 1,
  },
  stepDescription: {
    color: theme.colors.text.secondary,
    lineHeight: 18,
    fontSize: theme.typography.size.sm,
  },
  platformNote: {
    backgroundColor: theme.colors.warning.light,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  platformNoteText: {
    color: theme.colors.warning.dark,
    fontSize: theme.typography.size.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  returnPrompt: {
    backgroundColor: theme.colors.success.light,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  returnPromptText: {
    color: theme.colors.success.dark,
    fontSize: theme.typography.size.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
}));

export const SettingsGuideModal: FC<SettingsGuideModalProps> = ({
  visible,
  onClose,
  onCheckPermission,
  onOpenSettings,
}) => {
  const styles = useStyles();
  const { theme } = useTheme();
  const [appReturnedFromBackground, setAppReturnedFromBackground] =
    useState(false);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string): void => {
      if (nextAppState === 'active' && visible) {
        setAppReturnedFromBackground(true);
        // Auto-check permission when user returns from settings
        setTimeout(() => {
          onCheckPermission();
        }, 500);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
    };
  }, [visible, onCheckPermission]);

  const getSteps = (): {
    title: string;
    description: string;
    icon: string;
  }[] =>
    Platform.OS === 'ios'
      ? [
          {
            title: 'Open Settings App',
            description: 'Tap the Settings app on your home screen',
            icon: 'settings',
          },
          {
            title: 'Find Lumen App',
            description: 'Scroll down and tap "Lumen" in the app list',
            icon: 'smartphone',
          },
          {
            title: 'Camera Settings',
            description: 'Tap "Camera" to access camera permissions',
            icon: 'camera',
          },
          {
            title: 'Enable Permission',
            description: 'Toggle the camera permission to "ON" (green)',
            icon: 'toggle-right',
          },
        ]
      : [
          {
            title: 'Open Settings',
            description: 'Open your device Settings app',
            icon: 'settings',
          },
          {
            title: 'Apps & Permissions',
            description: 'Go to "Apps" or "Application Manager"',
            icon: 'grid',
          },
          {
            title: 'Find Lumen',
            description: 'Search for and tap "Lumen" in the app list',
            icon: 'search',
          },
          {
            title: 'Permissions',
            description: 'Tap "Permissions" or "App Permissions"',
            icon: 'shield',
          },
          {
            title: 'Enable Camera',
            description: 'Find "Camera" and toggle it ON',
            icon: 'camera',
          },
        ];

  const steps = getSteps();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <VStack style={styles.modal}>
        <VStack style={styles.container}>
          {/* Header */}
          <VStack style={styles.header}>
            <VStack style={styles.iconContainer}>
              <Icon
                name="settings"
                family="Feather"
                size="xl"
                color="#FFFFFF"
              />
            </VStack>
            <H1 style={styles.title}>Enable Camera Permission</H1>
            <Body1 style={styles.subtitle}>
              Follow these steps to enable camera access in Settings
            </Body1>
          </VStack>

          {/* Content */}
          <ContentWrapper variant="body" style={styles.content}>
            <VStack style={styles.stepsContainer}>
              <H2
                style={{
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.md,
                  textAlign: 'center',
                }}
              >
                Step-by-step guide:
              </H2>

              {steps.map((step, index) => (
                <VStack key={index} style={styles.stepItem}>
                  <HStack style={styles.stepHeader}>
                    <VStack style={styles.stepNumber}>
                      <Body2 style={styles.stepNumberText}>{index + 1}</Body2>
                    </VStack>
                    <Body1 style={styles.stepTitle}>{step.title}</Body1>
                    <Icon
                      name={step.icon}
                      family="Feather"
                      size="md"
                      color={theme.colors.text.secondary}
                    />
                  </HStack>
                  <Body1 style={styles.stepDescription}>
                    {step.description}
                  </Body1>
                </VStack>
              ))}
            </VStack>

            <VStack style={styles.platformNote}>
              <HStack spacing="sm" align="center">
                <Icon
                  name="info"
                  family="Feather"
                  size="sm"
                  color={theme.colors.warning.dark}
                />
                <Body1 style={styles.platformNoteText}>
                  Settings menu names may vary slightly depending on your{' '}
                  {Platform.OS === 'ios'
                    ? 'iOS version'
                    : 'Android version and device manufacturer'}
                </Body1>
              </HStack>
            </VStack>

            {appReturnedFromBackground && (
              <VStack style={styles.returnPrompt}>
                <HStack spacing="sm" align="center">
                  <Icon
                    name="check-circle"
                    family="Feather"
                    size="sm"
                    color={theme.colors.success.dark}
                  />
                  <Body1 style={styles.returnPromptText}>
                    Welcome back! Let's check if camera permission is now
                    enabled.
                  </Body1>
                </HStack>
              </VStack>
            )}
          </ContentWrapper>

          {/* Footer */}
          <ContentWrapper variant="footer" style={styles.footer}>
            <VStack spacing="sm">
              <ButtonRegular
                onPress={onOpenSettings}
                testID="open-device-settings-button-1"
                accessibilityLabel="Open device settings app"
              >
                Open Settings
              </ButtonRegular>

              <ButtonOutline
                onPress={onCheckPermission}
                testID="check-permission-status-button-1"
                accessibilityLabel="Check if camera permission is now enabled"
              >
                Check Permission
              </ButtonOutline>
              <ButtonGhost
                onPress={onClose}
                testID="cancel-settings-guide-button-1"
                accessibilityLabel="Cancel and close guide"
              >
                Cancel
              </ButtonGhost>
            </VStack>
          </ContentWrapper>
        </VStack>
      </VStack>
    </Modal>
  );
};
