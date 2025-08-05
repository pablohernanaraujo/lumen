import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  CryptoList: undefined;
  CryptoDetail: { cryptoId: string };
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

// Screen Props Types
export interface SplashScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
  route: RouteProp<RootStackParamList, 'Splash'>;
}

export interface LoginScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
  route: RouteProp<AuthStackParamList, 'Login'>;
}

export interface CryptoListScreenProps {
  navigation: NativeStackNavigationProp<AppStackParamList, 'CryptoList'>;
  route: RouteProp<AppStackParamList, 'CryptoList'>;
}

export interface CryptoDetailScreenProps {
  navigation: NativeStackNavigationProp<AppStackParamList, 'CryptoDetail'>;
  route: RouteProp<AppStackParamList, 'CryptoDetail'>;
}
