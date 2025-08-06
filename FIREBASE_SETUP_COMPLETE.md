# Firebase Setup Instructions for VedhaTrendz

## 🚀 Complete Firebase Setup Guide

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `vedhatrendz` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firebase Services

#### Enable Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**
   - **Google** (recommended)
   - **Phone** (optional)

#### Enable Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll update rules later)
4. Select your region (choose closest to your users)

#### Enable Storage (Optional)
1. Go to **Storage**
2. Click **Get started**
3. Start in test mode
4. Choose same region as Firestore

### 3. Configure Web App

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Register app name: `vedhatrendz-web`
5. Copy the configuration object

### 4. Update Environment Variables

Create or update `.env.local` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id-here

# ImageKit Configuration (keep your existing values)
VITE_IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
VITE_IMAGEKIT_URL_ENDPOINT=your-imagekit-url-endpoint
VITE_IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key

# Email Configuration (keep your existing values)
VITE_EMAIL_SERVER_URL=http://localhost:3001
VITE_ADMIN_EMAIL=vedhatrendz@gmail.com

# Razorpay Configuration (keep your existing values)
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

### 5. Deploy Firestore Security Rules

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select **Firestore** and **Hosting**
   - Choose your existing project
   - Accept default Firestore rules file (`firestore.rules`)
   - Accept default Firestore indexes file (`firestore.indexes.json`)

4. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 6. Set Up Admin Users

#### Method 1: Using Firebase Console
1. Go to **Authentication** → **Users**
2. Add user manually
3. Go to **Firestore Database**
4. Create collection: `admin_users`
5. Add document with admin email as document ID
6. Add field: `isAdmin: true`

#### Method 2: Using Custom Claims (Recommended)
Run this in Firebase Console → Functions:

```javascript
const admin = require('firebase-admin');

// Set admin custom claim
admin.auth().setCustomUserClaims('USER_UID_HERE', {
  admin: true
}).then(() => {
  console.log('Admin claim set successfully');
});
```

### 7. Initialize Database with Sample Data

Run the delivery date migration script:

1. Open your VedhaTrendz app in browser
2. Login as admin
3. Open browser Developer Tools (F12) → Console
4. Copy and paste the content from `firebase-delivery-migration.js`
5. Run: `addDeliveryFieldsToProducts()`

### 8. Production Deployment

#### Update Firestore Rules for Production
Replace the rules in `firestore.rules` with production-ready rules (already included).

#### Environment Variables for Vercel
Add these environment variables in your Vercel dashboard:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 9. Verify Setup

1. Start your development server: `npm run dev`
2. Check browser console for Firebase connection
3. Try creating a product in admin panel
4. Verify data appears in Firestore console

## 🔧 Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Check environment variables are set correctly
   - Ensure `.env.local` file exists and is not in `.gitignore`

2. **"Missing or insufficient permissions"**
   - Update Firestore security rules
   - Ensure admin custom claims are set

3. **"Network request failed"**
   - Check Firebase project is active
   - Verify API key is correct

### Getting Help

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: Tag your questions with `firebase` and `firestore`

## 📋 File Structure

After setup, your Firebase-related files should be:

```
src/
  integrations/
    firebase/
      config.ts          # Firebase initialization
      client.ts          # Database operations
firestore.rules          # Security rules
firestore.indexes.json   # Database indexes
firebase-delivery-migration.js  # Migration script
.env.local              # Environment variables
```

## ✅ Next Steps

1. Run the delivery date field migration
2. Test product creation with delivery dates
3. Verify email notifications include delivery info
4. Deploy to production with proper environment variables

Your VedhaTrendz application is now fully configured with Firebase! 🎉
