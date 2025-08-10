import React, { type FC } from 'react';
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import type { RootStackParamList } from '../../../routing/types';
import { makeStyles, useTheme } from '../../../theme';
import { ButtonOutline, ButtonRegular } from '../../../ui/buttons';
import { Icon } from '../../../ui/icon';
import { Container, ContentWrapper, HStack, VStack } from '../../../ui/layout';
import { Body1, H1, H2 } from '../../../ui/typography';

type PermissionEducationModalRouteProp = RouteProp<
  RootStackParamList,
  'PermissionEducationModal'
>;

const useStyles = makeStyles((theme) => ({
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
  },
  featureItem: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  featureIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2, // Align with first line of text
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.weight.semibold,
  },
  featureDescription: {
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
  securityNote: {
    backgroundColor: theme.colors.surfaceSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    marginVertical: theme.spacing.lg,
  },
  securityText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.size.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
}));

export const PermissionEducationModalScreen: FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PermissionEducationModalRouteProp>();
  const styles = useStyles();
  const { theme } = useTheme();

  const { onRequestPermission, onCancel } = route.params || {};

  const handleRequestPermission = (): void => {
    onRequestPermission?.();
    navigation.goBack();
  };

  const handleCancel = (): void => {
    onCancel?.();
    navigation.goBack();
  };

  const features = [
    {
      icon: 'qr-code-scanner',
      iconFamily: 'MaterialIcons' as const,
      title: 'Scan QR Codes',
      description:
        'Quickly scan wallet addresses and transaction QR codes for secure crypto transfers',
    },
    {
      icon: 'flash-on',
      iconFamily: 'MaterialIcons' as const,
      title: 'Built-in Flash',
      description:
        'Use flash for scanning in low-light conditions with automatic brightness adjustment',
    },
    {
      icon: 'history',
      iconFamily: 'MaterialIcons' as const,
      title: 'Scan History',
      description:
        'Keep track of previously scanned addresses and easily reuse them for future transactions',
    },
    {
      icon: 'content-paste',
      iconFamily: 'MaterialIcons' as const,
      title: 'Clipboard Integration',
      description:
        'Automatically process wallet addresses from your clipboard as an alternative to scanning',
    },
  ];

  return (
    <Container disableSafeArea>
      <ContentWrapper variant="header">
        <VStack>
          <VStack style={styles.iconContainer}>
            <Icon name="camera" family="Feather" size={32} color="#FFFFFF" />
          </VStack>
          <H1 style={styles.title}>Camera Permission Required</H1>
          <Body1 style={styles.subtitle}>
            Enable camera access to unlock powerful scanning features
          </Body1>
        </VStack>
      </ContentWrapper>
      <ContentWrapper variant="body" style={styles.content}>
        <VStack spacing="md">
          <H2 style={styles.title}>Why does Lumen need camera access?</H2>

          {features.map((feature, index) => (
            <HStack key={index} style={styles.featureItem}>
              <VStack style={styles.featureIcon}>
                <Icon
                  name={feature.icon}
                  family={feature.iconFamily}
                  size={24}
                  color={theme.colors.primary.main}
                />
              </VStack>
              <VStack style={styles.featureTextContainer}>
                <Body1 style={styles.featureTitle}>{feature.title}</Body1>
                <Body1 style={styles.featureDescription}>
                  {feature.description}
                </Body1>
              </VStack>
            </HStack>
          ))}

          <VStack style={styles.securityNote}>
            <HStack spacing="sm" align="center">
              <Icon
                name="shield-check"
                family="MaterialCommunityIcons"
                size={24}
                color={theme.colors.success.main}
              />
              <Body1 style={styles.securityText}>
                Your privacy is protected. Camera access is only used for QR
                scanning and is never used for recording or storing images.
              </Body1>
            </HStack>
          </VStack>
        </VStack>
      </ContentWrapper>
      <ContentWrapper variant="footer">
        <VStack spacing="sm">
          <ButtonRegular
            onPress={handleRequestPermission}
            testID="allow-camera-button-1"
            accessibilityLabel="Allow camera access for QR scanning"
            fullWidth
          >
            Allow Camera Access
          </ButtonRegular>
          <ButtonOutline
            onPress={handleCancel}
            testID="maybe-later-button-1"
            accessibilityLabel="Skip camera permission for now"
            fullWidth
          >
            Maybe Later
          </ButtonOutline>
        </VStack>
      </ContentWrapper>
    </Container>
  );
};

/*
<VStack style={styles.container}>
      <VStack style={styles.header}>
        <VStack style={styles.iconContainer}>
          <Icon name="camera" family="Feather" size="xxxl" color="#FFFFFF" />
        </VStack>
        <H1 style={styles.title}>Camera Permission Required</H1>
        <Body1 style={styles.subtitle}>
          Enable camera access to unlock powerful scanning features
        </Body1>
      </VStack>

   
      <ContentWrapper variant="body" style={styles.content}>
        <VStack spacing="md">
          <H2 style={{ color: theme.colors.text.primary }}>
            Why does Lumen need camera access?
          </H2>

          {features.map((feature, index) => (
            <HStack key={index} style={styles.featureItem}>
              <VStack style={styles.featureIcon}>
                <Icon
                  name={feature.icon}
                  family={feature.iconFamily}
                  size="lg"
                  color={theme.colors.primary.main}
                />
              </VStack>
              <VStack style={styles.featureTextContainer}>
                <Body1 style={styles.featureTitle}>{feature.title}</Body1>
                <Body1 style={styles.featureDescription}>
                  {feature.description}
                </Body1>
              </VStack>
            </HStack>
          ))}

          <VStack style={styles.securityNote}>
            <HStack spacing="sm" align="center" justify="center">
              <Icon
                name="shield-check"
                family="Feather"
                size="sm"
                color={theme.colors.success.main}
              />
              <Body1 style={styles.securityText}>
                Your privacy is protected. Camera access is only used for QR
                scanning and is never used for recording or storing images.
              </Body1>
            </HStack>
          </VStack>
        </VStack>
      </ContentWrapper>

      
      <ContentWrapper variant="footer" style={styles.footer}>
        <VStack spacing="sm">
          <ButtonRegular
            onPress={handleRequestPermission}
            testID="allow-camera-button-1"
            accessibilityLabel="Allow camera access for QR scanning"
            fullWidth
          >
            Allow Camera Access
          </ButtonRegular>
          <ButtonOutline
            onPress={handleCancel}
            testID="maybe-later-button-1"
            accessibilityLabel="Skip camera permission for now"
            fullWidth
          >
            Maybe Later
          </ButtonOutline>
        </VStack>
      </ContentWrapper>
    </VStack>
*/
