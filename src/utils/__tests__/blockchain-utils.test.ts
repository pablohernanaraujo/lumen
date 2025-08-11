/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-statements */
import { BlockchainNetwork } from '../../services/wallet-validation-types';
import {
  btcToSatoshi,
  ethToWei,
  extractAmountFromURI,
  formatAddressForDisplay,
  formatBitcoinAmount,
  formatEthereumAmount,
  getExplorerUrl,
  getNetworkFromAddress,
  getTransactionUrl,
  isTestnetAddress,
  normalizeAddress,
  satoshiToBtc,
  shortenAddress,
  weiToEth,
} from '../blockchain-utils';

describe('blockchain-utils', () => {
  describe('formatBitcoinAmount', () => {
    it('should format Bitcoin amounts correctly', () => {
      expect(formatBitcoinAmount('0.00000001')).toBe('0.00000001');
      expect(formatBitcoinAmount('1.00000000')).toBe('1');
      expect(formatBitcoinAmount('0.12345678')).toBe('0.12345678');
      expect(formatBitcoinAmount(0.001)).toBe('0.001');
      expect(formatBitcoinAmount('0.10000000')).toBe('0.1');
    });

    it('should handle invalid input', () => {
      expect(formatBitcoinAmount('invalid')).toBe('0');
      expect(formatBitcoinAmount(Number.NaN)).toBe('0');
    });
  });

  describe('formatEthereumAmount', () => {
    it('should format Ethereum amounts correctly', () => {
      expect(formatEthereumAmount('1.000000000000000000')).toBe('1');
      expect(formatEthereumAmount('0.000000000000000001')).toBe(
        '0.000000000000000001',
      );
      // Floating point precision issue with 0.1
      expect(formatEthereumAmount('0.1')).toBe('0.1');
      expect(formatEthereumAmount('0.100000000000000000')).toBe('0.1');
    });

    it('should handle invalid input', () => {
      expect(formatEthereumAmount('invalid')).toBe('0');
      expect(formatEthereumAmount(Number.NaN)).toBe('0');
    });
  });

  describe('satoshiToBtc', () => {
    it('should convert satoshi to BTC correctly', () => {
      expect(satoshiToBtc(100000000)).toBe(1);
      expect(satoshiToBtc(50000000)).toBe(0.5);
      expect(satoshiToBtc(1)).toBe(0.00000001);
      expect(satoshiToBtc(12345678)).toBe(0.12345678);
    });
  });

  describe('btcToSatoshi', () => {
    it('should convert BTC to satoshi correctly', () => {
      expect(btcToSatoshi(1)).toBe(100000000);
      expect(btcToSatoshi(0.5)).toBe(50000000);
      expect(btcToSatoshi(0.00000001)).toBe(1);
      expect(btcToSatoshi(0.12345678)).toBe(12345678);
    });

    it('should round to nearest satoshi', () => {
      expect(btcToSatoshi(0.000000001)).toBe(0);
      expect(btcToSatoshi(0.000000009)).toBe(1);
    });
  });

  describe('weiToEth', () => {
    it('should convert wei to ETH correctly', () => {
      expect(weiToEth('1000000000000000000')).toBe(1);
      expect(weiToEth('500000000000000000')).toBe(0.5);
      expect(weiToEth('1')).toBe(1e-18);
      expect(weiToEth(1000000000000000000)).toBe(1);
    });

    it('should handle string and number input', () => {
      expect(weiToEth('1000000000000000000')).toBe(1);
      expect(weiToEth(1000000000000000000)).toBe(1);
    });
  });

  describe('ethToWei', () => {
    it('should convert ETH to wei correctly', () => {
      expect(ethToWei(1)).toBe('1000000000000000000');
      expect(ethToWei(0.5)).toBe('500000000000000000');
      expect(ethToWei(0.000000000000000001)).toBe('1');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten long addresses', () => {
      expect(shortenAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')).toBe(
        '0x742d...bEb0',
      );
      expect(shortenAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(
        '1A1zP1...vfNa',
      );
    });

    it('should handle custom character counts', () => {
      expect(
        shortenAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', 8, 6),
      ).toBe('0x742d35...f0bEb0');
    });

    it('should not shorten short addresses', () => {
      expect(shortenAddress('0x123456')).toBe('0x123456');
      expect(shortenAddress('')).toBe('');
    });

    it('should handle null or undefined', () => {
      expect(shortenAddress(null as any)).toBe(null);
      expect(shortenAddress(undefined as any)).toBe(undefined);
    });
  });

  describe('getNetworkFromAddress', () => {
    it('should identify Bitcoin addresses', () => {
      expect(getNetworkFromAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(
        BlockchainNetwork.Bitcoin,
      );
      expect(getNetworkFromAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(
        BlockchainNetwork.Bitcoin,
      );
      expect(
        getNetworkFromAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'),
      ).toBe(BlockchainNetwork.Bitcoin);
    });

    it('should identify Ethereum addresses', () => {
      expect(
        getNetworkFromAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'),
      ).toBe(BlockchainNetwork.Ethereum);
      expect(
        getNetworkFromAddress('0x0000000000000000000000000000000000000000'),
      ).toBe(BlockchainNetwork.Ethereum);
    });

    it('should return Unknown for invalid addresses', () => {
      expect(getNetworkFromAddress('invalid')).toBe(BlockchainNetwork.Unknown);
      expect(getNetworkFromAddress('')).toBe(BlockchainNetwork.Unknown);
      expect(getNetworkFromAddress(null as any)).toBe(
        BlockchainNetwork.Unknown,
      );
    });
  });

  describe('getExplorerUrl', () => {
    it('should return correct Bitcoin explorer URL', () => {
      const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      expect(getExplorerUrl(address, BlockchainNetwork.Bitcoin)).toBe(
        `https://blockstream.info/address/${address}`,
      );
    });

    it('should return correct Ethereum explorer URL', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      expect(getExplorerUrl(address, BlockchainNetwork.Ethereum)).toBe(
        `https://etherscan.io/address/${address}`,
      );
    });

    it('should return null for unknown network', () => {
      expect(getExplorerUrl('address', BlockchainNetwork.Unknown)).toBe(null);
    });
  });

  describe('getTransactionUrl', () => {
    it('should return correct Bitcoin transaction URL', () => {
      const txHash =
        '0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098';
      expect(getTransactionUrl(txHash, BlockchainNetwork.Bitcoin)).toBe(
        `https://blockstream.info/tx/${txHash}`,
      );
    });

    it('should return correct Ethereum transaction URL', () => {
      const txHash =
        '0x88b44bc83add991289f24cf3e58e44b31c6bfe9a9ce75fac83f8b8f844f3b3e6';
      expect(getTransactionUrl(txHash, BlockchainNetwork.Ethereum)).toBe(
        `https://etherscan.io/tx/${txHash}`,
      );
    });

    it('should return null for unknown network', () => {
      expect(getTransactionUrl('hash', BlockchainNetwork.Unknown)).toBe(null);
    });
  });

  describe('formatAddressForDisplay', () => {
    it('should lowercase non-checksummed Ethereum addresses', () => {
      const address = '0x742d35cc6634c0532925a3b844bc9e7595f0beb0';
      expect(formatAddressForDisplay(address, BlockchainNetwork.Ethereum)).toBe(
        address.toLowerCase(),
      );
    });

    it('should preserve checksummed Ethereum addresses', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      expect(formatAddressForDisplay(address, BlockchainNetwork.Ethereum)).toBe(
        address,
      );
    });

    it('should not modify Bitcoin addresses', () => {
      const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      expect(formatAddressForDisplay(address, BlockchainNetwork.Bitcoin)).toBe(
        address,
      );
    });
  });

  describe('normalizeAddress', () => {
    it('should trim whitespace', () => {
      expect(normalizeAddress('  address  ')).toBe('address');
    });

    it('should remove internal spaces', () => {
      expect(normalizeAddress('addr ess with spaces')).toBe(
        'addresswithspaces',
      );
    });

    it('should handle multiple spaces', () => {
      expect(normalizeAddress('  addr   ess  ')).toBe('address');
    });
  });

  describe('isTestnetAddress', () => {
    it('should identify Bitcoin testnet addresses', () => {
      expect(
        isTestnetAddress('tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'),
      ).toBe(true);
      expect(isTestnetAddress('mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn')).toBe(true);
      expect(isTestnetAddress('n2Z3YNngTb5cRhx3zqZ2xkZFGf9K8U3Xvz8Eh')).toBe(
        true,
      );
      expect(isTestnetAddress('2MzQwSSnBHWHqSAqwY4fTgJkGBhsFbBGToW')).toBe(
        true,
      );
    });

    it('should identify mainnet addresses as not testnet', () => {
      expect(isTestnetAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(
        false,
      );
      expect(isTestnetAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(
        false,
      );
      expect(
        isTestnetAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'),
      ).toBe(false);
    });
  });

  describe('extractAmountFromURI', () => {
    it('should extract amount from Bitcoin URI', () => {
      const uri = 'bitcoin:address?amount=0.001';
      const result = extractAmountFromURI(uri);
      expect(result.amount).toBe('0.001');
      expect(result.unit).toBe('BTC');
    });

    it('should extract value from Ethereum URI', () => {
      const uri = 'ethereum:address?value=1000000000000000000';
      const result = extractAmountFromURI(uri);
      expect(result.amount).toBe('1000000000000000000');
      expect(result.unit).toBe('WEI');
    });

    it('should return empty object for URIs without amount', () => {
      expect(extractAmountFromURI('bitcoin:address')).toEqual({});
      expect(extractAmountFromURI('ethereum:address')).toEqual({});
    });

    it('should return empty object for invalid URIs', () => {
      expect(extractAmountFromURI('invalid')).toEqual({});
      expect(extractAmountFromURI('')).toEqual({});
    });
  });
});
