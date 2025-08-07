import React, { type FC, type ReactElement } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';

import { Header } from '../../../components';
import { useCryptoList } from '../../../hooks';
import type { CryptoListScreenProps } from '../../../routing';
import type { CryptoCurrency } from '../../../services/api-service';
import { makeStyles } from '../../../theme';
import {
  Body2,
  ContentWrapper,
  H3,
  HStack,
  Icon,
  ScreenWrapper,
  VStack,
} from '../../../ui';

const useStyles = makeStyles((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
  },
  cryptoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cryptoName: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
  },
  cryptoSymbol: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.text.secondary,
  },
  cryptoPrice: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.text.primary,
  },
  cryptoChange: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
  },
  positive: {
    color: theme.colors.success.main,
  },
  negative: {
    color: theme.colors.error.main,
  },
  emptyState: {
    textAlign: 'center',
    fontSize: theme.typography.size.lg,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xl,
  },
}));

export const CryptoListScreen: FC<CryptoListScreenProps> = ({ navigation }) => {
  const styles = useStyles();

  const { cryptos, isLoading, isError, refetch } = useCryptoList({
    per_page: 20,
    order: 'market_cap_desc',
  });

  const handleCryptoPress = (cryptoId: string): void => {
    navigation.navigate('CryptoDetail', { cryptoId });
  };

  const renderCryptoItem = ({
    item,
  }: {
    item: CryptoCurrency;
  }): ReactElement => (
    <TouchableOpacity
      style={styles.cryptoCard}
      onPress={() => handleCryptoPress(item.id)}
      testID={`crypto-item-${item.id}`}
    >
      <HStack spacing="md">
        <Icon
          name="currency-bitcoin"
          family="MaterialCommunityIcons"
          size="xl"
        />

        <VStack spacing="xs">
          <H3 emphasis="high">{item.name}</H3>
          <Body2 emphasis="medium">{item.symbol.toUpperCase()}</Body2>
        </VStack>

        <VStack spacing="xs">
          <Text style={styles.cryptoPrice}>
            ${item.current_price.toLocaleString()}
          </Text>
          <Text
            style={[
              styles.cryptoChange,
              item.price_change_percentage_24h >= 0
                ? styles.positive
                : styles.negative,
            ]}
          >
            {item.price_change_percentage_24h >= 0 ? '+' : ''}
            {item.price_change_percentage_24h.toFixed(2)}%
          </Text>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );

  if (isLoading && !cryptos) {
    return (
      <ScreenWrapper>
        <ContentWrapper variant="screen">
          <VStack spacing="xl">
            <Icon name="hourglass-empty" family="MaterialIcons" size="xxxl" />
            <Text style={styles.emptyState}>Loading cryptocurrencies...</Text>
          </VStack>
        </ContentWrapper>
      </ScreenWrapper>
    );
  }

  if (isError && !cryptos) {
    return (
      <ScreenWrapper>
        <ContentWrapper variant="screen">
          <VStack spacing="xl">
            <Icon name="error-outline" family="MaterialIcons" size="xxxl" />
            <Text style={styles.emptyState}>
              Failed to load cryptocurrencies
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              style={styles.cryptoCard}
              testID="retry-button"
            >
              <Text style={styles.cryptoName}>Tap to retry</Text>
            </TouchableOpacity>
          </VStack>
        </ContentWrapper>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header titleStyle={styles.title} />

      <FlatList
        data={cryptos}
        renderItem={renderCryptoItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: styles.cryptoCard.padding }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            testID="refresh-control"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyState}>No cryptocurrencies found</Text>
        }
      />
    </ScreenWrapper>
  );
};
