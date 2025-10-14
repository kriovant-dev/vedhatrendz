import React, { useState, useRef, useEffect } from 'react';
import { r2Service, ImageTransformation } from '@/services/cloudflareR2Service';

interface BaseImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

interface ResponsiveImageProps extends BaseImageProps {
  sizes?: string;
  widths?: number[];
  transformation?: ImageTransformation;
}

interface LazyImageProps extends BaseImageProps {
  transformation?: ImageTransformation;
  placeholder?: string;
  rootMargin?: string;
}

interface ThumbnailImageProps extends BaseImageProps {
  size?: number | 'small' | 'medium' | 'large';
}

interface BlurUpImageProps extends BaseImageProps {
  transformation?: ImageTransformation;
  placeholderQuality?: number;
}

// Responsive Image Component
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  widths = [400, 800, 1200, 1600],
  transformation = {},
  onClick,
}) => {
  const srcSet = widths
    .map(width => `${r2Service.getOptimizedImageUrl(src, { ...transformation, width, format: 'webp' })} ${width}w`)
    .join(', ');

  const defaultSrc = r2Service.getOptimizedImageUrl(src, { ...transformation, width: 800, format: 'webp' });

  return (
    <img
      src={defaultSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      onClick={onClick}
      loading="lazy"
    />
  );
};

// Lazy Loading Image Component
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  transformation = {},
  placeholder,
  rootMargin = '50px',
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  const optimizedSrc = r2Service.getOptimizedImageUrl(src, { ...transformation, format: 'webp' });
  const placeholderSrc = placeholder || r2Service.getOptimizedImageUrl(src, { 
    width: 50, 
    quality: 20, 
    format: 'webp' 
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      <img
        ref={imgRef}
        src={placeholderSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ filter: 'blur(5px)' }}
      />
      
      {/* Main Image */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onClick={onClick}
        />
      )}
    </div>
  );
};

// Thumbnail Image Component
export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt,
  size = 'medium',
  className = '',
  onClick,
}) => {
  const getSizeInPixels = (size: number | string): number => {
    if (typeof size === 'number') return size;
    
    switch (size) {
      case 'small': return 100;
      case 'medium': return 200;
      case 'large': return 300;
      default: return 200;
    }
  };

  const pixelSize = getSizeInPixels(size);
  const thumbnailUrl = r2Service.getThumbnailUrl(src, pixelSize);

  return (
    <img
      src={thumbnailUrl}
      alt={alt}
      className={className}
      onClick={onClick}
      loading="lazy"
    />
  );
};

// Blur-up Image Component (Progressive Loading)
export const BlurUpImage: React.FC<BlurUpImageProps> = ({
  src,
  alt,
  className = '',
  transformation = {},
  placeholderQuality = 20,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { placeholder, full } = r2Service.getProgressiveImageSet(src, transformation);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blurred placeholder */}
      <img
        src={placeholder}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoaded ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
        }`}
        style={{ filter: 'blur(10px)' }}
      />
      
      {/* Full resolution image */}
      <img
        src={full}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onClick={onClick}
      />
    </div>
  );
};

// Gallery Image Component (combines multiple features)
export const GalleryImage: React.FC<ResponsiveImageProps & { enableBlurUp?: boolean }> = ({
  enableBlurUp = true,
  ...props
}) => {
  if (enableBlurUp) {
    return <BlurUpImage {...props} />;
  }
  return <ResponsiveImage {...props} />;
};