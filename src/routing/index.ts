// Root Navigator
export { RootNavigator } from './root-navigator';

// Stack Navigators
export { AppStack } from './app-stack';
export { AuthStack } from './auth-stack';
export { TabNavigator } from './tab-navigator';

// Navigation Service
export {
  getCurrentRoute,
  goBack,
  isNavigationReady,
  navigate,
  navigationRef,
  reset,
} from './routing-service';

// Types
export type {
  AppNavigationProp,
  AppRouteProp,
  AppStackParamList,
  AuthNavigationProp,
  AuthRouteProp,
  AuthStackParamList,
  CryptoDetailScreenProps,
  CryptoListNavigationProp,
  CryptoListScreenProps,
  ExchangeScreenProps,
  LoginScreenProps,
  RootNavigationProp,
  RootRouteProp,
  RootStackParamList,
  ScannerScreenProps,
  TabNavigationProp,
  TabRouteProp,
  TabStackParamList,
} from './types';

// Screens
export type {
  CryptoItem,
  CryptoListScreenState,
  LoginFormData,
  LoginScreenState,
} from '../screens';
export { CryptoDetailScreen, CryptoListScreen, LoginScreen } from '../screens';
export { PrivacyModalScreen, TermsModalScreen } from '../screens/modals';
