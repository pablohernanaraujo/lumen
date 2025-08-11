import { type BlockchainNetwork } from '../services/wallet-validation-types';

export interface StoredAddress {
  id: string;
  address: string;
  network: BlockchainNetwork;
  addressType?: string;
  label?: string;
  isFavorite: boolean;
  usageCount: number;
  dateScanned: string; // ISO string
  dateLastUsed: string; // ISO string
  source: 'scanner' | 'manual' | 'clipboard';
  amount?: string;
  unit?: string;
  message?: string;
  uri?: string; // Original URI if scanned from URI
}

export interface AddressFilter {
  searchQuery?: string;
  network?: BlockchainNetwork;
  isFavorite?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface AddressSort {
  field: 'dateScanned' | 'dateLastUsed' | 'usageCount' | 'label' | 'address';
  order: 'asc' | 'desc';
}

export interface StorageMetrics {
  totalAddresses: number;
  favoriteCount: number;
  oldestEntry?: string;
  newestEntry?: string;
  storageSize: number; // in bytes
}

export interface StorageStats {
  scanCount: number;
  successfulScans: number;
  errorCount: number;
  lastScanDate?: string;
  averageScanDuration?: number;
}

export interface MigrationInfo {
  version: number;
  migrationDate: string;
  previousVersion?: number;
}

export const STORAGE_CONFIG = {
  MAX_ADDRESSES: 500,
  MAX_LABEL_LENGTH: 30,
  MAX_FAVORITES: 50,
  ENCRYPTION_KEY: 'lumen_address_storage',
  VERSION: 1,
} as const;

export const STORAGE_KEYS = {
  ADDRESSES: 'lumen_addresses',
  STATS: 'lumen_stats',
  MIGRATION_INFO: 'lumen_migration',
  USER_PREFERENCES: 'lumen_preferences',
} as const;
