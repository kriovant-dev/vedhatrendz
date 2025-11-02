import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ColorService, CustomColor } from '@/services/colorService';

interface ColorSelectorProps {
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
}

const getColorStyle = (color: CustomColor) => {
  return {
    backgroundColor: color.hex_code,
    border: color.hex_code === '#ffffff' ? '1px solid #d1d5db' : '1px solid #e5e7eb'
  };
};

const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColors, onColorsChange }) => {
  const [showAll, setShowAll] = useState(false);

  // Fetch available colors from database
  const { data: availableColors = [], isLoading } = useQuery({
    queryKey: ['available-colors'],
    queryFn: async () => {
      await ColorService.initializeDefaultColors(); // Initialize if needed
      return ColorService.getAllColors();
    },
  });

  const handleColorToggle = (color: CustomColor) => {
    const colorName = color.name.toLowerCase();
    if (selectedColors.includes(colorName)) {
      onColorsChange(selectedColors.filter(c => c !== colorName));
    } else {
      onColorsChange([...selectedColors, colorName]);
    }
  };

  const removeColor = (colorName: string) => {
    onColorsChange(selectedColors.filter(c => c !== colorName));
  };

  const getSelectedColorData = (colorName: string): CustomColor | null => {
    return availableColors.find(c => c.name.toLowerCase() === colorName.toLowerCase()) || null;
  };

  const displayColors = showAll ? availableColors : availableColors.slice(0, 12);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-2 block">Available Colors</label>
          <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading colors...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">Available Colors</label>
        {availableColors.length === 0 ? (
          <div className="p-4 border rounded-lg bg-gray-50 text-center">
            <p className="text-sm text-muted-foreground">
              No colors available. Contact admin to add colors.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-6 gap-2 p-3 border rounded-lg bg-gray-50">
              {displayColors.map((color) => {
                const isSelected = selectedColors.includes(color.name.toLowerCase());
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleColorToggle(color)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={getColorStyle(color)}
                    />
                    <span className="text-xs font-medium">{color.name}</span>
                  </button>
                );
              })}
            </div>
            
            {availableColors.length > 12 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="mt-2"
              >
                {showAll ? 'Show Less' : `Show All ${availableColors.length} Colors`}
              </Button>
            )}
          </>
        )}
      </div>

      {selectedColors.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Selected Colors ({selectedColors.length})</label>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((colorName) => {
              const colorData = getSelectedColorData(colorName);
              return (
                <Badge
                  key={colorName}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {colorData ? (
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={getColorStyle(colorData)}
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                  )}
                  <span className="capitalize">{colorName}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(colorName)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
