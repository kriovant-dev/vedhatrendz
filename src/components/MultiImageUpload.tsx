import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { ImageKitService, ImageUploadResult } from '@/services/imagekitService';
import { toast } from 'sonner';

interface MultiImageUploadProps {
  onImagesUploaded: (images: ImageUploadResult[]) => void;
  existingImages?: ImageUploadResult[];
  maxImages?: number;
  maxSize?: number; // in MB
  className?: string;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  onImagesUploaded,
  existingImages = [],
  maxImages = 5,
  maxSize = 5,
  className = ''
}) => {
  const [images, setImages] = useState<ImageUploadResult[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);
    const newImages: ImageUploadResult[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file`);
          continue;
        }

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is ${maxSize}MB`);
          continue;
        }

        try {
          const result = await ImageKitService.uploadImage(file);
          newImages.push(result);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onImagesUploaded(updatedImages);
        toast.success(`${newImages.length} image(s) uploaded successfully`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];
    
    // Try to delete from ImageKit if it has a fileId
    if (imageToRemove.fileId && !imageToRemove.fileId.startsWith('temp_')) {
      try {
        await ImageKitService.deleteImage(imageToRemove.fileId);
        toast.success('Image deleted from storage');
      } catch (error) {
        console.error('Failed to delete image from ImageKit:', error);
        toast.error('Failed to delete image from storage, but removed from list');
      }
    }
    
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesUploaded(updatedImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={className}>
      <Label className="text-sm font-medium">Product Images ({images.length}/{maxImages})</Label>
      
      {/* Existing Images */}
      {images.length > 0 && (
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <img
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <Card className="mt-2">
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                {images.length > 0 ? <Plus className="w-full h-full" /> : <ImageIcon className="w-full h-full" />}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {images.length > 0 
                    ? `Add more images (${maxImages - images.length} remaining)`
                    : 'Drag and drop images here, or click to select'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to {maxSize}MB each
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={handleButtonClick}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : images.length > 0 ? 'Add More' : 'Select Images'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default MultiImageUpload;
