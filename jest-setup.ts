import { ReactNode } from 'react';

// Jest setup for React Native Testing Library

// Mock react-native modules
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

// Mock StatusBar
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => ({
  __esModule: true,
  default: 'StatusBar',
}));

// Mock vector icons
jest.mock('react-native-vector-icons/AntDesign', () => 'AntDesign');
jest.mock('react-native-vector-icons/Entypo', () => 'Entypo');
jest.mock('react-native-vector-icons/EvilIcons', () => 'EvilIcons');
jest.mock('react-native-vector-icons/Feather', () => 'Feather');
jest.mock('react-native-vector-icons/FontAwesome', () => 'FontAwesome');
jest.mock('react-native-vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('react-native-vector-icons/Foundation', () => 'Foundation');
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock(
  'react-native-vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons',
);
jest.mock('react-native-vector-icons/Octicons', () => 'Octicons');
jest.mock('react-native-vector-icons/SimpleLineIcons', () => 'SimpleLineIcons');
jest.mock('react-native-vector-icons/Zocial', () => 'Zocial');

// Mock react-native-keyboard-aware-scroll-view
jest.mock('react-native-keyboard-aware-scroll-view', () => ({
  KeyboardAwareScrollView: 'KeyboardAwareScrollView',
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
  SafeAreaView: ({ children }: { children: ReactNode }) => children,
  useSafeAreaInsets: () => ({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }),
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: ReactNode }) => children,
  createNavigationContainerRef: () => ({
    isReady: () => true,
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    canGoBack: () => true,
    getCurrentRoute: () => ({ name: 'Splash' }),
  }),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    isFocused: () => true,
    canGoBack: () => true,
    getId: () => 'test-navigator',
    getParent: () => null,
    getState: () => ({
      routes: [{ name: 'Splash' }],
      index: 0,
    }),
  }),
  useRoute: () => ({
    params: {},
    name: 'Splash',
    key: 'test-route',
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: ReactNode }) => children,
    Screen: ({ children }: { children: ReactNode }) => children,
  }),
}));

// Global test configuration
beforeEach(() => {
  jest.clearAllMocks();
});
