import { type FC, useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import type { CryptoDetailScreenProps } from '../../../routing';
import { makeStyles } from '../../../theme';
import { Container, ContentWrapper, HStack, Icon, VStack } from '../../../ui';
import type { CryptoDetail } from './types';

const useStyles = makeStyles((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.text.secondary,
  },
  price: {
    fontSize: theme.typography.size.xxxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  change: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.semibold,
    textAlign: 'center',
  },
  positive: {
    color: theme.colors.success.main,
  },
  negative: {
    color: theme.colors.error.main,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    flex: 1,
  },
  statLabel: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.text.primary,
  },
  description: {
    fontSize: theme.typography.size.md,
    lineHeight: theme.typography.lineHeight.relaxed,
    color: theme.colors.text.primary,
  },
  emptyState: {
    textAlign: 'center',
    fontSize: theme.typography.size.lg,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xl,
  },
}));

// Mock data for demonstration
const mockCryptoDetails: Record<string, CryptoDetail> = {
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 45230.5,
    change24h: 2.45,
    change7d: -1.23,
    marketCap: 850000000000,
    volume24h: 25000000000,
    supply: 19500000,
    maxSupply: 21000000,
    description:
      "Bitcoin is the world's first cryptocurrency, created in 2009 by an unknown person using the alias Satoshi Nakamoto.",
    website: 'https://bitcoin.org',
    explorer: 'https://blockstream.info',
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3125.75,
    change24h: -1.23,
    change7d: 4.56,
    marketCap: 375000000000,
    volume24h: 15000000000,
    supply: 120000000,
    maxSupply: null,
    description:
      'Ethereum is a decentralized platform that runs smart contracts and enables developers to build decentralized applications.',
    website: 'https://ethereum.org',
    explorer: 'https://etherscan.io',
  },
  cardano: {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.52,
    change24h: 5.67,
    change7d: 2.34,
    marketCap: 17500000000,
    volume24h: 1200000000,
    supply: 34000000000,
    maxSupply: 45000000000,
    description:
      'Cardano is a blockchain platform built on peer-reviewed research and developed through evidence-based methods.',
    website: 'https://cardano.org',
    explorer: 'https://cardanoscan.io',
  },
};

export const CryptoDetailScreen: FC<CryptoDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const styles = useStyles();
  const { cryptoId } = route.params;
  const [crypto, setCrypto] = useState<CryptoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const cryptoData = mockCryptoDetails[cryptoId];
      setCrypto(cryptoData || null);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [cryptoId]);

  const handleBack = (): void => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <Container>
        <ContentWrapper variant="screen">
          <VStack spacing="xl">
            <Icon name="hourglass-empty" family="MaterialIcons" size="xxxl" />
            <Text style={styles.emptyState}>Loading details...</Text>
          </VStack>
        </ContentWrapper>
      </Container>
    );
  }

  if (!crypto) {
    return (
      <Container>
        <ContentWrapper variant="screen">
          <VStack spacing="xl">
            <Icon name="error-outline" family="MaterialIcons" size="xxxl" />
            <Text style={styles.emptyState}>Cryptocurrency not found</Text>
          </VStack>
        </ContentWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <ContentWrapper variant="header">
        <HStack spacing="md">
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            testID="back-button"
          >
            <Icon name="arrow-back" family="MaterialIcons" size="lg" />
          </TouchableOpacity>

          <VStack spacing="xs">
            <Text style={styles.title}>{crypto.name}</Text>
            <Text style={styles.subtitle}>{crypto.symbol}</Text>
          </VStack>
        </HStack>
      </ContentWrapper>

      <ContentWrapper variant="body">
        <VStack spacing="xl">
          {/* Price Section */}
          <VStack spacing="sm">
            <Text style={styles.price}>${crypto.price.toLocaleString()}</Text>
            <Text
              style={[
                styles.change,
                crypto.change24h >= 0 ? styles.positive : styles.negative,
              ]}
            >
              {crypto.change24h >= 0 ? '+' : ''}
              {crypto.change24h.toFixed(2)}% (24h)
            </Text>
          </VStack>

          {/* Stats Grid */}
          <VStack spacing="md">
            <HStack spacing="md">
              <VStack spacing="xs" style={styles.statCard}>
                <Text style={styles.statLabel}>Market Cap</Text>
                <Text style={styles.statValue}>
                  ${(crypto.marketCap / 1000000000).toFixed(2)}B
                </Text>
              </VStack>

              <VStack spacing="xs" style={styles.statCard}>
                <Text style={styles.statLabel}>Volume (24h)</Text>
                <Text style={styles.statValue}>
                  ${(crypto.volume24h / 1000000000).toFixed(2)}B
                </Text>
              </VStack>
            </HStack>

            <HStack spacing="md">
              <VStack spacing="xs" style={styles.statCard}>
                <Text style={styles.statLabel}>Supply</Text>
                <Text style={styles.statValue}>
                  {(crypto.supply / 1000000).toFixed(2)}M
                </Text>
              </VStack>

              <VStack spacing="xs" style={styles.statCard}>
                <Text style={styles.statLabel}>Max Supply</Text>
                <Text style={styles.statValue}>
                  {crypto.maxSupply
                    ? `${(crypto.maxSupply / 1000000).toFixed(2)}M`
                    : 'No Limit'}
                </Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Description */}
          <VStack spacing="sm">
            <Text style={styles.title}>About {crypto.name}</Text>
            <Text style={styles.description}>{crypto.description}</Text>
          </VStack>
        </VStack>
      </ContentWrapper>
    </Container>
  );
};
