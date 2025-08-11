# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native 0.80.2 project called "Lumen" that has been migrated to use React Native's New Architecture, including Fabric, TurboModules, and Codegen. The project is configured with TypeScript, Jest for testing, and ESLint for code quality.

## Development Commands

### Standard Commands

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator (requires CocoaPods setup)
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint

### New Architecture Commands

- `npm run start:new-arch` - Start Metro bundler with New Architecture enabled
- `npm run android:new-arch` - Run Android with New Architecture
- `npm run ios:new-arch` - Run iOS with New Architecture
- `./scripts/new-arch.sh` - Helper script to start with New Architecture

### iOS Setup

Before running iOS for the first time or after updating dependencies:

```bash
bundle install
bundle exec pod install
```

## Architecture

This project uses React Native's New Architecture with:

- **Fabric**: New rendering system for improved performance
- **TurboModules**: Enhanced native module system
- **Codegen**: Type-safe code generation
- **Hermes**: JavaScript engine enabled on both platforms

Key environment variables for New Architecture:

- `REACT_NATIVE_USE_NEW_ARCHITECTURE=1`
- `USE_FABRIC=1`
- `USE_TURBOMODULE=1`

## Project Structure

- `app.tsx` - Main application component using `@react-native/new-app-screen`
- `android/` - Android-specific configuration and native code
- `ios/` - iOS-specific configuration and native code
- `__tests__/` - Jest test files
- `scripts/new-arch.sh` - New Architecture startup script
- `NEW_ARCHITECTURE.md` - Detailed New Architecture migration documentation

## Application Features

### Core Functionality

**Lumen** is a React Native cryptocurrency utility app that provides the following main features:

#### 1. Cryptocurrency Exchange (`src/screens/exchange/`)

- **Real-time conversion** between cryptocurrencies and fiat currencies
- **Dynamic rate updates** with automatic refresh every minute
- **Bidirectional conversion** with swap functionality
- **Currency picker modal** for selecting source and destination currencies
- **Rate limiting and caching** to optimize API usage
- **Visual feedback** during rate loading and error states

Key components:

- `ExchangeScreen` - Main exchange interface
- `use-exchange-converter.ts` - Exchange logic and rate management
- `CurrencyPickerModal` - Currency selection interface

#### 2. QR Code Scanner (`src/screens/scanner/`)

- **Advanced QR code scanning** with React Native Vision Camera
- **Cryptocurrency address validation** (Bitcoin & Ethereum)
- **URI parsing** for payment requests (bitcoin:, ethereum: schemes)
- **Enhanced permission management** with educational flows
- **Error handling** with specific error types and recovery options
- **Analytics tracking** for scan success/failure rates
- **Clipboard integration** for manual address input
- **Timeout handling** with retry mechanisms

Key components:

- `ScannerScreen` - Main scanning interface
- `CameraView` - Camera implementation with barcode detection
- `ScannerOverlay` - UI overlay with controls
- `EnhancedPermissionFlow` - Camera permission management
- `use-qr-scanner.ts` - Scanning logic and state management

#### 3. History & Favorites (`src/screens/history/`)

- **Scan history tracking** with metadata
- **Address favorites** management
- **Filtering and sorting** by network, date, usage count
- **Label editing** for saved addresses
- **Usage analytics** and duplicate detection
- **Export functionality** for addresses

Key components:

- `HistoryScreen` - Main history interface
- `FavoritesScreen` - Favorites management
- `HistoryFilterModal` - Advanced filtering options
- `LabelEditModal` - Address label management

#### 4. Authentication (`src/screens/auth/`)

- **Google Sign-In integration** with @react-native-google-signin
- **Secure token management** with encrypted storage
- **Session restoration** with silent sign-in
- **Auto-refresh tokens** for persistent authentication
- **Privacy-compliant** user data handling

Key components:

- `LoginScreen` - Authentication interface
- `AuthProvider` - Authentication context
- `AuthService` - Google Sign-In implementation

#### 5. Cryptocurrency Data (`src/screens/crypto/`)

- **Real-time crypto prices** from CoinGecko API
- **Detailed coin information** with charts and metadata
- **Search functionality** with debounced queries
- **Market data caching** with intelligent TTL strategies
- **Rate limiting protection** to prevent API throttling

Key components:

- `CryptoListScreen` - Cryptocurrency listings
- `CryptoDetailScreen` - Individual coin details
- API hooks for data fetching and caching

## Custom Theme System

### Architecture (`src/theme/`)

Lumen implements a comprehensive theme system supporting light and dark modes:

#### Theme Provider (`theme-provider.tsx`)

- **Dynamic theme switching** with system preference detection
- **Persistent theme selection** with AsyncStorage
- **Context-based theme distribution** throughout the app
- **Automatic mode detection** from system settings

```typescript
// Usage example
const { theme, mode, setMode, toggleMode } = useTheme();
```

#### Design Tokens (`tokens.ts`, `colors.ts`)

- **Semantic color tokens** for consistent theming
- **Typography scale** with font families and sizes
- **Spacing system** with consistent measurements
- **Border radius** and shadow definitions
- **Breakpoint definitions** for responsive design

#### Styling Utilities (`make-styles.ts`, `utils.ts`)

- **Theme-aware styling** with TypeScript support
- **Runtime style generation** based on current theme
- **Performance optimization** with style memoization
- **Utility functions** for common theme operations

```typescript
// makeStyles usage
const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
  },
}));
```

## UI Components Library (`src/ui/`)

### Typography Components (`ui/typography/`)

- **Semantic text components**: H1, H2, H3, Body1, Body2, Body3
- **Consistent styling** with theme integration
- **Accessibility support** with proper semantic roles
- **Responsive sizing** and weight variations

