import React, { type FC, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  type ScrollViewProps,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView as RNKeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface KeyboardAwareScrollViewProps extends Omit<ScrollViewProps, 'style'> {
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  // Android-specific props (react-native-keyboard-aware-scroll-view)
  extraHeight?: number;
  extraScrollHeight?: number;
  enableOnAndroid?: boolean;
  enableAutomaticScroll?: boolean;
  keyboardOpeningTime?: number;
  onKeyboardWillShow?: () => void;
  onKeyboardWillHide?: () => void;
  // iOS-specific props (KeyboardAvoidingView)
  behavior?: 'height' | 'position' | 'padding';
  keyboardVerticalOffset?: number;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  contentContainer: {
    flexGrow: 1,
  } as ViewStyle,
});

export const KeyboardAwareScrollView: FC<KeyboardAwareScrollViewProps> = ({
  children,
  style,
  contentContainerStyle,
  // Android props
  extraHeight = 75,
  extraScrollHeight = 0,
  enableOnAndroid = true,
  enableAutomaticScroll = true,
  keyboardOpeningTime = 250,
  onKeyboardWillShow,
  onKeyboardWillHide,
  // iOS props
  behavior = 'padding',
  keyboardVerticalOffset = 0,
  // Common props
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
  ...scrollViewProps
}) => {
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        style={[styles.container, style]}
        behavior={behavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  // Android
  return (
    <RNKeyboardAwareScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      extraHeight={extraHeight}
      extraScrollHeight={extraScrollHeight}
      enableOnAndroid={enableOnAndroid}
      enableAutomaticScroll={enableAutomaticScroll}
      keyboardOpeningTime={keyboardOpeningTime}
      onKeyboardWillShow={onKeyboardWillShow}
      onKeyboardWillHide={onKeyboardWillHide}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...scrollViewProps}
    >
      {children}
    </RNKeyboardAwareScrollView>
  );
};
