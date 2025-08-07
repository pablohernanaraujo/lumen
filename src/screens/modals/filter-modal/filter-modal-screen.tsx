/* eslint-disable complexity */
import React, { type FC, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { makeStyles } from '../../../theme';
import {
  ButtonOutline,
  ButtonRegular,
  ContentWrapper,
  H2,
  ScreenWrapper,
  VStack,
} from '../../../ui';
import {
  FilterChip,
  FilterOption,
  FilterRangeSlider,
  FilterSection,
} from './filter-components';
import type { FilterModalScreenProps } from './types';
import { useCryptoFilters } from './use-crypto-filters';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text.primary,
  },
  activeFiltersText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.primary.main,
    marginTop: theme.spacing.xs,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: theme.spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
}));

export const FilterModalScreen: FC<FilterModalScreenProps> = ({
  navigation,
}) => {
  const styles = useStyles();
  const {
    filters,
    hasActiveFilters,
    clearFilters,
    updatePriceFilter,
    updateMarketCapFilter,
    updateVolumeFilter,
    updateChange24hFilter,
    updateRankingFilter,
    toggleQuickFilter,
    getActiveFilterCount,
  } = useCryptoFilters();

  const [expandedSections, setExpandedSections] = useState<{
    price: boolean;
    marketCap: boolean;
    volume: boolean;
    change: boolean;
    ranking: boolean;
    quick: boolean;
  }>({
    price: true,
    marketCap: false,
    volume: false,
    change: false,
    ranking: false,
    quick: false,
  });

  const toggleSection = (section: keyof typeof expandedSections): void => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApplyFilters = (): void => {
    navigation.goBack();
  };

  const handleClearFilters = async (): Promise<void> => {
    await clearFilters();
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <ScreenWrapper disableSafeArea>
      <ContentWrapper variant="header">
        <View style={styles.header}>
          <H2>Filtros</H2>
          {activeFilterCount > 0 && (
            <Text style={styles.activeFiltersText}>
              {activeFilterCount} filtro{activeFilterCount !== 1 ? 's' : ''}{' '}
              activo{activeFilterCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </ContentWrapper>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ContentWrapper variant="body">
          <VStack spacing="md">
            {/* Quick Filters */}
            <FilterSection
              title="Filtros Rápidos"
              isExpanded={expandedSections.quick}
              onToggle={() => toggleSection('quick')}
            >
              <View style={styles.chipContainer}>
                <FilterChip
                  label="Tendencia"
                  selected={filters.quickFilters?.trending || false}
                  onPress={() => toggleQuickFilter('trending')}
                  testID="filter-chip-trending"
                />
                <FilterChip
                  label="Alto Volumen"
                  selected={filters.quickFilters?.highVolume || false}
                  onPress={() => toggleQuickFilter('highVolume')}
                  testID="filter-chip-high-volume"
                />
                <FilterChip
                  label="Agregado Recientemente"
                  selected={filters.quickFilters?.recentlyAdded || false}
                  onPress={() => toggleQuickFilter('recentlyAdded')}
                  testID="filter-chip-recently-added"
                />
              </View>
            </FilterSection>

            {/* Price Filter */}
            <FilterSection
              title="Precio"
              isExpanded={expandedSections.price}
              onToggle={() => toggleSection('price')}
            >
              <VStack spacing="sm">
                <FilterOption
                  label="Menos de $1"
                  selected={
                    filters.price?.enabled === true && filters.price?.max === 1
                  }
                  onPress={() => updatePriceFilter(0, 1)}
                  testID="filter-price-under-1"
                />
                <FilterOption
                  label="$1 - $100"
                  selected={
                    filters.price?.enabled === true &&
                    filters.price?.min === 1 &&
                    filters.price?.max === 100
                  }
                  onPress={() => updatePriceFilter(1, 100)}
                  testID="filter-price-1-100"
                />
                <FilterOption
                  label="$100 - $1,000"
                  selected={
                    filters.price?.enabled === true &&
                    filters.price?.min === 100 &&
                    filters.price?.max === 1000
                  }
                  onPress={() => updatePriceFilter(100, 1000)}
                  testID="filter-price-100-1000"
                />
                <FilterOption
                  label="Más de $1,000"
                  selected={
                    filters.price?.enabled === true &&
                    filters.price?.min === 1000 &&
                    filters.price?.max === undefined
                  }
                  onPress={() => updatePriceFilter(1000)}
                  testID="filter-price-over-1000"
                />
                <FilterRangeSlider
                  label="Rango personalizado"
                  min={0}
                  max={10000}
                  currentMin={filters.price?.min}
                  currentMax={filters.price?.max}
                  onRangeChange={updatePriceFilter}
                  formatValue={(v) => `$${v}`}
                  testID="filter-price-range"
                />
              </VStack>
            </FilterSection>

            {/* Market Cap Filter */}
            <FilterSection
              title="Capitalización de Mercado"
              isExpanded={expandedSections.marketCap}
              onToggle={() => toggleSection('marketCap')}
            >
              <VStack spacing="sm">
                <FilterOption
                  label="Small Cap (< $1B)"
                  selected={
                    filters.marketCap?.enabled === true &&
                    filters.marketCap?.category === 'small'
                  }
                  onPress={() => updateMarketCapFilter('small')}
                  testID="filter-market-cap-small"
                />
                <FilterOption
                  label="Mid Cap ($1B - $10B)"
                  selected={
                    filters.marketCap?.enabled === true &&
                    filters.marketCap?.category === 'mid'
                  }
                  onPress={() => updateMarketCapFilter('mid')}
                  testID="filter-market-cap-mid"
                />
                <FilterOption
                  label="Large Cap (> $10B)"
                  selected={
                    filters.marketCap?.enabled === true &&
                    filters.marketCap?.category === 'large'
                  }
                  onPress={() => updateMarketCapFilter('large')}
                  testID="filter-market-cap-large"
                />
              </VStack>
            </FilterSection>

            {/* 24h Change Filter */}
            <FilterSection
              title="Cambio 24h"
              isExpanded={expandedSections.change}
              onToggle={() => toggleSection('change')}
            >
              <VStack spacing="sm">
                <FilterOption
                  label="Ganadores (> 0%)"
                  selected={
                    filters.change24h?.enabled === true &&
                    filters.change24h?.type === 'gainers'
                  }
                  onPress={() => updateChange24hFilter('gainers')}
                  testID="filter-change-gainers"
                />
                <FilterOption
                  label="Perdedores (< 0%)"
                  selected={
                    filters.change24h?.enabled === true &&
                    filters.change24h?.type === 'losers'
                  }
                  onPress={() => updateChange24hFilter('losers')}
                  testID="filter-change-losers"
                />
                <FilterRangeSlider
                  label="Rango personalizado (%)"
                  min={-100}
                  max={100}
                  currentMin={filters.change24h?.min}
                  currentMax={filters.change24h?.max}
                  onRangeChange={(min, max) =>
                    updateChange24hFilter('custom', min, max)
                  }
                  formatValue={(v) => `${v}%`}
                  testID="filter-change-range"
                />
              </VStack>
            </FilterSection>

            {/* Ranking Filter */}
            <FilterSection
              title="Ranking"
              isExpanded={expandedSections.ranking}
              onToggle={() => toggleSection('ranking')}
            >
              <View style={styles.chipContainer}>
                <FilterChip
                  label="Top 10"
                  selected={
                    filters.ranking?.enabled === true &&
                    filters.ranking?.topN === 10
                  }
                  onPress={() => updateRankingFilter(10)}
                  testID="filter-ranking-10"
                />
                <FilterChip
                  label="Top 50"
                  selected={
                    filters.ranking?.enabled === true &&
                    filters.ranking?.topN === 50
                  }
                  onPress={() => updateRankingFilter(50)}
                  testID="filter-ranking-50"
                />
                <FilterChip
                  label="Top 100"
                  selected={
                    filters.ranking?.enabled === true &&
                    filters.ranking?.topN === 100
                  }
                  onPress={() => updateRankingFilter(100)}
                  testID="filter-ranking-100"
                />
                <FilterChip
                  label="Top 500"
                  selected={
                    filters.ranking?.enabled === true &&
                    filters.ranking?.topN === 500
                  }
                  onPress={() => updateRankingFilter(500)}
                  testID="filter-ranking-500"
                />
              </View>
            </FilterSection>

            {/* Volume Filter */}
            <FilterSection
              title="Volumen 24h"
              isExpanded={expandedSections.volume}
              onToggle={() => toggleSection('volume')}
            >
              <FilterRangeSlider
                label="Rango de volumen"
                min={0}
                max={1000000000}
                currentMin={filters.volume?.min}
                currentMax={filters.volume?.max}
                onRangeChange={updateVolumeFilter}
                formatValue={(v) => {
                  if (v >= 1000000000)
                    return `$${(v / 1000000000).toFixed(1)}B`;
                  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
                  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
                  return `$${v}`;
                }}
                testID="filter-volume-range"
              />
            </FilterSection>
          </VStack>
        </ContentWrapper>
      </ScrollView>

      <ContentWrapper variant="footer">
        <View style={styles.buttonContainer}>
          <ButtonOutline
            onPress={handleClearFilters}
            testID="clear-filters-button"
            disabled={!hasActiveFilters}
            style={styles.button}
          >
            Limpiar
          </ButtonOutline>
          <ButtonRegular
            onPress={handleApplyFilters}
            testID="apply-filters-button"
            variant="primary"
            style={styles.button}
          >
            Aplicar Filtros
          </ButtonRegular>
        </View>
      </ContentWrapper>
    </ScreenWrapper>
  );
};
