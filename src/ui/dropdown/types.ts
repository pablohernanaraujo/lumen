import type { StyleProp, ViewStyle } from 'react-native';

export type SortField = 'name' | 'price' | 'change24h' | 'marketCap' | 'volume';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  id: string;
  label: string;
  field: SortField;
  direction: SortDirection;
  icon?: string;
}

export interface SortDropdownProps {
  value: string;
  onValueChange: (optionId: string) => void;
  options?: SortOption[];
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  {
    id: 'marketCap-desc',
    label: 'Market Cap ↓',
    field: 'marketCap',
    direction: 'desc',
  },
  {
    id: 'marketCap-asc',
    label: 'Market Cap ↑',
    field: 'marketCap',
    direction: 'asc',
  },
  {
    id: 'price-desc',
    label: 'Precio ↓',
    field: 'price',
    direction: 'desc',
  },
  {
    id: 'price-asc',
    label: 'Precio ↑',
    field: 'price',
    direction: 'asc',
  },
  {
    id: 'change24h-desc',
    label: 'Ganadores 24h',
    field: 'change24h',
    direction: 'desc',
  },
  {
    id: 'change24h-asc',
    label: 'Perdedores 24h',
    field: 'change24h',
    direction: 'asc',
  },
  {
    id: 'volume-desc',
    label: 'Volumen ↓',
    field: 'volume',
    direction: 'desc',
  },
  {
    id: 'volume-asc',
    label: 'Volumen ↑',
    field: 'volume',
    direction: 'asc',
  },
  {
    id: 'name-asc',
    label: 'Nombre A-Z',
    field: 'name',
    direction: 'asc',
  },
  {
    id: 'name-desc',
    label: 'Nombre Z-A',
    field: 'name',
    direction: 'desc',
  },
];
