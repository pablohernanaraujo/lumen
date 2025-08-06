import type { ReactNode } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';

import type { Theme } from '../../theme';
import type { IconFamily, IconProps } from '../icon';

export type ButtonSize = keyof Theme['typography']['size'];

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'backgroundless';

export interface BaseButtonProps {
  children?: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  onPress?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  iconName?: string;
  iconFamily?: IconFamily;
  iconSize?: IconProps['size'];
  iconColor?: string;
  iconPosition?: 'left' | 'right';
  iconStyle?: ViewStyle;
}

export interface ButtonRegularProps extends BaseButtonProps {
  children: ReactNode;
}

export interface ButtonOutlineProps extends BaseButtonProps {
  children: ReactNode;
}

export interface ButtonLinkProps extends BaseButtonProps {
  children: ReactNode;
  underline?: boolean;
  inline?: boolean;
}

export interface ButtonGhostProps extends BaseButtonProps {
  children: ReactNode;
}

export interface ButtonIconProps extends Omit<BaseButtonProps, 'children'> {
  name: string;
  family?: IconFamily;
  iconSize?: IconProps['size'];
  iconColor?: string;
}
