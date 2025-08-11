/* eslint-disable max-nested-callbacks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AddressStorageService } from '../address-storage-service';
import { BlockchainNetwork } from '../wallet-validation-types';

// Mock EncryptedStorage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Analytics Service
jest.mock('../analytics-service', () => ({
  analyticsService: {
    track: jest.fn(),
  },
}));

// Mock console methods to avoid test noise
const originalConsole = console;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

describe('AddressStorageService', () => {
  const mockAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
  const mockNetwork = BlockchainNetwork.Bitcoin;

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the memory cache to ensure clean state for each test
    (AddressStorageService as any).memoryCache = null;
    (AddressStorageService as any).cacheTimestamp = 0;

    // Reset EncryptedStorage mocks
    const EncryptedStorage = require('react-native-encrypted-storage');
    EncryptedStorage.getItem.mockReset();
    EncryptedStorage.setItem.mockReset();
    EncryptedStorage.removeItem.mockReset();
  });

  describe('saveAddress', () => {
    it('should save a new address successfully', async () => {
      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValueOnce('[]'); // Empty array for first call
      EncryptedStorage.setItem.mockResolvedValueOnce();

      const result = await AddressStorageService.saveAddress(
        mockAddress,
        mockNetwork,
        {
          addressType: 'NativeSegWit',
          source: 'scanner',
        },
      );

      expect(result).toMatchObject({
        address: mockAddress,
        network: mockNetwork,
        addressType: 'NativeSegWit',
        source: 'scanner',
        isFavorite: false,
        usageCount: 1,
      });

      expect(result.id).toBeDefined();
      expect(result.dateScanned).toBeDefined();
      expect(result.dateLastUsed).toBeDefined();
    });

    it('should increment usage count for existing address', async () => {
      const existingAddress = {
        id: 'test-id',
        address: mockAddress,
        network: mockNetwork,
        addressType: 'NativeSegWit',
        isFavorite: false,
        usageCount: 1,
        dateScanned: '2023-01-01T00:00:00.000Z',
        dateLastUsed: '2023-01-01T00:00:00.000Z',
        source: 'scanner' as const,
      };

      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValueOnce(
        JSON.stringify([existingAddress]),
      );
      EncryptedStorage.setItem.mockResolvedValueOnce();

      const result = await AddressStorageService.saveAddress(
        mockAddress,
        mockNetwork,
        {
          source: 'clipboard',
        },
      );

      expect(result.usageCount).toBe(2);
      expect(result.id).toBe('test-id'); // Should keep the same ID
      expect(result.dateLastUsed).not.toBe(existingAddress.dateLastUsed); // Should update timestamp
    });

    it('should trim labels to maximum length', async () => {
      const longLabel = 'A'.repeat(50); // Longer than max length of 30
      const expectedLabel = 'A'.repeat(30);

      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValueOnce('[]');
      EncryptedStorage.setItem.mockResolvedValueOnce();

      const result = await AddressStorageService.saveAddress(
        mockAddress,
        mockNetwork,
        {
          label: longLabel,
          source: 'manual',
        },
      );

      expect(result.label).toBe(expectedLabel);
    });
  });

  describe('getAddresses', () => {
    it('should return empty array when no addresses stored', async () => {
      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValueOnce(null);

      const result = await AddressStorageService.getAddresses();

      expect(result).toEqual([]);
    });

    it('should apply search filter correctly', async () => {
      const addresses = [
        {
          id: '1',
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          network: BlockchainNetwork.Bitcoin,
          label: 'My Bitcoin Wallet',
          isFavorite: false,
          usageCount: 1,
          dateScanned: '2023-01-01T00:00:00.000Z',
          dateLastUsed: '2023-01-01T00:00:00.000Z',
          source: 'scanner' as const,
        },
        {
          id: '2',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          network: BlockchainNetwork.Ethereum,
          label: 'Ethereum Test',
          isFavorite: true,
          usageCount: 3,
          dateScanned: '2023-01-02T00:00:00.000Z',
          dateLastUsed: '2023-01-02T00:00:00.000Z',
          source: 'clipboard' as const,
        },
      ];

      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValueOnce(JSON.stringify(addresses));

      // Test search by label
      const searchResult = await AddressStorageService.getAddresses({
        searchQuery: 'bitcoin',
      });

      expect(searchResult).toHaveLength(1);
      expect(searchResult[0].label).toBe('My Bitcoin Wallet');

      // Clear mock for next call
      EncryptedStorage.getItem.mockClear();
      EncryptedStorage.getItem.mockResolvedValueOnce(JSON.stringify(addresses));

      // Test network filter
      const networkResult = await AddressStorageService.getAddresses({
        network: BlockchainNetwork.Ethereum,
      });

      expect(networkResult).toHaveLength(1);
      expect(networkResult[0].network).toBe(BlockchainNetwork.Ethereum);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status successfully', async () => {
      const address = {
        id: 'test-id',
        address: mockAddress,
        network: mockNetwork,
        isFavorite: false,
        usageCount: 1,
        dateScanned: '2023-01-01T00:00:00.000Z',
        dateLastUsed: '2023-01-01T00:00:00.000Z',
        source: 'scanner' as const,
      };

      const EncryptedStorage = require('react-native-encrypted-storage');
      // getAddresses is called by toggleFavorite, so we need to mock it to return our test data
      EncryptedStorage.getItem.mockResolvedValue(JSON.stringify([address]));
      EncryptedStorage.setItem.mockResolvedValue();

      const result = await AddressStorageService.toggleFavorite('test-id');

      expect(result).toBe(true);
      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        'lumen_addresses',
        expect.stringContaining('"isFavorite":true'),
      );
    });

    it('should throw error when address not found', async () => {
      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValueOnce('[]');

      await expect(
        AddressStorageService.toggleFavorite('non-existent-id'),
      ).rejects.toThrow('Address not found');
    });

    it('should enforce favorite limit', async () => {
      // Create 50 favorite addresses (max limit)
      const favoriteAddresses = Array.from({ length: 50 }, (_, i) => ({
        id: `fav-${i}`,
        address: `address-${i}`,
        network: BlockchainNetwork.Bitcoin,
        isFavorite: true,
        usageCount: 1,
        dateScanned: '2023-01-01T00:00:00.000Z',
        dateLastUsed: '2023-01-01T00:00:00.000Z',
        source: 'scanner' as const,
      }));

      // Add one non-favorite address
      const nonFavoriteAddress = {
        id: 'non-fav',
        address: 'new-address',
        network: BlockchainNetwork.Bitcoin,
        isFavorite: false,
        usageCount: 1,
        dateScanned: '2023-01-01T00:00:00.000Z',
        dateLastUsed: '2023-01-01T00:00:00.000Z',
        source: 'scanner' as const,
      };

      const allAddresses = [...favoriteAddresses, nonFavoriteAddress];

      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValue(JSON.stringify(allAddresses));

      await expect(
        AddressStorageService.toggleFavorite('non-fav'),
      ).rejects.toThrow('Cannot exceed 50 favorites');
    });
  });

  describe('updateLabel', () => {
    it('should update label successfully', async () => {
      const address = {
        id: 'test-id',
        address: mockAddress,
        network: mockNetwork,
        isFavorite: false,
        usageCount: 1,
        dateScanned: '2023-01-01T00:00:00.000Z',
        dateLastUsed: '2023-01-01T00:00:00.000Z',
        source: 'scanner' as const,
      };

      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValue(JSON.stringify([address]));
      EncryptedStorage.setItem.mockResolvedValue();

      await AddressStorageService.updateLabel('test-id', 'New Label');

      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        'lumen_addresses',
        expect.stringContaining('"label":"New Label"'),
      );
    });

    it('should enforce label length limit', async () => {
      const address = {
        id: 'test-id',
        address: mockAddress,
        network: mockNetwork,
        isFavorite: false,
        usageCount: 1,
        dateScanned: '2023-01-01T00:00:00.000Z',
        dateLastUsed: '2023-01-01T00:00:00.000Z',
        source: 'scanner' as const,
      };

      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValue(JSON.stringify([address]));

      const longLabel = 'A'.repeat(31); // Over the 30 character limit

      await expect(
        AddressStorageService.updateLabel('test-id', longLabel),
      ).rejects.toThrow('Label cannot exceed 30 characters');
    });
  });

  describe('deleteAddress', () => {
    it('should delete address successfully', async () => {
      const address = {
        id: 'test-id',
        address: mockAddress,
        network: mockNetwork,
        isFavorite: false,
        usageCount: 1,
        dateScanned: '2023-01-01T00:00:00.000Z',
        dateLastUsed: '2023-01-01T00:00:00.000Z',
        source: 'scanner' as const,
      };

      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValueOnce(JSON.stringify([address]));
      EncryptedStorage.setItem.mockResolvedValueOnce();

      await AddressStorageService.deleteAddress('test-id');

      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        'lumen_addresses',
        '[]', // Should be empty array after deletion
      );
    });

    it('should throw error when trying to delete non-existent address', async () => {
      const EncryptedStorage = require('react-native-encrypted-storage');
      EncryptedStorage.getItem.mockResolvedValueOnce('[]');

      await expect(
        AddressStorageService.deleteAddress('non-existent-id'),
      ).rejects.toThrow('Address not found');
    });
  });
});