### Layout Components (`ui/layout/`)

- **Flexible containers**: Container, ContentWrapper, ScreenWrapper
- **Stack layouts**: HStack (horizontal), VStack (vertical) with spacing
- **Keyboard handling**: KeyboardAvoidingView, KeyboardAwareScrollView
- **Safe area integration** for modern device support

### Button System (`ui/buttons/`)

- **Multiple variants**: Regular, Ghost, Outline, Link, Icon
- **Consistent interaction patterns** with haptic feedback
- **Icon integration** with customizable positioning
- **Accessibility compliance** with proper ARIA labels

### Input Components (`ui/amount-input/`)

- **Specialized numeric input** for cryptocurrency amounts
- **Decimal precision control** based on currency type
- **Input validation** and formatting
- **Visual feedback** for invalid states

### Data Display (`ui/items/`, `ui/image/`)

- **CryptoItem component** for consistent coin display
- **Fallback image handling** with graceful degradation
- **Lazy loading** and performance optimization
- **Image caching** for improved performance

### Feedback Components (`ui/states/`, `ui/loading-indicator/`)

- **Loading states**: SkeletonLoader, LoadingIndicator with labels
- **Empty states**: Customizable empty content displays
- **Error states**: User-friendly error messages with retry actions
- **Network banners**: Connection status indicators

### Search & Selection (`ui/search/`, `ui/dropdown/`)

- **Debounced search**: Performance-optimized search input
- **Sort dropdown**: Multi-criteria sorting interface
- **Currency picker**: Unified crypto/fiat selection

## Wording & Internationalization System (`src/wording/`)

The app uses a centralized wording system for text management:

- **Centralized text constants** for maintainability
- **Consistent messaging** across the application
- **Easy localization preparation** for future i18n support
- **Type-safe text references** with TypeScript

_Note: The wording system is prepared but not yet fully populated with content._

## State Management & Contexts (`src/contexts/`)

### Authentication Context (`auth-context.tsx`)

- **Global authentication state** with Google Sign-In
- **Session persistence** and restoration
- **Loading states** for authentication flows
- **Error handling** for sign-in failures

### Network Context (`network-context.tsx`)

- **Network connectivity monitoring** with @react-native-community/netinfo
- **Offline state handling** and user feedback
- **API request queuing** during connectivity issues
- **Background sync** when connection restores

### Filter Context (`filter-context.tsx`)

- **Global filter state** for cryptocurrency lists
- **Persistent filter preferences**
- **Complex filtering logic** with multiple criteria
- **Reset and clear functionality**

### Query Context (`query-context.tsx`)

- **React Query configuration** and global settings
- **Cache management** and invalidation strategies
- **Error boundary integration**
- **Background refetch policies**

## Custom Hooks (`src/hooks/`)

### API Hooks (`hooks/api/`)

- **use-crypto-list**: Cryptocurrency listings with caching
- **use-crypto-detail**: Individual coin data fetching
- **use-search-cryptos**: Debounced search functionality
- **use-supported-fiats**: Fiat currency data
- **use-api-metrics**: API usage monitoring and optimization
- **use-network-aware-refresh**: Smart refresh based on connection

### Exchange Hooks (`hooks/exchange/`)

- **use-exchange-converter**: Real-time currency conversion logic
- **Rate caching** and refresh management
- **Bidirectional conversion** calculations
- **Error handling** for rate fetch failures

### Specialized Hooks

- **use-camera-permissions**: Camera permission management
- **use-enhanced-camera-permissions**: Advanced permission flows with education
- **use-qr-scanner**: QR scanning logic with timeout handling
- **use-sort-data**: Generic sorting functionality
- **use-app-initialization**: App startup and configuration

## Services Layer (`src/services/`)

### Core Services

- **ApiService**: HTTP client with rate limiting and caching
- **AuthService**: Google Sign-In implementation and token management
- **AnalyticsService**: Event tracking and user behavior analysis

### Specialized Services

- **AddressStorageService**: Cryptocurrency address persistence
- **WalletValidationService**: Address format validation for Bitcoin/Ethereum
- **QrErrorService**: QR scanning error tracking and recovery
- **RequestQueueService**: API rate limiting and request management
- **RequestDeduplicationService**: Duplicate request prevention
- **ApiCacheService**: Intelligent caching with TTL strategies
- **NetworkStrategyService**: Network-aware API strategies

### Utility Services

- **BlockchainUtils**: Address formatting and validation utilities
- **NumberFormat**: Currency and numeric display formatting

## Modal System (`src/screens/modals/`)

Comprehensive modal system for specialized interactions:

### Core Modals

- **CurrencyPickerModal**: Unified cryptocurrency and fiat selection
- **FilterModal**: Advanced filtering interface with multiple criteria
- **ScannerErrorModal**: QR scanning error handling with recovery options

### Informational Modals

- **TermsModal**: Terms of service display
- **PrivacyModal**: Privacy policy information
- **PermissionEducationModal**: Camera permission education
- **ProfileModal**: User profile and settings

Each modal includes:

- **Consistent navigation patterns**
- **Proper modal lifecycle management**
- **Accessibility support**
- **Theme integration**
- **Error boundary protection**

## Navigation System (`src/routing/`)

### Architecture

- **Stack Navigation**: Native stack navigator for screen transitions
- **Tab Navigation**: Bottom tab bar for main app sections
- **Modal Navigation**: Overlay modals for specialized interactions
- **Type-safe routing**: TypeScript integration for navigation params

Key files:

- `types.ts` - Navigation type definitions and param lists
- `app-stack.tsx` - Main application stack navigator
- `tab-navigator.tsx` - Bottom tab navigation setup
- `root-navigator.tsx` - Root navigation container
- `routing-service.ts` - Navigation utilities and helpers

