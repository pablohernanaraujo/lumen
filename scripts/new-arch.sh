#!/bin/bash

# Script to run React Native app with New Architecture enabled

echo "🚀 Starting React Native app with New Architecture..."

# Set New Architecture environment variables
export REACT_NATIVE_USE_NEW_ARCHITECTURE=1
export USE_FABRIC=1
export USE_TURBOMODULE=1

# Start Metro bundler with cache reset
echo "📦 Starting Metro bundler..."
npx react-native start --reset-cache 