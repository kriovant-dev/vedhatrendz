#!/bin/bash

echo "🚀 Starting VedhaTrendz Application with Firebase"
echo "=================================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local file not found!"
    echo "📋 Please create .env.local file with your Firebase configuration."
    echo "💡 Use .env.example as a template."
    echo ""
    echo "Required environment variables:"
    echo "  - VITE_FIREBASE_API_KEY"
    echo "  - VITE_FIREBASE_AUTH_DOMAIN"
    echo "  - VITE_FIREBASE_PROJECT_ID"
    echo "  - VITE_FIREBASE_STORAGE_BUCKET"
    echo "  - VITE_FIREBASE_MESSAGING_SENDER_ID"
    echo "  - VITE_FIREBASE_APP_ID"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔥 Starting development server..."
echo "📱 The application will open at http://localhost:5173"
echo ""
echo "🔧 Make sure you have:"
echo "  ✅ Created a Firebase project"
echo "  ✅ Enabled Firestore Database"
echo "  ✅ Added your Firebase config to .env.local"
echo "  ✅ Set up Firestore security rules"
echo ""

npm run dev
