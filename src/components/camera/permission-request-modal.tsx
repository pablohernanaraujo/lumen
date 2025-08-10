import React, { type FC, useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, View } from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import { ButtonRegular } from '../../ui/buttons';
import { Icon } from '../../ui/icon';
import { ContentWrapper, HStack, VStack } from '../../ui/layout';
import { Body1, H1, H2 } from '../../ui/typography';

interface PermissionRequestModalProps {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
  title?: string;
  subtitle?: string;
  isRequesting?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const useStyles = makeStyles((theme) => ({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    maxWidth: 360,
    width: SCREEN_WIDTH - 32,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary.light,
  },
  illustrationContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  scanningLine: {
    position: 'absolute',
    width: 100,
    height: 2,
    backgroundColor: theme.colors.success.main,
    opacity: 0.8,
  },
  qrOverlay: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
    borderRadius: 8,
    opacity: 0.4,
  },
  qrCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: theme.colors.success.main,
    borderWidth: 2,
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
  benefitItem: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.success.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semibold,
    marginBottom: theme.spacing.xs,
  },
  benefitDescription: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.size.sm,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  privacyNote: {
    backgroundColor: theme.colors.surfaceSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  privacyText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.size.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  requestingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestingText: {
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
}));

export const PermissionRequestModal: FC<PermissionRequestModalProps> = ({
  visible,
  onAllow,
  onDeny,
  title = 'Allow Camera Access',
  subtitle = 'Enable camera permission to scan QR codes and wallet addresses',
  isRequesting = false,
}) => {
  const styles = useStyles();
  const { theme } = useTheme();

  // Animation for scanning line
  const scanningAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Scanning line animation
      const scanningLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanningAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanningAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      );

      // Pulse animation for the main icon
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );

      scanningLoop.start();
      pulseLoop.start();

      return () => {
        scanningLoop.stop();
        pulseLoop.stop();
      };
    }
  }, [visible, scanningAnimation, pulseAnimation]);

  const benefits = [
    {
      icon: 'qr-code-2',
      iconFamily: 'Feather' as const,
      title: 'Instant QR Scanning',
      description: 'Quickly scan wallet addresses and payment codes',
    },
    {
      icon: 'shield-check',
      iconFamily: 'Feather' as const,
      title: 'Secure & Private',
      description: 'No images stored, only QR codes are processed',
    },
    {
      icon: 'zap',
      iconFamily: 'Feather' as const,
      title: 'Fast Transactions',
      description: 'Skip manual address entry and reduce errors',
    },
  ];

  const scanningLineTranslateY = scanningAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onDeny}
    >
      <VStack style={styles.modal}>
        <VStack style={styles.container}>
          {/* Header with Illustration */}
          <VStack style={styles.header}>
            <VStack style={styles.illustrationContainer}>
              {/* QR Code Overlay */}
              <View style={styles.qrOverlay}>
                {/* QR Code Corners */}
                <View
                  style={[
                    styles.qrCorner,
                    {
                      top: -2,
                      left: -2,
                      borderRightWidth: 0,
                      borderBottomWidth: 0,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.qrCorner,
                    {
                      top: -2,
                      right: -2,
                      borderLeftWidth: 0,
                      borderBottomWidth: 0,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.qrCorner,
                    {
                      bottom: -2,
                      left: -2,
                      borderRightWidth: 0,
                      borderTopWidth: 0,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.qrCorner,
                    {
                      bottom: -2,
                      right: -2,
                      borderLeftWidth: 0,
                      borderTopWidth: 0,
                    },
                  ]}
                />

                {/* Animated Scanning Line */}
                <Animated.View
                  style={[
                    styles.scanningLine,
                    {
                      transform: [{ translateY: scanningLineTranslateY }],
                    },
                  ]}
                />
              </View>

              {/* Main Camera Icon */}
              <Animated.View
                style={[
                  styles.mainIcon,
                  {
                    transform: [{ scale: pulseAnimation }],
                  },
                ]}
              >
                <Icon
                  name="camera"
                  family="Feather"
                  size="xl"
                  color="#FFFFFF"
                />
              </Animated.View>
            </VStack>

            <H1 style={styles.title}>{title}</H1>
            <Body1 style={styles.subtitle}>{subtitle}</Body1>
          </VStack>

          {/* Content */}
          <ContentWrapper variant="body" style={styles.content}>
            <VStack spacing="md">
              <H2 style={{ color: theme.colors.text.primary }}>
                What you can do:
              </H2>

              {benefits.map((benefit, index) => (
                <HStack key={index} style={styles.benefitItem}>
                  <VStack style={styles.benefitIconContainer}>
                    <Icon
                      name={benefit.icon}
                      family={benefit.iconFamily}
                      size="md"
                      color={theme.colors.success.main}
                    />
                  </VStack>
                  <VStack style={styles.benefitTextContainer}>
                    <Body1 style={styles.benefitTitle}>{benefit.title}</Body1>
                    <Body1 style={styles.benefitDescription}>
                      {benefit.description}
                    </Body1>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </ContentWrapper>

          {/* Footer */}
          <ContentWrapper variant="footer" style={styles.footer}>
            <VStack style={styles.privacyNote}>
              <HStack spacing="sm" align="center" textAlign="center">
                <Icon
                  name="lock"
                  family="Feather"
                  size="sm"
                  color={theme.colors.text.secondary}
                />
                <Body1 style={styles.privacyText}>
                  Camera is only used for QR scanning. No photos or videos are
                  saved.
                </Body1>
              </HStack>
            </VStack>

            <VStack spacing="sm">
              <ButtonRegular
                onPress={onAllow}
                testID="permission-allow-button-1"
                accessibilityLabel="Allow camera access for scanning"
                disabled={isRequesting}
              >
                Allow Camera Access
              </ButtonRegular>

              <ButtonRegular
                variant="secondary"
                onPress={onDeny}
                testID="permission-deny-button-1"
                accessibilityLabel="Skip camera permission"
                disabled={isRequesting}
              >
                Not Now
              </ButtonRegular>
            </VStack>
          </ContentWrapper>

          {/* Requesting Overlay */}
          {isRequesting && (
            <VStack style={styles.requestingOverlay}>
              <Icon
                name="camera"
                family="Feather"
                size="xl"
                color={theme.colors.primary.main}
              />
              <Body1 style={styles.requestingText}>
                Processing permission request...
              </Body1>
            </VStack>
          )}
        </VStack>
      </VStack>
    </Modal>
  );
};
