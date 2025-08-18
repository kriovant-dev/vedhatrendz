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
      cacheBuster?: boolean;
    } = {}
  ): string {
    if (!imagePath) return '';
    
    // If it's already a full URL with transformations, return as is
    if (imagePath.startsWith('http') && imagePath.includes('/tr:')) {
      return imagePath;
    }
    
    // If it's a non-ImageKit URL, return as is
    if (imagePath.startsWith('http') && 
        !imagePath.includes(this.IMAGEKIT_URL_ENDPOINT) && 
        !imagePath.includes(this.IMAGEKIT_URL_ENDPOINT_PREFIX)) {
      return imagePath;
    }

    // Default values optimized for bandwidth
    const {
      width,
      height,
      quality = 75, // Lower default quality (75 is usually visually acceptable)
      format = 'webp', // Always prefer WebP for better compression
      crop = 'maintain_ratio',
      focus = 'auto',
      cacheBuster = false
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
    
    // Add cache control parameters for better performance
    transformations.push('pr-true'); // Enable private CDN caching

    const transformationString = transformations.length > 0 
      ? `tr:${transformations.join(',')}` 
      : '';

    // Clean up image path
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    let url = '';
    if (transformationString) {
      url = `${baseUrl}/${transformationString}${cleanPath}`;
    } else {
      url = `${baseUrl}${cleanPath}`;
    }
    
    // Add cache buster if requested (only for admin previews)
    if (cacheBuster) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}t=${Date.now()}`;
    }
    
    return url;
  }

  /**
   * Get thumbnail URL for product images
   */
  static getThumbnailUrl(imagePath: string, size: number = 300): string {
    return this.getOptimizedImageUrl(imagePath, {
      width: size,
      height: size,
      crop: 'maintain_ratio',
      quality: 70, // Lower quality for thumbnails to save bandwidth
      format: 'webp' // WebP for better compression
    });
  }

  /**
   * Get tiny thumbnail for placeholders
   */
  static getTinyPlaceholder(imagePath: string): string {
    return this.getOptimizedImageUrl(imagePath, {
      width: 20,
      height: 20,
      quality: 30,
      format: 'webp',
      crop: 'maintain_ratio'
    }) + '&blur=10'; // Add blur effect
  }

  /**
   * Get full size product image URL
   */
  static getFullSizeUrl(imagePath: string): string {
    return this.getOptimizedImageUrl(imagePath, {
      width: 1200, // Limit max width to 1200px
      quality: 85, // Slightly reduced quality (still good)
      format: 'webp' // Always use WebP for better compression
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
      small: this.getOptimizedImageUrl(imagePath, { width: 400, quality: 70, format: 'webp' }),
      medium: this.getOptimizedImageUrl(imagePath, { width: 800, quality: 75, format: 'webp' }),
      large: this.getOptimizedImageUrl(imagePath, { width: 1200, quality: 80, format: 'webp' }),
      xlarge: this.getOptimizedImageUrl(imagePath, { width: 1600, quality: 85, format: 'webp' })
    };
  }
  
  /**
   * Get srcSet string for responsive images
   */
  static getResponsiveSrcSet(imagePath: string): string {
    if (!imagePath) return '';
    
    return `
      ${this.getOptimizedImageUrl(imagePath, { width: 400, format: 'webp', quality: 70 })} 400w,
      ${this.getOptimizedImageUrl(imagePath, { width: 800, format: 'webp', quality: 75 })} 800w,
      ${this.getOptimizedImageUrl(imagePath, { width: 1200, format: 'webp', quality: 80 })} 1200w
    `.trim();
  }
  
  /**
   * Get progressive loading image set (tiny blurred placeholder + full image)
   */
  static getProgressiveImageSet(imagePath: string, fullWidth: number = 800): {
    placeholder: string;
    full: string;
  } {
    return {
      // Tiny blurry placeholder
      placeholder: this.getTinyPlaceholder(imagePath),
      
      // Full image with optimal settings
      full: this.getOptimizedImageUrl(imagePath, {
        width: fullWidth,
        format: 'webp',
        quality: 75
      })
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
   * Compress image before upload
   */
  static async compressImage(file: File): Promise<File | Blob> {
    if (!file.type.startsWith('image/')) {
      return file; // Not an image, return as is
    }
    
    try {
      // Create a canvas element for compression
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create a promise to handle image loading
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = URL.createObjectURL(file);
      });
      
      // Calculate new dimensions (max 1920px width/height)
      const MAX_SIZE = 1920;
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress image
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      // Convert to blob with quality reduction
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b || new Blob()), 
          'image/jpeg', 
          0.85 // 85% quality
        );
      });
      
      // Create a new file from the blob
      const compressedFile = new File(
        [blob], 
        file.name, 
        { 
          type: 'image/jpeg', 
          lastModified: Date.now() 
        }
      );
      
      console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(img.src);
      
      return compressedFile;
    } catch (error) {
      console.error('Image compression failed:', error);
      return file; // Return original file on error
    }
  }

  /**
   * Upload image to ImageKit with compression
   */
  static async uploadImage(file: File, folder: string = 'products'): Promise<ImageUploadResult> {
    try {
      // Debug: Check if private key is available
      if (!this.IMAGEKIT_PRIVATE_KEY) {
        throw new Error('ImageKit private key is not configured. Please check your environment variables.');
      }

      if (!this.IMAGEKIT_PUBLIC_KEY) {
        throw new Error('ImageKit public key is not configured. Please check your environment variables.');
      }

      if (!this.IMAGEKIT_URL_ENDPOINT_PREFIX) {
        throw new Error('ImageKit URL endpoint is not configured. Please check your environment variables.');
      }
      
      // Compress the image before uploading
      const compressedFile = await this.compressImage(file);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('fileName', file.name);
      formData.append('folder', folder);
      formData.append('useUniqueFileName', 'true');
      
      // Add image transformation parameters on upload
      formData.append('transformation', JSON.stringify({
        pre: JSON.stringify({
          format: 'webp', // Convert to WebP on upload
          quality: 85    // Reduce quality
        })
      }));

      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.IMAGEKIT_PRIVATE_KEY + ':')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
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
  
  /**
   * Get admin preview URL (with cache buster)
   */
  static getAdminPreviewUrl(imagePath: string, options = {}): string {
    return this.getOptimizedImageUrl(imagePath, { ...options, cacheBuster: true });
  }
  
  /**
   * Get gallery thumbnail URL
   */
  static getGalleryThumbnailUrl(imagePath: string): string {
    return this.getOptimizedImageUrl(imagePath, {
      width: 80, 
      height: 80, 
      quality: 60, 
      format: 'webp',
      crop: 'at_max' 
    });
  }
  
  /**
   * Get product list image URL
   */
  static getProductListImageUrl(imagePath: string): string {
    return this.getOptimizedImageUrl(imagePath, {
      width: 300,
      quality: 70,
      format: 'webp'
    });
  }
  
  /**
   * Get product detail main image URL
   */
  static getProductDetailImageUrl(imagePath: string): string {
    return this.getOptimizedImageUrl(imagePath, {
      width: 800,
      quality: 85,
      format: 'webp'
    });
  }
  
  /**
   * Estimate bandwidth savings
   */
  static estimateBandwidthSavings(originalSize: number, quality: number = 75, toWebP: boolean = true): {
    originalSizeKB: number,
    estimatedSizeKB: number,
    savingsPercent: number
  } {
    const originalSizeKB = originalSize / 1024;
    
    // Approximate reduction factors
    let qualityFactor = 1;
    if (quality <= 60) qualityFactor = 0.5;
    else if (quality <= 70) qualityFactor = 0.6;
    else if (quality <= 80) qualityFactor = 0.7;
    else if (quality <= 90) qualityFactor = 0.8;
    
    // WebP gives approximately 25-30% additional reduction over JPEG at similar quality
    const formatFactor = toWebP ? 0.7 : 1;
    
    const estimatedSizeKB = originalSizeKB * qualityFactor * formatFactor;
    const savingsPercent = ((originalSizeKB - estimatedSizeKB) / originalSizeKB) * 100;
    
    return {
      originalSizeKB: Math.round(originalSizeKB),
      estimatedSizeKB: Math.round(estimatedSizeKB),
      savingsPercent: Math.round(savingsPercent)
    };
  }
}

export default ImageKitService;
