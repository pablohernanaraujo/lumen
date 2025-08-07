import { useFilters } from '../../../contexts';

// This hook is now a wrapper around the context hook
// It maintains the same interface for backward compatibility
export const useCryptoFilters = (): ReturnType<typeof useFilters> =>
  useFilters();
