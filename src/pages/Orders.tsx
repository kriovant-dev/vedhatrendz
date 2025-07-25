import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  Eye,
  RefreshCcw,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { OrderService, Order as OrderType } from '@/services/orderService';
import { FirebaseClient } from '@/integrations/firebase/client';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: 0 },
    { value: 'pending', label: 'Pending', count: 0 },
    { value: 'confirmed', label: 'Confirmed', count: 0 },
    { value: 'processing', label: 'Processing', count: 0 },
    { value: 'shipped', label: 'Shipped', count: 0 },
    { value: 'delivered', label: 'Delivered', count: 0 },
    { value: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  useEffect(() => {
    if (user) {
      loadUserOrders();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadUserOrders = async () => {
    try {
      const userEmail = user?.email;
      console.log('Loading orders for email:', userEmail);
      
      if (userEmail) {
        const { orders, error } = await OrderService.getOrdersByUser(userEmail);
        if (error) {
          console.error('Error loading orders:', error);
          toast.error('Failed to load orders');
        } else {
          console.log('Loaded orders:', orders);
          setOrders(orders);
          
          if (orders.length === 0) {
            // Also try to search with customer_email field as fallback
            try {
              const { data: fallbackOrders } = await FirebaseClient.getWhere('orders', [
                { field: 'customer_email', operator: '==', value: userEmail }
              ]);
              console.log('Fallback orders with customer_email:', fallbackOrders);
              if (fallbackOrders && fallbackOrders.length > 0) {
                // Convert to Order format
                const convertedOrders = fallbackOrders.map(order => ({
                  id: order.id,
                  items: order.items || order.order_items || [],
                  total: order.total || order.total_amount || 0,
                  status: order.status || 'pending',
                  created_at: order.created_at,
                  updated_at: order.updated_at,
                  user_email: order.user_email || order.customer_email,
                  user_phone: order.user_phone || order.customer_phone || '',
                  user_id: order.user_id,
                  shipping_address: order.shipping_address,
                  payment_method: order.payment_method,
                  tracking_number: order.tracking_number,
                  notes: order.notes
                }));
                setOrders(convertedOrders);
                console.log('Using fallback orders:', convertedOrders);
              }
            } catch (fallbackError) {
              console.error('Fallback search failed:', fallbackError);
            }
          }
        }
      } else {
        console.log('No phone number found for user');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusCounts = () => {
    const counts = statusOptions.map(option => ({
      ...option,
      count: option.value === 'all' 
        ? orders.length 
        : orders.filter(order => order.status.toLowerCase() === option.value).length
    }));
    return counts;
  };

  const getOrderIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'confirmed':
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to format prices consistently (convert from paise to rupees)
  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getTotalOrderValue = () => {
    return orders.reduce((total, order) => total + order.total, 0) / 100; // Convert to rupees
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold text-primary mb-2">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your orders.</p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Order Detail Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSelectedOrder(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Order Details</h1>
                <p className="text-gray-600">Order #{selectedOrder.id.slice(-8)}</p>
              </div>
            </div>
            <Badge className={OrderService.getOrderStatusColor(selectedOrder.status)}>
              {OrderService.getOrderStatusText(selectedOrder.status)}
            </Badge>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{formatOrderDate(selectedOrder.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg">{OrderService.formatPrice(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{selectedOrder.items.length} item{selectedOrder.items.length !== 1 ? 's' : ''}</span>
                </div>
                {selectedOrder.tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking:</span>
                    <span className="font-medium">{selectedOrder.tracking_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedOrder.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{selectedOrder.shipping_address.name}</p>
                  <p className="text-gray-600">{selectedOrder.shipping_address.street}</p>
                  <p className="text-gray-600">
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}
                  </p>
                  <p className="text-gray-600">PIN: {selectedOrder.shipping_address.pincode}</p>
                  <p className="text-gray-600 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {selectedOrder.shipping_address.phone}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Quantity: {item.quantity}</p>
                        {item.color && <p>Color: {item.color}</p>}
                        {item.size && <p>Size: {item.size}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedOrder.subtotal && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                )}
                {selectedOrder.shipping_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{formatPrice(selectedOrder.shipping_cost)}</span>
                  </div>
                )}
                {selectedOrder.tax_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST):</span>
                    <span>{formatPrice(selectedOrder.tax_amount)}</span>
                  </div>
                )}
                {(selectedOrder.subtotal || selectedOrder.shipping_cost || selectedOrder.tax_amount) && (
                  <Separator className="my-2" />
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">My Orders</h1>
            <p className="text-gray-600">
              {orders.length} order{orders.length !== 1 ? 's' : ''} • Total value: ₹{getTotalOrderValue().toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={loadUserOrders}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    const { data: allOrders } = await FirebaseClient.getAll('orders');
                    console.log('All orders in database:', allOrders);
                    toast.success(`Found ${allOrders?.length || 0} total orders in database`);
                  } catch (error) {
                    console.error('Error fetching all orders:', error);
                    toast.error('Failed to fetch all orders');
                  }
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                Debug DB
              </Button>
            )}
            <Link to="/profile">
              <Button variant="outline">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {getStatusCounts().slice(0, 4).map((status) => (
            <Card key={status.value} className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{status.count}</div>
                <div className="text-sm text-gray-600">{status.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search orders by ID or product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {getStatusCounts().map((status) => (
                  <Button
                    key={status.value}
                    variant={statusFilter === status.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status.value)}
                    className="text-xs"
                  >
                    {status.label} ({status.count})
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {orders.length === 0 ? 'No Orders Yet' : 'No orders match your search'}
              </h3>
              <p className="text-gray-500 mb-6">
                {orders.length === 0 
                  ? "You haven't placed any orders yet. Start shopping to see your orders here."
                  : "Try adjusting your search criteria or filters."
                }
              </p>
              
              {/* Debug Information */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left text-sm">
                  <p><strong>Debug Info:</strong></p>
                  <p>Email: {user?.email || 'Not found'}</p>
                  <p>User ID: {user?.uid || 'Not found'}</p>
                  <p>Total Orders: {orders.length}</p>
                  <button 
                    onClick={() => console.log('User object:', user)} 
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-2"
                  >
                    Log User to Console
                  </button>
                </div>
              )}
              
              {orders.length === 0 && (
                <Link to="/products">
                  <Button>
                    Start Shopping
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                    <div className="flex items-start space-x-4 mb-4 md:mb-0">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getOrderIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatOrderDate(order.created_at)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={OrderService.getOrderStatusColor(order.status)}>
                        {OrderService.getOrderStatusText(order.status)}
                      </Badge>
                      <p className="text-xl font-bold mt-2">{OrderService.formatPrice(order.total)}</p>
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-500">×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center bg-gray-100 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-600">
                          +{order.items.length - 3} more
                        </span>
                      </div>
                    )}
                  </div>

                  {order.shipping_address && (
                    <div className="text-sm text-gray-600 mb-4">
                      <p className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {order.shipping_address.city}, {order.shipping_address.state}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {OrderService.canTrackOrder(order.status) && (
                        <Button variant="outline" size="sm">
                          <Truck className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
