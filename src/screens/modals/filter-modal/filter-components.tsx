import React, { type FC, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '../../../theme';
import { Icon } from '../../../ui';
import type {
  FilterChipProps,
  FilterOptionProps,
  FilterRangeSliderProps,
  FilterSectionProps,
} from './types';

export const FilterSection: FC<FilterSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.typography.size.lg,
      fontWeight: theme.typography.weight.semibold,
      color: theme.colors.text.primary,
    },
    content: {
      paddingVertical: theme.spacing.md,
    },
    container: {
      width: '100%',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onToggle}>
        <Text style={styles.title}>{title}</Text>
        <Icon
          name={isExpanded ? 'expand-less' : 'expand-more'}
          family="MaterialIcons"
          size={28}
          color={theme.colors.text.secondary}
        />
      </TouchableOpacity>
      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

export const FilterOption: FC<FilterOptionProps> = ({
  label,
  selected,
  onPress,
  testID,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: theme.radii.sm,
      borderWidth: 2,
      borderColor: selected ? theme.colors.primary.main : theme.colors.border,
      backgroundColor: selected
        ? theme.colors.primary.main
        : theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.size.md,
      color: theme.colors.text.primary,
      flex: 1,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      testID={testID}
    >
      <View style={styles.checkbox}>
        {selected && (
          <Icon name="check" family="MaterialIcons" size="sm" color="#FFFFFF" />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export const FilterRangeSlider: FC<FilterRangeSliderProps> = ({
  label,
  min,
  max,
  currentMin = min,
  currentMax = max,
  onRangeChange,
  formatValue = (v) => v.toString(),
  testID,
}) => {
  const { theme } = useTheme();
  const [localMin, setLocalMin] = useState(currentMin.toString());
  const [localMax, setLocalMax] = useState(currentMax.toString());

  const styles = StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.sm,
    },
    label: {
      fontSize: theme.typography.size.md,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    inputContainer: {
      flex: 1,
    },
    inputLabel: {
      fontSize: theme.typography.size.xs,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      padding: theme.spacing.sm,
      fontSize: theme.typography.size.md,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.surface,
    },
    separator: {
      marginHorizontal: theme.spacing.md,
      fontSize: theme.typography.size.lg,
      color: theme.colors.text.secondary,
    },
    currentValues: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xs,
    },
    currentValue: {
      fontSize: theme.typography.size.sm,
      color: theme.colors.text.secondary,
    },
  });

  const handleMinChange = (text: string): void => {
    setLocalMin(text);
    const numValue = Number.parseFloat(text) || min;
    if (numValue >= min && numValue <= Number.parseFloat(localMax)) {
      onRangeChange(numValue, Number.parseFloat(localMax));
    }
  };

  const handleMaxChange = (text: string): void => {
    setLocalMax(text);
    const numValue = Number.parseFloat(text) || max;
    if (numValue <= max && numValue >= Number.parseFloat(localMin)) {
      onRangeChange(Number.parseFloat(localMin), numValue);
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mínimo</Text>
          <TextInput
            style={styles.input}
            value={localMin}
            onChangeText={handleMinChange}
            keyboardType="numeric"
            placeholder={formatValue(min)}
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>
        <Text style={styles.separator}>-</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Máximo</Text>
          <TextInput
            style={styles.input}
            value={localMax}
            onChangeText={handleMaxChange}
            keyboardType="numeric"
            placeholder={formatValue(max)}
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>
      </View>
    </View>
  );
};

export const FilterChip: FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  testID,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    chip: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.round,
      borderWidth: 1,
      borderColor: selected ? theme.colors.primary.main : theme.colors.border,
      backgroundColor: selected
        ? theme.colors.primary.light
        : theme.colors.surface,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    chipText: {
      fontSize: theme.typography.size.sm,
      color: selected ? theme.colors.primary.main : theme.colors.text.primary,
      fontWeight: selected
        ? theme.typography.weight.semibold
        : theme.typography.weight.regular,
    },
  });

  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} testID={testID}>
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
};
