#!/bin/bash
# Production build script for Vercel deployment

echo "🚀 Starting Production Build for VedhaTrendz..."

# 1. Check if all environment variables are set
echo "📋 Checking environment variables..."
if [ -z "$VITE_FIREBASE_API_KEY" ]; then
  echo "❌ Missing VITE_FIREBASE_API_KEY"
  exit 1
fi

if [ -z "$VITE_FIREBASE_PROJECT_ID" ]; then
  echo "❌ Missing VITE_FIREBASE_PROJECT_ID"
  exit 1
fi

if [ -z "$VITE_R2_PUBLIC_URL" ]; then
  echo "❌ Missing VITE_R2_PUBLIC_URL"
  exit 1
fi

echo "✅ Environment variables check passed"

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci

# 3. Run linting
echo "🔍 Running ESLint..."
npm run lint

# 4. Type checking
echo "📝 Running TypeScript checks..."
npm run type-check

# 5. Build the project
echo "🏗️ Building production bundle..."
npm run build

# 6. Check build output
echo "📊 Checking build output..."
if [ -d "dist" ]; then
  echo "✅ Build successful - dist folder created"
  echo "📁 Build size:"
  du -sh dist
else
  echo "❌ Build failed - dist folder not found"
  exit 1
fi

echo "🎉 Production build completed successfully!"
echo "🚀 Ready for Vercel deployment"