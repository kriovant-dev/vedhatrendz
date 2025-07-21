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
   * Upload image to ImageKit (placeholder implementation)
   * In a real implementation, this would use ImageKit's upload API
   */
  static async uploadImage(file: File, folder: string = 'products'): Promise<ImageUploadResult> {
    // This is a placeholder implementation
    // In production, you would integrate with ImageKit's upload API
    const fileReader = new FileReader();
    
    return new Promise((resolve, reject) => {
      fileReader.onload = () => {
        const result = fileReader.result as string;
        const uploadResult: ImageUploadResult = {
          url: result,
          thumbnailUrl: result,
          fileId: `temp_${Date.now()}`,
          name: file.name,
          size: file.size
        };
        resolve(uploadResult);
      };
      
      fileReader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      fileReader.readAsDataURL(file);
    });
  }
}

export default ImageKitService;
