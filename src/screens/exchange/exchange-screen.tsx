import React, { type FC, useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { navigate } from '../../routing';
import { makeStyles, useTheme } from '../../theme';
import {
  AmountInput,
  Body1,
  Body2,
  ButtonRegular,
  ContentWrapper,
  EmptyState,
  ErrorState,
  H2,
  HStack,
  Icon,
  ScreenWrapper,
  SkeletonLoader,
  VStack,
} from '../../ui';

type ExchangeStatus = 'loading' | 'error' | 'empty' | 'ready';

const useStyles = makeStyles((theme) => ({
  pageContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.text.primary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  row: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  rowHeader: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.size.sm,
    fontFamily: theme.typography.family.medium,
  },
  tokenSelectorWrapper: {
    flex: 1,
  },
  tokenSelector: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  amountInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  inputFlex: {
    flex: 1,
  },
  amountInputFixed: {
    flex: 1,
  },
  touchableContent: {
    flex: 1,
  },
  swapButtonContainer: {
    alignItems: 'center',
  },
  rateText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.size.md,
    fontFamily: theme.typography.family.medium,
  },
  timestampText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.size.sm,
  },
}));

export const ExchangeScreen: FC = () => {
  const styles = useStyles();
  const { theme } = useTheme();

  const [status, setStatus] = useState<ExchangeStatus>('loading');
  const [rate, setRate] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [sourceAmountText, setSourceAmountText] = useState<string>('');
  const [targetAmountText, setTargetAmountText] = useState<string>('');

  // Mock initial load to demonstrate skeleton → ready
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulated success path
      setRate(30250.35);
      setTimestamp(Date.now());
      setStatus('ready');
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const formattedTime = useMemo(() => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }, [timestamp]);

  const handleRetry = (): void => {
    setStatus('loading');
    setTimeout(() => {
      setRate(30250.35);
      setTimestamp(Date.now());
      setStatus('ready');
    }, 600);
  };

  return (
    <ScreenWrapper>
      <ContentWrapper variant="body" style={styles.pageContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.touchableContent}>
            {status === 'loading' ? (
              <VStack spacing="lg">
                <SkeletonLoader width={180} height={32} />
                <VStack spacing="md">
                  <VStack spacing="sm" style={styles.row}>
                    <SkeletonLoader width={'30%'} height={14} />
                    <HStack spacing="md" textAlign="space-between">
                      <SkeletonLoader width={'48%'} height={44} />
                      <SkeletonLoader width={'48%'} height={44} />
                    </HStack>
                  </VStack>
                  <VStack spacing="sm" style={styles.row}>
                    <SkeletonLoader width={'30%'} height={14} />
                    <HStack spacing="md" textAlign="space-between">
                      <SkeletonLoader width={'48%'} height={44} />
                      <SkeletonLoader width={'48%'} height={44} />
                    </HStack>
                  </VStack>
                  <HStack style={styles.swapButtonContainer}>
                    <SkeletonLoader width={160} height={44} />
                  </HStack>
                  <VStack spacing="sm" style={styles.card}>
                    <SkeletonLoader width={'60%'} height={16} />
                    <SkeletonLoader width={'40%'} height={14} />
                  </VStack>
                </VStack>
              </VStack>
            ) : status === 'error' ? (
              <ErrorState
                title="Error de conexión"
                message="No pudimos obtener la información. Intenta nuevamente."
                onRetry={handleRetry}
                testID="exchange-error-state"
              />
            ) : status === 'empty' ? (
              <EmptyState
                title="Sin datos"
                message="No hay información de tasas disponible en este momento."
                actionText="Reintentar"
                onAction={handleRetry}
                testID="exchange-empty-state"
              />
            ) : (
              <VStack spacing="lg">
                <VStack spacing="sm" align="flex-start" textAlign="left">
                  <H2 style={styles.title}>Exchange</H2>
                  <Body1 color="secondary">
                    Convertí entre criptomonedas y monedas fiat.
                  </Body1>
                </VStack>

                <VStack spacing="md">
                  <VStack spacing="sm" style={styles.row}>
                    <Body2 style={styles.rowHeader}>Origen</Body2>
                    <HStack spacing="md" textAlign="space-between">
                      <TouchableOpacity
                        style={styles.tokenSelectorWrapper}
                        onPress={() =>
                          navigate('CurrencyPickerModal', {
                            initialTab: 'crypto',
                          })
                        }
                      >
                        <HStack spacing="sm" style={styles.tokenSelector}>
                          <Icon
                            name="currency-bitcoin"
                            family="MaterialCommunityIcons"
                            size={20}
                            color={theme.colors.text.primary}
                          />
                          <Body1>BTC</Body1>
                          <Icon
                            name="expand-more"
                            family="MaterialIcons"
                            size={20}
                            color={theme.colors.text.secondary}
                          />
                        </HStack>
                      </TouchableOpacity>
                      <AmountInput
                        value={sourceAmountText}
                        onChange={(text: string) => {
                          setSourceAmountText(text);
                        }}
                        maxFractionDigits={8}
                        placeholder="0"
                        testID="exchange-source-amount"
                        style={styles.amountInputFixed}
                        showEditIcon={false}
                      />
                    </HStack>
                  </VStack>

                  <HStack style={styles.swapButtonContainer}>
                    <ButtonRegular
                      onPress={() => {}}
                      iconName="swap-vert"
                      iconFamily="MaterialIcons"
                      iconPosition="left"
                      testID="exchange-swap-button"
                    >
                      Swap
                    </ButtonRegular>
                  </HStack>

                  <VStack spacing="sm" style={styles.row}>
                    <Body2 style={styles.rowHeader}>Destino</Body2>
                    <HStack spacing="md" textAlign="space-between">
                      <TouchableOpacity
                        style={styles.tokenSelectorWrapper}
                        onPress={() =>
                          navigate('CurrencyPickerModal', {
                            initialTab: 'fiat',
                          })
                        }
                      >
                        <HStack spacing="sm" style={styles.tokenSelector}>
                          <Icon
                            name="currency-usd"
                            family="MaterialCommunityIcons"
                            size={20}
                            color={theme.colors.text.primary}
                          />
                          <Body1>USDT</Body1>
                          <Icon
                            name="expand-more"
                            family="MaterialIcons"
                            size={20}
                            color={theme.colors.text.secondary}
                          />
                        </HStack>
                      </TouchableOpacity>
                      <AmountInput
                        value={targetAmountText}
                        onChange={(text: string) => {
                          setTargetAmountText(text);
                        }}
                        maxFractionDigits={2}
                        placeholder="0"
                        testID="exchange-target-amount"
                        style={styles.amountInputFixed}
                        showEditIcon={false}
                      />
                    </HStack>
                  </VStack>

                  <VStack spacing="xs" style={styles.card}>
                    <Body1 style={styles.rateText}>
                      {rate ? `1 BTC ≈ ${rate.toLocaleString()} USDT` : '—'}
                    </Body1>
                    <Body2 style={styles.timestampText}>
                      {timestamp
                        ? `Actualizado: ${formattedTime}`
                        : 'Actualizando...'}
                    </Body2>
                  </VStack>
                </VStack>
              </VStack>
            )}
          </View>
        </TouchableWithoutFeedback>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
