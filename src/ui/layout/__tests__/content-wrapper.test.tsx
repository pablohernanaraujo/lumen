/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Text } from 'react-native';

import { createDualSnapshots, render } from '../../../test-utils';
import { makeStyles } from '../../../theme';
import { ContentWrapper } from '../content-wrapper';

const useTestStyles = makeStyles((theme) => ({
  blueBackgroundWithMargin: {
    backgroundColor: theme.colors.info.main,
    margin: theme.spacing.sm,
  },
  greenBackground: {
    backgroundColor: theme.colors.success.main,
  },
}));

describe('ContentWrapper', () => {
  const mockChildren = <Text>Test Content</Text>;

  createDualSnapshots(<ContentWrapper>{mockChildren}</ContentWrapper>);

  describe('with different variants', () => {
    const variants = ['screen', 'header', 'body', 'footer'] as const;

    for (const variant of variants) {
      it(`should render correctly with ${variant} variant`, () => {
        const { toJSON } = render(
          <ContentWrapper variant={variant}>{mockChildren}</ContentWrapper>,
        );
        expect(toJSON()).toMatchSnapshot();
      });
    }
  });

  describe('with borderless prop', () => {
    it('should render correctly with borderless enabled', () => {
      const { toJSON } = render(
        <ContentWrapper borderless>{mockChildren}</ContentWrapper>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with borderless disabled', () => {
      const { toJSON } = render(
        <ContentWrapper borderless={false}>{mockChildren}</ContentWrapper>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with borderless and different variants', () => {
      const variants = ['screen', 'header', 'body', 'footer'] as const;

      for (const variant of variants) {
        const { toJSON } = render(
          <ContentWrapper variant={variant} borderless>
            {mockChildren}
          </ContentWrapper>,
        );
        expect(toJSON()).toMatchSnapshot(`borderless-${variant}`);
      }
    });
  });

  describe('with custom styling', () => {
    it('should render correctly with custom style', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <ContentWrapper style={styles.blueBackgroundWithMargin}>
            {mockChildren}
          </ContentWrapper>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with custom style and borderless', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <ContentWrapper style={styles.greenBackground} borderless>
            {mockChildren}
          </ContentWrapper>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('with different content', () => {
    it('should render correctly with multiple children', () => {
      const { toJSON } = render(
        <ContentWrapper>
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </ContentWrapper>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with no children', () => {
      const { toJSON } = render(<ContentWrapper>{null}</ContentWrapper>);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('edge cases', () => {
    it('should render correctly with unknown variant (fallback to screen)', () => {
      const { toJSON } = render(
        <ContentWrapper variant={'unknown' as any}>
          {mockChildren}
        </ContentWrapper>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