### Navigation Patterns

- **Screen-specific navigation props** with proper typing
- **Modal presentation** with consistent UX patterns
- **Deep linking support** (prepared for future implementation)
- **Navigation state persistence** for development

## Assets & Resources (`src/assets/`)

### Custom Font System (`assets/fonts/`)

- **Nunito font family** with multiple weights:
  - Regular, Medium, SemiBold, Bold, Light
- **Font loading configuration** via react-native.config.js
- **Cross-platform font registration**

### Images & Branding (`assets/images/`)

- **App logos** and branding assets
- **Placeholder images** for fallback states
- **Optimized formats** for performance

## TypeScript Architecture (`src/types/`)

### Type Organization

- **Domain-specific types**: Separate files for different app areas
- **API response types**: Strongly typed service interfaces
- **Component prop interfaces**: Comprehensive component typing
- **Navigation types**: Type-safe routing with param validation

Key type files:

- `address-history-types.ts` - Address storage and history types
- `qr-error-types.ts` - QR scanning error classifications
- Component-specific `types.ts` files throughout the codebase

### Type Safety Patterns

- **Strict TypeScript configuration** with comprehensive rules
- **Runtime type validation** using Zod for API responses
- **Discriminated unions** for complex state management
- **Generic constraints** for reusable component patterns

## Development Tools & Git Hooks

### Git Hooks Configuration (`.husky/`)

The project uses Husky for Git hooks automation:

#### Pre-commit Hook (`.husky/pre-commit`)

- **Lint-staged execution**: Automatically runs linters and formatters on staged files
- **Code quality enforcement**: Prevents commits that don't meet quality standards
- **Performance optimization**: Only processes changed files, not entire codebase

#### Commit Message Hook (`.husky/commit-msg`)

- **Conventional Commits**: Enforces conventional commit message format
- **Automated validation**: Uses commitlint to validate commit messages
- **Consistent history**: Ensures readable and standardized commit history

#### Commit Message Rules (`.commitlintrc.js`)

Enforced commit types:

- `feat`: Nueva funcionalidad (New feature)
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Formatting changes (no code logic)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverts previous commits

Rules:

- **Subject case**: Must be lowercase
- **Header length**: Maximum 72 characters
- **Type enforcement**: Must use predefined types

### Lint-staged Configuration (`package.json`)

Automated quality checks on staged files:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"],
    "*.{ts,tsx}*": ["npm run test -- --findRelatedTests --passWithNoTests"]
  }
}
```

Features:

- **Automatic fixing**: ESLint auto-fixes issues where possible
- **Code formatting**: Prettier ensures consistent code style
- **Related tests**: Runs tests for modified files
- **File type handling**: Different rules for different file types

### Development Scripts

#### Quality Assurance

- `npm run lint` - Run ESLint on entire codebase
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format all files with Prettier
- `npm run type-check` - TypeScript type checking without compilation

#### Testing Scripts

- `npm test` - Run Jest tests
- `npm run test:coverage` - Generate coverage report
- `npm run test:watch` - Run tests in watch mode

## Testing Architecture

### Jest Configuration (`jest.config.js`, `jest-setup.ts`)

#### Test Environment Setup

- **React Native preset**: Optimized for React Native testing
- **Setup files**: `jest-setup.ts` for global test configuration
- **Transform configuration**: TypeScript and React Native transforms
- **Module mapping**: Proper path resolution for testing

#### Coverage Requirements

- **Minimum threshold**: 60% coverage enforced across:
  - Lines of code
  - Functions
  - Branches
  - Statements
- **Build failure**: CI/CD fails if coverage drops below threshold
- **Coverage reports**: HTML, JSON, and LCOV formats generated

### Testing Patterns & Best Practices

#### Component Testing (`src/ui/`)

All UI components include comprehensive test suites:

```typescript
// Example test structure
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Arrange - setup test data
    // Act - render component
    // Assert - verify behavior
  });

  it('should handle user interactions', async () => {
    // Test user events and state changes
  });

  it('should be accessible', () => {
    // Test ARIA labels and accessibility
  });
});
```

#### Service Testing (`src/services/__tests__/`)

Service layer includes unit tests for:

- **API interactions** with mocked responses
- **Data persistence** and storage operations
- **Validation logic** with edge cases
- **Error handling** scenarios

#### Hook Testing (`src/hooks/`)

Custom hooks tested with React Testing Library:

- **State management** and updates
- **API integrations** with mock data
- **Error boundaries** and recovery
- **Performance optimizations**

#### TestID Requirements (ESLint Rule: `custom/require-testid`)

- **Interactive elements**: All buttons, inputs require testID
- **Format convention**: `[component]-[element]-[number]`
- **Unique identifiers**: No duplicate testIDs per screen
- **Accessibility support**: TestIDs enhance automated testing

### Test Utilities (`src/test-utils.tsx`)

Shared testing utilities for consistent test setup:

- **Custom render functions** with providers
- **Mock data generators** for consistent test data
- **Helper functions** for common test operations
- **Provider wrappers** for context testing

### Coverage Reporting

Generated coverage reports include:

- **HTML reports**: Visual coverage analysis in `coverage/` directory
- **LCOV reports**: Integration with CI/CD and IDE plugins
- **JSON reports**: Programmatic coverage analysis
- **Console output**: Quick coverage summary during development

### Testing Best Practices Summary

1. **Test behavior, not implementation** - Focus on user-facing functionality
2. **Use proper TestIDs** - Enable reliable automated testing
3. **Mock external dependencies** - Ensure isolated, fast tests
4. **Test error states** - Verify proper error handling
5. **Accessibility testing** - Ensure components work with screen readers
6. **Performance testing** - Verify optimizations work as expected

## Build Configuration

- **Metro**: Configured with symlinks disabled (`unstable_enableSymlinks: false`)
- **Jest**: Uses React Native preset
- **TypeScript**: Version 5.0.4 with React Native types
- **Node**: Requires Node.js >= 18

## Troubleshooting Commands

Clean builds:

```bash
# Android
cd android && ./gradlew clean

