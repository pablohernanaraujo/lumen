import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type {
  CompositeNavigationProp,
  RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  TermsModal: undefined;
  PrivacyModal: undefined;
  ProfileModal: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  CryptoDetail: { cryptoId: string };
};

export type TabStackParamList = {
  CryptoListTab: undefined;
  Exchange: undefined;
  Scanner: undefined;
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
  navigation: BottomTabNavigationProp<TabStackParamList, 'Scanner'>;
  route: RouteProp<TabStackParamList, 'Scanner'>;
}
