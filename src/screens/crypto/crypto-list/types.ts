export interface CryptoItem {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export interface CryptoListScreenState {
  cryptos: CryptoItem[];
  isLoading: boolean;
  error: string | null;
  refreshing: boolean;
}
