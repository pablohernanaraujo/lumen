import React, { type FC, type ReactNode, useEffect } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import type { RootStackParamList } from '../../../routing/types';
import { qrErrorService } from '../../../services/qr-error-service';
import { makeStyles, useTheme } from '../../../theme';
import {
  getErrorActions,
  QR_ERROR_CONFIGS,
  QrErrorSeverity,
  QrErrorType,
} from '../../../types/qr-error-types';
import { ButtonGhost, ButtonOutline, ButtonRegular } from '../../../ui/buttons';
import { Icon } from '../../../ui/icon';
import {
  Container,
  ContentWrapper,
  HStack,
  ScreenWrapper,
  VStack,
} from '../../../ui/layout';
import { Body1, Body2, H2 } from '../../../ui/typography';

type ScannerErrorModalRouteProp = RouteProp<
  RootStackParamList,
  'ScannerErrorModal'
>;

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconContainerError: {
    backgroundColor: theme.colors.error.light,
  },
  iconContainerWarning: {
    backgroundColor: theme.colors.warning.light,
  },
  iconContainerInfo: {
    backgroundColor: theme.colors.info.light,
  },
  title: {
    textAlign: 'center',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  message: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  suggestion: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.lg,
  },
  helpSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  helpTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  helpIcon: {
    marginRight: theme.spacing.xs,
    marginTop: 2,
  },
  helpText: {
    flex: 1,
    color: theme.colors.text.secondary,
  },
  actionContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  primaryButton: {
    marginBottom: theme.spacing.sm,
  },
  secondaryButtons: {
    gap: theme.spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  debugInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  debugText: {
    fontSize: 10,
    color: theme.colors.text.tertiary,
    fontFamily: 'monospace',
  },
}));

const getIconForSeverity = (severity: QrErrorSeverity): string => {
  switch (severity) {
    case QrErrorSeverity.ERROR:
      return 'alert-triangle';
    case QrErrorSeverity.WARNING:
      return 'alert-circle';
    case QrErrorSeverity.INFO:
    default:
      return 'info';
  }
};

const getIconColorForSeverity = (
  severity: QrErrorSeverity,
  theme: {
    colors: {
      error: { main: string };
      warning: { main: string };
      info: { main: string };
    };
  },
): string => {
  switch (severity) {
    case QrErrorSeverity.ERROR:
      return theme.colors.error.main;
    case QrErrorSeverity.WARNING:
      return theme.colors.warning.main;
    case QrErrorSeverity.INFO:
    default:
      return theme.colors.info.main;
  }
};

export const ScannerErrorModalScreen: FC = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ScannerErrorModalRouteProp>();

  const {
    errorType,
    errorMessage,
    errorDetails,
    scanDuration,
    attemptNumber,
    onRetry,
    onManualEntry,
    onHelp,
    onCancel,
  } = route.params || {};

  const errorConfig = QR_ERROR_CONFIGS[errorType];
  const actions = getErrorActions(errorType);

  useEffect(() => {
    // Log error for analytics
    qrErrorService.logError(errorType, {
      scanDuration,
      attemptNumber,
      errorDetails,
    });
  }, [errorType, scanDuration, attemptNumber, errorDetails]);

  const handleAction = (actionType: string): void => {
    switch (actionType) {
      case 'retry':
        navigation.goBack();
        onRetry?.();
        break;
      case 'manual':
        navigation.goBack();
        onManualEntry?.();
        break;
      case 'help':
        onHelp?.();
        break;
      case 'settings':
        Linking.openSettings();
        break;
      case 'cancel':
      default:
        navigation.goBack();
        onCancel?.();
        break;
    }
  };

  const renderHelpTips = (): ReactNode => {
    if (
      errorType === QrErrorType.SCAN_TIMEOUT ||
      errorType === QrErrorType.CAMERA_ERROR
    ) {
      return (
        <View style={styles.helpSection}>
          <H2 style={styles.helpTitle}>Scanning Tips</H2>
          <View style={styles.helpItem}>
            <Icon
              name="check-circle"
              size={16}
              color={theme.theme.colors.success.main}
              style={styles.helpIcon}
            />
            <Body2 style={styles.helpText}>
              Position the QR code within the scanning frame
            </Body2>
          </View>
          <View style={styles.helpItem}>
            <Icon
              name="check-circle"
              size={16}
              color={theme.theme.colors.success.main}
              style={styles.helpIcon}
            />
            <Body2 style={styles.helpText}>
              Ensure good lighting and avoid shadows
            </Body2>
          </View>
          <View style={styles.helpItem}>
            <Icon
              name="check-circle"
              size={16}
              color={theme.theme.colors.success.main}
              style={styles.helpIcon}
            />
            <Body2 style={styles.helpText}>
              Hold your device steady at about 6-8 inches away
            </Body2>
          </View>
          <View style={styles.helpItem}>
            <Icon
              name="check-circle"
              size={16}
              color={theme.theme.colors.success.main}
              style={styles.helpIcon}
            />
            <Body2 style={styles.helpText}>
              Clean your camera lens if the image appears blurry
            </Body2>
          </View>
        </View>
      );
    }
    return null;
  };

  const getIconContainerStyle = (): object[] => {
    switch (errorConfig.severity) {
      case QrErrorSeverity.ERROR:
        return [styles.iconContainer, styles.iconContainerError];
      case QrErrorSeverity.WARNING:
        return [styles.iconContainer, styles.iconContainerWarning];
      case QrErrorSeverity.INFO:
      default:
        return [styles.iconContainer, styles.iconContainerInfo];
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <ContentWrapper variant="body">
          <View style={getIconContainerStyle()}>
            <Icon
              name={getIconForSeverity(errorConfig.severity)}
              size={32}
              color={getIconColorForSeverity(errorConfig.severity, theme.theme)}
            />
          </View>

          <H2 style={styles.title}>{errorConfig.title}</H2>

          <Body1 style={styles.message}>
            {errorMessage || errorConfig.message}
          </Body1>

          {errorConfig.suggestion && (
            <Body2 style={styles.suggestion}>
              💡 {qrErrorService.getSuggestedAction(errorType)}
            </Body2>
          )}

          {renderHelpTips()}

          {__DEV__ && errorDetails && (
            <View style={styles.debugInfo}>
              <Body2 style={styles.debugText}>
                Debug: {errorDetails}
                {scanDuration && ` | Duration: ${scanDuration}ms`}
                {attemptNumber && ` | Attempt: ${attemptNumber}`}
              </Body2>
            </View>
          )}
        </ContentWrapper>
      </ScrollView>

      <ContentWrapper variant="footer">
        <VStack spacing="sm">
          {actions
            .filter((action) => action.isPrimary)
            .map((action) => (
              <ButtonRegular
                key={action.type}
                onPress={() => handleAction(action.type)}
                testID={`action-${action.type}`}
                fullWidth
              >
                {action.label}
              </ButtonRegular>
            ))}

          {actions
            .filter((action) => !action.isPrimary && action.type !== 'cancel')
            .map((action) => (
              <ButtonOutline
                key={action.type}
                onPress={() => handleAction(action.type)}
                testID={`action-${action.type}`}
                fullWidth
              >
                {action.label}
              </ButtonOutline>
            ))}

          {actions
            .filter((action) => action.type === 'cancel')
            .map((action) => (
              <ButtonGhost
                key={action.type}
                onPress={() => handleAction(action.type)}
                testID={`action-${action.type}`}
                fullWidth
              >
                {action.label}
              </ButtonGhost>
            ))}
        </VStack>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
