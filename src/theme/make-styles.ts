import { StyleSheet } from 'react-native';

import { useTheme } from './theme-provider';
import type { NamedStyles, StylesOrFunction, Theme } from './types';

export const makeStyles =
  <T extends NamedStyles<T>>(
    factory: StylesOrFunction<T>,
  ): (() => StyleSheet.NamedStyles<T>) =>
  (): StyleSheet.NamedStyles<T> => {
    const { theme } = useTheme();

    const styles =
      typeof factory === 'function'
        ? (factory as (theme: Theme) => T)(theme)
        : factory;

    return StyleSheet.create(styles);
  };
