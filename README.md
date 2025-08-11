# Lumen 💡

**Lumen** is a modern cryptocurrency portfolio tracker built with React Native and the New Architecture. Track your crypto investments with a beautiful, intuitive interface and real-time data.

## 🚀 Quick Start for Development

Get the app running in development mode in just a few steps:

```bash
# 1. Install dependencies (using legacy peer deps for compatibility)
npm install --legacy-peer-deps

# 2. iOS setup (iOS development only)
bundle install && bundle exec pod install

# 3. Start the app
npm start                    # Start Metro bundler
npm run android             # Run on Android
npm run ios                 # Run on iOS

# Or with New Architecture (recommended)
npm run start:new-arch      # Start with New Architecture
npm run android:new-arch    # Run Android with New Architecture
npm run ios:new-arch        # Run iOS with New Architecture
```

**First time setup issues?** Check the [Prerequisites](#-prerequisites) and [Troubleshooting](#-troubleshooting) sections below.

## ✨ Features

- 🔐 **Authentication System** - Secure login and registration
- 📊 **Crypto Portfolio Tracking** - Monitor your cryptocurrency investments
- 💱 **Real-time Crypto Data** - View current prices and market changes
- 🚀 **API Optimizations** - Advanced rate limiting, caching, and request optimization
- 🎨 **Dynamic Theming** - Light and dark mode support
- 📱 **Cross-platform** - Works on both iOS and Android
- ⚡ **New Architecture** - Built with React Native's latest Fabric and TurboModules
- 🎯 **TypeScript** - Full type safety throughout the application
- 🛡️ **Circuit Breaker Pattern** - Auto-recovery from API failures with intelligent backoff

## 🚀 Technology Stack

- **React Native 0.80.2** with New Architecture
- **TypeScript** for type safety
- **TanStack React Query** for data fetching and caching
- **React Navigation 7** for routing
- **Fabric** rendering system
- **TurboModules** for native modules
- **Advanced API Optimizations** - Rate limiting, deduplication, intelligent caching
- **Vector Icons** for beautiful iconography
- **Keyboard handling** for better UX
- **ESLint + Prettier** for code quality

## 📋 Prerequisites

Before running this application, make sure you have completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment).

- Node.js >= 18
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- CocoaPods (for iOS dependencies)

## 🛠️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Lumen
   ```

2. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

   > **Note**: The `--legacy-peer-deps` flag is required to resolve peer dependency conflicts with some React Native packages.

3. **iOS Setup** (iOS only)

   ```bash
   # Install Ruby dependencies
   bundle install

   # Install CocoaPods dependencies
   bundle exec pod install
   ```

4. **Environment Configuration**
   ```bash
   # Create environment file if needed
   cp .env.example .env
   ```

## 🚀 Running the Application

### Standard Mode

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### New Architecture Mode

For enhanced performance with React Native's New Architecture:

```bash
# Start Metro with New Architecture
npm run start:new-arch

# Run Android with New Architecture
npm run android:new-arch

# Run iOS with New Architecture
npm run ios:new-arch

# Or use the helper script
./scripts/new-arch.sh
```

## 🧪 Development

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Debugging

- **Android**: Press <kbd>R</kbd> twice or <kbd>Ctrl/Cmd</kbd> + <kbd>M</kbd> for dev menu
- **iOS**: Press <kbd>R</kbd> in the simulator
- **Fast Refresh** is enabled by default for instant updates

## 📱 App Structure

```
src/
├── app.tsx                 # Main app component
├── routing/                # Navigation setup
│   ├── root-navigator.tsx  # Main navigation container
│   ├── app-stack.tsx       # Authenticated app screens
│   ├── auth-stack.tsx      # Authentication screens
│   └── screens/            # All screen components
│       ├── auth/           # Login & Register
│       ├── crypto/         # Crypto list & details
│       └── splash/         # Splash screen
├── theme/                  # Theming system
│   ├── colors.ts           # Color definitions
│   ├── tokens.ts           # Design tokens
│   └── theme-provider.tsx  # Theme context
├── ui/                     # Reusable UI components
│   ├── layout/             # Layout components
│   └── icon/               # Icon components
└── wording/                # Internationalization
```

## 🏗️ Architecture

This project leverages React Native's **New Architecture** for optimal performance:

- **Fabric**: New rendering system for smoother UI
- **TurboModules**: Enhanced native module system
- **Codegen**: Type-safe native interface generation
- **Hermes**: High-performance JavaScript engine

Key environment variables:

- `REACT_NATIVE_USE_NEW_ARCHITECTURE=1`
- `USE_FABRIC=1`
- `USE_TURBOMODULE=1`

## 🎨 UI Components

The app includes a comprehensive design system with:

- **Layout Components**: Container, VStack, HStack, ScreenWrapper
- **Interactive Elements**: Buttons, Forms, Input fields
- **Navigation**: Stack navigation with smooth transitions
- **Theming**: Dynamic light/dark mode switching
- **Icons**: Material Icons integration

## 🔧 Configuration Files

- `metro.config.js` - Metro bundler configuration
- `eslint.config.mjs` - ESLint rules and setup
- `babel.config.js` - Babel transformation settings
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Testing framework setup

## 📚 Additional Documentation

- [`NEW_ARCHITECTURE.md`](./NEW_ARCHITECTURE.md) - Detailed New Architecture migration guide
- [`CLAUDE.md`](./CLAUDE.md) - Development guidelines for AI assistance
- [`API_OPTIMIZATION.md`](./API_OPTIMIZATION.md) - Comprehensive API optimization and rate limiting guide
- [`PERFORMANCE_OPTIMIZATIONS.md`](./PERFORMANCE_OPTIMIZATIONS.md) - FlatList performance optimizations

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler fails to start**

   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS build fails**

   ```bash
   cd ios && bundle exec pod install
   ```

3. **Android build issues**

   ```bash
   cd android && ./gradlew clean
   ```

4. **New Architecture issues**
   - Ensure all environment variables are set
   - Clean and rebuild the project
   - Check [`NEW_ARCHITECTURE.md`](./NEW_ARCHITECTURE.md) for detailed guidance

5. **API Rate Limit Errors (429)**

   The app includes comprehensive API optimizations to prevent rate limit errors:

   ```bash
   # Check current rate limiting metrics
   console.log(requestQueueService.getMetrics());

   # Verify circuit breaker status
   console.log('Circuit breaker state:', circuitBreakerState);

   # Monitor API cache effectiveness
   console.log(apiCacheService.getMetrics());
   ```

   **Key protection features:**
   - Conservative 8 requests/minute rate limit
   - Circuit breaker pattern with auto-recovery
   - Intelligent caching with appropriate TTL strategies
   - Request deduplication to prevent duplicate API calls
   - Network-aware refresh strategies

   For detailed information, see [`API_OPTIMIZATION.md`](./API_OPTIMIZATION.md).

For more troubleshooting, visit the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting).

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using React Native and the New Architecture
