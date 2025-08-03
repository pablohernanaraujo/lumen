/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { createDualSnapshots, render } from '../../../test-utils';
import { makeStyles } from '../../../theme';
import { Icon } from '../icon';

const useTestStyles = makeStyles((theme) => ({
  marginStyle: {
    margin: theme.spacing.sm,
  },
}));

describe('Icon', () => {
  createDualSnapshots(<Icon name="home" testID="icon-1" />);

  describe('with different families', () => {
    const families = [
      'AntDesign',
      'Entypo',
      'EvilIcons',
      'Feather',
      'FontAwesome',
      'FontAwesome5',
      'Foundation',
      'Ionicons',
      'MaterialIcons',
      'MaterialCommunityIcons',
      'Octicons',
      'SimpleLineIcons',
      'Zocial',
    ] as const;

    for (const family of families) {
      it(`should render correctly with ${family} family`, () => {
        const { toJSON } = render(
          <Icon name="home" family={family} testID={`icon-${family}-1`} />,
        );
        expect(toJSON()).toMatchSnapshot();
      });
    }
  });

  describe('with different sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    for (const size of sizes) {
      it(`should render correctly with ${size} size`, () => {
        const { toJSON } = render(
          <Icon name="home" size={size} testID={`icon-${size}-1`} />,
        );
        expect(toJSON()).toMatchSnapshot();
      });
    }

    it('should render correctly with custom numeric size', () => {
      const { toJSON } = render(
        <Icon name="home" size={32} testID="icon-custom-size-1" />,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('with custom styling', () => {
    it('should render correctly with custom color', () => {
      const { toJSON } = render(
        <Icon name="home" color="#ff0000" testID="icon-red-1" />,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with custom style', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <Icon name="home" style={styles.marginStyle} testID="icon-styled-1" />
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('accessibility', () => {
    it('should render correctly with custom accessibility label', () => {
      const { toJSON } = render(
        <Icon
          name="home"
          accessibilityLabel="Custom home icon"
          testID="icon-accessibility-1"
        />,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with accessibility disabled', () => {
      const { toJSON } = render(
        <Icon
          name="home"
          accessible={false}
          testID="icon-no-accessibility-1"
        />,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('interactive functionality', () => {
    it('should render as touchable when onPress is provided', () => {
      const mockOnPress = jest.fn();
      const { toJSON } = render(
        <Icon name="home" onPress={mockOnPress} testID="icon-touchable-1" />,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should call onPress when pressed', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <Icon name="home" onPress={mockOnPress} testID="icon-touchable-1" />,
      );

      fireEvent.press(getByTestId('icon-touchable-1-button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should render correctly with children', () => {
      const { toJSON } = render(
        <Icon name="home" testID="icon-with-children-1">
          <Icon
            name="star"
            family="AntDesign"
            size="sm"
            testID="icon-child-1"
          />
        </Icon>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('edge cases', () => {
    it('should render correctly with unknown family (fallback to MaterialIcons)', () => {
      const { toJSON } = render(
        <Icon
          name="home"
          family={'UnknownFamily' as any}
          testID="icon-unknown-family-1"
        />,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with empty name', () => {
      const { toJSON } = render(<Icon name="" testID="icon-empty-name-1" />);
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
