import React from 'react';
import { ImageKitService } from '@/services/imagekitService';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Optimized thumbnail image component
 */
export function ThumbnailImage({
  src,
  alt,
  size = 80,
  className = '',
  onClick
}: ThumbnailImageProps) {
  // Generate optimized thumbnail URL
  const thumbnailUrl = ImageKitService.getOptimizedImageUrl(src, {
    width: size,
    height: size,
    quality: 60,
    format: 'webp',
    crop: 'at_max'
  });

  return (
    <img
      src={thumbnailUrl}
      alt={alt}
      className={`object-cover ${className}`}
      width={size}
      height={size}
      loading="lazy"
      onClick={onClick}
    />
  );
}

export default ThumbnailImage;
