/* eslint-disable max-nested-callbacks */
import React from 'react';
import { Text, useColorScheme } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider, useTheme } from '../theme-provider';

// Mock useColorScheme
jest.mock('react-native/Libraries/Utilities/useColorScheme');

const mockUseColorScheme = useColorScheme as jest.MockedFunction<
  typeof useColorScheme
>;

const TestComponent: React.FC = () => {
  const { theme, mode, setMode, toggleMode } = useTheme();

  return (
    <>
      <Text testID="current-mode">{mode}</Text>
      <Text testID="background-color">{theme.colors.background}</Text>
      <Text testID="text-color">{theme.colors.text.primary}</Text>
      <Text testID="set-light" onPress={() => setMode('light')}>
        Set Light
      </Text>
      <Text testID="set-dark" onPress={() => setMode('dark')}>
        Set Dark
      </Text>
      <Text testID="toggle-mode" onPress={toggleMode}>
        Toggle Mode
      </Text>
    </>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockUseColorScheme.mockClear();
  });

  describe('default behavior', () => {
    it('should use system theme when no preference is provided', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId('current-mode').children[0]).toBe('dark');
    });

    it('should default to light mode when system theme is null', () => {
      mockUseColorScheme.mockReturnValue(null);

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId('current-mode').children[0]).toBe('light');
    });
  });

  describe('with preference prop', () => {
    it('should use provided preference over system theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = render(
        <ThemeProvider preference="light">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId('current-mode').children[0]).toBe('light');
    });

    it('should render correctly with dark preference', () => {
      const { toJSON } = render(
        <ThemeProvider preference="dark">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('mode manipulation', () => {
    it('should allow setting mode to light', () => {
      const { getByTestId } = render(
        <ThemeProvider preference="dark">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId('current-mode').children[0]).toBe('dark');

      fireEvent.press(getByTestId('set-light'));

      expect(getByTestId('current-mode').children[0]).toBe('light');
    });

    it('should allow setting mode to dark', () => {
      const { getByTestId } = render(
        <ThemeProvider preference="light">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId('current-mode').children[0]).toBe('light');

      fireEvent.press(getByTestId('set-dark'));

      expect(getByTestId('current-mode').children[0]).toBe('dark');
    });

    it('should toggle mode correctly from light to dark', () => {
      const { getByTestId } = render(
        <ThemeProvider preference="light">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId('current-mode').children[0]).toBe('light');

      fireEvent.press(getByTestId('toggle-mode'));

      expect(getByTestId('current-mode').children[0]).toBe('dark');
    });

    it('should toggle mode correctly from dark to light', () => {
      const { getByTestId } = render(
        <ThemeProvider preference="dark">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(getByTestId('current-mode').children[0]).toBe('dark');

      fireEvent.press(getByTestId('toggle-mode'));

      expect(getByTestId('current-mode').children[0]).toBe('light');
    });
  });

  describe('theme colors', () => {
    it('should provide correct light theme colors', () => {
      const { getByTestId } = render(
        <ThemeProvider preference="light">
          <TestComponent />
        </ThemeProvider>,
      );

      const backgroundElement = getByTestId('background-color');
      const textElement = getByTestId('text-color');

      expect(backgroundElement.children[0]).toBeTruthy();
      expect(textElement.children[0]).toBeTruthy();
    });

    it('should provide correct dark theme colors', () => {
      const { getByTestId } = render(
        <ThemeProvider preference="dark">
          <TestComponent />
        </ThemeProvider>,
      );

      const backgroundElement = getByTestId('background-color');
      const textElement = getByTestId('text-color');

      expect(backgroundElement.children[0]).toBeTruthy();
      expect(textElement.children[0]).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should throw error when useTheme is used outside ThemeProvider', () => {
      // Capture console.error to prevent cluttering test output
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('custom persistence key', () => {
    it('should render correctly with custom persistence key', () => {
      const { toJSON } = render(
        <ThemeProvider persistenceKey="@custom-theme">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });
});
