import React, { type FC, type ReactElement } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';

import { Header } from '../../../components';
import { useCryptoList } from '../../../hooks';
import type { CryptoListScreenProps } from '../../../routing';
import type { CryptoCurrency } from '../../../services/api-service';
import { makeStyles } from '../../../theme';
import {
  ContentWrapper,
  CryptoItem,
  Icon,
  ScreenWrapper,
  VStack,
} from '../../../ui';

const useStyles = makeStyles((theme) => ({
  emptyState: {
    textAlign: 'center',
    fontSize: theme.typography.size.lg,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xl,
  },
  retryButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  retryText: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
  },
  listContainer: {
    padding: theme.spacing.md,
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
    <CryptoItem
      crypto={item}
      onPress={handleCryptoPress}
      testID={`crypto-item-${item.id}`}
    />
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
              style={styles.retryButton}
              testID="retry-button"
            >
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </VStack>
        </ContentWrapper>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header />

      <FlatList
        data={cryptos}
        renderItem={renderCryptoItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
