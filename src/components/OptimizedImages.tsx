import React, { useState, useEffect, useRef } from 'react';
import { Image, ImageKitProvider } from '@imagekit/react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  transformation?: Array<Record<string, any>>;
  lqip?: boolean; // Low Quality Image Placeholder
  onClick?: () => void;
}

const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_imagekit_id';

/**
 * ResponsiveImage component that uses ImageKit SDK with responsive sizing,
 * lazy loading, and optimal format delivery
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  transformation = [],
  lqip = true,
  onClick,
}) => {
  // Extract the path from the full URL if it's a full URL
  // If it's already a path, leave it as is
  const path = src.startsWith('http') 
    ? src.replace(/^.*\/\/[^/]+\//, '') 
    : src;
  
  // Default transformations for all images - use TypeScript 'as const' to ensure type safety
  const defaultTransformation = [{
    format: 'auto' as const,  // auto format (WebP where supported)
    quality: 80,     // quality setting (80% is good balance)
  }];

  return (
    <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
      <Image
        src={path}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        transformation={defaultTransformation}
        onClick={onClick}
      />
    </ImageKitProvider>
  );
};

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
}

/**
 * LazyImage component using Intersection Observer API
 * for more controlled lazy loading behavior
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 } // 10% of the element is visible
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // ImageKit transformations directly in URL
  const optimizedSrc = isInView
    ? `${IMAGEKIT_URL_ENDPOINT}/${src.replace(/^.*\/\/[^/]+\//, '')}?tr=f-auto,q-80${width ? ',w-' + width : ''}${height ? ',h-' + height : ''}`
    : '';

  return (
    <div className={`relative ${className || ''}`} style={{ width, height }}>
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <div ref={imgRef} className="w-full h-full">
        {isInView && (
          <img
            src={optimizedSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleLoad}
            onClick={onClick}
            width={width}
            height={height}
          />
        )}
      </div>
    </div>
  );
};

interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
  size?: number; // Square thumbnail size
  onClick?: () => void;
}

/**
 * ThumbnailImage component optimized for product thumbnails,
 * gallery previews, etc. with lower quality settings
 */
const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt,
  className,
  size = 100,
  onClick,
}) => {
  // Thumbnail-specific transformations
  const thumbnailTransformation = [{
    width: size,
    height: size,
    focus: "center" as const,
    quality: 60, // Lower quality for thumbnails is fine
    format: "auto" as const
  }];

  // Use ImageKit provider directly for thumbnails
  return (
    <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
      <Image
        src={src.startsWith('http') ? src.replace(/^.*\/\/[^/]+\//, '') : src}
        alt={alt}
        className={className}
        width={size}
        height={size}
        transformation={thumbnailTransformation}
        onClick={onClick}
        loading="lazy"
      />
    </ImageKitProvider>
  );
};

interface BlurUpImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
}

/**
 * BlurUpImage component that implements progressive loading
 * with blur-up technique for better perceived performance
 */
const BlurUpImage: React.FC<BlurUpImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const path = src.startsWith('http') ? src.replace(/^.*\/\/[^/]+\//, '') : src;

  // Create a low-quality version for the blur-up effect
  const lowQualityTransformation = [{
    format: "auto" as const,
    quality: 20,
    blur: 10
  }];

  const highQualityTransformation = [{
    format: "auto" as const,
    quality: 85
  }];

  return (
    <div className={`relative ${className || ''}`}>
      {/* Low quality placeholder image */}
      {!isLoaded && (
        <div className="absolute inset-0">
          <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
            <Image
              src={path}
              alt={alt}
              className="w-full h-full object-cover filter blur-sm"
              width={width && Math.floor(width / 4)}
              height={height && Math.floor(height / 4)}
              transformation={lowQualityTransformation}
            />
          </ImageKitProvider>
        </div>
      )}

      {/* High quality image */}
      <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
          <Image
            src={path}
            alt={alt}
            className={className}
            width={width}
            height={height}
            transformation={highQualityTransformation}
            onClick={onClick}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
          />
        </ImageKitProvider>
      </div>
    </div>
  );
};

export {
  ResponsiveImage,
  LazyImage,
  ThumbnailImage,
  BlurUpImage,
};