# iOS
cd ios && rm -rf Pods Podfile.lock && pod install

# Metro cache
npx react-native start --reset-cache
```

Check New Architecture status:

```bash
npx react-native info
```

## MCP Integration

This project has React Native MCP Server configured for enhanced AI assistance:

- **Server**: `rn-mcp` by Patrick Kabwe
- **Capabilities**: Project initialization, version management, upgrade guidance, Expo integration
- **Configuration**: Configured in Claude Code settings with project path

## API Optimization & Rate Limiting

This project implements comprehensive API optimizations to prevent rate limiting errors and improve performance:

### Core Optimization Services

- **Request Queue Service** (`src/services/request-queue-service.ts`) - Rate limiting with 8 requests/minute, burst protection, circuit breaker pattern
- **API Cache Service** (`src/services/api-cache-service.ts`) - Tiered caching (memory + AsyncStorage) with intelligent TTL strategies
- **Request Deduplication Service** (`src/services/request-deduplication-service.ts`) - Prevents duplicate concurrent requests
- **Network Strategy Service** (`src/services/network-strategy-service.ts`) - Network-aware refresh strategies
- **API Metrics Hook** (`src/hooks/api/use-api-metrics.ts`) - Real-time monitoring of API usage and optimization effectiveness

### Key Configuration Values

```typescript
// Conservative rate limits to prevent 429 errors
rateLimitConfig = {
  maxRequests: 8, // 8 requests per minute (CoinGecko free tier safe)
  windowMs: 60 * 1000, // 1 minute window
  retryAfterMs: 5000, // 5 second delay on rate limit
};

// Burst protection
burstConfig = {
  maxBurstRequests: 2, // Max 2 requests per 10-second window
  burstWindowMs: 10 * 1000, // 10 second burst window
};

// Cache TTL strategies by data type
TTL_STRATEGIES = {
  'crypto-list': 10 * 60 * 1000, // 10 minutes for market data
  'crypto-detail': 15 * 60 * 1000, // 15 minutes for coin details
  'crypto-search': 30 * 60 * 1000, // 30 minutes for search results
};
```

### Usage Guidelines

1. **Always use optimized API service**: All API calls go through `apiService.executeWithOptimizations()`
2. **Disabled automatic preloading**: Preloading is disabled to prevent rate limit bypass
3. **Reduced refresh frequencies**: Background refresh intervals increased significantly
4. **Circuit breaker protection**: Auto-recovery from API failures with exponential backoff

### Troubleshooting Rate Limits

If you encounter rate limit issues:

```bash
# Check rate limiting metrics
console.log(requestQueueService.getMetrics());

# Verify circuit breaker state
console.log('Circuit Breaker State:', circuitBreakerState);

# Monitor cache effectiveness
console.log(apiCacheService.getMetrics());

# Reset rate limiting if needed (development only)
requestQueueService.resetMetrics();
```

### Testing API Optimizations

```bash
# Run with New Architecture and monitoring enabled
npm run android:new-arch

