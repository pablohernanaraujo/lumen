export enum BlockchainNetwork {
  Bitcoin = 'bitcoin',
  Ethereum = 'ethereum',
  Unknown = 'unknown',
}

export enum BitcoinAddressType {
  Legacy = 'legacy', // P2PKH - starts with 1
  SegWit = 'segwit', // P2SH - starts with 3
  NativeSegWit = 'native-segwit', // Bech32 - starts with bc1
  Invalid = 'invalid',
}

export interface ValidationResult {
  isValid: boolean;
  network?: BlockchainNetwork;
  addressType?: BitcoinAddressType | 'ethereum';
  address?: string;
  errorMessage?: string;
}

export interface ParsedURI {
  isValid: boolean;
  network?: BlockchainNetwork;
  address?: string;
  amount?: string;
  label?: string;
  message?: string;
  gas?: string;
  value?: string;
  errorMessage?: string;
}

export interface WalletValidationError {
  code: string;
  message: string;
}

export const ValidationErrors = {
  INVALID_FORMAT: {
    code: 'INVALID_FORMAT',
    message: 'Invalid address format',
  },
  INVALID_CHECKSUM: {
    code: 'INVALID_CHECKSUM',
    message: 'Invalid address checksum',
  },
  INVALID_LENGTH: {
    code: 'INVALID_LENGTH',
    message: 'Invalid address length',
  },
  INVALID_PREFIX: {
    code: 'INVALID_PREFIX',
    message: 'Invalid address prefix',
  },
  INVALID_CHARACTERS: {
    code: 'INVALID_CHARACTERS',
    message: 'Address contains invalid characters',
  },
  EMPTY_ADDRESS: {
    code: 'EMPTY_ADDRESS',
    message: 'Address cannot be empty',
  },
  INVALID_URI: {
    code: 'INVALID_URI',
    message: 'Invalid URI format',
  },
  UNSUPPORTED_NETWORK: {
    code: 'UNSUPPORTED_NETWORK',
    message: 'Unsupported blockchain network',
  },
} as const;
