// Root Navigator
export { RootNavigator } from './root-navigator';

// Stack Navigators
export { AppStack } from './app-stack';
export { AuthStack } from './auth-stack';

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
  CryptoListScreenProps,
  LoginScreenProps,
  RegisterScreenProps,
  RootNavigationProp,
  RootRouteProp,
  RootStackParamList,
  SplashScreenProps,
} from './types';

// Screens
export type {
  CryptoItem,
  CryptoListScreenState,
  LoginFormData,
  LoginScreenState,
  RegisterFormData,
  RegisterScreenState,
  SplashScreenState,
} from '../screens';
export {
  CryptoDetailScreen,
  CryptoListScreen,
  LoginScreen,
  RegisterScreen,
  SplashScreen,
} from '../screens';
