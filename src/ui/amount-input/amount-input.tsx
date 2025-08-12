import React, { type FC, useCallback, useMemo, useRef, useState } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import {
  Animated,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import {
  formatNumberLocale,
  parseLocaleNumber,
  sanitizeAmountInput,
} from '../../utils/number-format';
import { Icon } from '../icon';

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

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  containerFocused: {
    borderColor: theme.colors.primary.main,
  },
  editIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.size.md,
    fontFamily: theme.typography.family.regular,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.xs,
  },
  clearButton: {
    marginLeft: theme.spacing.xs,
    padding: theme.spacing.xs,
    borderRadius: theme.radii.round,
  },
}));

export const AmountInput: FC<AmountInputProps> = ({
  value,
  onChange,
  locale,
  maxFractionDigits,
  placeholder = '0',
  style,
  inputStyle,
  testID,
  editable = true,
  showEditIcon = true,
}) => {
  const styles = useStyles();
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleFocus = (): void => setIsFocused(true);
  const handleBlur = (): void => setIsFocused(false);

  const emitChange = useCallback(
    (text: string): void => {
      const sanitized = sanitizeAmountInput(text, {
        locale,
        maxFractionDigits,
      });
      const numeric = parseLocaleNumber(sanitized, locale);
      onChange(sanitized, numeric);
    },
    [locale, maxFractionDigits, onChange],
  );

  const handleClear = (): void => {
    onChange('', null);
    inputRef.current?.focus();
  };

  // Helper function to format display value (reduces complexity)
  const formatDisplayValue = useCallback(
    (inputValue: string, numeric: number): string => {
      const decimalPlaces = inputValue.includes('.')
        ? inputValue.split('.')[1]?.length || 0
        : 0;
      const effectiveMaxDigits = Math.min(decimalPlaces, maxFractionDigits);
      const isSmallDecimal = numeric > 0 && numeric < 1;
      const hasMultipleDecimalPlaces = decimalPlaces > 2;

      // iOS-specific fix: For very small decimal numbers, bypass Intl.NumberFormat completely
      if (Platform.OS === 'ios' && isSmallDecimal && numeric < 0.001) {
        return inputValue;
      }

      return formatNumberLocale(numeric, {
        locale,
        maximumFractionDigits: effectiveMaxDigits,
        minimumFractionDigits:
          isSmallDecimal && hasMultipleDecimalPlaces
            ? effectiveMaxDigits
            : undefined,
        useGrouping: !(isSmallDecimal && hasMultipleDecimalPlaces),
        preserveLeadingZeros: isSmallDecimal && hasMultipleDecimalPlaces,
      });
    },
    [locale, maxFractionDigits],
  );

  const displayValue = useMemo(() => {
    if (!value) return '';
    if (isFocused) return value; // avoid grouping while typing

    const numeric = parseLocaleNumber(value, locale);
    if (numeric === null) return value;

    return formatDisplayValue(value, numeric);
  }, [formatDisplayValue, isFocused, locale, value]);

  return (
    <Animated.View
      style={[
        styles.container,
        isFocused ? styles.containerFocused : null,
        style,
      ]}
      testID={testID}
    >
      {showEditIcon && (
        <View style={styles.editIcon}>
          <Icon
            name="edit"
            family="MaterialIcons"
            size={18}
            color={
              isFocused
                ? theme.colors.primary.main
                : theme.colors.text.secondary
            }
          />
        </View>
      )}

      <TextInput
        ref={inputRef}
        style={[styles.input, inputStyle]}
        value={displayValue}
        onChangeText={emitChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        editable={editable}
        keyboardType="decimal-pad"
        inputMode="decimal"
        contextMenuHidden={false}
        autoCorrect={false}
        autoCapitalize="none"
        allowFontScaling
        // Ensure only one decimal separator
        // The sanitize util already enforces rules; no need for onKeyPress handling
      />

      <TouchableOpacity
        onPress={handleClear}
        style={styles.clearButton}
        accessibilityLabel="Clear amount"
        accessibilityHint="Clear the amount input"
        accessibilityRole="button"
        disabled={!value?.length}
      >
        <Icon
          name="clear"
          family="MaterialIcons"
          size={18}
          color={
            value?.length
              ? theme.colors.text.secondary
              : theme.colors.text.tertiary
          }
        />
      </TouchableOpacity>
    </Animated.View>
  );
};
