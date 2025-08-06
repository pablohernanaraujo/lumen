import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme';
import { ButtonRegular } from '../button-regular';

const renderWithTheme = (
  component: React.ReactElement,
): ReturnType<typeof render> =>
  render(<ThemeProvider>{component}</ThemeProvider>);

describe('ButtonRegular', () => {
  it('should render with children text', () => {
    renderWithTheme(
      <ButtonRegular testID="button-1">Test Button</ButtonRegular>,
    );

    expect(screen.getByText('Test Button')).toBeTruthy();
    expect(screen.getByTestId('button-1')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonRegular testID="button-1" onPress={mockOnPress}>
        Press Me
      </ButtonRegular>,
    );

    fireEvent.press(screen.getByTestId('button-1'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonRegular testID="button-1" disabled onPress={mockOnPress}>
        Disabled Button
      </ButtonRegular>,
    );

    const button = screen.getByTestId('button-1');
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    renderWithTheme(
      <ButtonRegular testID="button-1" loading>
        Loading Button
      </ButtonRegular>,
    );

    expect(screen.getByTestId('button-1')).toBeTruthy();
    expect(screen.getByText('Loading Button')).toBeTruthy();
  });

  it('should be disabled when loading', () => {
    const mockOnPress = jest.fn();
    renderWithTheme(
      <ButtonRegular testID="button-1" loading onPress={mockOnPress}>
        Loading Button
      </ButtonRegular>,
    );

    const button = screen.getByTestId('button-1');
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should render with different variants', () => {
    const { rerender } = renderWithTheme(
      <ButtonRegular testID="button-1" variant="primary">
        Primary
      </ButtonRegular>,
    );
    expect(screen.getByText('Primary')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ButtonRegular testID="button-1" variant="secondary">
          Secondary
        </ButtonRegular>
      </ThemeProvider>,
    );
    expect(screen.getByText('Secondary')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ButtonRegular testID="button-1" variant="danger">
          Danger
        </ButtonRegular>
      </ThemeProvider>,
    );
    expect(screen.getByText('Danger')).toBeTruthy();
  });

  it('should have proper accessibility properties', () => {
    renderWithTheme(
      <ButtonRegular
        testID="button-1"
        accessibilityLabel="Custom label"
        accessibilityHint="Custom hint"
      >
        Accessible Button
      </ButtonRegular>,
    );

    const button = screen.getByTestId('button-1');
    expect(button.props.accessibilityLabel).toBe('Custom label');
    expect(button.props.accessibilityHint).toBe('Custom hint');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('should render left icon when iconName is provided', () => {
    renderWithTheme(
      <ButtonRegular
        testID="button-1"
        iconName="send"
        iconFamily="MaterialIcons"
      >
        Send Message
      </ButtonRegular>,
    );

    expect(screen.getByText('Send Message')).toBeTruthy();
    expect(screen.getByTestId('button-1-icon')).toBeTruthy();
  });

  it('should render right icon when iconPosition is right', () => {
    renderWithTheme(
      <ButtonRegular
        testID="button-1"
        iconName="arrow-forward"
        iconFamily="MaterialIcons"
        iconPosition="right"
      >
        Next Step
      </ButtonRegular>,
    );

    expect(screen.getByText('Next Step')).toBeTruthy();
    expect(screen.getByTestId('button-1-icon')).toBeTruthy();
  });

  it('should not render icon when loading', () => {
    renderWithTheme(
      <ButtonRegular
        testID="button-1"
        iconName="send"
        iconFamily="MaterialIcons"
        loading
      >
        Sending
      </ButtonRegular>,
    );

    expect(screen.getByText('Sending')).toBeTruthy();
    expect(() => screen.getByTestId('button-1-icon')).toThrow();
  });

  it('should not render icon when iconName is not provided', () => {
    renderWithTheme(
      <ButtonRegular testID="button-1">No Icon Button</ButtonRegular>,
    );

    expect(screen.getByText('No Icon Button')).toBeTruthy();
    expect(() => screen.getByTestId('button-1-icon')).toThrow();
  });
});
