import { useEffect, useState } from 'react';

import type { UseDebounceOptions, UseDebounceResult } from './types';

export const useDebounce = <T>(
  value: T,
  options: UseDebounceOptions,
): UseDebounceResult<T> => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  useEffect(() => {
    if (value === debouncedValue) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, options.delay);

    return (): void => {
      clearTimeout(handler);
    };
  }, [value, options.delay, debouncedValue]);

  return {
    debouncedValue,
    isDebouncing,
  };
};
