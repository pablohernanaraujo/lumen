import React from 'react';
import { Text } from 'react-native';

import { createDualSnapshots, render } from '../../../test-utils';
import { makeStyles } from '../../../theme';
import { ScreenWrapper } from '../screen-wrapper';

const useTestStyles = makeStyles((theme) => ({
  redBackground: {
    backgroundColor: theme.colors.error.main,
    padding: theme.spacing.md,
  },
  blueBackground: {
    backgroundColor: theme.colors.info.main,
    borderWidth: 2,
    borderColor: theme.colors.background,
    margin: theme.spacing.sm,
  },
  titleText: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
  },
  footerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.size.xs,
  },
}));

describe('ScreenWrapper', () => {
  const mockChildren = <Text>Test Content</Text>;

  createDualSnapshots(<ScreenWrapper>{mockChildren}</ScreenWrapper>);

  describe('with custom styling', () => {
    it('should render correctly with custom style', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <ScreenWrapper style={styles.redBackground}>
            {mockChildren}
          </ScreenWrapper>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with complex custom styling', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <ScreenWrapper style={styles.blueBackground}>
            {mockChildren}
          </ScreenWrapper>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('with different content', () => {
    it('should render correctly with multiple children', () => {
      const { toJSON } = render(
        <ScreenWrapper>
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </ScreenWrapper>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with complex nested content', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <ScreenWrapper>
            <Text style={styles.titleText}>Title</Text>
            <Text>Some body text content</Text>
            <Text style={styles.footerText}>Footer text</Text>
          </ScreenWrapper>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with no children', () => {
      const { toJSON } = render(<ScreenWrapper>{null}</ScreenWrapper>);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('edge cases', () => {
    it('should render correctly with empty children', () => {
      const { toJSON } = render(<ScreenWrapper>{null}</ScreenWrapper>);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with string children', () => {
      const { toJSON } = render(
        <ScreenWrapper>{'Direct string content'}</ScreenWrapper>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with mixed content types', () => {
      const { toJSON } = render(
        <ScreenWrapper>
          {'String content'}
          <Text>Text component</Text>
          {42}
          {null}
          {undefined}
        </ScreenWrapper>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('integration with SafeAreaView', () => {
    it('should properly wrap content with SafeAreaView', () => {
      const { toJSON } = render(
        <ScreenWrapper>
          <Text>Safe area content</Text>
        </ScreenWrapper>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
