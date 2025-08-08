import { type FC, type ReactElement, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import type { CryptoDetailScreenProps } from '../../../routing';
import { makeStyles } from '../../../theme';
import {
  Container,
  ContentWrapper,
  H2,
  HStack,
  Icon,
  VStack,
} from '../../../ui';
import { EmptyState, SkeletonLoader } from '../../../ui';
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
  alignCenter: {
    alignItems: 'center',
  },
  marginBottomXs: {
    marginBottom: theme.spacing.xs,
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

  const renderHeader = (): ReactElement => (
    <HStack spacing="md" textAlign="left">
      <Icon
        name="arrow-back"
        family="MaterialIcons"
        size={32}
        onPress={handleBack}
      />
      <H2>Criptomoneda</H2>
    </HStack>
  );

  const renderLoading = (): ReactElement => (
    <VStack spacing="xl">
      <VStack spacing="sm" style={styles.alignCenter}>
        <SkeletonLoader width={220} height={48} />
        <SkeletonLoader width={140} height={20} />
      </VStack>

      <VStack spacing="md">
        <HStack spacing="md">
          <View style={styles.statCard}>
            <SkeletonLoader
              width={'50%'}
              height={14}
              style={styles.marginBottomXs}
            />
            <SkeletonLoader width={100} height={18} />
          </View>
          <View style={styles.statCard}>
            <SkeletonLoader
              width={'60%'}
              height={14}
              style={styles.marginBottomXs}
            />
            <SkeletonLoader width={100} height={18} />
          </View>
        </HStack>
        <HStack spacing="md">
          <View style={styles.statCard}>
            <SkeletonLoader
              width={'40%'}
              height={14}
              style={styles.marginBottomXs}
            />
            <SkeletonLoader width={80} height={18} />
          </View>
          <View style={styles.statCard}>
            <SkeletonLoader
              width={'50%'}
              height={14}
              style={styles.marginBottomXs}
            />
            <SkeletonLoader width={80} height={18} />
          </View>
        </HStack>
      </VStack>

      <VStack spacing="sm">
        <SkeletonLoader width={180} height={28} />
        <SkeletonLoader width={'100%'} height={16} />
        <SkeletonLoader width={'90%'} height={16} />
        <SkeletonLoader width={'80%'} height={16} />
      </VStack>
    </VStack>
  );

  const renderNotFound = (): ReactElement => (
    <EmptyState
      title="Criptomoneda no encontrada"
      message="No pudimos encontrar información para este activo. Puede haber sido removido o no estar disponible."
      icon="error-outline"
      actionText="Volver"
      onAction={handleBack}
    />
  );

  const renderContent = (): ReactElement => {
    if (!crypto) return <></>;
    return (
      <VStack spacing="xl">
        <VStack spacing="sm">
          {!!crypto?.name && <Text style={styles.title}>{crypto.name}</Text>}
          {!!crypto?.symbol && (
            <Text style={styles.subtitle}>{crypto.symbol}</Text>
          )}
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

        <VStack spacing="sm">
          <Text style={styles.title}>About {crypto.name}</Text>
          <Text style={styles.description}>{crypto.description}</Text>
        </VStack>
      </VStack>
    );
  };

  return (
    <Container>
      <ContentWrapper variant="body">{renderHeader()}</ContentWrapper>
      <ContentWrapper variant="body">
        {isLoading
          ? renderLoading()
          : !crypto
            ? renderNotFound()
            : renderContent()}
      </ContentWrapper>
    </Container>
  );
};
