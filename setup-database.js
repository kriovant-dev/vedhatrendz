// Firebase Database Setup Script
// Run this script to initialize your Firestore database with collections and sample data

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

// Firebase configuration (using your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDBLn6mh2-VLQbZEBlGuqNts77WU1uv6AQ",
  authDomain: "vedhatrendz-demo.firebaseapp.com",
  projectId: "vedhatrendz-demo",
  storageBucket: "vedhatrendz-demo.firebasestorage.app",
  messagingSenderId: "411964662341",
  appId: "1:411964662341:web:09ce09d5aff7d5c23d392c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Admin users data
const adminUsers = [
  {
    id: "admin1",
    username: "admin",
    password_hash: "admin123", // In production, this should be properly hashed
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Sample products data
const products = [
  {
    name: "Elegant Red Silk Saree",
    description: "Beautiful red silk saree with golden border, perfect for weddings and special occasions.",
    price: 15000, // Price in paise (₹150.00)
    original_price: 20000,
    category: "silk",
    fabric: "Pure Silk",
    occasion: "Wedding",
    colors: ["Red", "Golden"],
    sizes: ["Free Size"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500"
    ],
    stock_quantity: 10,
    rating: 4.5,
    reviews_count: 23,
    is_new: true,
    is_bestseller: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: "Royal Blue Banarasi Saree",
    description: "Luxurious blue Banarasi saree with intricate gold work, traditional and elegant.",
    price: 25000,
    original_price: 30000,
    category: "banarasi",
    fabric: "Banarasi Silk",
    occasion: "Festival",
    colors: ["Blue", "Gold"],
    sizes: ["Free Size"],
    images: [
      "https://images.unsplash.com/photo-1594736797933-d0d9a58b3e8f?w=500",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500"
    ],
    stock_quantity: 5,
    rating: 4.8,
    reviews_count: 45,
    is_new: false,
    is_bestseller: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: "Cotton Printed Casual Saree",
    description: "Comfortable cotton saree with beautiful prints, perfect for daily wear.",
    price: 5000,
    original_price: 7000,
    category: "cotton",
    fabric: "Cotton",
    occasion: "Casual",
    colors: ["Pink", "White"],
    sizes: ["Free Size"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
      "https://images.unsplash.com/photo-1594736797933-d0d9a58b3e8f?w=500"
    ],
    stock_quantity: 20,
    rating: 4.2,
    reviews_count: 12,
    is_new: false,
    is_bestseller: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: "Green Georgette Party Saree",
    description: "Stylish green georgette saree with embellishments, ideal for parties.",
    price: 12000,
    original_price: 16000,
    category: "georgette",
    fabric: "Georgette",
    occasion: "Party",
    colors: ["Green", "Silver"],
    sizes: ["Free Size"],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500"
    ],
    stock_quantity: 8,
    rating: 4.6,
    reviews_count: 18,
    is_new: true,
    is_bestseller: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Sample orders data
const orders = [
  {
    customer_email: "customer@example.com",
    customer_name: "Priya Sharma",
    customer_phone: "+91 98765 43210",
    shipping_address: {
      street: "123 MG Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      country: "India"
    },
    order_items: [
      {
        id: "product1",
        name: "Elegant Red Silk Saree",
        price: 15000,
        quantity: 1,
        color: "Red",
        size: "Free Size"
      }
    ],
    subtotal: 15000,
    shipping_cost: 500,
    tax_amount: 1500,
    total_amount: 17000,
    status: "pending",
    payment_status: "paid",
    payment_method: "UPI",
    tracking_number: null,
    notes: "Please handle with care",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function initializeDatabase() {
  try {
    console.log("🚀 Starting database initialization...");

    // Create admin users
    console.log("👤 Creating admin users...");
    for (const adminUser of adminUsers) {
      await setDoc(doc(db, 'admin_users', adminUser.id), adminUser);
      console.log(`✅ Created admin user: ${adminUser.username}`);
    }

    // Create products
    console.log("🛍️ Creating products...");
    for (const product of products) {
      const docRef = await addDoc(collection(db, 'products'), product);
      console.log(`✅ Created product: ${product.name} (ID: ${docRef.id})`);
    }

    // Create orders
    console.log("📦 Creating sample orders...");
    for (const order of orders) {
      const docRef = await addDoc(collection(db, 'orders'), order);
      console.log(`✅ Created order for: ${order.customer_name} (ID: ${docRef.id})`);
    }

    console.log("🎉 Database initialization completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`- Admin users: ${adminUsers.length}`);
    console.log(`- Products: ${products.length}`);
    console.log(`- Sample orders: ${orders.length}`);
    console.log("\n🔐 Admin Login Credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");

  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
}

// Run the initialization
initializeDatabase();
