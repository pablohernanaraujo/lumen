/* eslint-disable @typescript-eslint/no-explicit-any */
import { WalletValidationService } from '../wallet-validation-service';
import {
  BitcoinAddressType,
  BlockchainNetwork,
  ValidationErrors,
} from '../wallet-validation-types';

describe('WalletValidationService', () => {
  describe('validateBitcoinAddress', () => {
    it('should validate Legacy (P2PKH) addresses starting with 1', () => {
      const validAddresses = [
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        '1CounterpartyXXXXXXXXXXXXXXXUWLpVr',
      ];

      for (const address of validAddresses) {
        const result = WalletValidationService.validateBitcoinAddress(address);
        expect(result.isValid).toBe(true);
        expect(result.network).toBe(BlockchainNetwork.Bitcoin);
        expect(result.addressType).toBe(BitcoinAddressType.Legacy);
        expect(result.address).toBe(address);
      }
    });

    it('should validate SegWit (P2SH) addresses starting with 3', () => {
      const validAddresses = [
        '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        '3QJmV3qfvL9SuYo34YihAf3sRCW3qSinyC',
        '3Cbq7agjb8Cbq7agjb8CbqMfSm2vCbq7ag',
      ];

      for (const address of validAddresses) {
        const result = WalletValidationService.validateBitcoinAddress(address);
        expect(result.isValid).toBe(true);
        expect(result.network).toBe(BlockchainNetwork.Bitcoin);
        expect(result.addressType).toBe(BitcoinAddressType.SegWit);
        expect(result.address).toBe(address);
      }
    });

    it('should validate Native SegWit (Bech32) addresses starting with bc1', () => {
      const validAddresses = [
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        'bc1q34aq5drpuwy3wgl9lhup9892qp6svr8ldzyy7c',
      ];

      for (const address of validAddresses) {
        const result = WalletValidationService.validateBitcoinAddress(address);
        expect(result.isValid).toBe(true);
        expect(result.network).toBe(BlockchainNetwork.Bitcoin);
        expect(result.addressType).toBe(BitcoinAddressType.NativeSegWit);
        expect(result.address).toBe(address);
      }
    });

    it('should reject invalid Bitcoin addresses', () => {
      const invalidAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', // Ethereum address
        '1A1zP1eP5QGefi2DMPTfTL5SL', // Too short (25 chars)
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNaXXXXXXXXXXX', // Too long (>35 chars)
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3', // Invalid bech32 (too short)
        'bc1zw508d6qejxtdg4y5r3zarvaryvqyzf3du', // Invalid bech32 characters
        'XYZ123456789', // Random string
        '', // Empty
        'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn', // Testnet
      ];

      for (const address of invalidAddresses) {
        const result = WalletValidationService.validateBitcoinAddress(address);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();
      }
    });

    it('should reject testnet addresses', () => {
      const testnetAddresses = [
        'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn',
        'n2Z3YcoTb5c8x3zq2xkZFGf9K8U3Xvz8Eh',
        '2MzQwSSnBHWHqSAqwY4fTgJkGBhsFbBGToW',
        'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
      ];

      for (const address of testnetAddresses) {
        const result = WalletValidationService.validateBitcoinAddress(address);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe('Testnet addresses are not supported');
      }
    });

    it('should handle empty or invalid input', () => {
      const result1 = WalletValidationService.validateBitcoinAddress('');
      expect(result1.isValid).toBe(false);
      expect(result1.errorMessage).toBe(ValidationErrors.EMPTY_ADDRESS.message);

      const result2 = WalletValidationService.validateBitcoinAddress(
        null as any,
      );
      expect(result2.isValid).toBe(false);
    });
  });

  describe('validateEthereumAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
        '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
        '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
      ];

      for (const address of validAddresses) {
        const result = WalletValidationService.validateEthereumAddress(address);
        expect(result.isValid).toBe(true);
        expect(result.network).toBe(BlockchainNetwork.Ethereum);
        expect(result.addressType).toBe('ethereum');
      }
    });

    it('should validate lowercase Ethereum addresses', () => {
      const address = '0x742d35cc6634c0532925a3b844bc9e7595f0beb0';
      const result = WalletValidationService.validateEthereumAddress(address);
      expect(result.isValid).toBe(true);
      expect(result.network).toBe(BlockchainNetwork.Ethereum);
      expect(result.address).toBe(address);
    });

    it('should validate all-caps Ethereum addresses', () => {
      const address = '0x742D35CC6634C0532925A3B844BC9E7595F0BEB0';
      const result = WalletValidationService.validateEthereumAddress(address);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid Ethereum addresses', () => {
      const invalidAddresses = [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // Too short
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb00', // Too long
        '742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', // Missing 0x
        '0xGGGG35Cc6634C0532925a3b844Bc9e7595f0bEb0', // Invalid hex
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Bitcoin address
        '', // Empty
      ];

      for (const address of invalidAddresses) {
        const result = WalletValidationService.validateEthereumAddress(address);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();
      }
    });

    it('should handle empty input', () => {
      const result = WalletValidationService.validateEthereumAddress('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(ValidationErrors.EMPTY_ADDRESS.message);
    });
  });

  describe('validateAddress', () => {
    it('should detect and validate Bitcoin addresses', () => {
      const btcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      const result = WalletValidationService.validateAddress(btcAddress);
      expect(result.isValid).toBe(true);
      expect(result.network).toBe(BlockchainNetwork.Bitcoin);
    });

    it('should detect and validate Ethereum addresses', () => {
      const ethAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const result = WalletValidationService.validateAddress(ethAddress);
      expect(result.isValid).toBe(true);
      expect(result.network).toBe(BlockchainNetwork.Ethereum);
    });

    it('should reject invalid addresses', () => {
      const result = WalletValidationService.validateAddress('invalid-address');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(ValidationErrors.INVALID_FORMAT.message);
    });

    it('should handle empty input', () => {
      const result = WalletValidationService.validateAddress('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(ValidationErrors.EMPTY_ADDRESS.message);
    });

    it('should handle null or undefined input', () => {
      const result1 = WalletValidationService.validateAddress(null as any);
      expect(result1.isValid).toBe(false);

      const result2 = WalletValidationService.validateAddress(undefined as any);
      expect(result2.isValid).toBe(false);
    });
  });

  describe('parseBitcoinURI', () => {
    it('should parse valid Bitcoin URI with address only', () => {
      const uri = 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      const result = WalletValidationService.parseBitcoinURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.network).toBe(BlockchainNetwork.Bitcoin);
      expect(result.address).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    });

    it('should parse Bitcoin URI with amount', () => {
      const uri = 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001';
      const result = WalletValidationService.parseBitcoinURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.address).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
      expect(result.amount).toBe('0.001');
    });

    it('should parse Bitcoin URI with label and message', () => {
      const uri =
        'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001&label=Donation&message=Thanks';
      const result = WalletValidationService.parseBitcoinURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.amount).toBe('0.001');
      expect(result.label).toBe('Donation');
      expect(result.message).toBe('Thanks');
    });

    it('should handle encoded parameters', () => {
      const uri =
        'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?label=Coffee%20Shop&message=Payment%20for%20coffee';
      const result = WalletValidationService.parseBitcoinURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.label).toBe('Coffee Shop');
      expect(result.message).toBe('Payment for coffee');
    });

    it('should reject invalid Bitcoin URIs', () => {
      const invalidURIs = [
        'ethereum:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Wrong scheme
        'bitcoin:invalid-address', // Invalid address
        'bitcoin:', // No address
        'bitcoin:?amount=1', // No address with params
        '', // Empty
      ];

      for (const uri of invalidURIs) {
        const result = WalletValidationService.parseBitcoinURI(uri);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();
      }
    });

    it('should ignore invalid amount values', () => {
      const uri = 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=invalid';
      const result = WalletValidationService.parseBitcoinURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.amount).toBeUndefined();
    });
  });

  describe('parseEthereumURI', () => {
    it('should parse valid Ethereum URI with address only', () => {
      const uri = 'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const result = WalletValidationService.parseEthereumURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.network).toBe(BlockchainNetwork.Ethereum);
      expect(result.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
    });

    it('should parse Ethereum URI with value', () => {
      const uri =
        'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0?value=1000000000000000000';
      const result = WalletValidationService.parseEthereumURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('1000000000000000000');
    });

    it('should parse Ethereum URI with gas', () => {
      const uri =
        'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0?value=1000000000000000000&gas=21000';
      const result = WalletValidationService.parseEthereumURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('1000000000000000000');
      expect(result.gas).toBe('21000');
    });

    it('should handle EIP-681 format with chain ID', () => {
      const uri =
        'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0@1?value=1000000000000000000';
      const result = WalletValidationService.parseEthereumURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
      expect(result.value).toBe('1000000000000000000');
    });

    it('should reject invalid Ethereum URIs', () => {
      const invalidURIs = [
        'bitcoin:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', // Wrong scheme
        'ethereum:invalid-address', // Invalid address
        'ethereum:', // No address
        '', // Empty
      ];

      for (const uri of invalidURIs) {
        const result = WalletValidationService.parseEthereumURI(uri);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBeDefined();
      }
    });
  });

  describe('parseURI', () => {
    it('should detect and parse Bitcoin URIs', () => {
      const uri = 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001';
      const result = WalletValidationService.parseURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.network).toBe(BlockchainNetwork.Bitcoin);
    });

    it('should detect and parse Ethereum URIs', () => {
      const uri =
        'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0?value=1000000000000000000';
      const result = WalletValidationService.parseURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.network).toBe(BlockchainNetwork.Ethereum);
    });

    it('should reject unsupported URI schemes', () => {
      const uri = 'litecoin:LM2WMpR1Rp6j3Sa59cMXMs1SPzHkcc7CNj';
      const result = WalletValidationService.parseURI(uri);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        ValidationErrors.UNSUPPORTED_NETWORK.message,
      );
    });

    it('should handle empty or invalid input', () => {
      const result1 = WalletValidationService.parseURI('');
      expect(result1.isValid).toBe(false);

      const result2 = WalletValidationService.parseURI(null as any);
      expect(result2.isValid).toBe(false);
    });

    it('should trim whitespace from URIs', () => {
      const uri = '  bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa  ';
      const result = WalletValidationService.parseURI(uri);
      expect(result.isValid).toBe(true);
      expect(result.address).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    });
  });
});
