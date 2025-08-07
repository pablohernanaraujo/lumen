import React, { type FC, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import { Icon } from '../icon';
import type { SearchBarProps } from './types';

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  containerFocused: {
    borderColor: theme.colors.primary.main,
  },
  containerUnfocused: {
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.size.md,
    fontFamily: theme.typography.family.regular,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.xs,
  },
  inputPlaceholder: {
    color: theme.colors.text.tertiary,
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
    borderRadius: theme.radii.round,
  },
  clearButtonVisible: {
    opacity: 1,
  },
  clearButtonHidden: {
    opacity: 0,
  },
}));

const useSearchBarAnimations = (
  isFocused: boolean,
  value: string,
  theme: any, // eslint-disable-line @typescript-eslint/no-explicit-any
): {
  animatedBorderColor: Animated.AnimatedInterpolation<string | number>;
  animatedOpacity: Animated.AnimatedInterpolation<string | number>;
  animatedScale: Animated.AnimatedInterpolation<string | number>;
} => {
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const clearButtonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, borderColorAnim]);

  useEffect(() => {
    Animated.timing(clearButtonAnim, {
      toValue: value.length > 0 ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [value.length, clearButtonAnim]);

  const animatedBorderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary.main],
  });

  const animatedOpacity = clearButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const animatedScale = clearButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return {
    animatedBorderColor,
    animatedOpacity,
    animatedScale,
  };
};

export const SearchBar: FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search cryptocurrencies...',
  style,
  testID = 'search-container-1',
  autoFocus = false,
  editable = true,
}) => {
  const styles = useStyles();
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);

  const { animatedBorderColor, animatedOpacity, animatedScale } =
    useSearchBarAnimations(isFocused, value, theme);

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
  };

  const handleClear = (): void => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyboardDismiss = (): void => {
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: animatedBorderColor,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.searchIcon}>
        <Icon
          name="search"
          family="MaterialIcons"
          size="md"
          color={
            isFocused ? theme.colors.primary.main : theme.colors.text.secondary
          }
          testID="search-icon-1"
        />
      </View>

      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        autoFocus={autoFocus}
        editable={editable}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        onSubmitEditing={handleKeyboardDismiss}
        testID="search-input-1"
        accessible
        accessibilityLabel="Search input field"
        accessibilityHint="Enter text to search cryptocurrencies"
      />

      <Animated.View
        style={{
          opacity: animatedOpacity,
          transform: [{ scale: animatedScale }],
        }}
        pointerEvents={value.length > 0 ? 'auto' : 'none'}
      >
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          testID="clear-button-1"
          accessible
          accessibilityLabel="Clear search"
          accessibilityHint="Clear the search input"
          accessibilityRole="button"
        >
          <Icon
            name="clear"
            family="MaterialIcons"
            size="md"
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};
