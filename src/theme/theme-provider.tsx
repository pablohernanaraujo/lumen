import React, {
  createContext,
  type FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { colorTokens } from './colors';
import { baseTokens } from './tokens';
import type {
  Mode,
  Theme,
  ThemeContextValue,
  ThemeProviderProps,
} from './types';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  preference,
  persistenceKey = '@lumen-theme',
}) => {
  const systemMode = useColorScheme() as Mode | null;
  const [userMode, setUserMode] = useState<Mode | null>(preference || null);

  const currentMode: Mode = userMode ?? systemMode ?? 'light';

  const theme = useMemo<Theme>(
    () => ({
      ...baseTokens,
      colors: colorTokens[currentMode],
      mode: currentMode,
    }),
    [currentMode],
  );

  const setMode = useCallback((mode: Mode): void => {
    setUserMode(mode);
  }, []);

  const toggleMode = useCallback((): void => {
    setUserMode(currentMode === 'light' ? 'dark' : 'light');
  }, [currentMode]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode: currentMode,
      setMode,
      toggleMode,
    }),
    [theme, currentMode, setMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
