import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export interface ImageUploadResult {
  url: string;
  fileName: string;
  size: number;
  uploadedAt: string;
}

interface R2MultiImageUploadProps {
  onImagesUploaded: (images: ImageUploadResult[]) => void;
  existingImages?: ImageUploadResult[];
  maxImages?: number;
  allowedTypes?: string[];
  maxSizePerFile?: number; // in MB
  folder?: string; // Folder structure in R2
}

const R2MultiImageUpload: React.FC<R2MultiImageUploadProps> = ({
  onImagesUploaded,
  existingImages = [],
  maxImages = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  maxSizePerFile = 5,
  folder = 'products'
}) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ImageUploadResult[]>(existingImages);
  const [dragOver, setDragOver] = useState(false);

  const updateImages = useCallback((newImages: ImageUploadResult[]) => {
    setImages(newImages);
    onImagesUploaded(newImages);
  }, [onImagesUploaded]);

  const uploadToR2 = async (file: File): Promise<ImageUploadResult> => {
    const formData = new FormData();
    
    // Generate organized file name
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${folder}/${timestamp}_${sanitizedName}`;
    
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('folder', folder);

    const response = await fetch('/api/upload-r2-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      url: result.url,
      fileName: result.fileName,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate files
    for (const file of filesToUpload) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        return;
      }
      
      if (file.size > maxSizePerFile * 1024 * 1024) {
        toast.error(`${file.name}: File too large. Max size: ${maxSizePerFile}MB`);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(uploadToR2);
      const uploadResults = await Promise.all(uploadPromises);
      
      const newImages = [...images, ...uploadResults];
      updateImages(newImages);
      
      toast.success(`Successfully uploaded ${uploadResults.length} image(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      // Call delete API endpoint
      const response = await fetch('/api/delete-r2-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: imageToRemove.fileName }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image from R2');
      }

      const newImages = images.filter((_, i) => i !== index);
      updateImages(newImages);
      
      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove image');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, [images.length, maxImages]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.accept = allowedTypes.join(',');
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) handleFileUpload(files);
          };
          input.click();
        }}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <div className="text-sm text-gray-600">
            {uploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <span className="font-medium">Click to upload</span> or drag and drop
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            PNG, JPG, WebP up to {maxSizePerFile}MB each ({images.length}/{maxImages} images)
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Remove button */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* Image info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="truncate">{image.fileName.split('/').pop()}</div>
                  <div>{formatFileSize(image.size)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No images uploaded yet</p>
          <p className="text-sm">Upload some images to get started</p>
        </div>
      )}
    </div>
  );
};

export default R2MultiImageUpload;