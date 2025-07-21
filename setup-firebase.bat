@echo off
echo 🔥 Firebase Database Setup for Vedha Trendz
echo ==========================================
echo.
echo This script will help you set up your Firebase Firestore database.
echo.
echo Option 1: Manual Setup (Recommended)
echo ------------------------------------
echo 1. Go to Firebase Console: https://console.firebase.google.com/
echo 2. Select your project: vedhatrendz-demo
echo 3. Click on "Firestore Database"
echo 4. Follow the MANUAL_SETUP.md guide
echo.
echo Option 2: Quick Test Data
echo ------------------------
echo We'll create some test data directly through the web interface.
echo.
echo 📋 After setup, use these credentials:
echo Username: admin
echo Password: admin123
echo.
echo 🚀 To continue with manual setup:
echo 1. Open Firebase Console in your browser
echo 2. Open MANUAL_SETUP.md file in this project
echo 3. Follow the step-by-step instructions
echo.
pause
echo.
echo Opening Firebase Console...
start https://console.firebase.google.com/project/vedhatrendz-demo/firestore
echo.
echo Opening setup guide...
start MANUAL_SETUP.md
echo.
echo ✅ Setup initiated! Follow the MANUAL_SETUP.md guide.
pause
