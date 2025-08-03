import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import type { colorTokens } from './colors';
import type { baseTokens } from './tokens';

export type Mode = keyof typeof colorTokens;

export type BaseTokens = typeof baseTokens;

export type ColorTokens = typeof colorTokens;

export type ThemeColors = (typeof colorTokens)[keyof typeof colorTokens];

export type Theme = BaseTokens & {
  colors: ThemeColors;
  mode: Mode;
};

export type StyleFunction<T> = (theme: Theme) => T;

export type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export type StylesOrFunction<T extends NamedStyles<T>> = T | StyleFunction<T>;

export interface ThemeContextValue {
  theme: Theme;
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  preference?: Mode;
  persistenceKey?: string;
}
