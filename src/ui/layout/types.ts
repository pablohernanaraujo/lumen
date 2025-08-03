import type { ReactNode } from 'react';
import type { ScrollViewProps, ViewStyle } from 'react-native';

import type { Theme } from '../../theme';

export type SpacingSize = keyof Theme['spacing'];

export interface ContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  scrollViewProps?: Omit<ScrollViewProps, 'children'>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export interface ScreenWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
}

export type ContentWrapperVariant = 'screen' | 'header' | 'body' | 'footer';

export interface ContentWrapperProps {
  children: ReactNode;
  variant?: ContentWrapperVariant;
  borderless?: boolean;
  style?: ViewStyle;
}

export interface VStackProps {
  children: ReactNode;
  spacing?: SpacingSize;
  style?: ViewStyle;
}

export interface HStackProps {
  children?: ReactNode;
  spacing?: SpacingSize;
  style?: ViewStyle;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
}
