import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebase } from '@/integrations/firebase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Palette, Save, X } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CustomColor {
  id: string;
  name: string;
  hex_code: string;
  is_default: boolean;
  created_at: string;
}

interface ColorFormData {
  name: string;
  hex_code: string;
}

const ColorManager: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<ColorFormData>({
    name: '',
    hex_code: '#000000'
  });
  const [colorToDelete, setColorToDelete] = useState<CustomColor | null>(null);

  const queryClient = useQueryClient();

  // Fetch colors
  const { data: colors = [], isLoading } = useQuery({
    queryKey: ['custom-colors'],
    queryFn: async () => {
      const { data, error } = await firebase
        .from('custom_colors')
        .select('*')
        .order('created_at', { ascending: true })
        .execute();

      if (error) throw error;
      return data as CustomColor[];
    },
  });

  // Add color mutation
  const addColorMutation = useMutation({
    mutationFn: async (colorData: ColorFormData) => {
      // Validate hex code format
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexRegex.test(colorData.hex_code)) {
        throw new Error('Invalid hex color code format');
      }

      // Check if color name or hex already exists
      const existingColor = colors.find(
        color => 
          color.name.toLowerCase() === colorData.name.toLowerCase() || 
          color.hex_code.toLowerCase() === colorData.hex_code.toLowerCase()
      );

      if (existingColor) {
        throw new Error('Color name or hex code already exists');
      }

      const { data, error } = await firebase
        .from('custom_colors')
        .insert([
          {
            name: colorData.name.trim(),
            hex_code: colorData.hex_code.toLowerCase(),
            is_default: false,
            created_at: new Date().toISOString(),
          }
        ])
        .execute();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-colors'] });
      toast.success('Color added successfully!');
      setFormData({ name: '', hex_code: '#000000' });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add color');
    },
  });

  // Delete color mutation
  const deleteColorMutation = useMutation({
    mutationFn: async (colorId: string) => {
      const { error } = await firebase
        .from('custom_colors')
        .delete()
        .eq('id', colorId)
        .execute();

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-colors'] });
      toast.success('Color deleted successfully!');
      setColorToDelete(null);
    },
    onError: (error) => {
      toast.error('Failed to delete color');
      console.error('Delete color error:', error);
    },
  });

  const handleAddColor = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a color name');
      return;
    }
    addColorMutation.mutate(formData);
  };

  const handleDeleteColor = (color: CustomColor) => {
    if (color.is_default) {
      toast.error('Cannot delete default colors');
      return;
    }
    setColorToDelete(color);
  };

  const confirmDelete = () => {
    if (colorToDelete) {
      deleteColorMutation.mutate(colorToDelete.id);
    }
  };

  const isValidHex = (hex: string) => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Management
            </CardTitle>
            <Button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Color
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Color Form */}
          {isFormOpen && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Add New Color</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFormOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Color Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Royal Blue, Forest Green"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hex Color Code</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={formData.hex_code}
                      onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.hex_code}
                      onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  {!isValidHex(formData.hex_code) && formData.hex_code && (
                    <p className="text-sm text-red-500 mt-1">
                      Invalid hex color format (use #RRGGBB or #RGB)
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddColor}
                    disabled={addColorMutation.isPending || !formData.name.trim() || !isValidHex(formData.hex_code)}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {addColorMutation.isPending ? 'Adding...' : 'Add Color'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading colors...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage custom colors that will be available in the product color selector.
              </p>
              
              {colors.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No custom colors added yet</p>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Color
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colors.map((color) => (
                    <div
                      key={color.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: color.hex_code }}
                        />
                        <div>
                          <p className="font-medium">{color.name}</p>
                          <p className="text-sm text-muted-foreground uppercase">
                            {color.hex_code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {color.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                        {!color.is_default && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteColor(color)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!colorToDelete} onOpenChange={() => setColorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Color</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the color "{colorToDelete?.name}"?
              This action cannot be undone. Products using this color will still retain the color name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteColorMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ColorManager;