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
   * Check if URL is from Cloudflare R2
   */
  private isR2Url(url: string): boolean {
    return url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com');
  }

  /**
   * Get optimized image URL with transformations
   * For R2 direct URLs, returns the URL as-is since transformations require custom domain setup
   * 
   * BANDWIDTH OPTIMIZATION:
   * - R2.dev URLs automatically route through Cloudflare's CDN
   * - This provides global caching and reduces bandwidth costs
   * - No egress fees from R2 when using pub-*.r2.dev URLs
   */
  getOptimizedImageUrl(src: string, options: ImageTransformation = {}): string {
    if (!src) return '';
    
    // If it's already a full R2 URL, return as-is (automatically uses Cloudflare CDN)
    if (src.startsWith('http') && this.isR2Url(src)) {
      // R2.dev URLs automatically benefit from Cloudflare's global CDN
      // This significantly reduces bandwidth costs and improves performance
      return src;
    }

    // If it's any other HTTP URL, return as-is
    if (src.startsWith('http')) {
      return src;
    }

    // Construct the full R2 URL for relative paths
    const baseUrl = this.cdnUrl || this.baseUrl;
    const normalizedPath = this.normalizePath(src);
    const fullUrl = `${baseUrl}/${normalizedPath}`;
    
    return fullUrl;
  }

  /**
   * Apply Cloudflare Image Resizing transformations to URL
   * Note: For R2 direct URLs, transformations are limited without a custom domain + Image Resizing
   * However, R2.dev URLs automatically use Cloudflare's CDN for bandwidth optimization
   */
  private applyTransformations(url: string, options: ImageTransformation): string {
    if (!options || Object.keys(options).length === 0) {
      return url;
    }

    // For R2 direct URLs (pub-xxx.r2.dev), we can't use /cdn-cgi/image/ transformations
    // because they're not routed through Cloudflare's CDN with Image Resizing enabled
    // However, R2.dev URLs are already optimized through Cloudflare's CDN
    if (url.includes('r2.dev')) {
      // R2.dev URLs automatically benefit from Cloudflare's CDN caching and delivery
      // This reduces bandwidth costs significantly compared to direct R2 access
      return url;
    }

    // For custom domains with Cloudflare Image Resizing enabled, use transformations
    const params = new URLSearchParams();
    
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);
    if (options.fit) params.append('fit', options.fit);
    if (options.gravity) params.append('gravity', options.gravity);

    // Use Cloudflare Image Resizing (only works with custom domains)
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