import type { ReactNode } from 'react';
import type { TextStyle } from 'react-native';

import type { baseTokens } from '../../theme/tokens';
import type { TextColorKeys } from '../../theme/types';

export type EmphasisLevel = keyof typeof baseTokens.emphasis;

export interface BaseTypographyProps {
  children: ReactNode;
  emphasis?: EmphasisLevel;
  color?: TextColorKeys;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle;
  testID?: string;
}

export interface H1Props extends BaseTypographyProps {}

export interface H2Props extends BaseTypographyProps {}

export interface H3Props extends BaseTypographyProps {}

export interface Body1Props extends BaseTypographyProps {}

export interface Body2Props extends BaseTypographyProps {}

export type FontWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';

export interface Body3Props extends BaseTypographyProps {
  fontWeight?: FontWeight;
}
