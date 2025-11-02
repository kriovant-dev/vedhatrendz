import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebase } from '@/integrations/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import R2MultiImageUpload, { ImageUploadResult } from '@/components/R2MultiImageUpload';
import ColorSelector from '@/components/ColorSelector';
import { ValidationUtils } from '@/utils/validation';
import { CategoryService } from '@/services/categoryService';
import SizePricingManager from '@/components/SizePricingManager';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { ThumbnailImage } from '@/components/R2OptimizedImages';

interface SizePricing {
  default: number;
  [size: string]: number;
}

interface Product {
  id: string;
  name: string;
  product_code: string; // Unique product code for search
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  fabric: string | null;
  occasion: string | null;
  colors: string[];
  sizes: string[];
  images: string[];
  color_images?: { [color: string]: string[] }; // New: color-specific images
  size_prices?: SizePricing; // Size-based pricing with default fallback
  delivery_days_min: number | null; // Minimum delivery days
  delivery_days_max: number | null; // Maximum delivery days (for range)
  stock_quantity: number | null;
  rating: number | null;
  reviews_count: number | null;
  is_new: boolean | null;
  is_bestseller: boolean | null;
  is_featured_hero: boolean | null;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  name: string;
  product_code: string;
  description: string;
  price: string;
  original_price: string;
  category: string;
  fabric: string;
  occasion: string;
  colors: string[];
  sizes: string;
  images: string; // Keep for backward compatibility
  delivery_days_min: string;
  delivery_days_max: string;
  stock_quantity: string;
  is_new: boolean;
  is_bestseller: boolean;
  is_featured_hero: boolean;
}

interface ProductEditData extends Omit<Product, 'images' | 'color_images'> {
  images?: string[];
  color_images?: { [color: string]: string[] };
}

// Type for creating new products - only required fields
interface CreateProductData {
  name: string;
  product_code: string;
  category: string;
  price: number;
  description?: string | null;
  original_price?: number | null;
  fabric?: string | null;
  occasion?: string | null;
  colors?: string[];
  sizes?: string[];
  images?: string[];
  color_images?: { [color: string]: string[] }; // Optional, only include if has data
  size_prices?: SizePricing; // Optional size-based pricing

  delivery_days_min?: number | null;
  delivery_days_max?: number | null;
  stock_quantity?: number | null;
  is_new?: boolean | null;
  is_bestseller?: boolean | null;
  is_featured_hero?: boolean | null;
}

const ProductManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    product_code: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    fabric: '',
    occasion: '',
    colors: [],
    sizes: 'S,M,L,XL',
    images: '',
    delivery_days_min: '',
    delivery_days_max: '',
    stock_quantity: '0',
    is_new: false,
    is_bestseller: false,
    is_featured_hero: false,
  });

  const [uploadedImages, setUploadedImages] = useState<ImageUploadResult[]>([]);
  const [colorImages, setColorImages] = useState<{ [color: string]: ImageUploadResult[] }>({});
  const [sizePricing, setSizePricing] = useState<SizePricing>({ default: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await firebase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .execute();
      
      if (error) throw error;
      return data as Product[];
    },
  });

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.product_code?.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.fabric?.toLowerCase().includes(query) ||
      product.colors.some(color => color.toLowerCase().includes(query))
    );
  });

  // Fetch dynamic categories
  const { data: dynamicCategories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: CategoryService.getCategories,
  });

  // Generate category options for form
  const categoryOptions = dynamicCategories.length > 0 
    ? dynamicCategories.map(cat => ({ value: cat.slug, label: cat.name }))
    : CategoryService.getDefaultCategories();

  // Quick add category function
  const handleQuickAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const slug = CategoryService.generateSlug(newCategoryName);
      const categoryData = {
        name: newCategoryName,
        slug,
        is_active: true,
        sort_order: categoryOptions.length,
      };

      await CategoryService.createCategory(categoryData);
      
      // Refresh categories
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      
      // Set the new category as selected
      setFormData({ ...formData, category: slug });
      setNewCategoryName('');
      
      toast.success(`Category "${newCategoryName}" created successfully!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category');
      console.error('Quick add category error:', error);
    }
  };

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: CreateProductData) => {
      const { data, error } = await firebase
        .from('products')
        .insert(productData) // Remove array wrapper - Firebase client handles this
        .execute();
      
      if (error) {
        console.error('Product creation error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success('Product created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create product');
      console.error('Create error:', error);
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const { error } = await firebase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .execute();
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success('Product updated successfully');
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error('Update error:', error);
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      // First, get the product to find all its image URLs
      const { data: product } = await firebase
        .from('products')
        .select('images, color_images')
        .eq('id', productId)
        .single();

      // Delete the product from database
      const { error } = await firebase
        .from('products')
        .delete()
        .eq('id', productId)
        .execute();
      
      if (error) throw error;

      // Extract file names from URLs for R2 deletion
      const allFileNamesToDelete: string[] = [];

      // Add main image file names if they exist
      if (product && product.images && product.images.length > 0) {
        product.images.forEach((url: string) => {
          const fileName = url.split('/').slice(-2).join('/'); // Get "folder/filename.ext"
          if (fileName && fileName.includes('/')) {
            allFileNamesToDelete.push(fileName);
          }
        });
      }

      // Add color-specific image file names if they exist
      if (product && product.color_images) {
        Object.values(product.color_images).forEach((colorUrls: any) => {
          if (Array.isArray(colorUrls) && colorUrls.length > 0) {
            colorUrls.forEach(url => {
              const fileName = url.split('/').slice(-2).join('/'); // Get "folder/filename.ext"
              if (fileName && fileName.includes('/')) {
                allFileNamesToDelete.push(fileName);
              }
            });
          }
        });
      }

      // Delete all associated images from R2
      if (allFileNamesToDelete.length > 0) {
        try {
          const deletePromises = allFileNamesToDelete.map(fileName =>
            fetch('/api/delete-r2-image', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName }),
            })
          );
          
          const results = await Promise.all(deletePromises);
          const successCount = results.filter(r => r.ok).length;
        } catch (imageError) {
          console.error('Failed to delete images from R2:', imageError);
          // Don't throw here as the product is already deleted from database
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete product');
      console.error('Delete error:', error);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      product_code: '',
      description: '',
      price: '',
      original_price: '',
      category: '',
      fabric: '',
      occasion: '',
      colors: [],
      sizes: 'S,M,L,XL',
      images: '',
      delivery_days_min: '',
      delivery_days_max: '',
      stock_quantity: '0',
      is_new: false,
      is_bestseller: false,
      is_featured_hero: false,
    });
    setUploadedImages([]);
    setColorImages({});
    setSizePricing({ default: 0 });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      product_code: product.product_code || '',
      description: product.description || '',
      price: (product.price / 100).toString(),
      original_price: product.original_price ? (product.original_price / 100).toString() : '',
      category: product.category,
      fabric: product.fabric || '',
      occasion: product.occasion || '',
      colors: product.colors || [],
      sizes: product.sizes.join(','),
      images: product.images.join(','),
      delivery_days_min: product.delivery_days_min?.toString() || '',
      delivery_days_max: product.delivery_days_max?.toString() || '',
      stock_quantity: product.stock_quantity?.toString() || '0',
      is_new: product.is_new || false,
      is_bestseller: product.is_bestseller || false,
      is_featured_hero: product.is_featured_hero || false,
    });
    
    // Convert size_prices from paise back to rupees for editing
    if (product.size_prices) {
      const convertedPricing: SizePricing = { default: 0 };
      Object.entries(product.size_prices).forEach(([size, price]) => {
        convertedPricing[size] = price / 100;
      });
      setSizePricing(convertedPricing);
    } else {
      setSizePricing({ default: Math.round(product.price / 100) });
    }
    
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation
    const nameValidation = ValidationUtils.validateName(formData.name, 'Product name');
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error!);
      return;
    }
    
    const codeValidation = ValidationUtils.validateProductCode(formData.product_code);
    if (!codeValidation.isValid) {
      toast.error(codeValidation.error!);
      return;
    }
    
    const priceValidation = ValidationUtils.validatePrice(formData.price);
    if (!priceValidation.isValid) {
      toast.error(priceValidation.error!);
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    // Validate images
    const imageUrls = uploadedImages.map(img => img.url);
    const fallbackImages = formData.images.split(',').map(i => i.trim()).filter(i => i);
    const finalImages = imageUrls.length > 0 ? imageUrls : fallbackImages;

    if (finalImages.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    // Prepare color images data
    const colorImagesData: { [color: string]: string[] } = {};
    
    Object.entries(colorImages).forEach(([color, images]) => {
      if (images.length > 0) {
        colorImagesData[color] = images.map(img => img.url);
      }
    });

    setIsSubmitting(true);

    try {
      // Prepare product data, filtering out undefined values
      // Only include sizes that are:
      // 1. In the base sizes input field (predefined sizes), OR
      // 2. Have a valid price > 0 in size_prices (custom sizes)
      
      const baseSizes = formData.sizes.split(',').map(s => s.trim()).filter(s => s);
      const customSizesWithPrices = Object.keys(sizePricing).filter(s => s !== 'default' && sizePricing[s] > 0);
      
      // Combine base and custom sizes, remove duplicates
      const allValidSizes = Array.from(new Set([...baseSizes, ...customSizesWithPrices]));
      
      const baseProductData: CreateProductData = {
        name: formData.name,
        product_code: formData.product_code,
        category: formData.category,
        price: Math.round(parseFloat(formData.price) * 100),
        description: formData.description || null,
        original_price: formData.original_price ? Math.round(parseFloat(formData.original_price) * 100) : null,
        fabric: formData.fabric || null,
        occasion: formData.occasion || null,
        colors: formData.colors,
        sizes: allValidSizes,
        images: finalImages,
        delivery_days_min: formData.delivery_days_min ? parseInt(formData.delivery_days_min) : null,
        delivery_days_max: formData.delivery_days_max ? parseInt(formData.delivery_days_max) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_new: formData.is_new,
        is_bestseller: formData.is_bestseller,
        is_featured_hero: formData.is_featured_hero,
      };

      // Only add color_images if they have data
      if (Object.keys(colorImagesData).length > 0) {
        baseProductData.color_images = colorImagesData;
      }

      // Only add size_prices if they have custom pricing
      if (Object.keys(sizePricing).length > 1 || sizePricing.default > 0) {
        // Convert prices from rupees to paise (multiply by 100) for storage
        const convertedSizePricing: SizePricing = { 
          default: Math.round(sizePricing.default * 100) 
        };
        Object.entries(sizePricing).forEach(([size, price]) => {
          if (size !== 'default' && price > 0) {
            convertedSizePricing[size] = Math.round(price * 100);
          }
        });
        baseProductData.size_prices = convertedSizePricing;
      }

      // Filter out undefined values to avoid Firebase errors
      const productData = Object.fromEntries(
        Object.entries(baseProductData).filter(([_, value]) => value !== undefined)
      ) as CreateProductData;

      if (editingProduct) {
        updateProductMutation.mutate({ id: editingProduct.id, updates: productData });
      } else {
        createProductMutation.mutate(productData);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">Manage your saree collection</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingProduct(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Product Code *</label>
                  <Input
                    value={formData.product_code}
                    onChange={(e) => setFormData({ ...formData, product_code: e.target.value.toUpperCase() })}
                    placeholder="e.g., VT-SAR-001"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Unique code for easy search</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <div className="flex gap-2">
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="__add_new__" className="text-primary font-medium border-t">
                          + Add New Category
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.category === '__add_new__' && (
                    <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                      <Input
                        placeholder="Enter new category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleQuickAddCategory();
                          }
                        }}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button 
                          type="button" 
                          size="sm" 
                          onClick={handleQuickAddCategory}
                          disabled={!newCategoryName.trim()}
                        >
                          Add Category
                        </Button>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setFormData({ ...formData, category: '' });
                            setNewCategoryName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Default Price (₹) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Base/fallback price if no size-specific price is set</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Original Price (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">For showing discount %</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Fabric</label>
                  <Input
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g., Silk, Cotton, Chiffon"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Occasion</label>
                  <Input
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    placeholder="e.g., Wedding, Party, Casual"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <ColorSelector
                    selectedColors={formData.colors}
                    onColorsChange={(colors) => setFormData({ ...formData, colors })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Sizes (comma-separated)</label>
                <Input
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="e.g., S, M, L, XL"
                />
              </div>

              {/* Size-Based Pricing Manager */}
              <SizePricingManager
                sizes={formData.sizes.split(',').map(s => s.trim()).filter(s => s)}
                sizePricing={sizePricing}
                onSizePricingChange={setSizePricing}
              />

              <div>
                <label className="text-sm font-medium">Product Images</label>
                <R2MultiImageUpload
                  onImagesUploaded={setUploadedImages}
                  existingImages={uploadedImages}
                  maxImages={5}
                  folder="products"
                />
                {uploadedImages.length === 0 && formData.images && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Fallback URL Input:</p>
                    <Textarea
                      value={formData.images}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Color-specific Images */}
              {formData.colors.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Color-Specific Images</label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Upload images for each color variant. These will be shown when users select specific colors.
                  </p>
                  <div className="space-y-4">
                    {formData.colors.map((color) => (
                      <div key={color} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                          <h4 className="font-medium">{color} Images</h4>
                        </div>
                        <R2MultiImageUpload
                          onImagesUploaded={(images) => {
                            setColorImages(prev => ({
                              ...prev,
                              [color]: images
                            }));
                          }}
                          existingImages={colorImages[color] || []}
                          maxImages={5}
                          folder={`products/colors/${color.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Stock Quantity</label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>

              {/* Delivery Date Fields */}
              <div>
                <label className="text-sm font-medium">Delivery Time</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Set the delivery timeframe for this product
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Minimum Days</label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={formData.delivery_days_min}
                      onChange={(e) => setFormData({ ...formData, delivery_days_min: e.target.value })}
                      placeholder="e.g., 2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Maximum Days (Optional)</label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={formData.delivery_days_max}
                      onChange={(e) => setFormData({ ...formData, delivery_days_max: e.target.value })}
                      placeholder="e.g., 3"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Leave max days empty for single day delivery (e.g., "Will be delivered in 4 days")
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_new"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                  />
                  <label htmlFor="is_new" className="text-sm font-medium">Mark as New</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_bestseller"
                    checked={formData.is_bestseller}
                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                  />
                  <label htmlFor="is_bestseller" className="text-sm font-medium">Mark as Bestseller</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured_hero"
                    checked={formData.is_featured_hero}
                    onChange={(e) => setFormData({ ...formData, is_featured_hero: e.target.checked })}
                  />
                  <label htmlFor="is_featured_hero" className="text-sm font-medium">Featured Hero Carousel</label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({filteredProducts.length}{products.length !== filteredProducts.length ? ` of ${products.length}` : ''})
            </CardTitle>
            <div className="w-80">
              <Input
                placeholder="Search by name, code, category, fabric, or color..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                          <ThumbnailImage
                            src={product.images[0]}
                            alt={product.name}
                            size={40}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Package className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.fabric && `${product.fabric} • `}
                            {product.colors.slice(0, 2).join(', ')}
                            {product.colors.length > 2 && ` +${product.colors.length - 2}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm font-medium">{product.product_code || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(product.price)}</div>
                      {product.original_price && product.original_price > product.price && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.original_price)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock_quantity && product.stock_quantity > 0 ? "default" : "destructive"}>
                        {product.stock_quantity || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {product.is_new && <Badge className="bg-green-100 text-green-800">New</Badge>}
                        {product.is_bestseller && <Badge className="bg-blue-100 text-blue-800">Bestseller</Badge>}
                        {product.is_featured_hero && <Badge className="bg-purple-100 text-purple-800">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setProductToDelete(product);
                            setShowDeleteConfirmation(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm Delete Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {productToDelete && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {productToDelete.images && productToDelete.images.length > 0 ? (
                  <ThumbnailImage
                    src={productToDelete.images[0]}
                    alt={productToDelete.name}
                    size={48}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                    <Package className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{productToDelete.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {productToDelete.product_code} • {productToDelete.category}
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-muted-foreground text-sm space-y-3">
              <p>
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <p>
                <strong>All images associated with this product will also be permanently deleted from the server.</strong>
              </p>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (productToDelete) {
                    deleteProductMutation.mutate(productToDelete.id);
                    setShowDeleteConfirmation(false);
                    setProductToDelete(null);
                  }
                }}
              >
                Delete Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;
