import { FirebaseClient } from '@/integrations/firebase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  image_link?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  image_link?: string;
  is_active?: boolean;
  sort_order?: number;
}

export const CategoryService = {
  // Get all active categories
  async getCategories(): Promise<Category[]> {
    try {
      console.log('🔍 Fetching categories from Firebase...');
      
      const { data, error } = await FirebaseClient.getWhere('categories', [
        { field: 'is_active', operator: '==', value: true }
      ]);

      if (error) {
        console.error('❌ Error fetching categories:', error);
        // Fallback: try to get all categories without filtering
        const { data: allData, error: allError } = await FirebaseClient.getAll('categories');
        if (allError) {
          console.error('❌ Error fetching all categories:', allError);
          return [];
        }
        const activeCategories = (allData || []).filter((cat: any) => cat.is_active !== false);
        console.log(`✅ Fallback: Found ${activeCategories.length} categories`);
        return activeCategories.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) as Category[];
      }

      // Sort by sort_order
      const sortedData = (data || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
      console.log(`✅ Found ${sortedData.length} active categories:`, sortedData.map((c: any) => c.name));
      return sortedData as Category[];
    } catch (error) {
      console.error('❌ Error in getCategories:', error);
      // Final fallback: try to get all data without any filtering
      try {
        const { data: allData } = await FirebaseClient.getAll('categories');
        const result = (allData || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
        console.log(`✅ Final fallback: Found ${result.length} categories`);
        return result as Category[];
      } catch (finalError) {
        console.error('❌ Final fallback failed:', finalError);
        return [];
      }
    }
  },

  // Get only categories that have products (for display purposes)
  async getCategoriesWithProducts(): Promise<Category[]> {
    try {
      // First, get all active categories
      const { data: categories, error: categoriesError } = await FirebaseClient.getWhere('categories', [
        { field: 'is_active', operator: '==', value: true }
      ]);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }

      if (!categories || categories.length === 0) {
        return [];
      }

      // Get all products to check which categories have products
      const { data: products, error: productsError } = await FirebaseClient.getAll('products');

      if (productsError) {
        console.error('Error fetching products:', productsError);
        // If we can't fetch products, return all categories as fallback
        return (categories || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) as Category[];
      }

      // Filter categories that have at least one product
      const categoriesWithProducts = (categories || []).filter((category: any) => {
        const hasProducts = (products || []).some((product: any) => 
          product.category && product.category.toLowerCase() === category.name.toLowerCase()
        );
        
        if (!hasProducts) {
          console.log(`Category "${category.name}" has no products and will be hidden from display`);
        }
        
        return hasProducts;
      });

      // Sort by sort_order
      const sortedCategories = categoriesWithProducts.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
      
      console.log(`Displaying ${categoriesWithProducts.length} categories with products out of ${categories.length} total categories`);
      
      return sortedCategories as Category[];
    } catch (error) {
      console.error('Error in getCategoriesWithProducts:', error);
      // Fallback to regular getCategories if there's an error
      return this.getCategories();
    }
  },

  // Get all categories (including inactive ones for admin)
  async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await FirebaseClient.getAll('categories');

      if (error) {
        console.error('Error fetching all categories:', error);
        throw error;
      }

      // Sort by sort_order
      const sortedData = (data || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
      return sortedData as Category[];
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      return [];
    }
  },

  // Create a new category
  async createCategory(categoryData: CreateCategoryData): Promise<Category | null> {
    try {
      const newCategory = {
        ...categoryData,
        is_active: categoryData.is_active ?? true,
        sort_order: categoryData.sort_order ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await FirebaseClient.add('categories', newCategory);

      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }

      return data as Category;
    } catch (error) {
      console.error('Error in createCategory:', error);
      throw error;
    }
  },

  // Update a category
  async updateCategory(id: string, updates: Partial<CreateCategoryData>): Promise<Category | null> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await FirebaseClient.update('categories', id, updateData);

      if (error) {
        console.error('Error updating category:', error);
        throw error;
      }

      return data as Category;
    } catch (error) {
      console.error('Error in updateCategory:', error);
      throw error;
    }
  },

  // Delete a category (soft delete)
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await FirebaseClient.update('categories', id, {
        is_active: false,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      return false;
    }
  },

  // Permanently delete a category
  async hardDeleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await FirebaseClient.delete('categories', id);

      if (error) {
        console.error('Error hard deleting category:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in hardDeleteCategory:', error);
      return false;
    }
  },

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await FirebaseClient.getWhere('categories', [
        { field: 'slug', operator: '==', value: slug },
        { field: 'is_active', operator: '==', value: true }
      ]);

      if (error) {
        console.error('Error fetching category by slug:', error);
        return null;
      }

      return (data?.[0] as Category) || null;
    } catch (error) {
      console.error('Error in getCategoryBySlug:', error);
      return null;
    }
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await FirebaseClient.getById('categories', id);

      if (error) {
        console.error('Error fetching category by ID:', error);
        return null;
      }

      return data as Category;
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      return null;
    }
  },

  // Generate slug from name
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // Check if slug is unique
  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const { data } = await FirebaseClient.getWhere('categories', [
        { field: 'slug', operator: '==', value: slug }
      ]);

      if (!data || data.length === 0) return true;
      
      // If excluding an ID (for updates), check if the found category is the same one
      if (excludeId && data.length === 1 && data[0].id === excludeId) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking slug uniqueness:', error);
      return false;
    }
  },

  // Get default categories for fallback
  getDefaultCategories(): Array<{ value: string; label: string }> {
    return [
      { value: 'sarees', label: 'Sarees' },
      { value: 'silk-sarees', label: 'Silk Sarees' },
      { value: 'cotton-sarees', label: 'Cotton Sarees' },
      { value: 'designer-sarees', label: 'Designer Sarees' },
      { value: 'wedding-sarees', label: 'Wedding Sarees' },
      { value: 'festive-sarees', label: 'Festive Sarees' },
      { value: 'office-wear', label: 'Office Wear' },
    ];
  }
};