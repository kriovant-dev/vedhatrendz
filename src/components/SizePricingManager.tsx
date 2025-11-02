import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface SizePricing {
  default: number;
  [size: string]: number;
}

interface SizePricingManagerProps {
  sizes: string[]; // Available sizes for this product
  sizePricing: SizePricing;
  onSizePricingChange: (pricing: SizePricing) => void;
}

const SizePricingManager: React.FC<SizePricingManagerProps> = ({
  sizes,
  sizePricing,
  onSizePricingChange,
}) => {
  const [newSize, setNewSize] = useState('');
  const [newSizePrice, setNewSizePrice] = useState('');

  const handleDefaultPriceChange = (value: string) => {
    const price = value ? parseFloat(value) : 0;
    onSizePricingChange({
      ...sizePricing,
      default: price,
    });
  };

  const handleSizePriceChange = (size: string, value: string) => {
    const price = value ? parseFloat(value) : 0;
    onSizePricingChange({
      ...sizePricing,
      [size]: price,
    });
  };

  const handleAddCustomSize = () => {
    if (!newSize.trim()) {
      toast.error('Please enter a size name');
      return;
    }

    if (!newSizePrice || parseFloat(newSizePrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const sizeUpper = newSize.toUpperCase().trim();

    // Check if size already exists
    if (sizes.includes(sizeUpper)) {
      toast.error(`Size "${sizeUpper}" already exists`);
      return;
    }

    // Add size with price
    onSizePricingChange({
      ...sizePricing,
      [sizeUpper]: parseFloat(newSizePrice),
    });

    // Clear only the price field, keep size input for adding more sizes
    setNewSizePrice('');
    // Focus on the price field for next entry
    toast.success(`Size "${sizeUpper}" added with price ₹${newSizePrice}. Add another size or clear to continue.`);
  };

  const handleRemoveSize = (size: string) => {
    const newPricing = { ...sizePricing };
    delete newPricing[size];
    onSizePricingChange(newPricing);
    toast.success(`Size "${size}" removed`);
  };

  const hasDefaultPrice = sizePricing.default && sizePricing.default > 0;
  const priceCount = Object.keys(sizePricing).filter(k => k !== 'default').length;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          💰 Size-Based Pricing
          <Badge variant="secondary">{priceCount} sizes</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Set prices for different sizes. The default price is used if no specific price is set for a size.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Price Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-3">Default Price</h4>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-blue-800 font-medium">Fallback Price (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 499"
                    value={sizePricing.default || ''}
                    onChange={(e) => handleDefaultPriceChange(e.target.value)}
                    className="mt-1 bg-white"
                  />
                </div>
                {hasDefaultPrice && (
                  <div className="flex items-end">
                    <Badge className="bg-green-100 text-green-800 border border-green-300">
                      ✓ Set
                    </Badge>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-700 mt-2">
                This price applies to any size that doesn't have a specific price set.
              </p>
            </div>
          </div>
        </div>

        {/* Size Prices List */}
        {priceCount > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Size Prices</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(sizePricing)
                .filter(([key]) => key !== 'default')
                .map(([size, price]) => (
                  <div
                    key={size}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {size}
                        </Badge>
                        <span className="text-sm font-semibold">₹{price.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveSize(size)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {priceCount === 0 && hasDefaultPrice && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              No specific sizes added yet. Add sizes below or use the default price for all sizes.
            </p>
          </div>
        )}

        {/* Add Custom Size */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Add Size with Price</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Size Name</label>
              <Input
                placeholder="e.g., XL, 2XL, Free Size"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Price (₹)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 599"
                value={newSizePrice}
                onChange={(e) => setNewSizePrice(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="button"
                onClick={handleAddCustomSize}
                className="flex-1"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Size
              </Button>
              {(newSize || newSizePrice) && (
                <Button
                  type="button"
                  onClick={() => {
                    setNewSize('');
                    setNewSizePrice('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Add multiple sizes quickly - the form stays open for more entries. Click "Clear" when done.
          </p>
        </div>

        {/* Price Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="font-semibold text-green-900 mb-2">Summary</h4>
          <div className="text-sm text-green-800 space-y-1">
            {hasDefaultPrice && (
              <p>✓ Default price set: ₹{sizePricing.default.toFixed(2)}</p>
            )}
            {priceCount > 0 && (
              <p>✓ {priceCount} size(s) with specific prices</p>
            )}
            {!hasDefaultPrice && priceCount === 0 && (
              <p className="text-amber-700">⚠ No pricing configured yet</p>
            )}
            {!hasDefaultPrice && priceCount > 0 && (
              <p className="text-orange-700">⚠ No default price set - only configured sizes will work</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SizePricingManager;
