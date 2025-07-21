# Manual Firebase Firestore Setup Guide

Since running JavaScript files directly can be complex, here's how to manually set up your Firebase Firestore database:

## 1. Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **vedhatrendz-demo**
3. Click on **Firestore Database** in the left sidebar
4. If not already created, click **Create database**
5. Choose **Start in test mode** (we'll set up security rules later)
6. Select a location (choose the closest to your users)

## 2. Create Collections and Documents

### A. Create `admin_users` Collection

1. Click **Start collection**
2. Collection ID: `admin_users`
3. Click **Next**
4. Document ID: `admin1`
5. Add these fields:
   - `username` (string): `admin`
   - `password_hash` (string): `admin123`
   - `created_at` (string): `2025-07-18T10:30:00.000Z`
   - `updated_at` (string): `2025-07-18T10:30:00.000Z`
6. Click **Save**

### B. Create `products` Collection

1. Click **Start collection**
2. Collection ID: `products`
3. Click **Next**
4. Create multiple documents with these sample products:

#### Product 1:
- Document ID: Auto-generate
- Fields:
  ```
  name (string): "Elegant Red Silk Saree"
  description (string): "Beautiful red silk saree with golden border, perfect for weddings and special occasions."
  price (number): 15000
  original_price (number): 20000
  category (string): "silk"
  fabric (string): "Pure Silk"
  occasion (string): "Wedding"
  colors (array): ["Red", "Golden"]
  sizes (array): ["Free Size"]
  images (array): [
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500"
  ]
  stock_quantity (number): 10
  rating (number): 4.5
  reviews_count (number): 23
  is_new (boolean): true
  is_bestseller (boolean): false
  created_at (string): "2025-07-18T10:30:00.000Z"
  updated_at (string): "2025-07-18T10:30:00.000Z"
  ```

#### Product 2:
- Document ID: Auto-generate
- Fields:
  ```
  name (string): "Royal Blue Banarasi Saree"
  description (string): "Luxurious blue Banarasi saree with intricate gold work, traditional and elegant."
  price (number): 25000
  original_price (number): 30000
  category (string): "banarasi"
  fabric (string): "Banarasi Silk"
  occasion (string): "Festival"
  colors (array): ["Blue", "Gold"]
  sizes (array): ["Free Size"]
  images (array): [
    "https://images.unsplash.com/photo-1594736797933-d0d9a58b3e8f?w=500",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500"
  ]
  stock_quantity (number): 5
  rating (number): 4.8
  reviews_count (number): 45
  is_new (boolean): false
  is_bestseller (boolean): true
  created_at (string): "2025-07-18T10:30:00.000Z"
  updated_at (string): "2025-07-18T10:30:00.000Z"
  ```

#### Product 3:
- Document ID: Auto-generate
- Fields:
  ```
  name (string): "Cotton Printed Casual Saree"
  description (string): "Comfortable cotton saree with beautiful prints, perfect for daily wear."
  price (number): 5000
  original_price (number): 7000
  category (string): "cotton"
  fabric (string): "Cotton"
  occasion (string): "Casual"
  colors (array): ["Pink", "White"]
  sizes (array): ["Free Size"]
  images (array): [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
    "https://images.unsplash.com/photo-1594736797933-d0d9a58b3e8f?w=500"
  ]
  stock_quantity (number): 20
  rating (number): 4.2
  reviews_count (number): 12
  is_new (boolean): false
  is_bestseller (boolean): false
  created_at (string): "2025-07-18T10:30:00.000Z"
  updated_at (string): "2025-07-18T10:30:00.000Z"
  ```

### C. Create `orders` Collection

1. Click **Start collection**
2. Collection ID: `orders`
3. Click **Next**
4. Create a sample order:

#### Sample Order:
- Document ID: Auto-generate
- Fields:
  ```
  customer_email (string): "customer@example.com"
  customer_name (string): "Priya Sharma"
  customer_phone (string): "+91 98765 43210"
  shipping_address (map): {
    street (string): "123 MG Road"
    city (string): "Bangalore"
    state (string): "Karnataka"
    pincode (string): "560001"
    country (string): "India"
  }
  order_items (array): [{
    id (string): "product1"
    name (string): "Elegant Red Silk Saree"
    price (number): 15000
    quantity (number): 1
    color (string): "Red"
    size (string): "Free Size"
  }]
  subtotal (number): 15000
  shipping_cost (number): 500
  tax_amount (number): 1500
  total_amount (number): 17000
  status (string): "pending"
  payment_status (string): "paid"
  payment_method (string): "UPI"
  tracking_number (string): null
  notes (string): "Please handle with care"
  created_at (string): "2025-07-18T10:30:00.000Z"
  updated_at (string): "2025-07-18T10:30:00.000Z"
  ```

## 3. Set Up Security Rules

Go to **Rules** tab in Firestore and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to products
    match /products/{document} {
      allow read: if true;
      allow write: if true; // For now, allow all writes (change in production)
    }
    
    // Allow access to admin_users (should be restricted in production)
    match /admin_users/{document} {
      allow read, write: if true;
    }
    
    // Allow access to orders (should be restricted in production)
    match /orders/{document} {
      allow read, write: if true;
    }
  }
}
```

## 4. Admin Login Credentials

After setting up the database, you can log in with:
- **Username**: `admin`
- **Password**: `admin123`

## 5. Test Your Application

1. Start your development server: `npm run dev`
2. Go to `http://localhost:8080`
3. Navigate to `/admin` route
4. Login with the credentials above
5. You should see the products and can manage them

## Important Notes

- The security rules above are permissive for development. In production, implement proper authentication and authorization.
- Prices are stored in paise (1 rupee = 100 paise) for precise calculations.
- Images use Unsplash URLs for demonstration. Replace with your actual product images.
- The `shipping_address` field is a map (object) type in Firestore.
- Arrays in Firestore are created by clicking "Add item" for each array element.
