import React, { FC } from 'react';
import { Text, View } from 'react-native';

import { createDualSnapshots, render } from '../../../test-utils';
import { makeStyles } from '../../../theme';
import { VStack } from '../v-stack';

const useTestStyles = makeStyles((theme) => ({
  redContainer: {
    backgroundColor: theme.colors.error.main,
    padding: theme.spacing.sm,
  },
  blueContainer: {
    backgroundColor: theme.colors.info.main,
  },
  smallRedBox: {
    width: 20,
    height: 20,
    backgroundColor: theme.colors.error.main,
  },
  redText: {
    color: theme.colors.error.main,
  },
  boldText: {
    fontWeight: theme.typography.weight.bold,
  },
  bluePaddedContainer: {
    backgroundColor: theme.colors.info.main,
    padding: theme.spacing.xs,
  },
}));

describe('VStack', () => {
  const mockChildren = [
    <Text key="1">First</Text>,
    <Text key="2">Second</Text>,
    <Text key="3">Third</Text>,
  ];

  createDualSnapshots(<VStack>{mockChildren}</VStack>);

  describe('with different spacing', () => {
    const spacingValues = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    for (const spacing of spacingValues) {
      it(`should render correctly with ${spacing} spacing`, () => {
        const { toJSON } = render(
          <VStack spacing={spacing}>{mockChildren}</VStack>,
        );
        expect(toJSON()).toMatchSnapshot();
      });
    }
  });

  describe('with custom styling', () => {
    it('should render correctly with custom style', () => {
      const TestComponent: FC = () => {
        const testStyles = useTestStyles();
        return <VStack style={testStyles.redContainer}>{mockChildren}</VStack>;
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with custom style and spacing', () => {
      const TestComponent: FC = () => {
        const testStyles = useTestStyles();
        return (
          <VStack spacing="lg" style={testStyles.blueContainer}>
            {mockChildren}
          </VStack>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('with different children types', () => {
    it('should render correctly with single child', () => {
      const { toJSON } = render(
        <VStack>
          <Text>Single Child</Text>
        </VStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with mixed children types', () => {
      const TestComponent: FC = () => {
        const testStyles = useTestStyles();
        return (
          <VStack>
            <Text>Text Child</Text>
            <View style={testStyles.smallRedBox} />
            <Text>Another Text</Text>
          </VStack>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with children having existing styles', () => {
      const TestComponent: FC = () => {
        const testStyles = useTestStyles();
        return (
          <VStack spacing="lg">
            <Text style={testStyles.redText}>Styled Text 1</Text>
            <Text style={testStyles.boldText}>Styled Text 2</Text>
            <View style={testStyles.bluePaddedContainer}>
              <Text>Nested Content</Text>
            </View>
          </VStack>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with string children', () => {
      const { toJSON } = render(
        <VStack>
          {'String child 1'}
          {'String child 2'}
          {'String child 3'}
        </VStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with null/undefined children', () => {
      const { toJSON } = render(
        <VStack>
          <Text>Valid Child</Text>
          {null}
          {undefined}
          <Text>Another Valid Child</Text>
        </VStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('edge cases', () => {
    it('should render correctly with no children', () => {
      const { toJSON } = render(<VStack>{[]}</VStack>);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with empty children', () => {
      const { toJSON } = render(<VStack>{null}</VStack>);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with children without keys', () => {
      const { toJSON } = render(
        <VStack>
          <Text>No Key 1</Text>
          <Text>No Key 2</Text>
        </VStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('spacing behavior', () => {
    it('should not apply margin to last child', () => {
      const { toJSON } = render(
        <VStack spacing="lg">
          <Text>First</Text>
          <Text>Last</Text>
        </VStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply correct spacing between multiple children', () => {
      const { toJSON } = render(
        <VStack spacing="xl">
          <Text>Child 1</Text>
          <Text>Child 2</Text>
          <Text>Child 3</Text>
          <Text>Child 4</Text>
        </VStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
