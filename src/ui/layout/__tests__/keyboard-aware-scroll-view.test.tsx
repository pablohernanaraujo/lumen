import React from 'react';
import { Platform, Text, TextInput, View } from 'react-native';

import { render } from '../../../test-utils';
import { makeStyles } from '../../../theme';
import { KeyboardAwareScrollView } from '../keyboard-aware-scroll-view';

// Mock Platform.OS to test both iOS and Android behaviors
const mockPlatform = (os: 'ios' | 'android'): void => {
  Object.defineProperty(Platform, 'OS', {
    writable: true,
    value: os,
  });
};

const useTestStyles = makeStyles((theme) => ({
  redBackground: {
    backgroundColor: theme.colors.error.main,
    padding: theme.spacing.sm,
  },
  blueBackground: {
    backgroundColor: theme.colors.info.main,
  },
  containerPadding: {
    padding: theme.spacing.lg,
  },
  grayBox: {
    height: 50,
    backgroundColor: theme.colors.border,
  },
}));

describe('KeyboardAwareScrollView', () => {
  const mockChildren = (
    <View>
      <Text>Test Content</Text>
      <TextInput placeholder="Test Input" />
    </View>
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('iOS Platform', () => {
    beforeEach(() => {
      mockPlatform('ios');
    });

    it('should render correctly on iOS with default props', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView>{mockChildren}</KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on iOS with custom behavior', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView behavior="height">
          {mockChildren}
        </KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on iOS with keyboardVerticalOffset', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView
          behavior="position"
          keyboardVerticalOffset={100}
        >
          {mockChildren}
        </KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on iOS with custom style', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <KeyboardAwareScrollView style={styles.redBackground}>
            {mockChildren}
          </KeyboardAwareScrollView>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Android Platform', () => {
    beforeEach(() => {
      mockPlatform('android');
    });

    it('should render correctly on Android with default props', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView>{mockChildren}</KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on Android with custom Android props', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView
          extraHeight={100}
          extraScrollHeight={50}
          enableOnAndroid={true}
          enableAutomaticScroll={false}
          keyboardOpeningTime={500}
        >
          {mockChildren}
        </KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on Android with keyboard callbacks', () => {
      const mockOnKeyboardShow = jest.fn();
      const mockOnKeyboardHide = jest.fn();

      const { toJSON } = render(
        <KeyboardAwareScrollView
          onKeyboardWillShow={mockOnKeyboardShow}
          onKeyboardWillHide={mockOnKeyboardHide}
        >
          {mockChildren}
        </KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on Android with custom styles', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <KeyboardAwareScrollView
            style={styles.blueBackground}
            contentContainerStyle={styles.containerPadding}
          >
            {mockChildren}
          </KeyboardAwareScrollView>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on Android with disabled features', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView
          enableOnAndroid={false}
          enableAutomaticScroll={false}
          showsVerticalScrollIndicator={true}
        >
          {mockChildren}
        </KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Common Props', () => {
    beforeEach(() => {
      mockPlatform('android'); // Use Android for testing common props
    });

    it('should render correctly with custom scroll view props', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView
          bounces={false}
          scrollEnabled={false}
          horizontal={false}
          keyboardShouldPersistTaps="always"
        >
          {mockChildren}
        </KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with showsVerticalScrollIndicator enabled', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView showsVerticalScrollIndicator={true}>
          {mockChildren}
        </KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with different keyboardShouldPersistTaps values', () => {
      const persistTapsValues = ['always', 'never', 'handled'] as const;

      for (const value of persistTapsValues) {
        const { toJSON } = render(
          <KeyboardAwareScrollView keyboardShouldPersistTaps={value}>
            {mockChildren}
          </KeyboardAwareScrollView>,
        );
        expect(toJSON()).toMatchSnapshot(`persistTaps-${value}`);
      }
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockPlatform('android');
    });

    it('should render correctly with no children', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView>{null}</KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with null children', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView>{null}</KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with multiple children', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <KeyboardAwareScrollView>
            <Text>First Child</Text>
            <TextInput placeholder="Input 1" />
            <Text>Second Child</Text>
            <TextInput placeholder="Input 2" />
            <View style={styles.grayBox} />
          </KeyboardAwareScrollView>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with extreme prop values', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView
          extraHeight={0}
          extraScrollHeight={1000}
          keyboardOpeningTime={0}
          keyboardVerticalOffset={-100}
        >
          {mockChildren}
        </KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
