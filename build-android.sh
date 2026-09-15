#!/bin/bash
set -e

echo "================================================="
echo "   Dune Survival - Android Build & Sync Script   "
echo "================================================="

# 1. Verify Node and NPM
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not found in PATH."
    echo "Please ensure Node.js and npm are installed."
    exit 1
fi

# 2. Ensure dependencies are installed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/cap" ]; then
    echo "📦 Installing project dependencies..."
    npm install
fi

# 3. Build production bundle (Vite)
echo "⚡ Building web assets into dist/..."
npm run build

# 4. Add Android platform if not already added
if [ ! -d "android" ]; then
    echo "📱 Initializing Android platform..."
    npx @capacitor/cli add android
fi

# 5. Sync web assets and plugins to native Android
echo "🔄 Syncing assets to native Android project..."
npx @capacitor/cli sync android

echo ""
echo "================================================="
echo "✅ Android project successfully synced in ./android"
echo "================================================="
echo "Options to generate APK / AAB:"
echo "• Open Android Studio: npx cap open android"
echo "• Build Debug APK (CLI): cd android && ./gradlew assembleDebug"
echo "• Build Release AAB (Play Store): cd android && ./gradlew bundleRelease"
