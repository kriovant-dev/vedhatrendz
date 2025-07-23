import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Shield, User } from 'lucide-react';
import StarRating from './StarRating';
import { Review } from '@/services/reviewService';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: Review;
  onMarkHelpful?: (reviewId: string) => void;
  isMarkingHelpful?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onMarkHelpful,
  isMarkingHelpful = false
}) => {
  const handleMarkHelpful = () => {
    if (onMarkHelpful) {
      onMarkHelpful(review.id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {getInitials(review.user_name)}
              </span>
            </div>
            
            {/* User Info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{review.user_name}</span>
                {review.verified_purchase && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified Purchase
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(review.created_at)}
              </div>
            </div>
          </div>

          {/* Rating */}
          <StarRating rating={review.rating} size="sm" />
        </div>

        {/* Review Title */}
        <div>
          <h4 className="font-medium text-sm leading-tight">{review.title}</h4>
        </div>

        {/* Review Comment */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {review.comment}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {review.helpful_count > 0 && (
              <span>{review.helpful_count} people found this helpful</span>
            )}
          </div>
          
          {onMarkHelpful && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkHelpful}
              disabled={isMarkingHelpful}
              className="text-xs h-7 px-2"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {isMarkingHelpful ? 'Marking...' : 'Helpful'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
