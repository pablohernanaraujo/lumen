import React, { type FC } from 'react';
import { Modal, Platform } from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import { ButtonGhost, ButtonOutline, ButtonRegular } from '../../ui/buttons';
import { Icon } from '../../ui/icon';
import { ContentWrapper, HStack, VStack } from '../../ui/layout';
import { Body1, H1, H2 } from '../../ui/typography';

interface PermissionDeniedRecoveryModalProps {
  visible: boolean;
  onTryAgain: () => void;
  onOpenSettings: () => void;
  onCancel: () => void;
  isBlocked?: boolean;
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
    maxWidth: 380,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.warning.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.border,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    paddingBottom: theme.spacing.lg,
  },
  alternativeSection: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.lg,
  },
  alternativeTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontWeight: theme.typography.weight.semibold,
    textAlign: 'center',
  },
  alternativeItem: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  alternativeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  alternativeTextContainer: {
    flex: 1,
  },
  alternativeItemTitle: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semibold,
    marginBottom: theme.spacing.xs,
  },
  alternativeItemDescription: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.size.sm,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  instructionsContainer: {
    backgroundColor: theme.colors.info.light,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  instructionStep: {
    marginBottom: theme.spacing.sm,
  },
  instructionText: {
    color: theme.colors.info.dark,
    fontSize: theme.typography.size.sm,
    lineHeight: 18,
  },
  stepNumber: {
    fontWeight: theme.typography.weight.bold,
  },
  stepContainer: {
    marginRight: theme.spacing.xs,
  },
  instructionTextContainer: {
    flex: 1,
  },
  instructionsTitle: {
    color: theme.colors.info.dark,
    fontSize: theme.typography.size.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  stepNumberText: {
    color: theme.colors.info.dark,
    fontSize: theme.typography.size.sm,
    lineHeight: 18,
    fontWeight: theme.typography.weight.bold,
  },
}));

export const PermissionDeniedRecoveryModal: FC<
  PermissionDeniedRecoveryModalProps
> = ({ visible, onTryAgain, onOpenSettings, onCancel, isBlocked = false }) => {
  const styles = useStyles();
  const { theme } = useTheme();

  const alternatives = [
    {
      icon: 'clipboard',
      iconFamily: 'Feather' as const,
      title: 'Paste from Clipboard',
      description: 'Copy wallet addresses and paste them directly into the app',
    },
    {
      icon: 'type',
      iconFamily: 'Feather' as const,
      title: 'Manual Entry',
      description: 'Type wallet addresses manually with built-in validation',
    },
    {
      icon: 'book',
      iconFamily: 'Feather' as const,
      title: 'Address Book',
      description: 'Save frequently used addresses for quick access',
    },
  ];

  const getInstructions = (): string[] =>
    Platform.OS === 'ios'
      ? [
          'Open Settings app',
          'Scroll down and tap "Lumen"',
          'Tap "Camera" to enable permission',
          'Return to Lumen app',
        ]
      : [
          'Open Settings app',
          'Go to "Apps" or "Application Manager"',
          'Find and tap "Lumen"',
          'Tap "Permissions"',
          'Enable "Camera" permission',
        ];

  const title = isBlocked
    ? 'Camera Access Blocked'
    : 'Camera Permission Denied';
  const subtitle = isBlocked
    ? 'Camera permission has been permanently denied. You can enable it in Settings or use alternative methods below.'
    : 'Camera permission is required for QR scanning. You can try again or use alternative methods below.';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <VStack style={styles.modal}>
        <VStack style={styles.container}>
          {/* Header */}
          <VStack style={styles.header}>
            <VStack style={styles.iconContainer}>
              <Icon
                name={isBlocked ? 'x-circle' : 'camera-off'}
                family="Feather"
                size="xl"
                color={theme.colors.warning.main}
              />
            </VStack>
            <H1 style={styles.title}>{title}</H1>
            <Body1 style={styles.subtitle}>{subtitle}</Body1>
          </VStack>

          {/* Content */}
          <ContentWrapper variant="body" style={styles.content}>
            {isBlocked && (
              <VStack style={styles.instructionsContainer}>
                <H2 style={styles.instructionsTitle}>
                  How to enable camera permission:
                </H2>
                {getInstructions().map((instruction, index) => (
                  <HStack key={index} style={styles.instructionStep}>
                    <VStack style={styles.stepContainer}>
                      <Body1 style={styles.stepNumberText}>{index + 1}.</Body1>
                    </VStack>
                    <VStack style={styles.instructionTextContainer}>
                      <Body1 style={styles.instructionText}>
                        {instruction}
                      </Body1>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            )}

            <VStack style={styles.alternativeSection}>
              <H2 style={styles.alternativeTitle}>Alternative Methods</H2>

              {alternatives.map((alternative, index) => (
                <HStack key={index} style={styles.alternativeItem}>
                  <VStack style={styles.alternativeIconContainer}>
                    <Icon
                      name={alternative.icon}
                      family={alternative.iconFamily}
                      size="md"
                      color={theme.colors.primary.main}
                    />
                  </VStack>
                  <VStack style={styles.alternativeTextContainer}>
                    <Body1 style={styles.alternativeItemTitle}>
                      {alternative.title}
                    </Body1>
                    <Body1 style={styles.alternativeItemDescription}>
                      {alternative.description}
                    </Body1>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </ContentWrapper>

          {/* Footer */}
          <ContentWrapper variant="footer" style={styles.footer}>
            <VStack spacing="sm">
              {isBlocked ? (
                <>
                  <ButtonRegular
                    onPress={onOpenSettings}
                    testID="open-settings-button-1"
                    accessibilityLabel="Open device settings to enable camera"
                  >
                    Open Settings
                  </ButtonRegular>
                  <ButtonOutline
                    onPress={onTryAgain}
                    testID="try-again-button-1"
                    accessibilityLabel="Check camera permission again"
                  >
                    Try Again
                  </ButtonOutline>
                </>
              ) : (
                <>
                  <ButtonRegular
                    onPress={onTryAgain}
                    testID="retry-permission-button-1"
                    accessibilityLabel="Request camera permission again"
                  >
                    Try Again
                  </ButtonRegular>
                  <ButtonOutline
                    onPress={onCancel}
                    testID="use-alternatives-button-1"
                    accessibilityLabel="Continue without camera permission"
                  >
                    Use Alternatives
                  </ButtonOutline>
                </>
              )}
              <ButtonGhost
                onPress={onCancel}
                testID="cancel-permission-button-1"
                accessibilityLabel="Cancel and return to previous screen"
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
