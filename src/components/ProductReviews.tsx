import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { ReviewService, Review, ReviewStats, CreateReviewData } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProductReviewsProps {
  productId: string;
  className?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  className
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: () => ReviewService.getProductReviews(productId),
  });

  // Fetch review statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['review-stats', productId],
    queryFn: () => ReviewService.getReviewStats(productId),
  });

  // Check if user has already reviewed this product
  const { data: userReview } = useQuery({
    queryKey: ['user-review', productId, user?.uid],
    queryFn: () => user?.uid ? ReviewService.getUserReview(productId, user.uid) : null,
    enabled: !!user?.uid,
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: (reviewData: CreateReviewData) => ReviewService.createReview(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', productId, user?.uid] });
      setShowReviewForm(false);
      toast.success('Review submitted successfully!');
    },
    onError: (error) => {
      console.error('Error creating review:', error);
      toast.error('Failed to submit review. Please try again.');
    },
  });

  // Mark helpful mutation
  const markHelpfulMutation = useMutation({
    mutationFn: (reviewId: string) => ReviewService.markHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      toast.success('Thank you for your feedback!');
    },
    onError: (error) => {
      console.error('Error marking review helpful:', error);
      toast.error('Failed to mark review as helpful');
    },
  });

  const handleCreateReview = async (reviewData: CreateReviewData) => {
    await createReviewMutation.mutateAsync(reviewData);
  };

  const handleMarkHelpful = (reviewId: string) => {
    markHelpfulMutation.mutate(reviewId);
  };

  const getUserInfo = () => {
    if (!user) return undefined;
    return {
      id: user.uid,
      name: user.displayName || 'Anonymous User',
      email: user.email || '',
    };
  };

  const renderRatingDistribution = (stats: ReviewStats) => {
    const maxCount = Math.max(...Object.values(stats.rating_distribution));
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution];
          const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 w-12">
                <span>{rating}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="w-8 text-muted-foreground text-xs">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (reviewsLoading || statsLoading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasStats = stats && stats.total_reviews > 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Review Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold">
                  {hasStats ? stats.average_rating.toFixed(1) : '0.0'}
                </div>
                <StarRating 
                  rating={hasStats ? stats.average_rating : 0} 
                  size="lg"
                  showText
                  reviewCount={hasStats ? stats.total_reviews : 0}
                />
                <div className="text-sm text-muted-foreground">
                  {hasStats ? `Based on ${stats.total_reviews} review${stats.total_reviews !== 1 ? 's' : ''}` : 'No reviews yet'}
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Rating Breakdown</h4>
              {hasStats ? (
                renderRatingDistribution(stats)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No ratings yet</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Write Review Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Share Your Experience</h4>
              {!showReviewForm && !userReview && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </Button>
              )}
            </div>

            {userReview && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Your Review</Badge>
                  <StarRating rating={userReview.rating} size="sm" />
                </div>
                <p className="text-sm mt-2 text-muted-foreground">
                  You have already reviewed this product. Thank you for your feedback!
                </p>
              </div>
            )}

            {showReviewForm && !userReview && (
              <ReviewForm
                productId={productId}
                onSubmit={handleCreateReview}
                isSubmitting={createReviewMutation.isPending}
                userInfo={getUserInfo()}
              />
            )}
          </div>

          <Separator />

          {/* Reviews List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Reviews ({reviews.length})
              </h4>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Most Recent
                </div>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onMarkHelpful={handleMarkHelpful}
                    isMarkingHelpful={markHelpfulMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h5 className="font-medium mb-2">No reviews yet</h5>
                <p className="text-sm">Be the first to share your experience with this product!</p>
                {!showReviewForm && !userReview && (
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowReviewForm(true)}
                  >
                    Write the First Review
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductReviews;