# Monitor logs for optimization activity
# Expected logs:
# [RequestQueue] Rate limit reached, delaying requests for 5000ms
# [ApiCache] Cache hit for crypto-list, serving from memory
# [RequestDedup] Deduplicating request for /coins/markets
```

For detailed documentation, see [`API_OPTIMIZATION.md`](./API_OPTIMIZATION.md).

## Code Style Guide

### React Native Components

- **Import Style**: Use direct imports and React import for JSX

  ```typescript
  // ✅ Preferred for React Native
  import React, { useState, type FC } from 'react';
  import { View, Text, TouchableOpacity } from 'react-native';

  // ❌ Avoid default import without destructuring
  import * as React from 'react';
  ```

- **Component Definition**: Use `FC` with explicit type parameters for React Native components

  ```typescript
  // ✅ Preferred - React Native component
  interface ButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
  }

  const CustomButton: FC<ButtonProps> = ({ title, onPress, disabled = false }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );

  // ❌ Avoid React.FC or missing types
  const CustomButton: React.FC = ({ title, onPress }) => { ... };
  ```

- **Function Return Types**: Always specify return types for functions

  ```typescript
  // ✅ Preferred
  const handlePress = (): void => {
    setCounter(prev => prev + 1);
  };

  const calculateTotal = (items: Item[]): number => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  // ❌ Avoid missing return types
  const handlePress = () => { ... };
  ```

### React Native Styling

- **StyleSheet Usage**: Always use `StyleSheet.create()` for component styles

  ```typescript
  // ✅ Preferred - StyleSheet with type safety
  import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

  interface Styles {
    container: ViewStyle;
    title: TextStyle;
    button: ViewStyle;
  }

  const styles = StyleSheet.create<Styles>({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#333333',
    },
    button: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: '#007AFF',
    },
  });

  // ❌ Avoid inline styles for complex styling
  <View style={{ flex: 1, justifyContent: 'center' }}>
  ```

- **Style Organization**: Group styles logically and use consistent naming

  ```typescript
  // ✅ Good - Logical grouping
  const styles = StyleSheet.create({
    // Container styles
    container: {},
    content: {},

    // Text styles
    title: {},
    subtitle: {},
    description: {},

    // Button styles
    primaryButton: {},
    secondaryButton: {},
    buttonText: {},
  });
  ```

### TypeScript for React Native

- **Type Imports**: Use `type` keyword for type-only imports

  ```typescript
  import React, { type FC } from 'react';
  import { View } from 'react-native';
  import type { ViewStyle, TextStyle } from 'react-native';
  import type { NavigationProp } from '@react-navigation/native';
  ```

- **Component Props Interface**: Always define explicit prop interfaces

  ```typescript
  // ✅ Good - Explicit props interface
  interface UserProfileProps {
    user: User;
    onEdit?: () => void;
    showActions?: boolean;
    style?: ViewStyle;
  }

  const UserProfile: FC<UserProfileProps> = ({
    user,
    onEdit,
    showActions = true,
    style
  }) => (
    <View style={[styles.container, style]}>
      <Text>{user.name}</Text>
    </View>
  );

  // ❌ Bad - Inline or missing prop types
  const UserProfile = ({ user, onEdit }: any) => { ... };
  ```

### React Native Navigation

- **Type-safe Navigation**: Use proper TypeScript types for navigation

  ```typescript
  // ✅ Good - Type-safe navigation setup
  import type { NavigationProp } from '@react-navigation/native';

  type RootStackParamList = {
    Home: undefined;
    Profile: { userId: string };
    Settings: { theme?: 'light' | 'dark' };
  };

  interface HomeScreenProps {
    navigation: NavigationProp<RootStackParamList, 'Home'>;
  }

  const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
    const navigateToProfile = (): void => {
      navigation.navigate('Profile', { userId: '123' });
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={navigateToProfile}>
          <Text>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  };
  ```

### Platform-Specific Code

- **Platform Detection**: Use `Platform.OS` for platform-specific logic

  ```typescript
  // ✅ Good - Platform-specific styling
  import { Platform, StyleSheet } from 'react-native';

  const styles = StyleSheet.create({
    container: {
      paddingTop: Platform.OS === 'ios' ? 44 : 0,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
  });

  // ✅ Good - Platform-specific components
  import { Platform } from 'react-native';

  const PlatformButton: FC<ButtonProps> = ({ title, onPress }) => {
    if (Platform.OS === 'ios') {
      return <IOSButton title={title} onPress={onPress} />;
    }
    return <AndroidButton title={title} onPress={onPress} />;
  };
  ```

### React Native Images

- **Image Source Types**: Use proper TypeScript types for image sources

  ```typescript
  // ✅ Good - Typed image sources
  import { Image, type ImageSourcePropType } from 'react-native';

  interface AvatarProps {
    source: ImageSourcePropType;
    size?: number;
    style?: ViewStyle;
  }

  const Avatar: FC<AvatarProps> = ({ source, size = 50, style }) => (
    <Image
      source={source}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      resizeMode="cover"
    />
  );

  // Usage
  <Avatar source={{ uri: 'https://example.com/avatar.jpg' }} />
  <Avatar source={require('../assets/default-avatar.png')} />
  ```

### Export Patterns

- **Prefer Named Exports over Default Exports**: Use named exports for better IDE support and consistency

  ```typescript
  // ✅ Preferred - Named exports
  export const UserProfile: FC<UserProfileProps> = ({ user }) => (
    <View>
      <Text>{user.name}</Text>
    </View>
  );

  export const calculateTotal = (items: Item[]): number => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  // Usage
  import { UserProfile, calculateTotal } from './user-profile';

  // ❌ Avoid - Default exports
  const UserProfile: FC<UserProfileProps> = ({ user }) => (
    <View>
      <Text>{user.name}</Text>
    </View>
  );

  export default UserProfile;

  // Usage - less explicit, harder to refactor
  import UserProfile from './user-profile';
  ```

- **Benefits of Named Exports**:
  - **Better IDE support**: Automatic renaming and refactoring across files
  - **Explicit imports**: Clear what's being imported from each module
  - **Improved tree-shaking**: Bundlers can eliminate unused exports more effectively
  - **Consistent patterns**: Uniform approach across the entire codebase
  - **Multiple exports**: Can export multiple items from the same file

- **When to Use Default Exports**: Only for entry points or when required by frameworks

  ```typescript
  // ✅ Acceptable - App entry point (required by React Native)
  const App: FC = () => <AppContent />;
  export default App;

  // ✅ Acceptable - Next.js pages (framework requirement)
  const HomePage: FC = () => <HomeContent />;
  export default HomePage;
  ```

- **Index File Patterns**: Always use named exports in index files

  ```typescript
  // ✅ Good - src/components/index.ts
  export { UserProfile } from './user-profile';
  export { ProductCard } from './product-card';
  export { LoadingSpinner } from './loading-spinner';
  export type { UserProfileProps } from './user-profile';
  export type { ProductCardProps } from './product-card';

  // ❌ Avoid - mixing export styles
  export { UserProfile } from './user-profile';
  export { default as ProductCard } from './product-card';
  ```

## Comprehensive Style Guide

### Fundamentals

**Clarity at the point of use is the most important goal**

- Entities like methods and properties are declared once but used repeatedly
- Create methods/properties so usage is clear and concise
- Always examine use cases to ensure clarity in context
- Clarity is more important than brevity

**Promote clear usage**

- Include all necessary words to avoid ambiguity
- Omit needless words - every word should convey salient information
- Prefer method/function names that form grammatical English phrases at use sites

**Use terminology well**

- Avoid obscure terms if common words convey the same meaning
- Technical terms are essential communication tools but only use them to capture crucial meaning
- Avoid abbreviations - they are effectively technical terms requiring translation

### File Organization

**Things that change together should stay together**

- Components and type definitions should remain in the same file
- If file exceeds 100 lines, create new components (e.g., extract Avatar from UserProfile)

### File Naming

- **Use kebab-case**: Only lowercase English letters `[a-z]`, hyphens `-`, and dots `.`
- **Extensions**: `.tsx` for React components, `.ts` for other TypeScript code
- **Tests**: Include `.test` after module name in `__tests__` directory at same level

```typescript
// ❌ Bad
userProfile.tsx;
CardScreen.tsx / foo / bar / user - profile.test.tsx;

// ✅ Good
user - profile.tsx;
card - screen.tsx / foo / bar / __tests__ / user - profile.test.tsx;
```

### Testing

**Test behavior, not implementation**

- Test from user perspective - users care about visible loading indicators, not boolean flags
- Trigger callbacks through user interactions, not manual calls
- Use Arrange-Act-Assert (AAA) pattern with comment blocks:

```typescript
it("Should render loading after user tap submit", async () => {
  // arrange
  const renderResult = render(<SomeScreen />);

  // act
  fireEvent.press(renderResult.getByA11yLabel("submit"));

  // assert
  expect(renderResult.getByA11yLabel("loading")).not.toBeNull();
});
```

### Naming Conventions

**Constructors/React Components**: PascalCase

```typescript
// ✅ Good
class Application {}
const Avatar = ({ user }) => <img src={user.avatarUrl} />;
```

**Methods/Functions/Variables/Object Attributes**: camelCase

```typescript
// ✅ Good
const getUserPosts = () => {};
user.avatarUrl = '';
```

**No abbreviations**

```typescript
// ❌ Bad
const n = '';
const nErr = '';
const cstmrId = '';

// ✅ Good
const priceCountReader = '';
const numErrors = '';
const numDnsConnections = '';
```

**React Components use nouns** - components are things, not actions

```typescript
// ❌ Bad
const RenderAvatar = () => null;

// ✅ Good
const Avatar = () => null;
```

**Capitalize constant values**

```typescript
// ✅ Good
const HOURS_IN_DAY = 24;
```

### TypeScript Conventions

**Interfaces/Types**: PascalCase names, camelCase members

```typescript
// ✅ Good
interface Foo {
  someMember: string;
}
```

**Component Props Types**: Use `ComponentNameProps` format for component type definitions

```typescript
// ✅ Good - Component props naming
interface ProductCardProps {
  title: string;
  price: number;
  isOnSale?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({
  title,
  price,
  isOnSale = false,
}) => (
  <div>
    {title} - ${price}
  </div>
);

// ❌ Bad - Generic or unclear naming
interface Props {
  title: string;
}

interface ProductCard {
  title: string;
}
```

**Enums**: PascalCase for names and members

```typescript
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
```

**Null vs Undefined**

- Prefer not using either for implicit unavailability
- Use `undefined` in general
- Use truthy/falsy checks: `if (!error) {}`

### Choosing Better Names

**Use meaningful names**

```typescript
// ❌ Bad
const getUserData = ...
const getUserInfo = ...

// ✅ Good
const getUserProfile = ...
```

**Favor descriptive over concise when in doubt**

```typescript
// ✅ Good
const findUserByNameOrEmail = ...
const setUserStatusAsApproved = ...
```

**Use consistent verbs per concept**

- Standard CRUD operations: create, get, set, add, remove, delete
- Maintain consistency across codebase

**Create booleans that read well in if-then statements**

```typescript
// ❌ Bad
if (car.sedan) {
}

// ✅ Good
if (car.isSedan) {
}
```

### TestID Conventions

**Clickable components**: Always define, format `[component]-[number]`

```typescript
// ✅ Good
<Button testID="button-1" onPress={someFunction}>
  {TEXTS}
</Button>
```

**Text components with dynamic data**: Optional, format `[reference]-[number]`

```typescript
// ✅ Good
<Text testID="amount-1" variant="bodyBold-md">
  {AMOUNT}
</Text>
```

**TestIDs CANNOT be repeated on the same screen**

### Component Structure

```
component-folder/
  index.ts              # Export all from folder
  component.tsx         # Main component implementation
  types.ts             # Type definitions and interfaces
  base.tsx (optional)  # Base component if needed
  hooks.ts/tsx (optional) # Custom hooks
  __tests__/           # Test files directory
    component.test.tsx # Component tests
```

**Import/Export from index.ts**

```typescript
// ✅ Good
export { Component } from './component';
export type { ComponentProps } from './component';
```

**Component folder naming**: Use kebab-case for folders

```typescript
// ✅ Good folder structure
src / toggles / index.ts;
theme - toggle.tsx;
types.ts;
__tests__ / theme - toggle.test.tsx;

cards / index.ts;
product - card.tsx;
types.ts;
__tests__ / product - card.test.tsx;

theme / index.ts;
theme - provider.tsx;
theme - tokens.ts;
use - theme.ts;
types.ts;
theme.css;
```

## Theme System

### Theme Provider Setup

Always wrap apps with ThemeProvider to enable dynamic theming:

```typescript
// ✅ Good - App layout.tsx
import { ThemeProvider } from "@repo/ui/theme";

export const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <html lang="en">
    <body>
      <ThemeProvider appTheme="minima">{children}</ThemeProvider>
    </body>
  </html>
);
```

### Using Theme in Components

Components should use theme tokens instead of hardcoded values:

```typescript
// ✅ Good - Theme-aware component
import { useTheme } from "@repo/ui/theme";

export const MyComponent: FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        color: theme.colors.text.primary,
        borderColor: theme.colors.border,
      }}
    >
      Content
    </div>
  );
};

