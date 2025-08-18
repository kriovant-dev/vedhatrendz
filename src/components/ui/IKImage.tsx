import React from 'react';
import { Image, ImageKitProvider } from '@imagekit/react';

// Environment variables
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_imagekit_id';

/**
 * Optimized Image component using the official ImageKit React SDK
 */
interface IKImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  transformations?: Array<Record<string, any>>;
  loading?: 'lazy' | 'eager';
  lqip?: boolean; // Low Quality Image Placeholder
  onClick?: () => void;
}

export const IKImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '100vw',
  transformations = [],
  loading = 'lazy',
  lqip = true,
  onClick
}: IKImageProps) => {
  // Apply default optimizations if no specific transformations provided
  const finalTransformations = transformations.length > 0 
    ? transformations 
    : [
        { 
          quality: 75, 
          format: 'webp' 
        }
      ];
  
  // Add low quality image placeholder if requested
  const style = lqip ? {
    backgroundImage: `url(${IMAGEKIT_URL_ENDPOINT}/${src}?tr=w-20,h-20,bl-6,q-30)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return (
    <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        transformation={finalTransformations}
        loading={loading}
        style={style}
        onClick={onClick}
      />
    </ImageKitProvider>
  );
};

/**
 * Thumbnail specific image component
 */
interface IKThumbnailProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const IKThumbnail = ({
  src,
  alt,
  size = 80,
  className = '',
  onClick
}: IKThumbnailProps) => {
  return (
    <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={className}
        transformation={[
          { width: size, height: size, quality: 60, format: 'webp', crop: 'at_max' }
        ]}
        loading="lazy"
        onClick={onClick}
      />
    </ImageKitProvider>
  );
};

/**
 * Product image gallery image component
 */
export const IKProductImage = ({
  src,
  alt,
  className = '',
  onClick
}: {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={1067}
        sizes="(max-width: 768px) 100vw, 800px"
        className={className}
        transformation={[
          { width: 800, height: 1067, quality: 80, format: 'webp', crop: 'at_max' }
        ]}
        loading="eager"
        onClick={onClick}
      />
    </ImageKitProvider>
  );
};

/**
 * Banner/Hero image component with high quality
 */
export const IKBannerImage = ({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  return (
    <ImageKitProvider urlEndpoint={IMAGEKIT_URL_ENDPOINT}>
      <Image
        src={src}
        alt={alt}
        width={1920}
        height={1080}
        sizes="100vw"
        className={className}
        transformation={[
          { width: 1920, quality: 85, format: 'webp' }
        ]}
        loading="eager"
      />
    </ImageKitProvider>
  );
};

export default IKImage;
