import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type AmountInputProps = {
  value: string;
  onChange: (text: string, numericValue?: number | null) => void;
  locale?: string;
  maxFractionDigits: number;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  testID?: string;
  editable?: boolean;
  showEditIcon?: boolean;
};
