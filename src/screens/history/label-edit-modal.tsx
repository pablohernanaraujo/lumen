/* eslint-disable max-statements */
import React, { type FC, useCallback, useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  TextInput,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { makeStyles } from '../../theme';
import type { StoredAddress } from '../../types/address-history-types';
import { STORAGE_CONFIG } from '../../types/address-history-types';
import { ButtonOutline, ButtonRegular } from '../../ui/buttons';
import { HStack } from '../../ui/layout';
import { Body1, Body2, H3 } from '../../ui/typography';
import { shortenAddress } from '../../utils/blockchain-utils';

interface LabelEditModalProps {
  visible: boolean;
  item: StoredAddress;
  onSave: (item: StoredAddress, label: string) => Promise<void>;
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    margin: theme.spacing.lg,
    minWidth: 300,
    maxWidth: '90%',
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  addressInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  networkBadge: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
  },
  networkText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addressText: {
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  content: {
    padding: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background,
  },
  textInputFocused: {
    borderColor: theme.colors.primary.main,
    borderWidth: 2,
  },
  textInputError: {
    borderColor: theme.colors.error.main,
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.xs,
    color: theme.colors.text.tertiary,
    fontSize: 12,
  },
  characterCountWarning: {
    color: theme.colors.warning.main,
  },
  characterCountError: {
    color: theme.colors.error.main,
  },
  errorText: {
    color: theme.colors.error.main,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    paddingTop: 0,
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  currentLabelContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  currentLabelText: {
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
}));

export const LabelEditModal: FC<LabelEditModalProps> = ({
  visible,
  item,
  onSave,
  onClose,
}) => {
  const styles = useStyles();

  const [label, setLabel] = useState(item.label || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const characterCount = label.length;
  const isAtLimit = characterCount >= STORAGE_CONFIG.MAX_LABEL_LENGTH;
  const isNearLimit = characterCount >= STORAGE_CONFIG.MAX_LABEL_LENGTH - 5;
  const hasChanges = label.trim() !== (item.label || '');

  const handleSave = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    const trimmedLabel = label.trim();

    // Validation
    if (trimmedLabel.length > STORAGE_CONFIG.MAX_LABEL_LENGTH) {
      setError(
        `Label cannot exceed ${STORAGE_CONFIG.MAX_LABEL_LENGTH} characters`,
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onSave(item, trimmedLabel);

      HapticFeedback.trigger('impactLight');
      console.log('[LabelEditModal] Label saved successfully:', {
        id: item.id,
        label: trimmedLabel,
      });
    } catch (saveError) {
      console.error('[LabelEditModal] Failed to save label:', saveError);
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to save label',
      );
      HapticFeedback.trigger('notificationError');
    } finally {
      setIsLoading(false);
    }
  }, [label, item, onSave, isLoading]);

  const handleCancel = useCallback((): void => {
    if (isLoading) return;

    // Check for unsaved changes
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to close?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: onClose,
          },
        ],
      );
    } else {
      onClose();
    }
  }, [hasChanges, isLoading, onClose]);

  const handleClearLabel = useCallback((): void => {
    if (item.label) {
      Alert.alert(
        'Remove Label',
        'Are you sure you want to remove this label?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: (): void => setLabel(''),
          },
        ],
      );
    } else {
      setLabel('');
    }
  }, [item.label]);

  const getCharacterCountStyle = useCallback(() => {
    if (isAtLimit) {
      return [styles.characterCount, styles.characterCountError];
    } else if (isNearLimit) {
      return [styles.characterCount, styles.characterCountWarning];
    }
    return styles.characterCount;
  }, [isAtLimit, isNearLimit, styles]);

  const getInputStyle = useCallback(() => {
    if (error) {
      return [styles.textInput, styles.textInputError];
    } else if (isFocused) {
      return [styles.textInput, styles.textInputFocused];
    }
    return styles.textInput;
  }, [error, isFocused, styles]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCancel}
                  disabled={isLoading}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>

                <H3>Edit Label</H3>

                <View style={styles.addressInfo}>
                  <View style={styles.networkBadge}>
                    <Body2 style={styles.networkText}>{item.network}</Body2>
                  </View>
                  <Body2 style={styles.addressText}>
                    {shortenAddress(item.address, 8, 6)}
                  </Body2>
                </View>
              </View>

              {/* Content */}
              <View style={styles.content}>
                {/* Current Label Display */}
                {item.label && (
                  <View style={styles.currentLabelContainer}>
                    <Body2>Current label:</Body2>
                    <Body1 style={styles.currentLabelText}>
                      "{item.label}"
                    </Body1>
                  </View>
                )}

                {/* Input */}
                <View style={styles.inputContainer}>
                  <Body1 style={styles.label}>
                    Label {!item.label && '(optional)'}
                  </Body1>

                  <TextInput
                    style={getInputStyle()}
                    value={label}
                    onChangeText={(text): void => {
                      setLabel(text);
                      setError(null);
                    }}
                    onFocus={(): void => setIsFocused(true)}
                    onBlur={(): void => setIsFocused(false)}
                    placeholder="Enter a descriptive label..."
                    placeholderTextColor="#999"
                    maxLength={STORAGE_CONFIG.MAX_LABEL_LENGTH}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={hasChanges ? handleSave : undefined}
                    editable={!isLoading}
                  />

                  {/* Character Count */}
                  <Body2 style={getCharacterCountStyle() as TextStyle}>
                    {characterCount} / {STORAGE_CONFIG.MAX_LABEL_LENGTH}
                  </Body2>

                  {/* Error Message */}
                  {error && <Body2 style={styles.errorText}>{error}</Body2>}
                </View>

                {/* Clear Label Option */}
                {item.label && (
                  <TouchableOpacity
                    onPress={handleClearLabel}
                    disabled={isLoading}
                  >
                    <HStack spacing="sm" align="center">
                      <Icon name="delete-outline" size={16} color="#666" />
                      <Body2>Remove current label</Body2>
                    </HStack>
                  </TouchableOpacity>
                )}
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <ButtonOutline
                  onPress={handleCancel}
                  style={styles.footerButton}
                  disabled={isLoading}
                >
                  Cancel
                </ButtonOutline>
                <ButtonRegular
                  onPress={handleSave}
                  style={styles.footerButton}
                  disabled={!hasChanges || isLoading || isAtLimit}
                >
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </ButtonRegular>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
