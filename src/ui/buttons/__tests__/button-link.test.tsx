import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme';
import { ButtonLink } from '../button-link';

const renderWithTheme = (
  component: React.ReactElement,
): ReturnType<typeof render> =>
  render(<ThemeProvider>{component}</ThemeProvider>);

describe('ButtonLink', () => {
  it('should render with children text', () => {
    renderWithTheme(
      <ButtonLink testID="button-link-1">Test Button</ButtonLink>,
    );

    expect(screen.getByText('Test Button')).toBeTruthy();
    expect(screen.getByTestId('button-link-1')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonLink testID="button-link-1" onPress={mockOnPress}>
        Press Me
      </ButtonLink>,
    );

    fireEvent.press(screen.getByTestId('button-link-1'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonLink testID="button-link-1" disabled onPress={mockOnPress}>
        Disabled Button
      </ButtonLink>,
    );

    const button = screen.getByTestId('button-link-1');
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    renderWithTheme(
      <ButtonLink testID="button-link-1" loading>
        Loading Button
      </ButtonLink>,
    );

    expect(screen.getByTestId('button-link-1')).toBeTruthy();
    expect(screen.getByText('Loading Button')).toBeTruthy();
  });

  it('should be disabled when loading', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonLink testID="button-link-1" loading onPress={mockOnPress}>
        Loading Button
      </ButtonLink>,
    );

    const button = screen.getByTestId('button-link-1');
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should render with different variants', () => {
    const { rerender } = renderWithTheme(
      <ButtonLink testID="button-link-1" variant="primary">
        Primary
      </ButtonLink>,
    );
    expect(screen.getByText('Primary')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ButtonLink testID="button-link-1" variant="danger">
          Danger
        </ButtonLink>
      </ThemeProvider>,
    );
    expect(screen.getByText('Danger')).toBeTruthy();
  });

  it('should render with underline when underline prop is true', () => {
    renderWithTheme(
      <ButtonLink testID="button-link-1" underline>
        Underlined Link
      </ButtonLink>,
    );

    expect(screen.getByText('Underlined Link')).toBeTruthy();
  });

  it('should have proper accessibility properties', () => {
    renderWithTheme(
      <ButtonLink
        testID="button-link-1"
        accessibilityLabel="Custom label"
        accessibilityHint="Custom hint"
      >
        Accessible Button
      </ButtonLink>,
    );

    const button = screen.getByTestId('button-link-1');
    expect(button.props.accessibilityLabel).toBe('Custom label');
    expect(button.props.accessibilityHint).toBe('Custom hint');
    expect(button.props.accessibilityRole).toBe('button');
  });
});
