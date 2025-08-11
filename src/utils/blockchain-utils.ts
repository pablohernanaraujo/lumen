import { BlockchainNetwork } from '../services/wallet-validation-types';

export const formatBitcoinAmount = (amount: string | number): string => {
  const btc = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(btc)) return '0';
  return btc.toFixed(8).replace(/\.?0+$/, '');
};

export const formatEthereumAmount = (amount: string | number): string => {
  if (typeof amount === 'string') {
    const eth = Number.parseFloat(amount);
    if (Number.isNaN(eth)) return '0';
    // For string input, use the original string to avoid floating point issues
    if (amount.includes('.')) {
      // Remove trailing zeros
      return amount.replace(/\.?0+$/, '');
    }
    return amount;
  }

  const eth = amount;
  if (Number.isNaN(eth)) return '0';
  // For numeric input, format with fixed decimals
  const formatted = eth.toFixed(18);
  // Remove trailing zeros and decimal point if necessary
  return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
};

export const satoshiToBtc = (satoshi: number): number => satoshi / 100000000;

export const btcToSatoshi = (btc: number): number =>
  Math.round(btc * 100000000);

export const weiToEth = (wei: string | number): number => {
  const weiNum = typeof wei === 'string' ? Number.parseFloat(wei) : wei;
  return weiNum / 1e18;
};

export const ethToWei = (eth: number): string =>
  Math.round(eth * 1e18).toString();

export const shortenAddress = (
  address: string,
  startChars: number = 6,
  endChars: number = 4,
): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const getNetworkFromAddress = (address: string): BlockchainNetwork => {
  if (!address) return BlockchainNetwork.Unknown;

  if (address.startsWith('0x') && address.length === 42) {
    return BlockchainNetwork.Ethereum;
  }

  if (
    address.startsWith('1') ||
    address.startsWith('3') ||
    address.startsWith('bc1')
  ) {
    return BlockchainNetwork.Bitcoin;
  }

  return BlockchainNetwork.Unknown;
};

export const getExplorerUrl = (
  address: string,
  network: BlockchainNetwork,
): string | null => {
  switch (network) {
    case BlockchainNetwork.Bitcoin:
      return `https://blockstream.info/address/${address}`;
    case BlockchainNetwork.Ethereum:
      return `https://etherscan.io/address/${address}`;
    default:
      return null;
  }
};

export const getTransactionUrl = (
  txHash: string,
  network: BlockchainNetwork,
): string | null => {
  switch (network) {
    case BlockchainNetwork.Bitcoin:
      return `https://blockstream.info/tx/${txHash}`;
    case BlockchainNetwork.Ethereum:
      return `https://etherscan.io/tx/${txHash}`;
    default:
      return null;
  }
};

export const formatAddressForDisplay = (
  address: string,
  network: BlockchainNetwork,
): string => {
  if (network === BlockchainNetwork.Ethereum) {
    const hasChecksum = address.slice(2) !== address.slice(2).toLowerCase();
    if (!hasChecksum) {
      return address.toLowerCase();
    }
  }
  return address;
};

export const normalizeAddress = (address: string): string =>
  address.replace(/\s+/g, '').trim();

export const isTestnetAddress = (address: string): boolean => {
  const testnetPrefixes = ['tb1', 'm', 'n', '2'];

  if (address.startsWith('tb1')) return true;

  if (testnetPrefixes.includes(address[0])) {
    const secondChar = address[1];
    return /[a-km-zA-HJ-NP-Z1-9]/.test(secondChar);
  }

  return false;
};

export const extractAmountFromURI = (
  uri: string,
): { amount?: string; unit?: string } => {
  if (!uri) return {};

  const params = new URLSearchParams(uri.split('?')[1] || '');

  if (uri.startsWith('bitcoin:')) {
    const amount = params.get('amount');
    return amount
      ? {
          amount,
          unit: 'BTC',
        }
      : {};
  }

  if (uri.startsWith('ethereum:')) {
    const value = params.get('value');
    return value
      ? {
          amount: value,
          unit: 'WEI',
        }
      : {};
  }

  return {};
};
