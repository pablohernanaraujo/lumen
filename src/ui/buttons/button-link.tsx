import React, { type FC } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { useTheme } from '../../theme';
import type { ButtonLinkProps } from './types';

// eslint-disable-next-line complexity
export const ButtonLink: FC<ButtonLinkProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false,
  underline = false,
  inline = false,
  style,
  textStyle,
  testID,
  onPress,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  // Simplified color mapping
  const colorMap = {
    primary: theme.colors.primary.main,
    secondary: theme.colors.secondary.main,
    danger: theme.colors.error.main,
    success: theme.colors.success.main,
    backgroundless: theme.colors.text.primary,
  };

  const textColor = colorMap[variant] || theme.colors.primary.main;
  const fontSize = theme.typography.size[size];
  const isDisabled = disabled || loading;

  const buttonStyles = StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingVertical: inline ? 0 : theme.spacing.sm,
      paddingHorizontal: inline ? 0 : theme.spacing.xs,
      opacity: isDisabled ? theme.opacity.disabled : 1,
    },
    text: {
      color: textColor,
      fontSize,
      fontWeight: theme.typography.weight.regular,
      fontFamily: theme.typography.family.regular,
      lineHeight: theme.typography.lineHeight.normal * fontSize,
      textDecorationLine: underline ? 'underline' : 'none',
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
          color={textColor}
          style={buttonStyles.loadingIndicator}
        />
      )}
      <Text style={[buttonStyles.text, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};
