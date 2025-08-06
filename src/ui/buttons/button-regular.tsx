import React, { type FC, type ReactElement } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '../../theme';
import { Icon } from '../icon';
import type { ButtonRegularProps } from './types';

export const ButtonRegular: FC<ButtonRegularProps> = ({
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
    backgroundColor: string;
    textColor: string;
  } => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary.main,
          textColor: theme.colors.text.inverse,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary.main,
          textColor: theme.colors.text.inverse,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error.main,
          textColor: theme.colors.text.inverse,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success.main,
          textColor: theme.colors.text.inverse,
        };
      default:
        return {
          backgroundColor: theme.colors.primary.main,
          textColor: theme.colors.text.inverse,
        };
    }
  };

  const colors = getVariantColors();
  const fontSize = theme.typography.size[size];
  const isDisabled = disabled || loading;

  const buttonStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundColor,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: 44,
      opacity: isDisabled ? theme.opacity.disabled : 1,
      width: fullWidth ? '100%' : undefined,
      ...theme.shadows.sm,
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

  const renderIcon = (position: 'left' | 'right'): ReactElement | null => {
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