// ❌ Bad - Hardcoded values
export const MyComponent: FC = () => (
  <div className="bg-white dark:bg-gray-900 text-black dark:text-white">
    Content
  </div>
);
```

### Available Themes

- **minima**: Minimalist grayscale theme
- **sazonia**: TRT Concept inspired (coral/yellow/black)
- **docs**: Professional blue theme
- **web**: Corporate teal/green theme

### Creating Custom Themes

Define app-specific themes using the base structure:

```typescript
// ✅ Good - Custom theme definition
import { type AppTheme } from '@repo/ui/theme';

export const customTheme: AppTheme = {
  name: 'custom',
  displayName: 'Custom Theme',
  light: {
    colors: {
      primary: '#your-color',
      accent: '#accent-color',
      // ... other colors
    },
    // ... spacing, radius
  },
  dark: {
    // ... dark variant
  },
};
```

**Use relative imports for immediate parent directory**

```typescript
import { objectKeys } from '..';
```

### ESLint Configuration

- **`import/prefer-default-export`**: `off` - Allows named exports even for single exports (recommended for consistency and refactoring)
- `import/no-extraneous-dependencies`: disabled on test files
- `complexity`: max 12
- `max-depth`: 3
- `max-nested-callbacks`: 2
- `max-params`: 3
- `max-statements`: 12
- `arrow-body-style`: not enforced
- `object-property-newline-allowAllPropertiesSameLine`: false
- **`unicorn/filename-case`**: enforced as `kebabCase` for all files

### Prettier Configuration

- `trailingComma`: all
- `singleQuote`: true

## Monorepo & Turborepo Conventions

### Script Standards

All apps and packages should use consistent script naming:

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "check-types": "turbo run check-types",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  }
}
```

