import React, { type FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import { ButtonIcon } from '../../ui/buttons';
import { Body2 } from '../../ui/typography';

interface ScannerOverlayProps {
  onFlashlightToggle: () => void;
  onHistoryPress: () => void;
  onPastePress: () => void;
  isFlashlightOn: boolean;
  isScanning: boolean;
}

const SCAN_AREA_SIZE = 250;
const CORNER_SIZE = 20;
const CORNER_WIDTH = 4;

const useStyles = makeStyles((theme) => ({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    marginTop: -SCAN_AREA_SIZE / 2,
    marginLeft: -SCAN_AREA_SIZE / 2,
  },
  scanHole: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    backgroundColor: 'transparent',
    borderRadius: theme.radii.md,
  },
  scanCorners: {
    ...StyleSheet.absoluteFillObject,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopColor: theme.colors.primary.main,
    borderLeftColor: theme.colors.primary.main,
    borderTopLeftRadius: theme.radii.md,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopColor: theme.colors.primary.main,
    borderRightColor: theme.colors.primary.main,
    borderTopRightRadius: theme.radii.md,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomColor: theme.colors.primary.main,
    borderLeftColor: theme.colors.primary.main,
    borderBottomLeftRadius: theme.radii.md,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomColor: theme.colors.primary.main,
    borderRightColor: theme.colors.primary.main,
    borderBottomRightRadius: theme.radii.md,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: '25%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  instructionText: {
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.sm,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  scanningIndicator: {
    position: 'absolute',
    top: SCAN_AREA_SIZE / 2 - 1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.primary.main,
    opacity: 0.8,
  },
}));

export const ScannerOverlay: FC<ScannerOverlayProps> = ({
  onFlashlightToggle,
  onHistoryPress,
  onPastePress,
  isFlashlightOn,
  isScanning,
}) => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.scanArea} pointerEvents="none">
        <View style={styles.scanHole} />
        <View style={styles.scanCorners}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>
        {isScanning && <View style={styles.scanningIndicator} />}
      </View>

      <View style={styles.instructionsContainer} pointerEvents="none">
        <Body2 style={styles.instructionText}>
          {isScanning
            ? 'Position QR code within the frame to scan'
            : 'Processing...'}
        </Body2>
      </View>

      <View style={styles.controlsContainer}>
        <ButtonIcon
          name={isFlashlightOn ? 'flash-on' : 'flash-off'}
          family="MaterialIcons"
          variant={isFlashlightOn ? 'primary' : 'backgroundless'}
          iconColor="#FFFFFF"
          size="md"
          testID="flashlight-button-1"
          onPress={onFlashlightToggle}
          accessibilityLabel={
            isFlashlightOn ? 'Turn off flashlight' : 'Turn on flashlight'
          }
        />

        <ButtonIcon
          name="history"
          family="MaterialIcons"
          variant="backgroundless"
          iconColor="#FFFFFF"
          size="md"
          testID="history-button-1"
          onPress={onHistoryPress}
          accessibilityLabel="View scan history"
        />

        <ButtonIcon
          name="content-paste"
          family="MaterialIcons"
          variant="backgroundless"
          iconColor="#FFFFFF"
          size="md"
          testID="paste-button-1"
          onPress={onPastePress}
          accessibilityLabel="Paste QR data"
        />
      </View>
    </View>
  );
};
