import React, { type FC } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '../../theme';
import { Icon } from '../icon';
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
  iconName,
  iconFamily,
  iconSize,
  iconColor,
  iconPosition = 'left',
  iconStyle,
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
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    leftIcon: {
      marginRight: theme.spacing.sm,
    },
    rightIcon: {
      marginLeft: theme.spacing.sm,
    },
  });

  const renderIcon = (
    position: 'left' | 'right',
  ): React.ReactElement | null => {
    if (!iconName || loading || iconPosition !== position) {
      return null;
    }

    const iconMarginStyle =
      position === 'left' ? buttonStyles.leftIcon : buttonStyles.rightIcon;

    return (
      <View style={[buttonStyles.iconContainer, iconMarginStyle, iconStyle]}>
        <Icon
          name={iconName}
          family={iconFamily}
          size={iconSize || size}
          color={iconColor || colors.textColor}
          testID={testID ? `${testID}-icon` : undefined}
        />
      </View>
    );
  };

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
      {renderIcon('left')}
      <Text style={[buttonStyles.text, textStyle]}>{children}</Text>
      {renderIcon('right')}
    </TouchableOpacity>
  );
};
