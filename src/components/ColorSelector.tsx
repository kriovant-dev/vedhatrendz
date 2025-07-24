import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ColorSelectorProps {
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
}

const AVAILABLE_COLORS = [
  'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Black', 
  'White', 'Gray', 'Brown', 'Navy', 'Maroon', 'Gold', 'Silver', 'Beige', 
  'Cream', 'Magenta', 'Cyan', 'Teal', 'Lime', 'Indigo', 'Violet', 'Rose',
  'Coral', 'Peach', 'Mint', 'Lavender', 'Turquoise', 'Olive'
];

const getColorClass = (color: string) => {
  const colorMap = {
    'red': 'bg-red-500',
    'blue': 'bg-blue-500',
    'green': 'bg-green-500',
    'yellow': 'bg-yellow-500',
    'orange': 'bg-orange-500',
    'purple': 'bg-purple-500',
    'pink': 'bg-pink-500',
    'black': 'bg-black',
    'white': 'bg-white border-gray-300',
    'gray': 'bg-gray-500',
    'brown': 'bg-amber-700',
    'navy': 'bg-blue-900',
    'maroon': 'bg-red-900',
    'gold': 'bg-yellow-400',
    'silver': 'bg-gray-300',
    'beige': 'bg-yellow-100',
    'cream': 'bg-yellow-50',
    'magenta': 'bg-fuchsia-500',
    'cyan': 'bg-cyan-500',
    'teal': 'bg-teal-500',
    'lime': 'bg-lime-500',
    'indigo': 'bg-indigo-500',
    'violet': 'bg-violet-500',
    'rose': 'bg-rose-500',
    'coral': 'bg-orange-400',
    'peach': 'bg-orange-200',
    'mint': 'bg-green-200',
    'lavender': 'bg-purple-200',
    'turquoise': 'bg-cyan-400',
    'olive': 'bg-yellow-600'
  };
  
  return colorMap[color.toLowerCase() as keyof typeof colorMap] || 'bg-gray-400';
};

const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColors, onColorsChange }) => {
  const [showAll, setShowAll] = useState(false);
  
  const handleColorToggle = (color: string) => {
    const colorLower = color.toLowerCase();
    if (selectedColors.includes(colorLower)) {
      onColorsChange(selectedColors.filter(c => c !== colorLower));
    } else {
      onColorsChange([...selectedColors, colorLower]);
    }
  };

  const removeColor = (color: string) => {
    onColorsChange(selectedColors.filter(c => c !== color));
  };

  const displayColors = showAll ? AVAILABLE_COLORS : AVAILABLE_COLORS.slice(0, 12);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">Available Colors</label>
        <div className="grid grid-cols-6 gap-2 p-3 border rounded-lg bg-gray-50">
          {displayColors.map((color) => {
            const isSelected = selectedColors.includes(color.toLowerCase());
            return (
              <button
                key={color}
                type="button"
                onClick={() => handleColorToggle(color)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <div 
                  className={`w-6 h-6 rounded-full border ${getColorClass(color)} ${
                    color.toLowerCase() === 'white' ? 'border-gray-300' : 'border-gray-200'
                  }`}
                />
                <span className="text-xs font-medium">{color}</span>
              </button>
            );
          })}
        </div>
        
        {AVAILABLE_COLORS.length > 12 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="mt-2"
          >
            {showAll ? 'Show Less' : `Show All ${AVAILABLE_COLORS.length} Colors`}
          </Button>
        )}
      </div>

      {selectedColors.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Selected Colors ({selectedColors.length})</label>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((color) => (
              <Badge
                key={color}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                <div 
                  className={`w-3 h-3 rounded-full border ${getColorClass(color)} ${
                    color === 'white' ? 'border-gray-300' : 'border-gray-200'
                  }`}
                />
                <span className="capitalize">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
