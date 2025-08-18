import React, { useState, useEffect } from 'react';
import { ImageKitService } from '@/services/imagekitService';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  style?: React.CSSProperties;
  loadingStrategy?: 'lazy' | 'eager';
  enableBlurEffect?: boolean;
  onClick?: () => void;
}

/**
 * Responsive image component with progressive loading and optimizations
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '100vw',
  style = {},
  loadingStrategy = 'lazy',
  enableBlurEffect = true,
  onClick
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Get srcset for responsive images
  const srcSet = ImageKitService.getResponsiveSrcSet(src);
  
  // Get progressive images (tiny placeholder + full)
  const { placeholder, full } = ImageKitService.getProgressiveImageSet(
    src, 
    width || 800
  );
  
  useEffect(() => {
    // If eager loading, mark as visible immediately
    if (loadingStrategy === 'eager') {
      setIsVisible(true);
      return;
    }
    
    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px', // Start loading 200px before visible
    });
    
    // Get current reference
    const imgElement = document.getElementById(`img-${generateUniqueId(src)}`);
    if (imgElement) {
      observer.observe(imgElement);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [src, loadingStrategy]);
  
  // Generate a unique ID based on the src
  function generateUniqueId(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  // Additional styles for the image container
  const containerStyle = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    backgroundColor: '#f0f0f0',
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    ...style,
  };

  return (
    <div 
      className={`responsive-image-container ${className}`}
      style={containerStyle}
      onClick={onClick}
    >
      {/* Placeholder/blur image */}
      {enableBlurEffect && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 blur-sm"
          style={{ opacity: isLoaded ? 0 : 1 }}
          aria-hidden="true"
        />
      )}
      
      {/* Main image (only render when in viewport) */}
      {isVisible && (
        <img
          id={`img-${generateUniqueId(src)}`}
          src={full} // Fallback for browsers that don't support srcSet
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          style={{ objectFit: 'cover' }}
          loading={loadingStrategy}
        />
      )}
      
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 w-full h-full bg-gray-100 animate-pulse" />
      )}
    </div>
  );
}

export default ResponsiveImage;
