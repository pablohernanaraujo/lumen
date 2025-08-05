import React, { type FC } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { useTheme } from '../../theme';
import { Icon } from '../icon';
import type { ButtonIconProps } from './types';

export const ButtonIcon: FC<ButtonIconProps> = ({
  name,
  family = 'MaterialIcons',
  size = 'md',
  variant = 'primary',
  disabled = false,
  iconSize,
  iconColor,
  style,
  testID,
  onPress,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  const getVariantColors = (): {
    backgroundColor: string;
    iconColor: string;
  } => {
    if (variant === 'backgroundless') {
      return {
        backgroundColor: 'transparent',
        iconColor: theme.colors.text.primary,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary.main,
          iconColor: theme.colors.text.inverse,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary.main,
          iconColor: theme.colors.text.inverse,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error.main,
          iconColor: theme.colors.text.inverse,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success.main,
          iconColor: theme.colors.text.inverse,
        };
      default:
        return {
          backgroundColor: theme.colors.primary.main,
          iconColor: theme.colors.text.inverse,
        };
    }
  };

  const colors = getVariantColors();
  const buttonSize = theme.typography.size[size];
  const finalIconSize = iconSize || size;
  const finalIconColor = iconColor || colors.iconColor;
  const isDisabled = disabled;

  const buttonStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundColor,
      borderRadius: theme.radii.md,
      width: buttonSize * 2.5,
      height: buttonSize * 2.5,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isDisabled ? theme.opacity.disabled : 1,
      ...(variant !== 'backgroundless' ? theme.shadows.sm : {}),
    },
  });

  return (
    <TouchableOpacity
      style={[buttonStyles.container, style]}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || `${name} button`}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      <Icon
        name={name}
        family={family}
        size={finalIconSize}
        color={finalIconColor}
        accessible={false}
      />
    </TouchableOpacity>
  );
};
