/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable max-statements */
import EncryptedStorage from 'react-native-encrypted-storage';

import {
  type AddressFilter,
  type AddressSort,
  type MigrationInfo,
  STORAGE_CONFIG,
  STORAGE_KEYS,
  type StorageMetrics,
  type StorageStats,
  type StoredAddress,
} from '../types/address-history-types';
import { analyticsService } from './analytics-service';
import { type BlockchainNetwork } from './wallet-validation-types';

export class AddressStorageService {
  private static memoryCache: StoredAddress[] | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize the storage service and run migrations if needed
   */
  static async initialize(): Promise<void> {
    try {
      await this.runMigrations();
      // Preload cache
      await this.getAddresses();
      console.log('[AddressStorageService] Initialized successfully');
    } catch (error) {
      console.error('[AddressStorageService] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Save a new address to storage
   */
  static async saveAddress(
    address: string,
    network: BlockchainNetwork,
    options?: {
      addressType?: string;
      label?: string;
      source?: 'scanner' | 'manual' | 'clipboard';
      amount?: string;
      unit?: string;
      message?: string;
      uri?: string;
    },
  ): Promise<StoredAddress> {
    try {
      const addresses = await this.getAddresses();
      const now = new Date().toISOString();

      // Check if address already exists
      const existingIndex = addresses.findIndex(
        (stored) =>
          stored.address.toLowerCase() === address.toLowerCase() &&
          stored.network === network,
      );

      let savedAddress: StoredAddress;

      if (existingIndex >= 0) {
        // Update existing address
        const existing = addresses[existingIndex];
        savedAddress = {
          ...existing,
          usageCount: existing.usageCount + 1,
          dateLastUsed: now,
          // Update optional fields if provided
          ...(options?.label && {
            label: options.label.slice(0, STORAGE_CONFIG.MAX_LABEL_LENGTH),
          }),
          ...(options?.amount && { amount: options.amount }),
          ...(options?.unit && { unit: options.unit }),
          ...(options?.message && { message: options.message }),
          ...(options?.uri && { uri: options.uri }),
        };
        addresses[existingIndex] = savedAddress;
      } else {
        // Create new address entry
        savedAddress = {
          id: this.generateId(),
          address,
          network,
          addressType: options?.addressType,
          label: options?.label?.slice(0, STORAGE_CONFIG.MAX_LABEL_LENGTH),
          isFavorite: false,
          usageCount: 1,
          dateScanned: now,
          dateLastUsed: now,
          source: options?.source || 'scanner',
          amount: options?.amount,
          unit: options?.unit,
          message: options?.message,
          uri: options?.uri,
        };

        // Add to beginning of array (newest first)
        addresses.unshift(savedAddress);

        // Enforce limit using FIFO
        if (addresses.length > STORAGE_CONFIG.MAX_ADDRESSES) {
          // Remove oldest non-favorite addresses first
          const nonFavorites = addresses.filter((addr) => !addr.isFavorite);
          const favorites = addresses.filter((addr) => addr.isFavorite);

          if (
            nonFavorites.length >
            STORAGE_CONFIG.MAX_ADDRESSES - favorites.length
          ) {
            const keepNonFavorites = nonFavorites.slice(
              0,
              STORAGE_CONFIG.MAX_ADDRESSES - favorites.length,
            );
            addresses.length = 0;
            addresses.push(...keepNonFavorites, ...favorites);
          }
        }
      }

      await this.saveAddresses(addresses);
      await this.updateStats('scan_success');

      console.log('[AddressStorageService] Address saved successfully:', {
        id: savedAddress.id,
        address: savedAddress.address.slice(0, 10) + '...',
        network: savedAddress.network,
      });

      return savedAddress;
    } catch (error) {
      console.error('[AddressStorageService] Failed to save address:', error);
      await this.updateStats('scan_error');
      throw error;
    }
  }

  /**
   * Get all addresses with optional filtering and sorting
   */
  static async getAddresses(
    filter?: AddressFilter,
    sort?: AddressSort,
  ): Promise<StoredAddress[]> {
    try {
      // Check cache first
      if (this.isCacheValid()) {
        return this.applyFilterAndSort(this.memoryCache!, filter, sort);
      }

      const stored = await EncryptedStorage.getItem(STORAGE_KEYS.ADDRESSES);
      let addresses: StoredAddress[] = stored ? JSON.parse(stored) : [];

      // Update cache
      this.memoryCache = addresses;
      this.cacheTimestamp = Date.now();

      return this.applyFilterAndSort(addresses, filter, sort);
    } catch (error) {
      console.error('[AddressStorageService] Failed to get addresses:', error);
      return [];
    }
  }

  /**
   * Get favorite addresses only
   */
  static async getFavoriteAddresses(
    sort?: AddressSort,
  ): Promise<StoredAddress[]> {
    return this.getAddresses({ isFavorite: true }, sort);
  }

  /**
   * Toggle favorite status of an address
   */
  static async toggleFavorite(addressId: string): Promise<boolean> {
    try {
      const addresses = await this.getAddresses();
      const addressIndex = addresses.findIndex((addr) => addr.id === addressId);

      if (addressIndex === -1) {
        throw new Error('Address not found');
      }

      const address = addresses[addressIndex];
      const willBeFavorite = !address.isFavorite;

      // Check favorite limit
      if (willBeFavorite) {
        const currentFavorites = addresses.filter(
          (addr) => addr.isFavorite,
        ).length;
        if (currentFavorites >= STORAGE_CONFIG.MAX_FAVORITES) {
          throw new Error(
            `Cannot exceed ${STORAGE_CONFIG.MAX_FAVORITES} favorites`,
          );
        }
      }

      address.isFavorite = willBeFavorite;
      address.dateLastUsed = new Date().toISOString();

      await this.saveAddresses(addresses);

      // Track favorite toggle
      analyticsService.track('address_favorited', {
        blockchain_type: address.network,
        previous_usage_count: address.usageCount,
        is_favoriting: willBeFavorite,
      });

      console.log('[AddressStorageService] Favorite toggled:', {
        id: addressId,
        isFavorite: willBeFavorite,
      });

      return willBeFavorite;
    } catch (error) {
      console.error(
        '[AddressStorageService] Failed to toggle favorite:',
        error,
      );
      throw error;
    }
  }

  /**
   * Update label for an address
   */
  static async updateLabel(addressId: string, label: string): Promise<void> {
    try {
      const addresses = await this.getAddresses();
      const addressIndex = addresses.findIndex((addr) => addr.id === addressId);

      if (addressIndex === -1) {
        throw new Error('Address not found');
      }

      const trimmedLabel = label.trim();
      if (trimmedLabel.length > STORAGE_CONFIG.MAX_LABEL_LENGTH) {
        throw new Error(
          `Label cannot exceed ${STORAGE_CONFIG.MAX_LABEL_LENGTH} characters`,
        );
      }

      const address = addresses[addressIndex];
      const hadLabel = !!address.label;

      address.label = trimmedLabel || undefined;
      address.dateLastUsed = new Date().toISOString();

      await this.saveAddresses(addresses);

      // Track label update
      analyticsService.track('address_labeled', {
        blockchain_type: address.network,
        label_length: trimmedLabel.length,
        is_editing: hadLabel,
      });

      console.log('[AddressStorageService] Label updated:', {
        id: addressId,
        label: trimmedLabel,
      });
    } catch (error) {
      console.error('[AddressStorageService] Failed to update label:', error);
      throw error;
    }
  }

  /**
   * Delete an address
   */
  static async deleteAddress(addressId: string): Promise<void> {
    try {
      const addresses = await this.getAddresses();
      const addressToDelete = addresses.find((addr) => addr.id === addressId);

      if (!addressToDelete) {
        throw new Error('Address not found');
      }

      const filteredAddresses = addresses.filter(
        (addr) => addr.id !== addressId,
      );

      await this.saveAddresses(filteredAddresses);

      // Track address deletion
      analyticsService.track('address_deleted', {
        blockchain_type: addressToDelete.network,
        usage_count: addressToDelete.usageCount,
        was_favorite: addressToDelete.isFavorite,
        had_label: !!addressToDelete.label,
      });

      console.log('[AddressStorageService] Address deleted:', addressId);
    } catch (error) {
      console.error('[AddressStorageService] Failed to delete address:', error);
      throw error;
    }
  }

  /**
   * Clear all addresses (with confirmation)
   */
  static async clearAllAddresses(): Promise<void> {
    try {
      await EncryptedStorage.removeItem(STORAGE_KEYS.ADDRESSES);
      this.clearCache();

      console.log('[AddressStorageService] All addresses cleared');
    } catch (error) {
      console.error(
        '[AddressStorageService] Failed to clear addresses:',
        error,
      );
      throw error;
    }
  }

  /**
   * Get storage metrics
   */
  static async getStorageMetrics(): Promise<StorageMetrics> {
    try {
      const addresses = await this.getAddresses();
      const favorites = addresses.filter((addr) => addr.isFavorite);

      const dates = addresses.map((addr) => addr.dateScanned);
      const oldestEntry =
        dates.length > 0
          ? Math.min(...dates.map((d) => new Date(d).getTime()))
          : undefined;
      const newestEntry =
        dates.length > 0
          ? Math.max(...dates.map((d) => new Date(d).getTime()))
          : undefined;

      // Estimate storage size
      const jsonSize = JSON.stringify(addresses).length * 2; // UTF-16 encoding

      return {
        totalAddresses: addresses.length,
        favoriteCount: favorites.length,
        oldestEntry: oldestEntry
          ? new Date(oldestEntry).toISOString()
          : undefined,
        newestEntry: newestEntry
          ? new Date(newestEntry).toISOString()
          : undefined,
        storageSize: jsonSize,
      };
    } catch (error) {
      console.error('[AddressStorageService] Failed to get metrics:', error);
      throw error;
    }
  }

  /**
   * Get storage stats
   */
  static async getStorageStats(): Promise<StorageStats> {
    try {
      const stored = await EncryptedStorage.getItem(STORAGE_KEYS.STATS);
      return stored
        ? JSON.parse(stored)
        : {
            scanCount: 0,
            successfulScans: 0,
            errorCount: 0,
          };
    } catch (error) {
      console.error('[AddressStorageService] Failed to get stats:', error);
      return {
        scanCount: 0,
        successfulScans: 0,
        errorCount: 0,
      };
    }
  }

  /**
   * Export addresses as JSON
   */
  static async exportAddresses(): Promise<string> {
    try {
      const addresses = await this.getAddresses();
      const exportData = {
        version: STORAGE_CONFIG.VERSION,
        exportDate: new Date().toISOString(),
        addresses,
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error(
        '[AddressStorageService] Failed to export addresses:',
        error,
      );
      throw error;
    }
  }

  // Private methods

  private static async saveAddresses(
    addresses: StoredAddress[],
  ): Promise<void> {
    await EncryptedStorage.setItem(
      STORAGE_KEYS.ADDRESSES,
      JSON.stringify(addresses),
    );

    // Update cache
    this.memoryCache = addresses;
    this.cacheTimestamp = Date.now();
  }

  private static applyFilterAndSort(
    addresses: StoredAddress[],
    filter?: AddressFilter,
    sort?: AddressSort,
  ): StoredAddress[] {
    let filtered = [...addresses];

    // Apply filters
    if (filter) {
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (addr) =>
            addr.address.toLowerCase().includes(query) ||
            addr.label?.toLowerCase().includes(query) ||
            addr.network.toLowerCase().includes(query),
        );
      }

      if (filter.network) {
        filtered = filtered.filter((addr) => addr.network === filter.network);
      }

      if (filter.isFavorite !== undefined) {
        filtered = filtered.filter(
          (addr) => addr.isFavorite === filter.isFavorite,
        );
      }

      if (filter.dateFrom) {
        const fromDate = new Date(filter.dateFrom);
        filtered = filtered.filter(
          (addr) => new Date(addr.dateScanned) >= fromDate,
        );
      }

      if (filter.dateTo) {
        const toDate = new Date(filter.dateTo);
        filtered = filtered.filter(
          (addr) => new Date(addr.dateScanned) <= toDate,
        );
      }
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sort.field) {
          case 'dateScanned':
            aValue = new Date(a.dateScanned).getTime();
            bValue = new Date(b.dateScanned).getTime();
            break;
          case 'dateLastUsed':
            aValue = new Date(a.dateLastUsed).getTime();
            bValue = new Date(b.dateLastUsed).getTime();
            break;
          case 'usageCount':
            aValue = a.usageCount;
            bValue = b.usageCount;
            break;
          case 'label':
            aValue = a.label || '';
            bValue = b.label || '';
            break;
          case 'address':
            aValue = a.address;
            bValue = b.address;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sort.order === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sort.order === 'asc'
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
      });
    }

    return filtered;
  }

