import React, { type FC } from 'react';

import { makeStyles, useTheme } from '../../theme';
import { ButtonOutline, ButtonRegular } from '../../ui/buttons';
import { Icon } from '../../ui/icon';
import { ContentWrapper, ScreenWrapper, VStack } from '../../ui/layout';
import { Body1, H2 } from '../../ui/typography';

interface PermissionDeniedStateProps {
  onOpenSettings: () => void;
  onRetryPermission: () => void;
  isBlocked?: boolean;
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  description: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  buttonContainer: {
    width: '100%',
    paddingTop: theme.spacing.lg,
  },
}));

export const PermissionDeniedState: FC<PermissionDeniedStateProps> = ({
  onOpenSettings,
  onRetryPermission,
  isBlocked = false,
}) => {
  const styles = useStyles();
  const { theme } = useTheme();

  const title = isBlocked
    ? 'Camera Access Blocked'
    : 'Camera Permission Required';

  const description = isBlocked
    ? 'Camera access has been permanently denied. Please go to Settings to enable camera permission for this app.'
    : 'This app needs camera access to scan QR codes for wallet addresses and transactions. Please allow camera permission to continue.';

  const primaryButtonText = isBlocked ? 'Open Settings' : 'Allow Camera';
  const primaryButtonAction = isBlocked ? onOpenSettings : onRetryPermission;

  return (
    <ScreenWrapper>
      <ContentWrapper variant="screen" style={styles.container}>
        <VStack spacing="xl" align="center">
          <Icon
            name="camera-off"
            family="MaterialIcons"
            size="xxxl"
            color={theme.colors.text.secondary}
          />

          <VStack spacing="md" align="center">
            <H2 style={styles.title}>{title}</H2>
            <Body1 style={styles.description}>{description}</Body1>
          </VStack>

          <VStack spacing="md" style={styles.buttonContainer}>
            <ButtonRegular
              onPress={primaryButtonAction}
              testID="permission-primary-button-1"
              accessibilityLabel={primaryButtonText}
            >
              {primaryButtonText}
            </ButtonRegular>

            {isBlocked && (
              <ButtonOutline
                onPress={onRetryPermission}
                testID="permission-retry-button-1"
                accessibilityLabel="Try camera permission again"
              >
                Try Again
              </ButtonOutline>
            )}
          </VStack>
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
