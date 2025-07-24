import { CategoryService } from '@/services/categoryService';

export const seedDefaultCategories = async () => {
  try {
    console.log('🌱 Checking if categories exist...');
    
    // Check if categories already exist
    const existingCategories = await CategoryService.getAllCategories();
    
    if (existingCategories.length > 0) {
      console.log(`✅ Found ${existingCategories.length} existing categories, skipping seed`);
      return existingCategories;
    }

    console.log('🌱 No categories found, seeding default categories...');

    const defaultCategories = [
      {
        name: 'Lehengas',
        slug: 'lehengas',
        description: 'lehengas',
        sort_order: 1,
        is_active: true
      },
      {
        name: 'Sarees',
        slug: 'sarees',
        description: 'Sarees',
        sort_order: 2,
        is_active: true
      },
      {
        name: 'Kurtiset',
        slug: 'kurtiset',
        description: '',
        sort_order: 3,  
        is_active: true
      },
      {
        name: 'Gowns',
        slug: 'gowns',
        description: '',
        sort_order: 4,
        is_active: true
      },
      {
        name: 'Stitched Blouse Sarees',
        slug: 'stitched-blouse-sarees',
        description: '',
        sort_order: 5,
        is_active: true
      },
      {
        name: 'Kids Wear',
        slug: 'kidswear',
        description: '',
        sort_order: 6,
        is_active: true
      }
    ];

    const createdCategories = [];

    for (const category of defaultCategories) {
      try {
        const result = await CategoryService.createCategory(category);
        createdCategories.push(result);
        console.log(`✅ Created category: ${category.name}`);
      } catch (error) {
        console.error(`❌ Failed to create category ${category.name}:`, error);
      }
    }

    console.log(`🌱 Successfully seeded ${createdCategories.length} categories`);
    return createdCategories;

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    return [];
  }
};

// Function to call from admin interface
export const resetCategories = async () => {
  try {
    console.log('🔄 Resetting categories...');
    
    // Get all categories
    const allCategories = await CategoryService.getAllCategories();
    
    // Deactivate all existing categories
    for (const category of allCategories) {
      await CategoryService.updateCategory(category.id, { is_active: false });
    }
    
    // Seed default categories
    return await seedDefaultCategories();
    
  } catch (error) {
    console.error('❌ Error resetting categories:', error);
    return [];
  }
};
