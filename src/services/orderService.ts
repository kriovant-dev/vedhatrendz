import { FirebaseClient } from '@/integrations/firebase/client';

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  shipping_cost?: number;
  tax_amount?: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_phone: string;
  user_id?: string;
  shipping_address?: ShippingAddress;
  payment_method?: string;
  tracking_number?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  image?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export class OrderService {
  static async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; orderId?: string; error?: any }> {
    try {
      const order = {
        ...orderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: orderData.status || 'pending'
      };

      const { data, error } = await FirebaseClient.add('orders', order);
      
      if (error) {
        return { success: false, error };
      }

      return { success: true, orderId: data.id };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error };
    }
  }

  static async getOrdersByUser(userEmail: string): Promise<{ orders: Order[]; error?: any }> {
    try {
      const { data, error } = await FirebaseClient.getWhere('orders', [
        { field: 'user_email', operator: '==', value: userEmail }
      ]);

      if (error) {
        return { orders: [], error };
      }

      // Sort orders by creation date (newest first)
      const sortedOrders = (data || []).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return { orders: sortedOrders };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return { orders: [], error };
    }
  }

  static async getOrderById(orderId: string): Promise<{ order: Order | null; error?: any }> {
    try {
      const { data, error } = await FirebaseClient.getById('orders', orderId);

      if (error) {
        return { order: null, error };
      }

      return { order: data };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { order: null, error };
    }
  }

  static async updateOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<{ success: boolean; error?: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      const { error } = await FirebaseClient.update('orders', orderId, updateData);

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error };
    }
  }

  static getOrderStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'returned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  static getOrderStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'returned':
        return 'Returned';
      default:
        return 'Unknown';
    }
  }

  static canCancelOrder(status: string): boolean {
    const cancelableStatuses = ['pending', 'confirmed', 'processing'];
    return cancelableStatuses.includes(status.toLowerCase());
  }

  static canTrackOrder(status: string): boolean {
    const trackableStatuses = ['shipped', 'out_for_delivery'];
    return trackableStatuses.includes(status.toLowerCase());
  }

  static formatPrice(amount: number): string {
    return `₹${(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }
}
