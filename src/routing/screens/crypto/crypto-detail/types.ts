export interface CryptoDetail {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  supply: number;
  maxSupply: number | null;
  description: string;
  website: string;
  explorer: string;
}

export interface CryptoDetailScreenState {
  crypto: CryptoDetail | null;
  isLoading: boolean;
  error: string | null;
}
