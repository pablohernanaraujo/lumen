/* eslint-disable max-statements */
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

export const formatNumberLocale = (
  value: number,
  options?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    useGrouping?: boolean;
  },
): string => {
  const { locale, minimumFractionDigits, maximumFractionDigits, useGrouping } =
    options ?? {};
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
  }).format(value);
};

export const parseLocaleNumber = (
  input: string,
  locale?: string,
): number | null => {
  if (!input) return null;
  const { decimal, group } = getLocaleSeparators(locale);
  // Normalize: remove grouping, replace locale decimal with '.'
  const withoutGroups = group ? input.split(group).join('') : input;
  const normalized = withoutGroups.split(decimal).join('.').replace(/\s/g, '');
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
