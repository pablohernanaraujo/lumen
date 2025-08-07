import { useCallback, useMemo, useState } from 'react';

import type { CryptoCurrency } from '../services/api-service';
import type { SortDirection, SortField } from '../ui/dropdown';

export interface UseSortDataReturn {
  sortBy: string;
  setSortBy: (sortId: string) => void;
  sortData: (data: CryptoCurrency[]) => CryptoCurrency[];
}

const getSortValue = (
  item: CryptoCurrency,
  field: SortField,
): number | string => {
  switch (field) {
    case 'name':
      return item.name.toLowerCase();
    case 'price':
      return item.current_price || 0;
    case 'change24h':
      return item.price_change_percentage_24h || 0;
    case 'marketCap':
      return item.market_cap || 0;
    case 'volume':
      return item.total_volume || 0;
    default:
      return 0;
  }
};

const compareValues = (
  aValue: number | string,
  bValue: number | string,
  direction: SortDirection,
): number => {
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return direction === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  }

  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  }

  return 0;
};

export const useSortData = (
  initialSort = 'marketCap-desc',
): UseSortDataReturn => {
  const [sortBy, setSortBy] = useState(initialSort);

  const sortData = useCallback(
    (data: CryptoCurrency[]): CryptoCurrency[] => {
      if (!data || data.length === 0) return data;

      const [field, direction] = sortBy.split('-') as [
        SortField,
        SortDirection,
      ];

      const sortedData = [...data].sort((a, b) => {
        const aValue = getSortValue(a, field);
        const bValue = getSortValue(b, field);
        return compareValues(aValue, bValue, direction);
      });

      return sortedData;
    },
    [sortBy],
  );

  return useMemo(
    () => ({
      sortBy,
      setSortBy,
      sortData,
    }),
    [sortBy, sortData],
  );
};
