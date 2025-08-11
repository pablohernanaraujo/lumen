import React, { type FC, useMemo } from 'react';
import {
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import type { FiatCurrencyItem } from '../../hooks/api/use-supported-fiats';
import {
  createCurrencyFromCrypto,
  createCurrencyFromFiat,
  useExchangeConverter,
} from '../../hooks/exchange/use-exchange-converter';
import { navigate } from '../../routing';
import type { CryptoCurrency } from '../../services/api-service';
import { makeStyles, useTheme } from '../../theme';
import {
  AmountInput,
  Body1,
  Body2,
  ButtonRegular,
  ContentWrapper,
  ErrorState,
  H2,
  HStack,
  Icon,
  Image,
  ScreenWrapper,
  SkeletonLoader,
  VStack,
} from '../../ui';

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

  const {
    sourceAmount,
    destinationAmount,
    sourceCurrency,
    destinationCurrency,
    isLoadingRate,
    rateError,
    setSourceAmount,
    setDestinationAmount,
    setSourceCurrency,
    setDestinationCurrency,
    swapCurrencies,
    rateDisplay,
  } = useExchangeConverter();

  const handleSelectSourceCurrency = (payload: unknown): void => {
    const selection = payload as { type: 'crypto' | 'fiat'; value: unknown };
    if (selection.type === 'crypto') {
      setSourceCurrency(
        createCurrencyFromCrypto(selection.value as CryptoCurrency),
      );
    } else {
      setSourceCurrency(
        createCurrencyFromFiat(selection.value as FiatCurrencyItem),
      );
    }
  };

  const handleSelectDestinationCurrency = (payload: unknown): void => {
    const selection = payload as { type: 'crypto' | 'fiat'; value: unknown };
    if (selection.type === 'crypto') {
      setDestinationCurrency(
        createCurrencyFromCrypto(selection.value as CryptoCurrency),
      );
    } else {
      setDestinationCurrency(
        createCurrencyFromFiat(selection.value as FiatCurrencyItem),
      );
    }
  };

  const sourceCurrencyIcon = useMemo(() => {
    if (sourceCurrency.type === 'crypto' && sourceCurrency.image) {
      return (
        <Image
          source={{ uri: sourceCurrency.image }}
          width={20}
          height={20}
          circular
        />
      );
    }

    const iconName =
      sourceCurrency.type === 'crypto' ? 'currency-bitcoin' : 'payments';
    const iconFamily =
      sourceCurrency.type === 'crypto'
        ? 'MaterialCommunityIcons'
        : 'MaterialIcons';

    return (
      <Icon
        name={iconName}
        family={iconFamily}
        size={20}
        color={theme.colors.text.primary}
      />
    );
  }, [sourceCurrency, theme.colors.text.primary]);

  const destinationCurrencyIcon = useMemo(() => {
    if (destinationCurrency.type === 'crypto' && destinationCurrency.image) {
      return (
        <Image
          source={{ uri: destinationCurrency.image }}
          width={20}
          height={20}
          circular
        />
      );
    }

    const iconName =
      destinationCurrency.type === 'crypto' ? 'currency-bitcoin' : 'payments';
    const iconFamily =
      destinationCurrency.type === 'crypto'
        ? 'MaterialCommunityIcons'
        : 'MaterialIcons';

    return (
      <Icon
        name={iconName}
        family={iconFamily}
        size={20}
        color={theme.colors.text.primary}
      />
    );
  }, [destinationCurrency, theme.colors.text.primary]);

  const handleRetry = (): void => {
    // No need for manual retry - the hook handles refetching automatically
  };

  return (
    <ScreenWrapper>
      <ContentWrapper variant="body" style={styles.pageContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.touchableContent}>
            {rateError ? (
              <ErrorState
                title="Error de conexión"
                message={rateError}
                onRetry={handleRetry}
                testID="exchange-error-state"
              />
            ) : (
              <VStack spacing="lg">
                <VStack spacing="sm" align="flex-start" fullWidth>
                  <H2>Intercambiar</H2>
                  <Body1 emphasis="medium">
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
                            initialTab: sourceCurrency.type,
                            onSelect: handleSelectSourceCurrency,
                          })
                        }
                      >
                        <HStack spacing="sm" style={styles.tokenSelector}>
                          {sourceCurrencyIcon}
                          <Body1>{sourceCurrency.symbol}</Body1>
                          <Icon
                            name="expand-more"
                            family="MaterialIcons"
                            size={20}
                            color={theme.colors.text.secondary}
                          />
                        </HStack>
                      </TouchableOpacity>
                      <AmountInput
                        value={sourceAmount}
                        onChange={setSourceAmount}
                        maxFractionDigits={sourceCurrency.decimals}
                        placeholder="0"
                        testID="exchange-source-amount"
                        style={styles.amountInputFixed}
                        showEditIcon={false}
                      />
                    </HStack>
                  </VStack>

                  <HStack style={styles.swapButtonContainer}>
                    <ButtonRegular
                      onPress={swapCurrencies}
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
                            initialTab: destinationCurrency.type,
                            onSelect: handleSelectDestinationCurrency,
                          })
                        }
                      >
                        <HStack spacing="sm" style={styles.tokenSelector}>
                          {destinationCurrencyIcon}
                          <Body1>{destinationCurrency.symbol}</Body1>
                          <Icon
                            name="expand-more"
                            family="MaterialIcons"
                            size={20}
                            color={theme.colors.text.secondary}
                          />
                        </HStack>
                      </TouchableOpacity>
                      <AmountInput
                        value={destinationAmount}
                        onChange={setDestinationAmount}
                        maxFractionDigits={destinationCurrency.decimals}
                        placeholder="0"
                        testID="exchange-target-amount"
                        style={styles.amountInputFixed}
                        showEditIcon={false}
                      />
                    </HStack>
                  </VStack>

                  <VStack spacing="xs" style={styles.card}>
                    {isLoadingRate ? (
                      <VStack spacing="xs">
                        <SkeletonLoader width={'60%'} height={16} />
                        <SkeletonLoader width={'40%'} height={14} />
                      </VStack>
                    ) : (
                      <VStack spacing="xs">
                        <Body1 style={styles.rateText}>{rateDisplay}</Body1>
                        <Body2 style={styles.timestampText}>
                          Actualizado cada minuto
                        </Body2>
                      </VStack>
                    )}
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
