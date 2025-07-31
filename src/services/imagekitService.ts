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
  private static readonly IMAGEKIT_PRIVATE_KEY = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || '';
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
   * Upload image to ImageKit
   */
  static async uploadImage(file: File, folder: string = 'products'): Promise<ImageUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('folder', folder);
      formData.append('useUniqueFileName', 'true');

      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.IMAGEKIT_PRIVATE_KEY + ':')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        url: result.url,
        thumbnailUrl: result.thumbnailUrl || result.url,
        fileId: result.fileId,
        name: result.name,
        size: result.size
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete image from ImageKit
   */
  static async deleteImage(fileId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa(this.IMAGEKIT_PRIVATE_KEY + ':')}`,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete multiple images from ImageKit
   */
  static async deleteMultipleImages(fileIds: string[]): Promise<boolean[]> {
    const results = await Promise.allSettled(
      fileIds.map(fileId => this.deleteImage(fileId))
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }

  /**
   * Get image details from ImageKit
   */
  static async getImageDetails(fileId: string): Promise<any> {
    try {
      const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(this.IMAGEKIT_PRIVATE_KEY + ':')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get image details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default ImageKitService;
