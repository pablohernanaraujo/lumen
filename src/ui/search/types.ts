import type { ViewStyle } from 'react-native';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: ViewStyle;
  testID?: string;
  autoFocus?: boolean;
  editable?: boolean;
}

export interface UseDebounceOptions {
  delay: number;
}

export interface UseDebounceResult<T> {
  debouncedValue: T;
  isDebouncing: boolean;
}
