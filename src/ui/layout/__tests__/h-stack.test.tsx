import React from 'react';
import { Text, View } from 'react-native';

import { createDualSnapshots, render } from '../../../test-utils';
import { makeStyles } from '../../../theme';
import { HStack } from '../h-stack';

const useTestStyles = makeStyles(() => ({
  redBackground: {
    backgroundColor: 'red',
    padding: 10,
  },
  blueBackground: {
    backgroundColor: 'blue',
  },
  smallRedBox: {
    width: 20,
    height: 20,
    backgroundColor: 'red',
  },
  blueContainer: {
    backgroundColor: 'blue',
    padding: 5,
  },
  redText: {
    color: 'red',
  },
  boldText: {
    fontWeight: 'bold',
  },
}));

describe('HStack', () => {
  const mockChildren = [
    <Text key="1">First</Text>,
    <Text key="2">Second</Text>,
    <Text key="3">Third</Text>,
  ];

  createDualSnapshots(<HStack>{mockChildren}</HStack>);

  describe('with different spacing', () => {
    const spacingValues = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    for (const spacing of spacingValues) {
      it(`should render correctly with ${spacing} spacing`, () => {
        const { toJSON } = render(
          <HStack spacing={spacing}>{mockChildren}</HStack>,
        );
        expect(toJSON()).toMatchSnapshot();
      });
    }
  });

  describe('with different alignment', () => {
    const alignValues = [
      'flex-start',
      'center',
      'flex-end',
      'stretch',
    ] as const;

    for (const align of alignValues) {
      it(`should render correctly with ${align} alignment`, () => {
        const { toJSON } = render(
          <HStack align={align}>{mockChildren}</HStack>,
        );
        expect(toJSON()).toMatchSnapshot();
      });
    }
  });

  describe('with custom styling', () => {
    it('should render correctly with custom style', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return <HStack style={styles.redBackground}>{mockChildren}</HStack>;
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with custom style and spacing', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <HStack spacing="lg" style={styles.blueBackground}>
            {mockChildren}
          </HStack>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('with different children types', () => {
    it('should render correctly with single child', () => {
      const { toJSON } = render(
        <HStack>
          <Text>Single Child</Text>
        </HStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with mixed children types', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <HStack>
            <Text>Text Child</Text>
            <View style={styles.smallRedBox} />
            <Text>Another Text</Text>
          </HStack>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with children having existing styles', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <HStack spacing="lg">
            <Text style={styles.redText}>Styled Text 1</Text>
            <Text style={styles.boldText}>Styled Text 2</Text>
            <View style={styles.blueContainer}>
              <Text>Nested Content</Text>
            </View>
          </HStack>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with string children', () => {
      const { toJSON } = render(
        <HStack>
          {'String child 1'}
          {'String child 2'}
          {'String child 3'}
        </HStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with null/undefined children', () => {
      const { toJSON } = render(
        <HStack>
          <Text>Valid Child</Text>
          {null}
          {undefined}
          <Text>Another Valid Child</Text>
        </HStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('edge cases', () => {
    it('should render correctly with no children', () => {
      const { toJSON } = render(<HStack>{[]}</HStack>);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with empty children', () => {
      const { toJSON } = render(<HStack />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with children without keys', () => {
      const { toJSON } = render(
        <HStack>
          <Text>No Key 1</Text>
          <Text>No Key 2</Text>
        </HStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('spacing behavior', () => {
    it('should not apply margin to last child', () => {
      const { toJSON } = render(
        <HStack spacing="lg">
          <Text>First</Text>
          <Text>Last</Text>
        </HStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should apply correct spacing between multiple children', () => {
      const { toJSON } = render(
        <HStack spacing="xl">
          <Text>Child 1</Text>
          <Text>Child 2</Text>
          <Text>Child 3</Text>
          <Text>Child 4</Text>
        </HStack>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
