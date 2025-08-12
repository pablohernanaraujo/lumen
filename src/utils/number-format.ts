/* eslint-disable max-statements */
import { Platform } from 'react-native';

export type LocaleSeparators = {
  decimal: string;
  group: string;
};

export const getLocaleSeparators = (locale?: string): LocaleSeparators => {
  // Hermes may not support formatToParts reliably; derive from formatted samples
  const decimalSample = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    useGrouping: false,
  }).format(1.1);
  const groupSample = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(1000);

  const firstNonDigit = (s: string): string | null => {
    for (const ch of s) {
      if (ch < '0' || ch > '9') return ch;
    }
    return null;
  };

  const decimal = firstNonDigit(decimalSample) ?? '.';
  const group = firstNonDigit(groupSample) ?? ',';
  return {
    decimal,
    group,
  };
};

// Helper function for iOS-specific decimal formatting
const formatIOSSmallDecimal = (
  value: number,
  maximumFractionDigits?: number,
): string => {
  const stringValue = value.toString();
  if (stringValue.includes('e')) {
    // Handle scientific notation
    return value.toFixed(maximumFractionDigits || 18).replace(/\.?0+$/, '');
  }
  return stringValue;
};

export const formatNumberLocale = (
  value: number,
  options?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    useGrouping?: boolean;
    preserveLeadingZeros?: boolean;
  },
): string => {
  const {
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
    preserveLeadingZeros = false,
  } = options ?? {};

  const isSmallDecimal = value > 0 && value < 1;

  // iOS-specific handling for very small decimal numbers
  if (Platform.OS === 'ios' && isSmallDecimal && value < 0.001) {
    return formatIOSSmallDecimal(value, maximumFractionDigits);
  }

  const hasSignificantDecimals =
    maximumFractionDigits && maximumFractionDigits > 4;

  let effectiveUseGrouping = useGrouping;
  let effectiveMinFractionDigits = minimumFractionDigits;

  if (preserveLeadingZeros && isSmallDecimal && hasSignificantDecimals) {
    effectiveUseGrouping = false;
    effectiveMinFractionDigits = maximumFractionDigits;
  }

  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: effectiveMinFractionDigits,
    maximumFractionDigits,
    useGrouping: effectiveUseGrouping,
  }).format(value);
};

export const parseLocaleNumber = (
  input: string,
  locale?: string,
): number | null => {
  if (!input) return null;
  const { decimal, group } = getLocaleSeparators(locale);
  // Normalize: remove grouping, replace locale decimal with '.'
  // NEW: Force-treat '.' as decimal if present in input (overrides locale group if it conflicts)
  let normalized = input;
  if (input.includes('.')) {
    // Remove locale groups, but preserve '.' as decimal
    if (group !== '.') {
      normalized = normalized.split(group).join('');
    }
    // If locale decimal is not '.', replace it with '.' (but since input uses '.', this preserves it)
    if (decimal !== '.') {
      normalized = normalized.split(decimal).join('.');
    }
  } else {
    // Fallback to original logic if no '.' in input
    const withoutGroups = group ? input.split(group).join('') : input;
    normalized = withoutGroups.split(decimal).join('.').replace(/\s/g, '');
  }

  if (!/^\d*(?:\.\d*)?$/.test(normalized)) return null;
  const value =
    normalized === '' || normalized === '.' ? Number.NaN : Number(normalized);
  return Number.isFinite(value) ? value : null;
};

export const sanitizeAmountInput = (
  rawText: string,
  params: {
    locale?: string;
    maxFractionDigits: number;
  },
): string => {
  const { locale, maxFractionDigits } = params;
  const { decimal } = getLocaleSeparators(locale);
  // Accept both '.' and ',' as decimal while typing, convert to locale decimal
  const incomingDecimalPattern = /[\.,]/g;
  // Remove all but digits and decimal separators
  let cleaned = rawText.replace(/[^0-9\.,]/g, '');
  // Replace any '.' or ',' with the locale decimal
  cleaned = cleaned.replace(incomingDecimalPattern, decimal);
  // Keep only first decimal separator
  const firstDecimalIndex = cleaned.indexOf(decimal);
  if (firstDecimalIndex !== -1) {
    const before = cleaned.slice(0, firstDecimalIndex + 1);
    const after = cleaned.slice(firstDecimalIndex + 1).replaceAll(decimal, '');
    cleaned = before + after;
  }
  // Disallow leading decimal without zero -> prefix with 0
  if (cleaned.startsWith(decimal)) {
    cleaned = `0${decimal}${cleaned.slice(1)}`;
  }
  // Trim fraction length
  if (firstDecimalIndex !== -1) {
    const [intPart, fracPart] = cleaned.split(decimal);
    const trimmedFrac = (fracPart ?? '').slice(
      0,
      Math.max(0, maxFractionDigits),
    );
    cleaned =
      trimmedFrac.length > 0 ? `${intPart}${decimal}${trimmedFrac}` : intPart;
  }
  // Remove leading zeros from integer part (but keep single zero if needed)
  const [intPart2, fracPart2] = cleaned.split(decimal);
  const normalizedInt = intPart2.replace(/^0+(?=\d)/, '');
  cleaned =
    fracPart2 !== undefined
      ? `${normalizedInt}${decimal}${fracPart2}`
      : normalizedInt;

  return cleaned;
};
