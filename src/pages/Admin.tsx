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
import { Search, Filter, Package, Eye, Edit, Calendar, DollarSign, TrendingUp, Users, LogOut, ShoppingBag, ArrowLeft, Home, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { CategoryService } from '@/services/categoryService';
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
    return (
      <div className="min-h-screen bg-background">
        <div className="admin-mobile-container max-w-md mx-auto">
          <AdminLogin onLoginSuccess={login} />
        </div>
      </div>
    );
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
      <div className="admin-mobile-container max-w-7xl mx-auto">
        {/* Header with logout */}
        <div className="admin-mobile-header">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mobile-button"
            >
              <Home className="h-4 w-4" />
              <span className="hidden xs:inline">Home</span>
            </Button>
            <div>
              <h1 className="mobile-heading">Admin Dashboard</h1>
              <p className="mobile-text text-muted-foreground">Manage orders, products, and monitor your ecommerce store</p>
            </div>
          </div>
          <div className="flex flex-col xs:flex-row gap-2">
            <Button variant="outline" onClick={logout} className="flex items-center gap-2 mobile-button">
              <LogOut className="h-4 w-4" />
              <span className="mobile-small-text">Logout</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="admin-stats-grid">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-small-text font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-small-text font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-small-text font-medium">Products</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-small-text font-medium">Pending Orders</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mobile-small-text font-medium">Completed Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text font-bold">{stats.completedOrders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="admin-mobile-tabs space-y-6">
          <TabsList className="admin-mobile-tab-list">
            <TabsTrigger value="orders" className="mobile-button">Order Management</TabsTrigger>
            <TabsTrigger value="products" className="mobile-button">Product Management</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="mobile-text">Order Management</CardTitle>
              </CardHeader>
              <CardContent className="admin-mobile-card">
                <div className="admin-mobile-filters">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="admin-mobile-input pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="admin-mobile-select">
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
                    <SelectTrigger className="admin-mobile-select">
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
                <div className="admin-table-container">
                  <Table className="admin-mobile-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="admin-table-cell">Order ID</TableHead>
                        <TableHead className="admin-table-cell">Customer</TableHead>
                        <TableHead className="admin-table-cell">Items</TableHead>
                        <TableHead className="admin-table-cell">Total</TableHead>
                        <TableHead className="admin-table-cell">Status</TableHead>
                        <TableHead className="admin-table-cell">Payment</TableHead>
                        <TableHead className="admin-table-cell">Date</TableHead>
                        <TableHead className="admin-table-cell-action">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="admin-table-cell">
                            <span className="font-mono mobile-small-text">
                              #{order.id.slice(0, 8)}
                            </span>
                          </TableCell>
                          <TableCell className="admin-table-cell">
                            <div>
                              <div className="font-medium mobile-small-text">{order.customer_name || 'N/A'}</div>
                              <div className="mobile-small-text text-muted-foreground truncate max-w-[120px]">{order.customer_email || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="admin-table-cell">
                            <span className="mobile-small-text">
                              {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                            </span>
                          </TableCell>
                          <TableCell className="admin-table-cell">
                            <span className="font-medium mobile-small-text">
                              {formatCurrency(order.total_amount)}
                            </span>
                          </TableCell>
                          <TableCell className="admin-table-cell">
                            <Badge className={`${getStatusColor(order.status)} text-xs`}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="admin-table-cell">
                            <Badge className={`${getPaymentStatusColor(order.payment_status)} text-xs`}>
                              {order.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="admin-table-cell">
                            <span className="mobile-small-text">
                              {format(new Date(order.created_at), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="admin-table-cell-action">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                              className="admin-action-button"
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
          <SheetContent className="admin-sheet-mobile admin-sheet-content">
            <SheetHeader>
              <SheetTitle className="mobile-text">Order Details</SheetTitle>
            </SheetHeader>
            
            {selectedOrder && (
              <div className="space-y-6 mt-6">
                {/* Order Info */}
                <div>
                  <h3 className="font-semibold mb-3 mobile-text">Order Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground mobile-small-text">Order ID:</span>
                      <span className="font-mono mobile-small-text">#{selectedOrder.id?.slice(0, 8) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground mobile-small-text">Date:</span>
                      <span className="mobile-small-text">{selectedOrder.created_at ? format(new Date(selectedOrder.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground mobile-small-text">Total:</span>
                      <span className="font-medium mobile-small-text">{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3 mobile-text">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground mobile-small-text">Name:</span>
                      <span className="mobile-small-text">{selectedOrder.customer_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground mobile-small-text">Email:</span>
                      <span className="mobile-small-text break-all">{selectedOrder.customer_email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground mobile-small-text">Phone:</span>
                      <span className="mobile-small-text">{selectedOrder.customer_phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Current Shipping Info */}
                <div>
                  <h3 className="font-semibold mb-3 mobile-text">Current Shipping Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground mobile-small-text">Provider:</span>
                      <span className="mobile-small-text">{selectedOrder.shipping_provider || 'Not assigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground mobile-small-text">Tracking:</span>
                      <span className="font-mono mobile-small-text break-all">{selectedOrder.tracking_number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-3 mobile-text">Shipping Address</h3>
                  <div className="mobile-small-text">
                    <p className="whitespace-pre-wrap">{formatShippingAddress(selectedOrder.shipping_address)}</p>
                  </div>
                </div>

                {/* Status Updates */}
                <div>
                  <h3 className="font-semibold mb-3 mobile-text">Update Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mobile-small-text font-medium mb-1 block">Order Status</label>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(value) => handleUpdateOrder({ status: value })}
                      >
                        <SelectTrigger className="admin-mobile-select">
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
                      <label className="mobile-small-text font-medium mb-1 block">Payment Status</label>
                      <Select
                        value={selectedOrder.payment_status}
                        onValueChange={(value) => handleUpdateOrder({ payment_status: value })}
                      >
                        <SelectTrigger className="admin-mobile-select">
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
                        <label className="mobile-small-text font-medium mb-1 block">Shipping Provider</label>
                        <Select
                          value={selectedOrder.shipping_provider || ''}
                          onValueChange={(value) => setSelectedOrder({ ...selectedOrder, shipping_provider: value })}
                        >
                          <SelectTrigger className="admin-mobile-select">
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
                        <label className="mobile-small-text font-medium mb-1 block">Tracking Number</label>
                        <Input
                          value={selectedOrder.tracking_number || ''}
                          onChange={(e) => setSelectedOrder({ ...selectedOrder, tracking_number: e.target.value })}
                          placeholder="Enter tracking number"
                          className="admin-mobile-input"
                        />
                      </div>
                      
                      <Button
                        size="sm"
                        className="w-full mobile-button"
                        onClick={() => handleUpdateTracking()}
                        disabled={!selectedOrder.tracking_number || !selectedOrder.shipping_provider}
                      >
                        <span className="mobile-small-text">Update Tracking & Send WhatsApp</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3 mobile-text">Order Items</h3>
                  <div className="space-y-3">
                    {(selectedOrder.order_items || []).map((item: any, index: number) => (
                      <div key={index} className="admin-order-item-mobile">
                        <div className="font-medium mobile-small-text">{item.name}</div>
                        <div className="mobile-small-text text-muted-foreground">
                          Color: {item.color} | Size: {item.size} | Qty: {item.quantity}
                        </div>
                        <div className="font-medium mobile-small-text">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-3 mobile-text">Shipping Address</h3>
                  <div className="mobile-small-text space-y-1">
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
