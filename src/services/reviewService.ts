import { FirebaseClient } from '@/integrations/firebase/client';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewData {
  product_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase?: boolean;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const ReviewService = {
  // Get all reviews for a product
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const { data, error } = await FirebaseClient.getWhere('reviews', [
        { field: 'product_id', operator: '==', value: productId }
      ]);

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      // Sort by newest first
      const sortedData = (data || []).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      return sortedData as Review[];
    } catch (error) {
      console.error('Error in getProductReviews:', error);
      return [];
    }
  },

  // Get review statistics for a product
  async getReviewStats(productId: string): Promise<ReviewStats> {
    try {
      const reviews = await this.getProductReviews(productId);
      
      if (reviews.length === 0) {
        return {
          total_reviews: 0,
          average_rating: 0,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      return {
        total_reviews: reviews.length,
        average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        rating_distribution: ratingDistribution
      };
    } catch (error) {
      console.error('Error in getReviewStats:', error);
      return {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  },

  // Create a new review
  async createReview(reviewData: CreateReviewData): Promise<Review> {
    try {
      const reviewWithTimestamp = {
        ...reviewData,
        helpful_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await FirebaseClient.add('reviews', reviewWithTimestamp);

      if (error) {
        console.error('Error creating review:', error);
        throw error;
      }

      // Update product rating and review count
      await this.updateProductStats(reviewData.product_id);

      return data as Review;
    } catch (error) {
      console.error('Error in createReview:', error);
      throw error;
    }
  },

  // Update product rating and review count
  async updateProductStats(productId: string): Promise<void> {
    try {
      const stats = await this.getReviewStats(productId);
      
      const { error } = await FirebaseClient.update('products', productId, {
        rating: stats.average_rating,
        reviews_count: stats.total_reviews,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error updating product stats:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateProductStats:', error);
      throw error;
    }
  },

  // Mark review as helpful
  async markHelpful(reviewId: string): Promise<void> {
    try {
      const { data: review, error: fetchError } = await FirebaseClient.getById('reviews', reviewId);
      
      if (fetchError || !review) {
        throw new Error('Review not found');
      }

      const { error } = await FirebaseClient.update('reviews', reviewId, {
        helpful_count: (review.helpful_count || 0) + 1,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error marking review helpful:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in markHelpful:', error);
      throw error;
    }
  },

  // Delete a review (admin only)
  async deleteReview(reviewId: string): Promise<void> {
    try {
      // Get review to find product_id for updating stats
      const { data: review, error: fetchError } = await FirebaseClient.getById('reviews', reviewId);
      
      if (fetchError || !review) {
        throw new Error('Review not found');
      }

      const { error } = await FirebaseClient.delete('reviews', reviewId);

      if (error) {
        console.error('Error deleting review:', error);
        throw error;
      }

      // Update product stats after deletion
      await this.updateProductStats(review.product_id);
    } catch (error) {
      console.error('Error in deleteReview:', error);
      throw error;
    }
  },

  // Get user's review for a specific product
  async getUserReview(productId: string, userId: string): Promise<Review | null> {
    try {
      const { data, error } = await FirebaseClient.getWhere('reviews', [
        { field: 'product_id', operator: '==', value: productId },
        { field: 'user_id', operator: '==', value: userId }
      ]);

      if (error) {
        console.error('Error fetching user review:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] as Review : null;
    } catch (error) {
      console.error('Error in getUserReview:', error);
      return null;
    }
  }
};

export default ReviewService;
