import type { ViewStyle } from 'react-native';

import type { CryptoCurrency } from '../../services/api-service';

export interface CryptoItemProps {
  crypto: CryptoCurrency;
  onPress?: (cryptoId: string) => void;
  showShimmer?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export interface CryptoItemShimmerProps {
  style?: ViewStyle;
  testID?: string;
}
