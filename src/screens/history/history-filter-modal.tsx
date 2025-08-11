/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-statements */
import React, { type FC, useCallback, useState } from 'react';
import {
  Modal,
  ScrollView,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatePicker from '@react-native-community/datetimepicker';

import { BlockchainNetwork } from '../../services/wallet-validation-types';
import { makeStyles } from '../../theme';
import type {
  AddressFilter,
  AddressSort,
} from '../../types/address-history-types';
import { ButtonOutline, ButtonRegular } from '../../ui/buttons';
import { HStack, VStack } from '../../ui/layout';
import { Body1, Body2, H3 } from '../../ui/typography';

interface HistoryFilterModalProps {
  visible: boolean;
  filter: AddressFilter;
  sort: AddressSort;
  onApply: (filter: AddressFilter, sort: AddressSort) => void;
  onClose: () => void;
  onSortChange?: (sort: AddressSort) => void;
}

const useStyles = makeStyles((theme) => ({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '70%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    marginBottom: theme.spacing.xs,
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary.main + '20',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  filterOptionText: {
    flex: 1,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  filterOptionSelectedText: {
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  dateButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  dateButtonText: {
    color: theme.colors.text.secondary,
  },
  dateButtonSelected: {
    backgroundColor: theme.colors.primary.main + '20',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  dateButtonSelectedText: {
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    marginBottom: theme.spacing.xs,
  },
  sortOptionSelected: {
    backgroundColor: theme.colors.primary.main + '20',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  resetText: {
    color: theme.colors.text.secondary,
  },
  dateLabel: {
    minWidth: 60,
  },
}));

interface NetworkOption {
  label: string;
  value: BlockchainNetwork | 'all';
  icon: string;
}

interface SortOption {
  label: string;
  field: AddressSort['field'];
  icon: string;
}

const NETWORK_OPTIONS: NetworkOption[] = [
  {
    label: 'All Networks',
    value: 'all',
    icon: 'public',
  },
  {
    label: 'Bitcoin',
    value: BlockchainNetwork.Bitcoin,
    icon: 'currency-bitcoin',
  },
  {
    label: 'Ethereum',
    value: BlockchainNetwork.Ethereum,
    icon: 'currency-eth',
  },
];

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Last Used',
    field: 'dateLastUsed',
    icon: 'access-time',
  },
  {
    label: 'Date Scanned',
    field: 'dateScanned',
    icon: 'date-range',
  },
  {
    label: 'Usage Count',
    field: 'usageCount',
    icon: 'trending-up',
  },
  {
    label: 'Address',
    field: 'address',
    icon: 'sort-by-alpha',
  },
  {
    label: 'Label',
    field: 'label',
    icon: 'label',
  },
];

export const HistoryFilterModal: FC<HistoryFilterModalProps> = ({
  visible,
  filter,
  sort,
  onApply,
  onClose,
  onSortChange,
}) => {
  const styles = useStyles();

  // Local state for temporary filter values
  const [localFilter, setLocalFilter] = useState<AddressFilter>(filter);
  const [localSort, setLocalSort] = useState<AddressSort>(sort);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  const handleNetworkSelect = useCallback(
    (network: BlockchainNetwork | 'all'): void => {
      setLocalFilter((prev) => ({
        ...prev,
        network: network === 'all' ? undefined : network,
      }));
    },
    [],
  );

  const handleFavoriteFilter = useCallback(
    (isFavorite: boolean | undefined): void => {
      setLocalFilter((prev) => ({
        ...prev,
        isFavorite,
      }));
    },
    [],
  );

  const handleDateFromChange = useCallback(
    (event: any, selectedDate?: Date): void => {
      setShowDateFromPicker(false);
      if (selectedDate) {
        setLocalFilter((prev) => ({
          ...prev,
          dateFrom: selectedDate.toISOString(),
        }));
      }
    },
    [],
  );

  const handleDateToChange = useCallback(
    (event: any, selectedDate?: Date): void => {
      setShowDateToPicker(false);
      if (selectedDate) {
        setLocalFilter((prev) => ({
          ...prev,
          dateTo: selectedDate.toISOString(),
        }));
      }
    },
    [],
  );

  const handleSortSelect = useCallback(
    (field: AddressSort['field']): void => {
      const newSort: AddressSort = {
        field,
        order:
          localSort.field === field && localSort.order === 'desc'
            ? 'asc'
            : 'desc',
      };
      setLocalSort(newSort);
      onSortChange?.(newSort);
    },
    [localSort, onSortChange],
  );

  const handleReset = useCallback((): void => {
    const resetFilter: AddressFilter = {};
    const resetSort: AddressSort = {
      field: 'dateLastUsed',
      order: 'desc',
    };

    setLocalFilter(resetFilter);
    setLocalSort(resetSort);
    onApply(resetFilter, resetSort);
    onClose();
  }, [onApply, onClose]);

  const handleApply = useCallback((): void => {
    onApply(localFilter, localSort);
    onClose();
  }, [localFilter, localSort, onApply, onClose]);

  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) return 'Select date';
    return new Date(dateString).toLocaleDateString();
  }, []);

  const clearDateFrom = useCallback((): void => {
    setLocalFilter((prev) => ({
      ...prev,
      dateFrom: undefined,
    }));
  }, []);

  const clearDateTo = useCallback((): void => {
    setLocalFilter((prev) => ({
      ...prev,
      dateTo: undefined,
    }));
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <H3>Filter & Sort</H3>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent}>
            {/* Network Filter */}
            <View style={styles.section}>
              <Body1 style={styles.sectionTitle}>Network</Body1>
              {NETWORK_OPTIONS.map((option) => {
                const isSelected =
                  localFilter.network === option.value ||
                  (!localFilter.network && option.value === 'all');

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      isSelected && styles.filterOptionSelected,
                    ]}
                    onPress={(): void => handleNetworkSelect(option.value)}
                  >
                    <Icon
                      name={option.icon}
                      size={20}
                      color={isSelected ? '#007AFF' : '#666'}
                    />
                    <Body2
                      style={
                        [
                          styles.filterOptionText,
                          ...(isSelected
                            ? [styles.filterOptionSelectedText]
                            : []),
                        ] as unknown as TextStyle
                      }
                    >
                      {option.label}
                    </Body2>
                    {isSelected && (
                      <Icon name="check" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Favorites Filter */}
            <View style={styles.section}>
              <Body1 style={styles.sectionTitle}>Favorites</Body1>
              {[
                {
                  label: 'All addresses',
                  value: undefined,
                },
                {
                  label: 'Favorites only',
                  value: true,
                },
                {
                  label: 'Non-favorites only',
                  value: false,
                },
              ].map((option) => {
                const isSelected = localFilter.isFavorite === option.value;

                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.filterOption,
                      isSelected && styles.filterOptionSelected,
                    ]}
                    onPress={(): void => handleFavoriteFilter(option.value)}
                  >
                    <Icon
                      name={
                        option.value === true
                          ? 'star'
                          : option.value === false
                            ? 'star-border'
                            : 'apps'
                      }
                      size={20}
                      color={isSelected ? '#007AFF' : '#666'}
                    />
                    <Body2
                      style={
                        [
                          styles.filterOptionText,
                          ...(isSelected
                            ? [styles.filterOptionSelectedText]
                            : []),
                        ] as unknown as TextStyle
                      }
                    >
                      {option.label}
                    </Body2>
                    {isSelected && (
                      <Icon name="check" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date Range Filter */}
            <View style={styles.section}>
              <Body1 style={styles.sectionTitle}>Date Range</Body1>
              <VStack spacing="md">
                <HStack spacing="md" align="center">
                  <Body2 style={styles.dateLabel}>From:</Body2>
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      localFilter.dateFrom && styles.dateButtonSelected,
                    ]}
                    onPress={(): void => setShowDateFromPicker(true)}
                  >
                    <Body2
                      style={[
                        styles.dateButtonText,
                        ...(localFilter.dateFrom
                          ? [styles.dateButtonSelectedText]
                          : []),
                      ]}
                    >
                      {formatDate(localFilter.dateFrom)}
                    </Body2>
                  </TouchableOpacity>
                  {localFilter.dateFrom && (
                    <TouchableOpacity onPress={clearDateFrom}>
                      <Icon name="clear" size={20} color="#666" />
                    </TouchableOpacity>
                  )}
                </HStack>

                <HStack spacing="md" align="center">
                  <Body2 style={styles.dateLabel}>To:</Body2>
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      localFilter.dateTo && styles.dateButtonSelected,
                    ]}
                    onPress={(): void => setShowDateToPicker(true)}
                  >
                    <Body2
                      style={[
                        styles.dateButtonText,
                        ...(localFilter.dateTo
                          ? [styles.dateButtonSelectedText]
                          : []),
                      ]}
                    >
                      {formatDate(localFilter.dateTo)}
                    </Body2>
                  </TouchableOpacity>
                  {localFilter.dateTo && (
                    <TouchableOpacity onPress={clearDateTo}>
                      <Icon name="clear" size={20} color="#666" />
                    </TouchableOpacity>
                  )}
                </HStack>
              </VStack>
            </View>

            {/* Sort Options */}
            <View style={styles.section}>
              <Body1 style={styles.sectionTitle}>Sort By</Body1>
              {SORT_OPTIONS.map((option) => {
                const isSelected = localSort.field === option.field;

                return (
                  <TouchableOpacity
                    key={option.field}
                    style={[
                      styles.sortOption,
                      isSelected && styles.sortOptionSelected,
                    ]}
                    onPress={(): void => handleSortSelect(option.field)}
                  >
                    <Icon
                      name={option.icon}
                      size={20}
                      color={isSelected ? '#007AFF' : '#666'}
                    />
                    <Body2
                      style={
                        [
                          styles.filterOptionText,
                          ...(isSelected
                            ? [styles.filterOptionSelectedText]
                            : []),
                        ] as unknown as TextStyle
                      }
                    >
                      {option.label}
                    </Body2>
                    {isSelected && (
                      <HStack spacing="xs" align="center">
                        <Body2 style={styles.filterOptionSelectedText}>
                          {localSort.order === 'asc' ? '↑' : '↓'}
                        </Body2>
                        <Icon name="check" size={20} color="#007AFF" />
                      </HStack>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <ButtonOutline
              onPress={handleReset}
              style={styles.footerButton}
              textStyle={styles.resetText}
            >
              Reset
            </ButtonOutline>
            <ButtonRegular onPress={handleApply} style={styles.footerButton}>
              Apply
            </ButtonRegular>
          </View>

          {/* Date Pickers */}
          {showDateFromPicker && (
            <DatePicker
              value={
                localFilter.dateFrom
                  ? new Date(localFilter.dateFrom)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={handleDateFromChange}
            />
          )}

          {showDateToPicker && (
            <DatePicker
              value={
                localFilter.dateTo ? new Date(localFilter.dateTo) : new Date()
              }
              mode="date"
              display="default"
              onChange={handleDateToChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
