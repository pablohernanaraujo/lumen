import type { ReactNode } from 'react';
import type { ScrollViewProps, ViewStyle } from 'react-native';

import type { Theme } from '../../theme';

export type SpacingSize = keyof Theme['spacing'];

export interface ContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  scrollViewProps?: Omit<ScrollViewProps, 'children'>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  disableSafeArea?: boolean;
}

export interface ScreenWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
  disableSafeArea?: boolean;
}

export type ContentWrapperVariant = 'screen' | 'header' | 'body' | 'footer';

export interface ContentWrapperProps {
  children: ReactNode;
  variant?: ContentWrapperVariant;
  borderless?: boolean;
  style?: ViewStyle;
}

export type TextAlign = 'left' | 'center' | 'right' | 'space-between';

export interface VStackProps {
  children: ReactNode;
  spacing?: SpacingSize;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  textAlign?: TextAlign;
  style?: ViewStyle;
}

export interface HStackProps {
  children?: ReactNode;
  spacing?: SpacingSize;
  style?: ViewStyle;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  textAlign?: TextAlign;
}
