import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { User, Phone, Mail, MapPin, Package, Heart, ShoppingCart, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { FirebaseClient } from '../integrations/firebase/client';
import { OrderService, Order } from '../services/orderService';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getTotalItems: getWishlistCount, items: wishlistItems, removeFromWishlist } = useWishlist();
  const { getTotalItems: getCartCount, addToCart } = useCart();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: user?.phoneNumber || '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserOrders();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      // Try to load existing profile
      const { data } = await FirebaseClient.getSingle('user_profiles', [
        { field: 'user_id', operator: '==', value: user?.uid }
      ]);
      
      if (data) {
        setProfile(data);
      } else {
        // Create default profile with phone number and try to auto-fill from orders
        const defaultProfile = {
          name: '',
          email: '',
          phone: user?.phoneNumber || '',
          address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
          }
        };

        // Try to auto-fill profile from latest order data
        const phoneNumber = user?.phoneNumber;
        if (phoneNumber) {
          try {
            const { data: orderData } = await FirebaseClient.getWhere('orders', [
              { field: 'user_phone', operator: '==', value: phoneNumber }
            ]);
            
            if (orderData && orderData.length > 0) {
              // Get the most recent order with shipping address
              const ordersWithAddress = orderData.filter(order => order.shipping_address);
              if (ordersWithAddress.length > 0) {
                // Sort by created_at to get the most recent
                const sortedOrders = ordersWithAddress.sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                const latestOrder = sortedOrders[0];
                
                if (latestOrder.shipping_address) {
                  defaultProfile.name = latestOrder.shipping_address.name || '';
                  defaultProfile.email = latestOrder.shipping_address.email || '';
                  defaultProfile.address = {
                    street: latestOrder.shipping_address.street || '',
                    city: latestOrder.shipping_address.city || '',
                    state: latestOrder.shipping_address.state || '',
                    pincode: latestOrder.shipping_address.pincode || ''
                  };
                  
                  // Auto-save the profile with order data
                  const profileData = {
                    ...defaultProfile,
                    user_id: user?.uid,
                    user_phone: user?.phoneNumber,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    auto_filled_from_order: true
                  };
                  
                  try {
                    await FirebaseClient.add('user_profiles', profileData);
                  } catch (error) {
                    // Error auto-saving profile
                  }
                }
              }
            }
          } catch (orderError) {
            // Error fetching orders for auto-fill
          }
        }
        
        setProfile(defaultProfile);
      }
    } catch (error) {
      // Set phone number from auth user as fallback
      setProfile(prev => ({
        ...prev,
        phone: user?.phoneNumber || ''
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserOrders = async () => {
    try {
      const userEmail = user?.email;
      
      if (userEmail) {
        // First try to get orders using the OrderService (same as Orders page)
        const { orders: userOrders, error } = await OrderService.getOrdersByUser(userEmail);
        
        if (error) {
          // Fallback: try direct Firebase query with customer_email
          try {
            const { data: fallbackOrders } = await FirebaseClient.getWhere('orders', [
              { field: 'customer_email', operator: '==', value: userEmail }
            ]);
            
            if (fallbackOrders && fallbackOrders.length > 0) {
              const convertedOrders = fallbackOrders.map(order => ({
                id: order.id,
                items: order.items || order.order_items || [],
                total: order.total || order.total_amount || 0,
                status: order.status || 'pending',
                created_at: order.created_at,
                user_phone: order.user_phone || order.customer_phone || '',
                shipping_address: order.shipping_address
              }));
              setOrders(convertedOrders);
            } else {
              setOrders([]);
            }
          } catch (fallbackError) {
            setOrders([]);
          }
        } else {
          setOrders(userOrders || []);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      setOrders([]);
    }
  };

  const saveProfile = async () => {
    try {
      const profileData = {
        user_id: user?.uid,
        user_phone: user?.phoneNumber,
        ...profile,
        updated_at: new Date().toISOString()
      };

      // Check if profile exists
      const { data: existing } = await FirebaseClient.getSingle('user_profiles', [
        { field: 'user_id', operator: '==', value: user?.uid }
      ]);

      if (existing) {
        await FirebaseClient.update('user_profiles', existing.id, profileData);
      } else {
        await FirebaseClient.add('user_profiles', {
          ...profileData,
          created_at: new Date().toISOString()
        });
      }

      // Also update future orders with this address as default shipping address
      await updateFutureOrdersWithProfile();

      setIsEditing(false);
    } catch (error) {
      // Error saving profile
    }
  };

  const updateFutureOrdersWithProfile = async () => {
    try {
      // This is for future orders - we won't modify existing orders
      // but we can set this as default for checkout
    } catch (error) {
      // Error updating future orders
    }
  };

  const autoFillFromOrders = async () => {
    setIsAutoFilling(true);
    try {
      const userEmail = user?.email;
      if (!userEmail) return;

      // Try to get orders using email (same logic as loadUserOrders)
      const { orders: userOrders, error } = await OrderService.getOrdersByUser(userEmail);
      let orderData = userOrders;
      
      if (error || !orderData || orderData.length === 0) {
        // Fallback: try direct Firebase query with customer_email
        const { data: fallbackOrders } = await FirebaseClient.getWhere('orders', [
          { field: 'customer_email', operator: '==', value: userEmail }
        ]);
        orderData = fallbackOrders || [];
      }
      
      if (orderData && orderData.length > 0) {
        // Get the most recent order with shipping address
        const ordersWithAddress = orderData.filter(order => order.shipping_address);
        if (ordersWithAddress.length > 0) {
          // Sort by created_at to get the most recent
          const sortedOrders = ordersWithAddress.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const latestOrder = sortedOrders[0];
          
          if (latestOrder.shipping_address) {
            setProfile(prev => ({
              ...prev,
              name: latestOrder.shipping_address.name || prev.name,
              email: latestOrder.user_email || prev.email,
              phone: latestOrder.shipping_address.phone || latestOrder.user_phone || prev.phone,
              address: {
                street: latestOrder.shipping_address.street || prev.address.street,
                city: latestOrder.shipping_address.city || prev.address.city,
                state: latestOrder.shipping_address.state || prev.address.state,
                pincode: latestOrder.shipping_address.pincode || prev.address.pincode
              }
            }));
          }
        }
      }
    } catch (error) {
      // Error auto-filling from orders
    } finally {
      setIsAutoFilling(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center">
          <User className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold text-saree-primary mb-2">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
          <Link to="/admin">
            <Button className="bg-saree-accent hover:bg-saree-accent/90">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saree-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-saree-primary to-saree-accent text-white rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.name || 'User'}</h1>
                <p className="opacity-90">{profile.phone}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{getWishlistCount()}</div>
                <div className="text-sm opacity-90">Wishlist</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{getCartCount()}</div>
                <div className="text-sm opacity-90">Cart Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-sm opacity-90">Orders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/wishlist">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <h3 className="font-semibold">My Wishlist</h3>
                <p className="text-sm text-gray-600">{getWishlistCount()} items</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/cart">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold">Shopping Cart</h3>
                <p className="text-sm text-gray-600">{getCartCount()} items</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Order History</h3>
              <p className="text-sm text-gray-600">{orders.length} orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="wishlist">My Wishlist</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your personal information and address</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {/* Auto-fill button */}
                    <Button 
                      variant="outline" 
                      onClick={autoFillFromOrders}
                      disabled={isAutoFilling || orders.length === 0}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      {isAutoFilling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Auto-filling...
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4 mr-2" />
                          Fill from Orders
                        </>
                      )}
                    </Button>
                    
                    {!isEditing ? (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={saveProfile}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto-fill Notice */}
                {orders.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-800">Auto-fill Available</h4>
                        <p className="text-sm text-blue-700">
                          We found {orders.length} order(s) with shipping details. Click "Fill from Orders" to automatically populate your profile with your latest shipping address.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        disabled={true}
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={profile.address.street}
                        onChange={(e) => setProfile(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, street: e.target.value }
                        }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profile.address.city}
                        onChange={(e) => setProfile(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profile.address.state}
                        onChange={(e) => setProfile(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, state: e.target.value }
                        }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input
                        id="pincode"
                        value={profile.address.pincode}
                        onChange={(e) => setProfile(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, pincode: e.target.value }
                        }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View all your past orders and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                    <Link to="/products">
                      <Button className="bg-saree-accent hover:bg-saree-accent/90">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold">Order #{order.id.slice(-8)}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={getOrderStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                              <p className="text-lg font-bold mt-1">{OrderService.formatPrice(order.total)}</p>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <p>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                            {order.shipping_address && (
                              <p className="mt-1">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {order.shipping_address.city}, {order.shipping_address.state}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  My Wishlist ({getWishlistCount()} items)
                </CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {getWishlistCount() === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-4">Save items you love to view them later</p>
                    <Link to="/products">
                      <Button>
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.map((item) => (
                      <Card key={item.id} className="group hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="aspect-square relative mb-3 overflow-hidden rounded-lg">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.name}</h3>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">₹{(item.price / 100).toLocaleString()}</span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{(item.originalPrice / 100).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                addToCart({
                                  productId: item.productId,
                                  name: item.name,
                                  price: item.price,
                                  color: item.colors[0] || '',
                                  size: 'Free Size',
                                  quantity: 1,
                                  image: item.image
                                });
                                toast.success('Added to cart!');
                              }}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Add to Cart
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                removeFromWishlist(item.productId);
                                toast.success('Removed from wishlist!');
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
