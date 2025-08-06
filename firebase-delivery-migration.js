// Firebase Script: Add delivery date fields to existing products
// Run this in the browser console while authenticated as admin

import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './src/integrations/firebase/config';

export const addDeliveryFieldsToProducts = async () => {
  console.log('🔧 Starting Firebase migration: Adding delivery date fields to products...');
  
  try {
    // Get all products
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    let updatedCount = 0;
    const batch = [];
    
    // Process each product
    snapshot.forEach((productDoc) => {
      const productData = productDoc.data();
      
      // Check if delivery fields already exist
      if (!productData.delivery_days_min && !productData.delivery_days_max) {
        // Add default delivery days based on category
        let deliveryDaysMin = 3; // Default 3 days
        let deliveryDaysMax = 5; // Default 3-5 days range
        
        // Category-specific delivery times
        if (productData.category) {
          switch (productData.category.toLowerCase()) {
            case 'sarees':
            case 'saree':
              deliveryDaysMin = 3;
              deliveryDaysMax = 5;
              break;
            case 'kurta sets':
            case 'kurta':
            case 'kurti':
              deliveryDaysMin = 2;
              deliveryDaysMax = 3;
              break;
            case 'lehengas':
            case 'lehenga':
              deliveryDaysMin = 5;
              deliveryDaysMax = 7;
              break;
            case 'kids wear':
            case 'kids':
              deliveryDaysMin = 2;
              deliveryDaysMax = 4;
              break;
            default:
              deliveryDaysMin = 3;
              deliveryDaysMax = 5;
          }
        }
        
        batch.push({
          docRef: doc(db, 'products', productDoc.id),
          data: {
            delivery_days_min: deliveryDaysMin,
            delivery_days_max: deliveryDaysMax,
            updated_at: new Date().toISOString()
          }
        });
        
        updatedCount++;
      }
    });
    
    // Execute batch updates
    console.log(`📦 Updating ${updatedCount} products with delivery information...`);
    
    for (const update of batch) {
      await updateDoc(update.docRef, update.data);
    }
    
    console.log(`✅ Successfully updated ${updatedCount} products with delivery date fields!`);
    console.log('📝 Migration Summary:');
    console.log('- Added delivery_days_min field (minimum delivery days)');
    console.log('- Added delivery_days_max field (maximum delivery days)');
    console.log('- Set category-specific default delivery times');
    console.log('- Updated timestamps for modified documents');
    
    return {
      success: true,
      updatedCount,
      message: `Successfully updated ${updatedCount} products`
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Instructions for running this migration:
console.log(`
🚀 FIREBASE MIGRATION INSTRUCTIONS:

1. Open your browser and go to your VedhaTrendz admin panel
2. Make sure you're logged in as admin
3. Open browser Developer Tools (F12)
4. Go to Console tab
5. Copy and paste this entire script
6. Run: addDeliveryFieldsToProducts()

This will add delivery_days_min and delivery_days_max fields to all existing products.

Default delivery times by category:
- Sarees: 3-5 days
- Kurta Sets: 2-3 days  
- Lehengas: 5-7 days
- Kids Wear: 2-4 days
- Other: 3-5 days

You can modify these defaults in the ProductManager after the migration.
`);

// Optional: Function to verify the migration
export const verifyDeliveryFieldsMigration = async () => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    let totalProducts = 0;
    let productsWithDelivery = 0;
    
    snapshot.forEach((doc) => {
      totalProducts++;
      const data = doc.data();
      if (data.delivery_days_min || data.delivery_days_max) {
        productsWithDelivery++;
      }
    });
    
    console.log(`📊 Migration Verification Results:`);
    console.log(`Total products: ${totalProducts}`);
    console.log(`Products with delivery fields: ${productsWithDelivery}`);
    console.log(`Migration complete: ${productsWithDelivery === totalProducts ? '✅ YES' : '❌ NO'}`);
    
    return {
      totalProducts,
      productsWithDelivery,
      isComplete: productsWithDelivery === totalProducts
    };
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return { error: error.message };
  }
};
