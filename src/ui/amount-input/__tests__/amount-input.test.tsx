import React, { ReactElement } from 'react';
import { render, RenderResult, screen } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme';
import { AmountInput } from '../amount-input';

const renderWithTheme = (component: ReactElement): RenderResult =>
  render(<ThemeProvider>{component}</ThemeProvider>);

describe('AmountInput', () => {
  it('should render correctly with basic props', () => {
    const mockOnChange = jest.fn();

    renderWithTheme(
      <AmountInput
        value="123.45"
        onChange={mockOnChange}
        maxFractionDigits={2}
        testID="amount-input-1"
      />,
    );

    expect(screen.getByTestId('amount-input-1')).toBeTruthy();
  });

  it('should preserve decimal places when unfocused (fixes currency formatting issue)', () => {
    const mockOnChange = jest.fn();

    renderWithTheme(
      <AmountInput
        value="57.56"
        onChange={mockOnChange}
        maxFractionDigits={8}
        testID="amount-input-1"
      />,
    );

    const input = screen.getByTestId('amount-input-1');
    expect(input).toBeTruthy();

    // The input should display "57.56" and not a malformed version like "5.756"
    // This test validates that the effectiveMaxDigits calculation works correctly
    const textInput = screen.getByDisplayValue('57.56');
    expect(textInput).toBeTruthy();
  });

  it('should handle values with different decimal lengths correctly', () => {
    const mockOnChange = jest.fn();

    // Test with 4 decimal places
    const { rerender } = renderWithTheme(
      <AmountInput
        value="123.4567"
        onChange={mockOnChange}
        maxFractionDigits={8}
        testID="amount-input-1"
      />,
    );

    expect(screen.getByDisplayValue('123.4567')).toBeTruthy();

    // Test with 1 decimal place
    rerender(
      <ThemeProvider>
        <AmountInput
          value="123.4"
          onChange={mockOnChange}
          maxFractionDigits={8}
          testID="amount-input-1"
        />
      </ThemeProvider>,
    );

    expect(screen.getByDisplayValue('123.4')).toBeTruthy();

    // Test with no decimal places
    rerender(
      <ThemeProvider>
        <AmountInput
          value="123"
          onChange={mockOnChange}
          maxFractionDigits={8}
          testID="amount-input-1"
        />
      </ThemeProvider>,
    );

    expect(screen.getByDisplayValue('123')).toBeTruthy();
  });

  it('should handle empty value correctly', () => {
    const mockOnChange = jest.fn();

    renderWithTheme(
      <AmountInput
        value=""
        onChange={mockOnChange}
        maxFractionDigits={2}
        testID="amount-input-1"
      />,
    );

    const input = screen.getByTestId('amount-input-1');
    expect(input).toBeTruthy();
  });
});
