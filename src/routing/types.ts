import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type {
  CompositeNavigationProp,
  RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { ScannerErrorModalParams } from '../screens/modals/scanner-error-modal';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  TermsModal: undefined;
  PrivacyModal: undefined;
  ProfileModal: undefined;
  FilterModal: undefined;
  CurrencyPickerModal:
    | {
        initialTab?: 'crypto' | 'fiat';
        onSelect?: (payload: unknown) => void;
      }
    | undefined;
  PermissionEducationModal:
    | {
        onRequestPermission?: () => void;
        onCancel?: () => void;
      }
    | undefined;
  ScannerErrorModal: ScannerErrorModalParams;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  CryptoDetail: { cryptoId: string };
  History: undefined;
  Favorites: undefined;
};

export type TabStackParamList = {
  CryptoListTab: undefined;
  Exchange: undefined;
  Scanner: undefined;
  Favorites: undefined;
};

// Root Navigator Types
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type RootRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;

// Auth Stack Types
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type AuthRouteProp<T extends keyof AuthStackParamList> = RouteProp<
  AuthStackParamList,
  T
>;

// App Stack Types
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type AppRouteProp<T extends keyof AppStackParamList> = RouteProp<
  AppStackParamList,
  T
>;

// Tab Navigator Types
export type TabNavigationProp = BottomTabNavigationProp<TabStackParamList>;
export type TabRouteProp<T extends keyof TabStackParamList> = RouteProp<
  TabStackParamList,
  T
>;

// Combined navigation type for screens in tabs that need to navigate to stack screens
export type CryptoListNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabStackParamList, 'CryptoListTab'>,
  NativeStackNavigationProp<AppStackParamList>
>;

// Screen Props Types
export interface LoginScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
  route: RouteProp<AuthStackParamList, 'Login'>;
}

export interface CryptoListScreenProps {
  navigation: CryptoListNavigationProp;
  route: RouteProp<TabStackParamList, 'CryptoListTab'>;
}

export interface CryptoDetailScreenProps {
  navigation: NativeStackNavigationProp<AppStackParamList, 'CryptoDetail'>;
  route: RouteProp<AppStackParamList, 'CryptoDetail'>;
}

export interface ExchangeScreenProps {
  navigation: BottomTabNavigationProp<TabStackParamList, 'Exchange'>;
  route: RouteProp<TabStackParamList, 'Exchange'>;
}

export interface ScannerScreenProps {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabStackParamList, 'Scanner'>,
    NativeStackNavigationProp<AppStackParamList>
  >;
  route: RouteProp<TabStackParamList, 'Scanner'>;
}

export interface HistoryScreenProps {
  navigation: NativeStackNavigationProp<AppStackParamList, 'History'>;
  route: RouteProp<AppStackParamList, 'History'>;
}

export interface FavoritesScreenProps {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabStackParamList, 'Favorites'>,
    NativeStackNavigationProp<AppStackParamList>
  >;
  route: RouteProp<TabStackParamList, 'Favorites'>;
}

export interface FavoritesStackScreenProps {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Favorites'>;
  route: RouteProp<AppStackParamList, 'Favorites'>;
}
