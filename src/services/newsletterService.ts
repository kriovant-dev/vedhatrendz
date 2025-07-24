import { FirebaseClient } from '@/integrations/firebase/client';

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: Date;
  status: 'active' | 'unsubscribed';
  name?: string;
}

class NewsletterService {
  private collectionName = 'newsletter_subscribers';

  async subscribe(email: string, name?: string): Promise<boolean> {
    try {
      // Check if email already exists
      const existingSubscriber = await this.getSubscriber(email);
      
      if (existingSubscriber) {
        // If already subscribed, just update the status to active
        if (existingSubscriber.status === 'unsubscribed') {
          await FirebaseClient.update(this.collectionName, existingSubscriber.id, {
            status: 'active',
            subscribedAt: new Date().toISOString()
          });
          return true;
        } else {
          // Already subscribed
          return false;
        }
      }

      // Create new subscriber
      const subscriber = {
        email: email.toLowerCase().trim(),
        subscribedAt: new Date().toISOString(),
        status: 'active' as const,
        ...(name && { name: name.trim() })
      };

      const result = await FirebaseClient.add(this.collectionName, subscriber);
      return result.error === null;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }

  async unsubscribe(email: string): Promise<boolean> {
    try {
      const subscriber = await this.getSubscriber(email);
      if (subscriber) {
        await FirebaseClient.update(this.collectionName, subscriber.id, {
          status: 'unsubscribed'
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      throw error;
    }
  }

  async getSubscriber(email: string): Promise<(NewsletterSubscriber & { id: string }) | null> {
    try {
      const result = await FirebaseClient.getWhere(this.collectionName, [
        { field: 'email', operator: '==', value: email.toLowerCase() }
      ]);
      
      if (result.data && result.data.length > 0) {
        return result.data[0] as (NewsletterSubscriber & { id: string });
      }
      return null;
    } catch (error) {
      console.error('Error getting subscriber:', error);
      return null;
    }
  }

  async getAllActiveSubscribers(): Promise<(NewsletterSubscriber & { id: string })[]> {
    try {
      const result = await FirebaseClient.getWhere(this.collectionName, [
        { field: 'status', operator: '==', value: 'active' }
      ]);
      
      return result.data || [];
    } catch (error) {
      console.error('Error getting active subscribers:', error);
      return [];
    }
  }

  async getSubscriberCount(): Promise<number> {
    try {
      const activeSubscribers = await this.getAllActiveSubscribers();
      return activeSubscribers.length;
    } catch (error) {
      console.error('Error getting subscriber count:', error);
      return 0;
    }
  }
}

export const newsletterService = new NewsletterService();
