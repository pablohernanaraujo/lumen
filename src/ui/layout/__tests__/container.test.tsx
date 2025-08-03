import React from 'react';
import { Text } from 'react-native';

import { createDualSnapshots, render } from '../../../test-utils';
import { makeStyles } from '../../../theme';
import { Container } from '../container';

const useTestStyles = makeStyles((theme) => ({
  redBackground: {
    backgroundColor: theme.colors.error.main,
  },
}));

describe('Container', () => {
  const mockChildren = <Text>Test Content</Text>;

  createDualSnapshots(<Container>{mockChildren}</Container>);

  describe('with different props', () => {
    it('should render correctly with custom style', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <Container style={styles.redBackground}>{mockChildren}</Container>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with keyboardShouldPersistTaps set to always', () => {
      const { toJSON } = render(
        <Container keyboardShouldPersistTaps="always">
          {mockChildren}
        </Container>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with keyboardShouldPersistTaps set to never', () => {
      const { toJSON } = render(
        <Container keyboardShouldPersistTaps="never">{mockChildren}</Container>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with custom scrollViewProps', () => {
      const { toJSON } = render(
        <Container
          scrollViewProps={{
            showsHorizontalScrollIndicator: true,
            bounces: false,
            contentInsetAdjustmentBehavior: 'automatic',
          }}
        >
          {mockChildren}
        </Container>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with multiple children', () => {
      const { toJSON } = render(
        <Container>
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </Container>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('edge cases', () => {
    it('should render correctly with no children', () => {
      const { toJSON } = render(<Container>{null}</Container>);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with empty scrollViewProps', () => {
      const { toJSON } = render(
        <Container scrollViewProps={{}}>{mockChildren}</Container>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
