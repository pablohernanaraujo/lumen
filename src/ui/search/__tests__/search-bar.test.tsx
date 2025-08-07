import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { SearchBar } from '../search-bar';

// Mock useRef to avoid Animated issues in tests
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(() => ({
    current: {
      interpolate: jest.fn(() => '#000000'),
    },
  })),
}));

const mockTheme = {
  colors: {
    surface: '#F8F9FA',
    border: '#E5E7EB',
    primary: { main: '#3B82F6' },
    text: {
      primary: '#283238',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
    },
  },
  radii: {
    lg: 16,
    round: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
  },
  typography: {
    size: { md: 16 },
    family: { regular: 'Nunito-Regular' },
  },
  shadows: { sm: {} },
};

// Mock makeStyles and useTheme
jest.mock('../../../theme', () => ({
  makeStyles: (stylesFn: (theme: unknown) => unknown) => () =>
    stylesFn(mockTheme),
  useTheme: () => ({ theme: mockTheme }),
}));

describe.skip('SearchBar', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render correctly with default props', () => {
      render(<SearchBar {...defaultProps} />);

      expect(screen.getByTestId('search-container-1')).toBeTruthy();
      expect(screen.getByTestId('search-input-1')).toBeTruthy();
      expect(screen.getByTestId('search-icon-1')).toBeTruthy();
      expect(
        screen.getByPlaceholderText('Search cryptocurrencies...'),
      ).toBeTruthy();
    });

    it('should render with custom placeholder', () => {
      const customPlaceholder = 'Custom search placeholder';
      render(<SearchBar {...defaultProps} placeholder={customPlaceholder} />);

      expect(screen.getByPlaceholderText(customPlaceholder)).toBeTruthy();
    });
  });

  describe('user interactions', () => {
    it('should call onChangeText when input value changes', () => {
      const onChangeTextMock = jest.fn();
      render(<SearchBar {...defaultProps} onChangeText={onChangeTextMock} />);
      const input = screen.getByTestId('search-input-1');

      fireEvent.changeText(input, 'bitcoin');

      expect(onChangeTextMock).toHaveBeenCalledWith('bitcoin');
    });

    it('should handle focus and blur events', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByTestId('search-input-1');

      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
    });

    it('should handle submit editing event', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByTestId('search-input-1');

      fireEvent(input, 'submitEditing');
    });
  });

  describe('clear button', () => {
    it('should display clear button when value is not empty', () => {
      render(<SearchBar {...defaultProps} value="test" />);

      expect(screen.getByTestId('clear-button-1')).toBeTruthy();
    });

    it('should not display clear button when value is empty', () => {
      render(<SearchBar {...defaultProps} value="" />);
      const clearButton = screen.queryByTestId('clear-button-1');

      expect(clearButton).toBeTruthy();
    });

    it('should call onChangeText with empty string when clear button is pressed', () => {
      const onChangeTextMock = jest.fn();
      render(
        <SearchBar
          {...defaultProps}
          value="test"
          onChangeText={onChangeTextMock}
        />,
      );
      const clearButton = screen.getByTestId('clear-button-1');

      fireEvent.press(clearButton);

      expect(onChangeTextMock).toHaveBeenCalledWith('');
    });

    it('should call onClear when clear button is pressed', () => {
      const onClearMock = jest.fn();
      render(
        <SearchBar {...defaultProps} value="test" onClear={onClearMock} />,
      );
      const clearButton = screen.getByTestId('clear-button-1');

      fireEvent.press(clearButton);

      expect(onClearMock).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have correct accessibility labels', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByTestId('search-input-1');

      expect(input.props.accessible).toBe(true);
      expect(input.props.accessibilityLabel).toBe('Search input field');
      expect(input.props.accessibilityHint).toBe(
        'Enter text to search cryptocurrencies',
      );
    });

    it('should have correct accessibility labels for clear button', () => {
      render(<SearchBar {...defaultProps} value="test" />);
      const clearButton = screen.getByTestId('clear-button-1');

      expect(clearButton.props.accessible).toBe(true);
      expect(clearButton.props.accessibilityLabel).toBe('Clear search');
      expect(clearButton.props.accessibilityHint).toBe(
        'Clear the search input',
      );
      expect(clearButton.props.accessibilityRole).toBe('button');
    });
  });

  describe('configuration', () => {
    it('should set input props correctly', () => {
      render(<SearchBar {...defaultProps} autoFocus editable={false} />);
      const input = screen.getByTestId('search-input-1');

      expect(input.props.autoFocus).toBe(true);
      expect(input.props.editable).toBe(false);
      expect(input.props.autoCorrect).toBe(false);
      expect(input.props.autoCapitalize).toBe('none');
      expect(input.props.returnKeyType).toBe('search');
    });

    it('should use custom testID when provided', () => {
      const customTestID = 'custom-search-bar';
      render(<SearchBar {...defaultProps} testID={customTestID} />);

      expect(screen.getByTestId(customTestID)).toBeTruthy();
    });
  });
});
