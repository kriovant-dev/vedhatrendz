// ImageKit service for handling image operations

export interface ImageUploadResult {
  url: string;
  thumbnailUrl: string;
  fileId?: string;
  name?: string;
  size?: number;
}

export class ImageKitService {
  private static readonly IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io';
  private static readonly IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '';
  private static readonly IMAGEKIT_PRIVATE_KEY = import.meta.env.IMAGEKIT_PRIVATE_KEY || '';
  private static readonly IMAGEKIT_URL_ENDPOINT_PREFIX = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '';

  /**
   * Get optimized image URL with transformations
   */
  static getOptimizedImageUrl(
    imagePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
      crop?: 'maintain_ratio' | 'force' | 'at_max' | 'at_least';
      focus?: 'auto' | 'face' | 'center';
    } = {}
  ): string {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const {
      width,
      height,
      quality = 80,
      format = 'auto',
      crop = 'maintain_ratio',
      focus = 'auto'
    } = options;

    const baseUrl = this.IMAGEKIT_URL_ENDPOINT_PREFIX || this.IMAGEKIT_URL_ENDPOINT;
    
    // Build transformation string
    const transformations: string[] = [];
    
    if (width) transformations.push(`w-${width}`);
    if (height) transformations.push(`h-${height}`);
    if (quality) transformations.push(`q-${quality}`);
    if (format) transformations.push(`f-${format}`);
    if (crop) transformations.push(`c-${crop}`);
    if (focus) transformations.push(`fo-${focus}`);

    const transformationString = transformations.length > 0 
      ? `tr:${transformations.join(',')}` 
      : '';

    // Clean up image path
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    if (transformationString) {
      return `${baseUrl}/${transformationString}${cleanPath}`;
    }
    
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Get thumbnail URL for product images
   */
  static getThumbnailUrl(imagePath: string, size: number = 300): string {
    return this.getOptimizedImageUrl(imagePath, {
      width: size,
      height: size,
      crop: 'maintain_ratio',
      quality: 80,
      format: 'auto'
    });
  }

  /**
   * Get full size product image URL
   */
  static getFullSizeUrl(imagePath: string): string {
    return this.getOptimizedImageUrl(imagePath, {
      width: 1200,
      quality: 90,
      format: 'auto'
    });
  }

  /**
   * Get responsive image URLs for different screen sizes
   */
  static getResponsiveUrls(imagePath: string): {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  } {
    return {
      small: this.getOptimizedImageUrl(imagePath, { width: 400, quality: 75 }),
      medium: this.getOptimizedImageUrl(imagePath, { width: 800, quality: 80 }),
      large: this.getOptimizedImageUrl(imagePath, { width: 1200, quality: 85 }),
      xlarge: this.getOptimizedImageUrl(imagePath, { width: 1600, quality: 90 })
    };
  }

  /**
   * Check if ImageKit is properly configured
   */
  static isConfigured(): boolean {
    return !!(this.IMAGEKIT_PUBLIC_KEY && this.IMAGEKIT_URL_ENDPOINT_PREFIX);
  }

  /**
   * Get a placeholder image URL
   */
  static getPlaceholderUrl(width: number = 400, height: number = 400): string {
    return `https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&h=${height}&q=80`;
  }

  /**
   * Upload image to ImageKit via server-side API
   */
  static async uploadImage(file: File, folder: string = 'products'): Promise<ImageUploadResult> {
    try {
      // Convert file to base64
      const base64String = await this.fileToBase64(file);
      
      const payload = {
        file: base64String,
        fileName: file.name,
        folder: folder
      };

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Upload failed: ${errorData.details || response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Upload failed: ${result.details || 'Unknown error'}`);
      }
      
      return {
        url: result.data.url,
        thumbnailUrl: result.data.thumbnailUrl || result.data.url,
        fileId: result.data.fileId,
        name: result.data.name,
        size: result.data.size
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert file to base64 string
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Delete image from ImageKit via server-side API
   */
  static async deleteImage(fileId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      return response.ok && result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete multiple images from ImageKit via server-side API
   */
  static async deleteMultipleImages(fileIds: string[]): Promise<boolean[]> {
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileIds }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Map the results back to boolean array matching the input order
        return fileIds.map(fileId => {
          const failure = result.data.failures?.find((f: any) => f.fileId === fileId);
          return !failure; // true if not in failures array
        });
      }
      
      // If the request failed, return all false
      return fileIds.map(() => false);
    } catch (error) {
      return fileIds.map(() => false);
    }
  }

  /**
   * Get image details from ImageKit via server-side API
   */
  static async getImageDetails(fileId: string): Promise<any> {
    try {
      const response = await fetch(`/api/image-details?fileId=${encodeURIComponent(fileId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get image details: ${errorData.details || response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Failed to get image details: ${result.details || 'Unknown error'}`);
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }
}

export default ImageKitService;
