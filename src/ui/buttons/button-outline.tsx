import React, { type FC } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { useTheme } from '../../theme';
import type { ButtonOutlineProps } from './types';

export const ButtonOutline: FC<ButtonOutlineProps> = ({
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

  const getVariantColors = (): { borderColor: string; textColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          borderColor: theme.colors.primary.main,
          textColor: theme.colors.primary.main,
        };
      case 'secondary':
        return {
          borderColor: theme.colors.secondary.main,
          textColor: theme.colors.secondary.main,
        };
      case 'danger':
        return {
          borderColor: theme.colors.error.main,
          textColor: theme.colors.error.main,
        };
      case 'success':
        return {
          borderColor: theme.colors.success.main,
          textColor: theme.colors.success.main,
        };
      default:
        return {
          borderColor: theme.colors.primary.main,
          textColor: theme.colors.primary.main,
        };
    }
  };

  const colors = getVariantColors();
  const fontSize = theme.typography.size[size];
  const isDisabled = disabled || loading;

  const buttonStyles = StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderColor: colors.borderColor,
      borderWidth: 1,
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
      fontWeight: theme.typography.weight.medium,
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
