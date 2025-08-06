import React, { type FC } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { useTheme } from '../../theme';
import type { ButtonGhostProps } from './types';

export const ButtonGhost: FC<ButtonGhostProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  testID,
  onPress,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  const getVariantColors = (): {
    textColor: string;
    pressedBackgroundColor: string;
  } => {
    switch (variant) {
      case 'primary':
        return {
          textColor: theme.colors.primary.main,
          pressedBackgroundColor: `${theme.colors.primary.main}10`,
        };
      case 'secondary':
        return {
          textColor: theme.colors.secondary.main,
          pressedBackgroundColor: `${theme.colors.secondary.main}10`,
        };
      case 'danger':
        return {
          textColor: theme.colors.error.main,
          pressedBackgroundColor: `${theme.colors.error.main}10`,
        };
      case 'success':
        return {
          textColor: theme.colors.success.main,
          pressedBackgroundColor: `${theme.colors.success.main}10`,
        };
      case 'backgroundless':
        return {
          textColor: theme.colors.text.primary,
          pressedBackgroundColor: `${theme.colors.text.primary}10`,
        };
      default:
        return {
          textColor: theme.colors.primary.main,
          pressedBackgroundColor: `${theme.colors.primary.main}10`,
        };
    }
  };

  const colors = getVariantColors();
  const fontSize = theme.typography.size[size];
  const isDisabled = disabled || loading;

  const buttonStyles = StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: 44,
      opacity: isDisabled ? theme.opacity.disabled : 1,
      width: fullWidth ? '100%' : undefined,
    },
    text: {
      color: colors.textColor,
      fontSize,
      fontWeight: theme.typography.weight.bold,
      fontFamily: theme.typography.family.regular,
      lineHeight: theme.typography.lineHeight.normal * fontSize,
    },
    loadingIndicator: {
      marginRight: theme.spacing.sm,
    },
  });

  return (
    <TouchableOpacity
      style={[buttonStyles.container, style]}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={colors.textColor}
          style={buttonStyles.loadingIndicator}
        />
      )}
      <Text style={[buttonStyles.text, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};
