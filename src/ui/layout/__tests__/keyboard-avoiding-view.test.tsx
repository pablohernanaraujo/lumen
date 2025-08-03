import React from 'react';
import { Platform, Text, TextInput, View } from 'react-native';

import { render } from '../../../test-utils';
import { makeStyles } from '../../../theme';
import { KeyboardAvoidingView } from '../keyboard-avoiding-view';

// Mock Platform.OS to test both iOS and Android behaviors
const mockPlatform = (os: 'ios' | 'android'): void => {
  Object.defineProperty(Platform, 'OS', {
    writable: true,
    value: os,
  });
};

const useTestStyles = makeStyles((theme) => ({
  redBackground: {
    backgroundColor: 'red',
    padding: 10,
  },
  blueBackground: {
    backgroundColor: 'blue',
  },
  grayBox: {
    height: 50,
    backgroundColor: 'gray',
  },
}));

describe('KeyboardAvoidingView', () => {
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
        <KeyboardAvoidingView>{mockChildren}</KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on iOS with padding behavior', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView behavior="padding">
          {mockChildren}
        </KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on iOS with height behavior', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView behavior="height">
          {mockChildren}
        </KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on iOS with position behavior', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView behavior="position">
          {mockChildren}
        </KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on iOS with keyboardVerticalOffset', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={100}>
          {mockChildren}
        </KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on iOS with custom style', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <KeyboardAvoidingView style={styles.redBackground}>
            {mockChildren}
          </KeyboardAvoidingView>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on iOS with zero keyboardVerticalOffset', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView keyboardVerticalOffset={0}>
          {mockChildren}
        </KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on iOS with negative keyboardVerticalOffset', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView keyboardVerticalOffset={-50}>
          {mockChildren}
        </KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Android Platform', () => {
    beforeEach(() => {
      mockPlatform('android');
    });

    it('should render correctly on Android (no KeyboardAvoidingView wrapper)', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView>{mockChildren}</KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on Android with ignored props', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={100}
            style={styles.blueBackground}
          >
            {mockChildren}
          </KeyboardAvoidingView>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly on Android with multiple children', () => {
      const TestComponent: React.FC = () => {
        const styles = useTestStyles();
        return (
          <KeyboardAvoidingView>
            <Text>First Child</Text>
            <TextInput placeholder="Input 1" />
            <Text>Second Child</Text>
            <TextInput placeholder="Input 2" />
            <View style={styles.grayBox} />
          </KeyboardAvoidingView>
        );
      };
      const { toJSON } = render(<TestComponent />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Cross-Platform Edge Cases', () => {
    it('should render correctly with no children on iOS', () => {
      mockPlatform('ios');
      const { toJSON } = render(<KeyboardAvoidingView />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with no children on Android', () => {
      mockPlatform('android');
      const { toJSON } = render(<KeyboardAvoidingView />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with null children on iOS', () => {
      mockPlatform('ios');
      const { toJSON } = render(
        <KeyboardAvoidingView>{null}</KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with null children on Android', () => {
      mockPlatform('android');
      const { toJSON } = render(
        <KeyboardAvoidingView>{null}</KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with string children on iOS', () => {
      mockPlatform('ios');
      const { toJSON } = render(
        <KeyboardAvoidingView>{'Direct string content'}</KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should render correctly with string children on Android', () => {
      mockPlatform('android');
      const { toJSON } = render(
        <KeyboardAvoidingView>{'Direct string content'}</KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Default Prop Handling', () => {
    beforeEach(() => {
      mockPlatform('ios');
    });

    it('should use default behavior when not specified', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView>{mockChildren}</KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should use default keyboardVerticalOffset when not specified', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView behavior="position">
          {mockChildren}
        </KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle undefined behavior gracefully', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView behavior={undefined}>
          {mockChildren}
        </KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should handle undefined keyboardVerticalOffset gracefully', () => {
      const { toJSON } = render(
        <KeyboardAvoidingView keyboardVerticalOffset={undefined}>
          {mockChildren}
        </KeyboardAvoidingView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