### Package Dependencies

- **Internal packages**: Reference as `"*"` in package.json
- **Shared configs**: Use `@repo/eslint-config`, `@repo/typescript-config`, `@repo/tailwind-config`
- **UI components**: Import from `@repo/ui/component-name`

### Turbo Configuration

- **Build dependencies**: Use `"dependsOn": ["^build"]` for dependent tasks
- **Cache settings**: Mark dev tasks as `"cache": false, "persistent": true`
- **Outputs**: Define appropriate output directories in `"outputs"`

### Workspace Structure

```
packages/
  eslint-config/     # Shared ESLint configurations
  typescript-config/ # Shared TypeScript configurations
  tailwind-config/   # Shared Tailwind configuration
  ui/               # Shared React components
apps/
  docs/             # Documentation app
  web/              # Main web app
  minima/           # Minima app
  sazonia/          # Sazonia app
```

## Tailwind CSS Standards

### Dark Mode Implementation

Always use class-based dark mode with selector strategy:

```typescript
// ✅ Good - Tailwind config
export default {
  darkMode: ['selector', '.dark'],
  // ...
} satisfies Config;
```

### Content Paths Pattern

Include all relevant paths and shared packages:

```typescript
// ✅ Good - App Tailwind config
content: [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}', // Include shared UI
],
```

### Class Naming Patterns

- **Responsive design**: Use `sm:`, `lg:` prefixes consistently
- **Dark mode**: Always provide dark mode variants: `dark:bg-gray-800`
- **States**: Use `hover:`, `focus:`, `active:` for interactive elements
- **Transitions**: Always add `transition-colors duration-200` for smooth changes

### UI Package Integration

- UI package uses `ui-` prefix for compiled styles
- Apps consume via `transpilePackages` in Next.js config
- Shared components should work across all apps

## TypeScript Configuration Standards

### Shared Configuration Usage

Always extend from shared configs instead of duplicating:

```json
// ✅ Good - App tsconfig.json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "next-env.d.ts",
    "next.config.ts",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### Config File Extensions

- **TypeScript configs**: Use `.ts` extension (`next.config.ts`, `tailwind.config.ts`)
- **JavaScript configs**: Use `.js` for compatibility when needed
- **Type-only files**: Use `type` imports and `satisfies` keyword

### Satisfies Keyword Usage

Use `satisfies` for better type checking while preserving inference:

```typescript
// ✅ Good
export default {
  darkMode: ['selector', '.dark'],
  content: [...],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;

// ❌ Bad - loses type inference
const config: Config = {
  // ...
};
```

### Union Types for Constants

Define strict union types for constrained values:

```typescript
// ✅ Good
const [theme, setTheme] = useState<'light' | 'dark'>('light');

// ❌ Bad - too permissive
const [theme, setTheme] = useState<string>('light');
```

### Base Configuration Standards

The shared base config enforces:

- `"strict": true` - Enable all strict type checking
- `"noUncheckedIndexedAccess": true` - Safe array/object access
- `"isolatedModules": true` - Enable fast transpilation
- `"skipLibCheck": true` - Skip type checking of declaration files

## Shared Package Usage Conventions

### Import Patterns

Use consistent import patterns for shared packages:

```typescript
// ✅ Good - Shared UI components
import { ThemeToggle } from '@repo/ui/theme-toggle';
import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';

// ✅ Good - Next.js Image imports
import Image from 'next/image';

// ✅ Good - Type-only imports
import { type FC } from 'react';
import type { Config } from 'tailwindcss';
```

### Package.json Dependencies

Reference internal packages correctly:

```json
// ✅ Good - Internal package references
{
  "dependencies": {
    "@repo/ui": "*",
    "@repo/tailwind-config": "*"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*"
  }
}
```

### Export Patterns from Packages

Shared packages should export cleanly from index files:

```typescript
// ✅ Good - packages/ui/index.ts
export { ThemeToggle } from './theme-toggle';
export { Card } from './card';
export type { ThemeToggleProps } from './theme-toggle';
export type { CardProps } from './card';

// ❌ Bad - don't export from subdirectories
// Users should not import from './ui/src/components/...'
```

### Next.js Configuration for Shared Packages

Apps must transpile shared packages:

```typescript
// ✅ Good - next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui'],
  // ... other config
};
```

### Version Management

- All internal packages use `"*"` for version
- External dependencies should match across workspace
- Use `yarn workspaces` for dependency deduplication

## Theme System Standards

### Dark/Light Mode Implementation

Use this pattern for robust theme switching:

```typescript
// ✅ Good - Theme toggle component pattern
export const ThemeToggle: FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Wait until component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark'): void => {
    const html = document.documentElement;
    if (newTheme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  };
};
```

### Theme Storage

- **Persistence**: Always save theme preference to `localStorage`
- **System preference**: Respect `prefers-color-scheme` as fallback
- **Class application**: Use `document.documentElement.classList` for theme classes

### Component Theme Support

All components should support both themes:

```tsx
// ✅ Good - Component with theme support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <button className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
    Button
  </button>
