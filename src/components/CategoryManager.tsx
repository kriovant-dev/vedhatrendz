import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Tag, AlertTriangle, Sprout } from 'lucide-react';
import { CategoryService, Category, CreateCategoryData } from '@/services/categoryService';
import { seedDefaultCategories, resetCategories } from '@/utils/seedCategories';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  sort_order: string;
  is_active: boolean;
}

const CategoryManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    sort_order: '0',
    is_active: true,
  });

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: CategoryService.getAllCategories,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      // Check slug uniqueness
      const isUnique = await CategoryService.isSlugUnique(data.slug);
      if (!isUnique) {
        throw new Error('Category slug already exists. Please choose a different name or slug.');
      }
      return CategoryService.createCategory(data);
    },
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // Invalidate public categories too
      toast.success('Category created successfully');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
      console.error('Create error:', error);
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCategoryData> }) => {
      // Check slug uniqueness if slug is being updated
      if (data.slug) {
        const isUnique = await CategoryService.isSlugUnique(data.slug, id);
        if (!isUnique) {
          throw new Error('Category slug already exists. Please choose a different slug.');
        }
      }
      return CategoryService.updateCategory(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // Invalidate public categories too
      toast.success('Category updated successfully');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category');
      console.error('Update error:', error);
    },
  });

  // Soft delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: CategoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // Invalidate public categories too
      toast.success('Category soft deleted successfully (can be restored by setting to active)');
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete category');
      console.error('Delete error:', error);
    },
  });

  // Seed categories mutation
  const seedCategoriesMutation = useMutation({
    mutationFn: seedDefaultCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Default categories seeded successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to seed categories');
      console.error('Seed error:', error);
    },
  });

  const resetForm = () => {
    },
  });
      setCategoryToDelete(null);
    },
    onError: (error) => {
      toast.error('Failed to delete category');
      console.error('Delete error:', error);
    },
  });

  // Hard delete category mutation
  const hardDeleteMutation = useMutation({
    mutationFn: CategoryService.hardDeleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // Invalidate public categories too
      toast.success('Category permanently deleted');
    },
    onError: (error) => {
      toast.error('Failed to permanently delete category');
      console.error('Hard delete error:', error);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      sort_order: '0',
      is_active: true,
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sort_order: category.sort_order.toString(),
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const categoryData: CreateCategoryData = {
      name: formData.name,
      slug: formData.slug || CategoryService.generateSlug(formData.name),
      description: formData.description || undefined,
      sort_order: parseInt(formData.sort_order) || 0,
      is_active: formData.is_active,
    };

    try {
      if (editingCategory) {
        updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryData });
      } else {
        createCategoryMutation.mutate(categoryData);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug === CategoryService.generateSlug(prev.name) || !prev.slug 
        ? CategoryService.generateSlug(value) 
        : prev.slug
    }));
  };

  const handleSoftDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleHardDelete = (category: Category) => {
    const message = `⚠️ PERMANENT DELETION WARNING ⚠️\n\nThis will PERMANENTLY delete "${category.name}" and CANNOT be undone!\n\nAre you absolutely sure?\n\nType "DELETE" to confirm:`;
    
    const confirmation = window.prompt(message);
    if (confirmation === 'DELETE') {
      hardDeleteMutation.mutate(category.id);
    } else if (confirmation !== null) {
      toast.error('Deletion cancelled - you must type "DELETE" exactly');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Tag className="h-5 w-5 sm:h-6 sm:w-6" />
            Category Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage product categories and their organization
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => seedCategoriesMutation.mutate()} 
            variant="outline"
            disabled={seedCategoriesMutation.isPending}
            className="flex-1 sm:flex-none"
          >
            <Sprout className="h-4 w-4 mr-2" />
            {seedCategoriesMutation.isPending ? 'Seeding...' : 'Seed Categories'}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
              </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Silk Sarees"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., silk-sarees"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL-friendly version (auto-generated from name)
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the category"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Sort Order</label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    placeholder="0"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No categories found</p>
              <p className="text-sm">Add your first category to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Slug</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category, index) => (
                    <TableRow key={category.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {category.sort_order || index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm sm:text-base">{category.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">
                          {category.slug}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs font-mono">
                        {category.slug}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {category.description ? (
                          <span className="truncate max-w-32 block">
                            {category.description}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">No description</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? 'default' : 'secondary'} className="text-xs">
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSoftDelete(category)}
                            className="h-7 w-7 p-0 text-orange-500 hover:text-orange-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHardDelete(category)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <AlertTriangle className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soft Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to soft delete "{categoryToDelete?.name}"?
              <br /><br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Hide the category from public view</li>
                <li>Keep all products in this category</li>
                <li>Allow you to restore it later by setting it as active</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => categoryToDelete && deleteCategoryMutation.mutate(categoryToDelete.id)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Soft Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManager;
