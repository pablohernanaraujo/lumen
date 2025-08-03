import { Platform, type TextStyle, type ViewStyle } from 'react-native';

import type { Theme } from './types';

export const createShadow = (
  theme: Theme,
  level: 'sm' | 'md' | 'lg',
): ViewStyle => {
  if (Platform.OS === 'ios') {
    return theme.shadows[level];
  }

  return {
    elevation: theme.shadows[level].elevation,
  };
};

export const createTextStyle = (
  theme: Theme,
  options: {
    size: keyof Theme['typography']['size'];
    weight: keyof Theme['typography']['weight'];
    color: string;
  },
): TextStyle => ({
  fontSize: theme.typography.size[options.size],
  fontWeight: theme.typography.weight[options.weight],
  color: options.color,
  fontFamily: theme.typography.family.regular,
});

export const createButtonStyle = (
  theme: Theme,
  variant: 'primary' | 'secondary' | 'outline' = 'primary',
): ViewStyle => {
  const baseStyle: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // iOS accessibility minimum
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.primary.main,
        ...createShadow(theme, 'sm'),
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.secondary.main,
        ...createShadow(theme, 'sm'),
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
      };
    default:
      return baseStyle;
  }
};

export const createCardStyle = (theme: Theme): ViewStyle => ({
  backgroundColor: theme.colors.surface,
  borderRadius: theme.radii.lg,
  padding: theme.spacing.md,
  ...createShadow(theme, 'md'),
  borderWidth: Platform.select({
    ios: 0,
    android: 1,
  }),
  borderColor: theme.colors.border,
});

export const createInputStyle = (theme: Theme): TextStyle & ViewStyle => ({
  backgroundColor: theme.colors.surface,
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: theme.radii.md,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.sm,
  fontSize: theme.typography.size.md,
  color: theme.colors.text.primary,
  minHeight: 44, // iOS accessibility minimum
});

export const getColorOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const alpha = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0');
    return `#${hex}${alpha}`;
  }

  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  }

  return color;
};

export const isLightColor = (color: string): boolean => {
  const hex = color.replace('#', '');
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

export const getContrastColor = (backgroundColor: string): string =>
  isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
