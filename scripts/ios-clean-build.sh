#!/bin/bash

echo "🧹 Cleaning iOS project..."

# Navigate to iOS directory
cd ios

# Clean Xcode project
echo "📱 Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Lumen*

# Clean Pods
echo "📦 Cleaning CocoaPods..."
rm -rf Pods
rm -rf Podfile.lock

# Clean React Native cache
echo "⚛️  Cleaning React Native cache..."
cd ..
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID

# Reinstall Pods
echo "📦 Reinstalling CocoaPods..."
cd ios
bundle install
bundle exec pod install

echo "✅ iOS project cleaned and rebuilt!"
echo ""
echo "🚀 Now you can run:"
echo "  npm run ios"
echo "  or"
echo "  npm run ios:new-arch"