import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme';
import { ButtonIcon } from '../button-icon';

const renderWithTheme = (
  component: React.ReactElement,
): ReturnType<typeof render> =>
  render(<ThemeProvider>{component}</ThemeProvider>);

describe('ButtonIcon', () => {
  it('should render with icon', () => {
    renderWithTheme(<ButtonIcon testID="button-icon-1" name="home" />);

    expect(screen.getByTestId('button-icon-1')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonIcon testID="button-icon-1" name="home" onPress={mockOnPress} />,
    );

    fireEvent.press(screen.getByTestId('button-icon-1'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonIcon
        testID="button-icon-1"
        name="home"
        disabled
        onPress={mockOnPress}
      />,
    );

    const button = screen.getByTestId('button-icon-1');
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should render with different variants', () => {
    const { rerender } = renderWithTheme(
      <ButtonIcon testID="button-icon-1" name="home" variant="primary" />,
    );
    expect(screen.getByTestId('button-icon-1')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ButtonIcon testID="button-icon-1" name="home" variant="danger" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('button-icon-1')).toBeTruthy();
  });

  it('should render with different icon families', () => {
    renderWithTheme(
      <ButtonIcon testID="button-icon-1" name="home" family="Feather" />,
    );

    expect(screen.getByTestId('button-icon-1')).toBeTruthy();
  });

  it('should have proper accessibility properties', () => {
    renderWithTheme(
      <ButtonIcon
        testID="button-icon-1"
        name="home"
        accessibilityLabel="Home button"
        accessibilityHint="Navigate to home screen"
      />,
    );

    const button = screen.getByTestId('button-icon-1');
    expect(button.props.accessibilityLabel).toBe('Home button');
    expect(button.props.accessibilityHint).toBe('Navigate to home screen');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('should have default accessibility label when not provided', () => {
    renderWithTheme(<ButtonIcon testID="button-icon-1" name="home" />);

    const button = screen.getByTestId('button-icon-1');
    expect(button.props.accessibilityLabel).toBe('home button');
  });
});