</div>
```

### Theme Event System

Dispatch custom events for theme changes:

```typescript
// ✅ Good - Theme change notification
window.dispatchEvent(
  new CustomEvent('themeChange', { detail: { theme: newTheme } }),
);
```

## Accessibility Standards

### ARIA Labels

Always provide descriptive ARIA labels for interactive elements:

```tsx
// ✅ Good - Descriptive aria-label
<button
  onClick={toggleTheme}
  aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
>
  {theme === "light" ? <MoonIcon /> : <SunIcon />}
</button>

// ✅ Good - Loading state accessibility
<div aria-label="loading" role="status">
  <span className="sr-only">Loading...</span>
</div>
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```tsx
// ✅ Good - Keyboard accessible
<button
  onPress={handlePress}
  onKeyDown={(e) => e.key === 'Enter' && handlePress()}
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Submit
</button>
```

### Focus Management

Provide clear focus indicators:

```tsx
// ✅ Good - Focus styles
className =
  'focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600';
```

### Screen Reader Support

- Use semantic HTML elements when possible
- Provide `alt` text for all images
- Use `role` attributes when semantic elements aren't sufficient
- Include `sr-only` text for screen reader context

### Color Contrast

Ensure sufficient contrast ratios:

- Normal text: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Use both color and other indicators (icons, text) for state changes

## Performance Patterns

### Hydration Mismatch Prevention

Always check if component is mounted before rendering client-side content:

```tsx
// ✅ Good - Hydration safe pattern
export const ThemeToggle: FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-neutral-200 w-10 h-10">
        <div className="w-5 h-5 bg-neutral-400 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    // ... actual component
  );
}
```

### Client-Side API Usage

Safe patterns for browser APIs:

```tsx
// ✅ Good - Safe localStorage usage
useEffect(() => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  // ...
}, []);

// ❌ Bad - Using browser APIs during SSR
const theme = localStorage.getItem('theme'); // Will error during SSR
```

### Image Optimization

Always use Next.js Image component with proper configuration:

```tsx
// ✅ Good - Optimized image usage
<Image
  src={imageSrc || ''}
  alt="Descriptive alt text"
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={isAboveFold}
  onError={handleImageError}
/>
```

### Bundle Size Optimization

- Use dynamic imports for large components
- Implement code splitting at route level
- Use `next/image` for automatic image optimization
- Configure `transpilePackages` for shared packages

### State Management Performance

- Use `useState` for local component state
- Implement proper dependency arrays in `useEffect`
- Avoid unnecessary re-renders with `useMemo` and `useCallback` when needed
- Keep state close to where it's used

## Testing Standards

### Jest & React Testing Library Setup

All apps and packages use Jest with React Testing Library for testing:

```json
// package.json scripts
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Coverage Requirements

- **Minimum 60% coverage** required for all projects
- Coverage enforced on: lines, functions, branches, statements
- **Builds fail** if coverage falls below threshold
- Coverage reports generated in HTML, JSON, and LCOV formats

### TestID Enforcement

ESLint rule `custom/require-testid` enforces testID on interactive elements:

```tsx
// ✅ Good - Required testID pattern
<button testID="submit-button-1" onClick={handleSubmit}>
  Submit
</button>

<input testID="email-input-1" type="email" />

// ❌ Bad - Missing testID on interactive element
<button onClick={handleSubmit}>Submit</button>
```

### TestID Patterns

- **Format**: `[component]-[element]-[number]`
- **Examples**: `button-1`, `modal-close-1`, `form-submit-2`
- **Clickable elements**: Always required
- **Text with dynamic data**: Optional but recommended
- **Unique per screen**: No duplicate testIDs on same screen

### Test File Naming

- **Unit tests**: `component-name.test.tsx`
- **Integration tests**: `feature-name.test.tsx`
- **Test directory**: `__tests__/` at appropriate level
- **File location**: Same directory as component being tested

### Testing Best Practices

- **Test behavior, not implementation**
- **Use Arrange-Act-Assert (AAA) pattern**
- **Mock external dependencies**
- **Test user interactions with userEvent**
- **Test accessibility with screen reader queries**

### Common Test Patterns

```tsx
// ✅ Good - Testing component behavior
it('should toggle theme when button is clicked', async () => {
  // arrange
  const user = userEvent.setup();
  render(<ThemeToggle />);

  // act
  const button = screen.getByRole('button');
  await user.click(button);

  // assert
  expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
});

// ✅ Good - Testing with testID
it('should submit form when submit button is clicked', async () => {
  render(<LoginForm />);
  const submitButton = screen.getByTestId('submit-button-1');
  // ...
});
```
