import React, { type FC, type ReactNode } from 'react';
import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Platform,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

interface KeyboardAvoidingViewProps {
  children?: ReactNode;
  style?: ViewStyle;
  behavior?: 'height' | 'position' | 'padding';
  keyboardVerticalOffset?: number;
}

export const KeyboardAvoidingView: FC<KeyboardAvoidingViewProps> = ({
  children,
  style,
  behavior,
  keyboardVerticalOffset,
}) => {
  if (Platform.OS === 'android') {
    return <>{children}</>;
  }

  return (
    <RNKeyboardAvoidingView
      style={[styles.container, style]}
      behavior={behavior || 'padding'}
      keyboardVerticalOffset={keyboardVerticalOffset || 0}
    >
      {children}
    </RNKeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
