@echo off
echo 🚀 Starting VedhaTrendz Application with Firebase
echo ==================================================

REM Check if .env.local exists
if not exist .env.local (
    echo ⚠️  Warning: .env.local file not found!
    echo 📋 Please create .env.local file with your Firebase configuration.
    echo 💡 Use .env.example as a template.
    echo.
    echo Required environment variables:
    echo   - VITE_FIREBASE_API_KEY
    echo   - VITE_FIREBASE_AUTH_DOMAIN
    echo   - VITE_FIREBASE_PROJECT_ID
    echo   - VITE_FIREBASE_STORAGE_BUCKET
    echo   - VITE_FIREBASE_MESSAGING_SENDER_ID
    echo   - VITE_FIREBASE_APP_ID
    echo.
    set /p answer="Continue anyway? (y/N): "
    if /i not "%answer%"=="y" exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

echo 🔥 Starting development server...
echo 📱 The application will open at http://localhost:5173
echo.
echo 🔧 Make sure you have:
echo   ✅ Created a Firebase project
echo   ✅ Enabled Firestore Database
echo   ✅ Added your Firebase config to .env.local
echo   ✅ Set up Firestore security rules
echo.

npm run dev
