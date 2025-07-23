import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showText?: boolean;
  reviewCount?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showText = false,
  reviewCount,
  className
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const filled = i <= rating;
      const halfFilled = i - 0.5 === rating;
      
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          disabled={!interactive}
          className={cn(
            'relative',
            interactive && 'hover:scale-110 transition-transform cursor-pointer',
            !interactive && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-colors',
              filled
                ? 'fill-yellow-400 text-yellow-400'
                : halfFilled
                ? 'fill-yellow-200 text-yellow-200'
                : 'fill-gray-200 text-gray-200',
              interactive && 'hover:fill-yellow-300 hover:text-yellow-300'
            )}
          />
        </button>
      );
    }
    return stars;
  };

  const formatRating = (rating: number) => {
    return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>
      
      {showText && (
        <div className={cn('flex items-center gap-1 text-muted-foreground', textSizeClasses[size])}>
          {rating > 0 ? (
            <>
              <span className="font-medium text-foreground">{formatRating(rating)}</span>
              {reviewCount !== undefined && (
                <span>
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;
