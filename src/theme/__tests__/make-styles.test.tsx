/* eslint-disable max-nested-callbacks */
import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { makeStyles } from '../make-styles';
import { ThemeProvider } from '../theme-provider';

const TestComponent: React.FC = () => {
  const styles = makeStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    text: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.size.md,
    },
    dynamic: {
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  }))();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Text</Text>
      <View style={styles.dynamic} />
    </View>
  );
};

describe('makeStyles', () => {
  describe('theme integration', () => {
    it('should create styles with light theme', () => {
      const { toJSON } = render(
        <ThemeProvider preference="light">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should create styles with dark theme', () => {
      const { toJSON } = render(
        <ThemeProvider preference="dark">
          <TestComponent />
        </ThemeProvider>,
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('style function behavior', () => {
    it('should create consistent styles across multiple calls', () => {
      const styleFunction = makeStyles((theme) => ({
        test: {
          color: theme.colors.text.primary,
        },
      }));

      const TestConsistencyComponent: React.FC = () => {
        const styles1 = styleFunction();
        const styles2 = styleFunction();

        return (
          <View>
            <Text style={styles1.test}>Test 1</Text>
            <Text style={styles2.test}>Test 2</Text>
          </View>
        );
      };

      const { toJSON } = render(
        <ThemeProvider preference="light">
          <TestConsistencyComponent />
        </ThemeProvider>,
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle complex style objects', () => {
      const ComplexStyleComponent: React.FC = () => {
        const styles = makeStyles((theme) => ({
          complex: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.radii.md,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
          },
        }))();

        return <View style={styles.complex} />;
      };

      const { toJSON } = render(
        <ThemeProvider preference="light">
          <ComplexStyleComponent />
        </ThemeProvider>,
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle empty style objects', () => {
      const EmptyStyleComponent: React.FC = () => {
        const styles = makeStyles(() => ({}))();

        return <View style={styles} />;
      };

      const { toJSON } = render(
        <ThemeProvider preference="light">
          <EmptyStyleComponent />
        </ThemeProvider>,
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('theme responsiveness', () => {
    it('should update styles when theme changes', () => {
      const ResponsiveComponent: React.FC<{ mode: 'light' | 'dark' }> = ({
        mode,
      }) => {
        const styles = makeStyles((theme) => ({
          responsive: {
            backgroundColor: theme.colors.background,
            color: theme.colors.text.primary,
          },
        }))();

        return (
          <Text style={styles.responsive} testID="responsive-text">
            Responsive Text
          </Text>
        );
      };

      const { rerender, toJSON: toJSONLight } = render(
        <ThemeProvider preference="light">
          <ResponsiveComponent mode="light" />
        </ThemeProvider>,
      );

      expect(toJSONLight()).toMatchSnapshot('light-responsive');

      rerender(
        <ThemeProvider preference="dark">
          <ResponsiveComponent mode="dark" />
        </ThemeProvider>,
      );

      expect(toJSONLight()).toMatchSnapshot('dark-responsive');
    });
  });
});
