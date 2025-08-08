/* eslint-disable max-statements */
import React, { type FC, type ReactElement, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';

import { useCryptoList } from '../../hooks/api/use-crypto-list';
import { useSearchCryptos } from '../../hooks/api/use-search-cryptos';
import { useSupportedFiats } from '../../hooks/api/use-supported-fiats';
import type { CryptoCurrency } from '../../services/api-service';
import { makeStyles, useTheme } from '../../theme';
import {
  Body1,
  Body2,
  ContentWrapper,
  EmptyState,
  ErrorState,
  HStack,
  Icon,
  Image,
  LoadingIndicator,
  SearchBar,
  SkeletonLoader,
  VStack,
} from '..';

export type CurrencyPickerTab = 'crypto' | 'fiat';

export interface CurrencyPickerProps {
  initialTab?: CurrencyPickerTab;
  onSelectCrypto?: (crypto: CryptoCurrency) => void;
  onSelectFiat?: (fiat: { code: string; name?: string }) => void;
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.primary.light,
  },
  searchContainer: {
    paddingVertical: theme.spacing.sm,
  },
  listItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
}));

export const CurrencyPicker: FC<CurrencyPickerProps> = ({
  initialTab = 'crypto',
  onSelectCrypto,
  onSelectFiat,
}) => {
  const styles = useStyles();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<CurrencyPickerTab>(initialTab);
  const [query, setQuery] = useState('');

  // Crypto data
  const { cryptos, isLoading: isCryptosLoading } = useCryptoList({
    per_page: 100,
    page: 1,
    enableInfiniteScroll: false,
  });
  const {
    searchResults,
    isSearching,
    searchError,
    hasSearchQuery,
    setSearchQuery,
  } = useSearchCryptos({ allCryptos: cryptos || [] });

  const cryptoDisplay = useMemo(() => {
    if (!hasSearchQuery) return cryptos || [];
    return searchResults;
  }, [cryptos, hasSearchQuery, searchResults]);

  // Fiat data
  const {
    items: fiats,
    isLoading: isFiatsLoading,
    isError: isFiatsError,
  } = useSupportedFiats();

  const filteredFiats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fiats || [];
    return (fiats || []).filter(
      (f) => f.code.includes(q) || (f.name || '').toLowerCase().includes(q),
    );
  }, [fiats, query]);

  const renderTabs = (): ReactElement => (
    <ContentWrapper variant="body">
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'crypto' && styles.tabActive]}
          onPress={() => setActiveTab('crypto')}
          testID="tab-crypto"
        >
          <Body1 style={{ color: theme.colors.text.primary }}>Crypto</Body1>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fiat' && styles.tabActive]}
          onPress={() => setActiveTab('fiat')}
          testID="tab-fiat"
        >
          <Body1 style={{ color: theme.colors.text.primary }}>Fiat</Body1>
        </TouchableOpacity>
      </View>
    </ContentWrapper>
  );

  const renderSearch = (): ReactElement => (
    <View style={styles.searchContainer}>
      <SearchBar
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setSearchQuery(text);
        }}
        onClear={() => {
          setQuery('');
          setSearchQuery('');
        }}
        placeholder={
          activeTab === 'crypto' ? 'Buscar cripto...' : 'Buscar fiat...'
        }
        testID="currency-picker-search"
      />
    </View>
  );

  const renderCryptoList = (): ReactElement => {
    if (isSearching || isCryptosLoading) {
      return (
        <ContentWrapper variant="body">
          <VStack>
            <SkeletonLoader height={56} />
            <SkeletonLoader height={56} />
            <SkeletonLoader height={56} />
          </VStack>
        </ContentWrapper>
      );
    }

    if (searchError) {
      return (
        <ErrorState
          message="No se pudo buscar criptomonedas"
          onRetry={() => setSearchQuery(query)}
        />
      );
    }

    if (!cryptoDisplay || cryptoDisplay.length === 0) {
      return <EmptyState variant="search" message="Sin resultados" />;
    }

    return (
      <ContentWrapper variant="body">
        <FlatList
          data={cryptoDisplay}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => onSelectCrypto?.(item)}
              testID={`crypto-option-${item.id}`}
            >
              <HStack spacing="md" textAlign="left" align="center">
                <Image
                  source={{ uri: item.image }}
                  width={32}
                  height={32}
                  circular
                />
                <VStack align="flex-start" textAlign="left">
                  <Body1>{item.name}</Body1>
                  <Body2 color="secondary">{item.symbol.toUpperCase()}</Body2>
                </VStack>
              </HStack>
            </TouchableOpacity>
          )}
        />
      </ContentWrapper>
    );
  };

  const renderFiatList = (): ReactElement => {
    if (isFiatsLoading) {
      return (
        <ContentWrapper variant="body">
          <LoadingIndicator showLabel label="Cargando fiats..." />
        </ContentWrapper>
      );
    }
    if (isFiatsError || !fiats) {
      return (
        <ErrorState
          message="No se pudieron cargar las monedas fiat"
          onRetry={() => {}}
        />
      );
    }
    if (filteredFiats.length === 0) {
      return <EmptyState variant="search" message="Sin resultados" />;
    }

    return (
      <ContentWrapper variant="body">
        <FlatList
          data={filteredFiats}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => onSelectFiat?.(item)}
              testID={`fiat-option-${item.code}`}
            >
              <HStack spacing="md" textAlign="left" align="center">
                <Icon
                  name="payments"
                  family="MaterialIcons"
                  size={22}
                  color={theme.colors.text.secondary}
                />
                <VStack align="flex-start" textAlign="left">
                  <Body1>{item.name || item.code.toUpperCase()}</Body1>
                  <Body2 color="secondary">{item.code.toUpperCase()}</Body2>
                </VStack>
              </HStack>
            </TouchableOpacity>
          )}
        />
      </ContentWrapper>
    );
  };

  return (
    <View style={styles.container}>
      {renderTabs()}
      <ContentWrapper variant="body">{renderSearch()}</ContentWrapper>
      {activeTab === 'crypto' ? renderCryptoList() : renderFiatList()}
    </View>
  );
};
