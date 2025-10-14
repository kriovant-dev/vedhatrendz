export interface ImageTransformation {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  gravity?: 'auto' | 'side' | 'top' | 'bottom' | 'left' | 'right';
}

class CloudflareR2Service {
  private baseUrl: string;
  private cdnUrl?: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || '';
    this.cdnUrl = import.meta.env.VITE_R2_CDN_URL;
  }

  /**
   * Get optimized image URL with transformations
   * Uses Cloudflare Images API for transformations
   */
  getOptimizedImageUrl(src: string, options: ImageTransformation = {}): string {
    if (!src) return '';
    
    // If it's already a full URL, use it as-is
    if (src.startsWith('http')) {
      return this.applyTransformations(src, options);
    }

    // Construct the full URL
    const baseUrl = this.cdnUrl || this.baseUrl;
    const normalizedPath = this.normalizePath(src);
    const fullUrl = `${baseUrl}/${normalizedPath}`;
    
    return this.applyTransformations(fullUrl, options);
  }

  /**
   * Apply Cloudflare Image Resizing transformations to URL
   */
  private applyTransformations(url: string, options: ImageTransformation): string {
    if (!options || Object.keys(options).length === 0) {
      return url;
    }

    const params = new URLSearchParams();
    
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);
    if (options.fit) params.append('fit', options.fit);
    if (options.gravity) params.append('gravity', options.gravity);

    // Use Cloudflare Image Resizing
    const transformedUrl = `/cdn-cgi/image/${params.toString()}/${url}`;
    return transformedUrl;
  }

  /**
   * Get thumbnail URL (optimized for small sizes)
   */
  getThumbnailUrl(src: string, size: number = 150): string {
    return this.getOptimizedImageUrl(src, {
      width: size,
      height: size,
      quality: 85,
      format: 'webp',
      fit: 'cover'
    });
  }

  /**
   * Get responsive image srcset
   */
  generateSrcSet(src: string, sizes: number[] = [400, 800, 1200, 1600]): string {
    return sizes
      .map(size => `${this.getOptimizedImageUrl(src, { width: size, format: 'webp' })} ${size}w`)
      .join(', ');
  }

  /**
   * Get progressive loading image set (placeholder + full)
   */
  getProgressiveImageSet(src: string, options: ImageTransformation = {}) {
    const placeholder = this.getOptimizedImageUrl(src, {
      ...options,
      width: 50,
      quality: 20,
      format: 'webp'
    });

    const full = this.getOptimizedImageUrl(src, {
      ...options,
      format: 'webp'
    });

    return { placeholder, full };
  }

  /**
   * Normalize file path for consistent URLs
   */
  private normalizePath(path: string): string {
    return path.replace(/^\/+/, '').replace(/\/+/g, '/');
  }

  /**
   * Get full size image URL
   */
  getFullSizeUrl(src: string): string {
    const normalizedPath = this.normalizePath(src);
    const baseUrl = this.cdnUrl || this.baseUrl;
    return `${baseUrl}/${normalizedPath}`;
  }
}

// Export a singleton instance
export const r2Service = new CloudflareR2Service();