  private static async updateStats(
    type: 'scan_success' | 'scan_error',
  ): Promise<void> {
    try {
      const stats = await this.getStorageStats();
      const now = new Date().toISOString();

      const updatedStats: StorageStats = {
        ...stats,
        scanCount: stats.scanCount + 1,
        lastScanDate: now,
      };

      if (type === 'scan_success') {
        updatedStats.successfulScans = stats.successfulScans + 1;
      } else {
        updatedStats.errorCount = stats.errorCount + 1;
      }

      await EncryptedStorage.setItem(
        STORAGE_KEYS.STATS,
        JSON.stringify(updatedStats),
      );
    } catch (error) {
      console.error('[AddressStorageService] Failed to update stats:', error);
    }
  }

  private static async runMigrations(): Promise<void> {
    try {
      const migrationInfo = await this.getMigrationInfo();

      if (!migrationInfo || migrationInfo.version < STORAGE_CONFIG.VERSION) {
        console.log('[AddressStorageService] Running migrations...');

        // Add future migrations here
        // For now, just update the version
        const newMigrationInfo: MigrationInfo = {
          version: STORAGE_CONFIG.VERSION,
          migrationDate: new Date().toISOString(),
          previousVersion: migrationInfo?.version,
        };

        await EncryptedStorage.setItem(
          STORAGE_KEYS.MIGRATION_INFO,
          JSON.stringify(newMigrationInfo),
        );

        console.log(
          '[AddressStorageService] Migration completed:',
          newMigrationInfo,
        );
      }
    } catch (error) {
      console.error('[AddressStorageService] Migration failed:', error);
      throw error;
    }
  }

  private static async getMigrationInfo(): Promise<MigrationInfo | null> {
    try {
      const stored = await EncryptedStorage.getItem(
        STORAGE_KEYS.MIGRATION_INFO,
      );
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error(
        '[AddressStorageService] Failed to get migration info:',
        error,
      );
      return null;
    }
  }

  private static isCacheValid(): boolean {
    return (
      this.memoryCache !== null &&
      Date.now() - this.cacheTimestamp < this.CACHE_TTL
    );
  }

  private static clearCache(): void {
    this.memoryCache = null;
    this.cacheTimestamp = 0;
  }

  private static generateId(): string {
    return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
