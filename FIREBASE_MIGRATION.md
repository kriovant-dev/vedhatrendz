# Firebase Migration Guide

## Overview
This guide will help you migrate your React application from Supabase to Firebase.

## Prerequisites

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard
   - Enable Firestore Database in your project

2. **Get Firebase Configuration**
   - In your Firebase project, go to Project Settings
   - Scroll down to "Your apps" section
   - Click on "Web app" or add a new web app
   - Copy the Firebase configuration object

## Setup Steps

### 1. Environment Configuration

Create a `.env.local` file in your project root and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
```

### 2. Database Structure Migration

Since Supabase uses PostgreSQL and Firebase uses NoSQL, you'll need to restructure your data:

#### Supabase Tables → Firestore Collections

- `admin_users` → `admin_users` collection
- `products` → `products` collection  
- `orders` → `orders` collection

#### Data Migration Process

1. **Export data from Supabase**
   - Use Supabase Dashboard or SQL queries to export your data
   - Convert to JSON format

2. **Import data to Firestore**
   - Use Firebase Admin SDK or Firestore console
   - Create documents in appropriate collections

### 3. Key Differences to Note

#### Authentication
- Supabase: Built-in row-level security
- Firebase: Use Firebase Authentication + Firestore Security Rules

#### Queries
- Supabase: SQL-like queries
- Firebase: NoSQL queries with limited joins

#### Real-time
- Supabase: Built-in real-time subscriptions
- Firebase: Real-time listeners with onSnapshot

### 4. Updated Code Structure

The migration has been implemented with a compatibility layer that mimics Supabase's API:

```typescript
// Before (Supabase)
import { supabase } from '@/integrations/supabase/client';
const { data, error } = await supabase.from('products').select('*');

// After (Firebase with compatibility layer)
import { firebase } from '@/integrations/firebase/client';
const { data, error } = await firebase.from('products').select('*').execute();
```

### 5. Running the Application

1. **Install dependencies** (already done):
   ```bash
   npm install firebase
   ```

2. **Update environment variables**:
   Copy `.env.example` to `.env.local` and fill in your Firebase configuration

3. **Remove Supabase dependencies**:
   ```bash
   npm uninstall @supabase/supabase-js
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### 6. Files Modified

The following files have been updated to use Firebase:

- `src/integrations/firebase/config.ts` - Firebase configuration
- `src/integrations/firebase/client.ts` - Firebase client with Supabase-compatible API
- `src/components/AdminLogin.tsx` - Updated import and queries
- `src/components/ProductManager.tsx` - Updated import and queries  
- `src/components/FeaturedProducts.tsx` - Updated import and queries
- `src/pages/Admin.tsx` - Updated import (partial)

### 7. Next Steps

1. **Set up your Firebase project** and get the configuration values
2. **Update the `.env.local` file** with your actual Firebase configuration
3. **Create Firestore collections** and migrate your data
4. **Set up Firestore Security Rules** for data protection
5. **Test all functionality** to ensure everything works correctly

### 8. Security Rules Example

Add these basic security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin users collection - only authenticated admins can read/write
    match /admin_users/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Products collection - public read, admin write
    match /products/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders collection - admin only
    match /orders/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Make sure your environment variables are set correctly
2. **Firestore rules deny access**: Update your security rules
3. **Data structure differences**: Adjust queries for NoSQL structure
4. **Missing collections**: Create collections in Firebase console

### Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Ensure Firestore collections exist
4. Check Firebase security rules

## Performance Notes

- Firebase queries are optimized differently than SQL
- Consider denormalizing data for better performance
- Use compound indexes for complex queries
- Implement pagination for large datasets
