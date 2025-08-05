import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme';
import { ButtonOutline } from '../button-outline';

const renderWithTheme = (
  component: React.ReactElement,
): ReturnType<typeof render> =>
  render(<ThemeProvider>{component}</ThemeProvider>);

describe('ButtonOutline', () => {
  it('should render with children text', () => {
    renderWithTheme(
      <ButtonOutline testID="button-outline-1">Test Button</ButtonOutline>,
    );

    expect(screen.getByText('Test Button')).toBeTruthy();
    expect(screen.getByTestId('button-outline-1')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonOutline testID="button-outline-1" onPress={mockOnPress}>
        Press Me
      </ButtonOutline>,
    );

    fireEvent.press(screen.getByTestId('button-outline-1'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonOutline testID="button-outline-1" disabled onPress={mockOnPress}>
        Disabled Button
      </ButtonOutline>,
    );

    const button = screen.getByTestId('button-outline-1');
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    renderWithTheme(
      <ButtonOutline testID="button-outline-1" loading>
        Loading Button
      </ButtonOutline>,
    );

    expect(screen.getByTestId('button-outline-1')).toBeTruthy();
    expect(screen.getByText('Loading Button')).toBeTruthy();
  });

  it('should be disabled when loading', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonOutline testID="button-outline-1" loading onPress={mockOnPress}>
        Loading Button
      </ButtonOutline>,
    );

    const button = screen.getByTestId('button-outline-1');
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should render with different variants', () => {
    const { rerender } = renderWithTheme(
      <ButtonOutline testID="button-outline-1" variant="primary">
        Primary
      </ButtonOutline>,
    );
    expect(screen.getByText('Primary')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ButtonOutline testID="button-outline-1" variant="danger">
          Danger
        </ButtonOutline>
      </ThemeProvider>,
    );
    expect(screen.getByText('Danger')).toBeTruthy();
  });

  it('should have proper accessibility properties', () => {
    renderWithTheme(
      <ButtonOutline
        testID="button-outline-1"
        accessibilityLabel="Custom label"
        accessibilityHint="Custom hint"
      >
        Accessible Button
      </ButtonOutline>,
    );

    const button = screen.getByTestId('button-outline-1');
    expect(button.props.accessibilityLabel).toBe('Custom label');
    expect(button.props.accessibilityHint).toBe('Custom hint');
    expect(button.props.accessibilityRole).toBe('button');
  });
});
