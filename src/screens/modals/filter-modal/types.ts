import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../routing';

export interface FilterModalScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FilterModal'>;
}

export interface PriceFilter {
  enabled: boolean;
  min?: number;
  max?: number;
}

export interface MarketCapFilter {
  enabled: boolean;
  category?: 'small' | 'mid' | 'large' | 'custom';
  min?: number;
  max?: number;
}

export interface VolumeFilter {
  enabled: boolean;
  min?: number;
  max?: number;
}

export interface ChangeFilter {
  enabled: boolean;
  type?: 'gainers' | 'losers' | 'custom';
  min?: number;
  max?: number;
}

export interface RankingFilter {
  enabled: boolean;
  topN?: 10 | 50 | 100 | 500;
}

export interface QuickFilter {
  trending?: boolean;
  recentlyAdded?: boolean;
  highVolume?: boolean;
}

export interface CryptoFilters {
  price?: PriceFilter;
  marketCap?: MarketCapFilter;
  volume?: VolumeFilter;
  change24h?: ChangeFilter;
  ranking?: RankingFilter;
  quickFilters?: QuickFilter;
}

export interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export interface FilterOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

export interface FilterRangeSliderProps {
  label: string;
  min: number;
  max: number;
  currentMin?: number;
  currentMax?: number;
  onRangeChange: (min: number, max: number) => void;
  formatValue?: (value: number) => string;
  testID?: string;
}

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

export interface ActiveFiltersProps {
  filters: CryptoFilters;
  onClear: () => void;
}
