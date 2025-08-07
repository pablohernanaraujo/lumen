import React, { type FC, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { makeStyles, useTheme } from '../../theme';
import { Icon } from '../icon';
import { DEFAULT_SORT_OPTIONS, type SortOption } from './types';

const useStyles = makeStyles((theme) => ({
  button: {
    position: 'relative',
    padding: theme.spacing.sm,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.main,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    maxHeight: '60%',
    paddingBottom: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  optionsList: {
    paddingVertical: theme.spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  optionActive: {
    backgroundColor: theme.colors.primary.light,
  },
  optionText: {
    fontSize: theme.typography.size.md,
    color: theme.colors.text.primary,
  },
  optionTextActive: {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.weight.bold,
  },
  optionIcon: {
    marginLeft: theme.spacing.sm,
  },
}));

export interface SortButtonProps {
  value: string;
  onValueChange: (optionId: string) => void;
  options?: SortOption[];
  testID?: string;
}

export const SortButton: FC<SortButtonProps> = ({
  value,
  onValueChange,
  options = DEFAULT_SORT_OPTIONS,
  testID = 'sort-button',
}) => {
  const styles = useStyles();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  const isDefaultSort = value === 'marketCap-desc';
  const selectedOption = options.find((opt) => opt.id === value);

  const openModal = (): void => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = (): void => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  };

  const handleOptionPress = (optionId: string): void => {
    onValueChange(optionId);
    closeModal();
  };

  return (
    <>
      <TouchableOpacity
        onPress={openModal}
        style={styles.button}
        testID={testID}
      >
        <Icon
          name="swap-vert"
          family="MaterialIcons"
          size={28}
          color="text.primary"
        />
        {!isDefaultSort && <View style={styles.indicator} />}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContent,
                  { transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ordenar por</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                    testID={`${testID}-close`}
                  >
                    <Icon
                      name="close"
                      family="MaterialIcons"
                      size={24}
                      color={theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.optionsList}>
                  {options.map((option) => {
                    const isActive = option.id === value;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[styles.option, isActive && styles.optionActive]}
                        onPress={() => handleOptionPress(option.id)}
                        testID={`${testID}-option-${option.id}`}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isActive && styles.optionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {isActive && (
                          <Icon
                            name="check"
                            family="MaterialIcons"
                            size={20}
                            color={theme.colors.primary.main}
                            style={styles.optionIcon}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};
