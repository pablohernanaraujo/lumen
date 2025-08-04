import React, { type FC, type ReactElement, useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';

import type { CryptoListScreenProps } from '../../../routing';
import { makeStyles } from '../../../theme';
import { Container, ContentWrapper, HStack, Icon, VStack } from '../../../ui';
import type { CryptoItem } from './types';

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

// Mock data for demonstration
const mockCryptos: CryptoItem[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 45230.5,
    change24h: 2.45,
    marketCap: 850000000000,
    volume24h: 25000000000,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3125.75,
    change24h: -1.23,
    marketCap: 375000000000,
    volume24h: 15000000000,
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.52,
    change24h: 5.67,
    marketCap: 17500000000,
    volume24h: 1200000000,
  },
];

export const CryptoListScreen: FC<CryptoListScreenProps> = ({ navigation }) => {
  const styles = useStyles();
  const [cryptos, setCryptos] = useState<CryptoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCryptos(mockCryptos);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCryptoPress = (cryptoId: string): void => {
    navigation.navigate('CryptoDetail', { cryptoId });
  };

  const renderCryptoItem = ({ item }: { item: CryptoItem }): ReactElement => (
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
          <Text style={styles.cryptoName}>{item.name}</Text>
          <Text style={styles.cryptoSymbol}>{item.symbol}</Text>
        </VStack>

        <VStack spacing="xs">
          <Text style={styles.cryptoPrice}>${item.price.toLocaleString()}</Text>
          <Text
            style={[
              styles.cryptoChange,
              item.change24h >= 0 ? styles.positive : styles.negative,
            ]}
          >
            {item.change24h >= 0 ? '+' : ''}
            {item.change24h.toFixed(2)}%
          </Text>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <Container>
        <ContentWrapper variant="screen">
          <VStack spacing="xl">
            <Icon name="hourglass-empty" family="MaterialIcons" size="xxxl" />
            <Text style={styles.emptyState}>Loading cryptocurrencies...</Text>
          </VStack>
        </ContentWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <ContentWrapper variant="header">
        <HStack spacing="sm">
          <Icon name="trending-up" family="MaterialIcons" size="xl" />
          <Text style={styles.title}>Crypto Portfolio</Text>
        </HStack>
      </ContentWrapper>

      <ContentWrapper variant="body" borderless>
        <FlatList
          data={cryptos}
          renderItem={renderCryptoItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: styles.cryptoCard.padding }}
          ListEmptyComponent={
            <Text style={styles.emptyState}>No cryptocurrencies found</Text>
          }
        />
      </ContentWrapper>
    </Container>
  );
};
