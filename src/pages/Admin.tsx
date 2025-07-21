import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { firebase } from '@/integrations/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Search, Filter, Package, Eye, Edit, Calendar, DollarSign, TrendingUp, Users, LogOut, ShoppingBag, ArrowLeft, Home } from 'lucide-react';
import { format } from 'date-fns';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLogin from '@/components/AdminLogin';
import ProductManager from '@/components/ProductManager';

interface Order {
  id: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: any;
  userAddress?: string; // Support for legacy field name
  order_items?: any[];
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  tracking_number: string | null;
  shipping_provider: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, login, logout } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false);

  const queryClient = useQueryClient();

  // Helper function to format shipping address
  const formatShippingAddress = (address: any): string => {
    if (!address) return 'No address provided';
    
    if (typeof address === 'string') return address;
    
    if (typeof address === 'object') {
      const lines = [];
      
      // Name line
      if (address.fullName) lines.push(address.fullName);
      
      // Street address line
      if (address.street || address.address) lines.push(address.street || address.address);
      
      // City, State, Pincode line
      const cityStatePin = [];
      if (address.city) cityStatePin.push(address.city);
      if (address.state) cityStatePin.push(address.state);
      if (address.pincode) cityStatePin.push(address.pincode);
      if (cityStatePin.length > 0) lines.push(cityStatePin.join(', '));
      
      // Country line
      if (address.country) lines.push(address.country);
      
      return lines.length > 0 ? lines.join('\n') : 'Address details incomplete';
    }
    
    return 'Invalid address format';
  };

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await firebase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .execute();
      
      if (error) throw error;
      return data as Order[];
    },
  });

  // Fetch products count for stats
  const { data: productsCount = 0 } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: async () => {
      const { data, error } = await firebase
        .from('products')
        .select('*')
        .execute();
      
      if (error) throw error;
      return data ? data.length : 0;
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) => {
      const { error } = await firebase
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .execute();
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated successfully');
      setIsOrderSheetOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update order');
      console.error('Update error:', error);
    },
  });

  // Filter orders
  const filteredOrders = (orders || []).filter(order => {
    if (!order) return false;
    
    const matchesSearch = searchTerm === '' || 
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate statistics
  const stats = {
    totalOrders: (orders || []).length,
    totalRevenue: (orders || []).reduce((sum, order) => sum + (order?.total_amount || 0), 0),
    pendingOrders: (orders || []).filter(order => order?.status === 'pending').length,
    completedOrders: (orders || []).filter(order => order?.status === 'delivered').length,
    totalProducts: productsCount,
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount || isNaN(amount)) return '₹0.00';
    return `₹${(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderSheetOpen(true);
  };

  const handleUpdateOrder = (updates: Partial<Order>) => {
    if (selectedOrder) {
      updateOrderMutation.mutate({ orderId: selectedOrder.id, updates });
    }
  };

  const handleUpdateTracking = async () => {
    if (!selectedOrder || !selectedOrder.tracking_number || !selectedOrder.shipping_provider) {
      toast.error('Please provide both tracking number and shipping provider');
      return;
    }

    try {
      // Update the order with tracking details
      await updateOrderMutation.mutateAsync({ 
        orderId: selectedOrder.id, 
        updates: { 
          tracking_number: selectedOrder.tracking_number,
          shipping_provider: selectedOrder.shipping_provider
        }
      });

      // Open WhatsApp with tracking message if phone number exists
      if (selectedOrder.customer_phone) {
        const customerName = selectedOrder.customer_name || 'Customer';
        const orderId = selectedOrder.id.slice(0, 8); // First 8 characters of order ID
        const trackingNumber = selectedOrder.tracking_number;
        const provider = selectedOrder.shipping_provider;
        
        // Create the WhatsApp message
        const message = `Hi ${customerName}! 📦

Your order #${orderId} has been shipped via *${provider}*.

🚚 Track your package: *${trackingNumber}*

Thank you for choosing Rang-e-Saree Haven! ✨`;

        // Format phone number (remove any non-digits and ensure it starts with country code)
        let phoneNumber = selectedOrder.customer_phone.replace(/\D/g, '');
        if (phoneNumber.startsWith('91')) {
          phoneNumber = phoneNumber; // Already has country code
        } else if (phoneNumber.length === 10) {
          phoneNumber = '91' + phoneNumber; // Add India country code
        }

        // Create WhatsApp web link
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        
        toast.success(`Tracking updated! WhatsApp opened for ${selectedOrder.customer_phone}`);
      } else {
        toast.success('Tracking updated successfully (no phone number for WhatsApp)');
      }

    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Failed to update tracking information');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={login} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with logout */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage orders, products, and monitor your ecommerce store</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Order Management</TabsTrigger>
            <TabsTrigger value="products">Product Management</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders by email, name, or order ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer_name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{order.customer_email || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPaymentStatusColor(order.payment_status)}>
                              {order.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <ProductManager />
          </TabsContent>
        </Tabs>

        {/* Order Detail Sheet */}
        <Sheet open={isOrderSheetOpen} onOpenChange={setIsOrderSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Order Details</SheetTitle>
            </SheetHeader>
            
            {selectedOrder && (
              <div className="space-y-6 mt-6">
                {/* Order Info */}
                <div>
                  <h3 className="font-semibold mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono">#{selectedOrder.id?.slice(0, 8) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{selectedOrder.created_at ? format(new Date(selectedOrder.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedOrder.customer_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedOrder.customer_email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedOrder.customer_phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Current Shipping Info */}
                <div>
                  <h3 className="font-semibold mb-3">Current Shipping Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider:</span>
                      <span>{selectedOrder.shipping_provider || 'Not assigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tracking:</span>
                      <span className="font-mono">{selectedOrder.tracking_number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <div className="text-sm">
                    <p className="whitespace-pre-wrap">{formatShippingAddress(selectedOrder.shipping_address)}</p>
                  </div>
                </div>

                {/* Status Updates */}
                <div>
                  <h3 className="font-semibold mb-3">Update Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Order Status</label>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(value) => handleUpdateOrder({ status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Payment Status</label>
                      <Select
                        value={selectedOrder.payment_status}
                        onValueChange={(value) => handleUpdateOrder({ payment_status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Shipping Provider</label>
                        <Select
                          value={selectedOrder.shipping_provider || ''}
                          onValueChange={(value) => setSelectedOrder({ ...selectedOrder, shipping_provider: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shipping provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bluedart">Blue Dart</SelectItem>
                            <SelectItem value="dhl">DHL</SelectItem>
                            <SelectItem value="fedex">FedEx</SelectItem>
                            <SelectItem value="dtdc">DTDC</SelectItem>
                            <SelectItem value="ekart">Ekart</SelectItem>
                            <SelectItem value="indianpost">India Post</SelectItem>
                            <SelectItem value="xpressbees">XpressBees</SelectItem>
                            <SelectItem value="shadowfax">Shadowfax</SelectItem>
                            <SelectItem value="delhivery">Delhivery</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Tracking Number</label>
                        <Input
                          value={selectedOrder.tracking_number || ''}
                          onChange={(e) => setSelectedOrder({ ...selectedOrder, tracking_number: e.target.value })}
                          placeholder="Enter tracking number"
                        />
                      </div>
                      
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleUpdateTracking()}
                        disabled={!selectedOrder.tracking_number || !selectedOrder.shipping_provider}
                      >
                        Update Tracking & Send WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {(selectedOrder.order_items || []).map((item: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Color: {item.color} | Size: {item.size} | Qty: {item.quantity}
                        </div>
                        <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <div className="text-sm space-y-1">
                    <div>{selectedOrder.shipping_address.street}</div>
                    <div>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</div>
                    <div>{selectedOrder.shipping_address.pincode}</div>
                    <div>{selectedOrder.shipping_address.country}</div>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Admin;
