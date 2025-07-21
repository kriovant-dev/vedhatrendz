import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { User, Phone, Mail, MapPin, Package, Heart, ShoppingCart, Edit2, Save, X } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { FirebaseClient } from '../integrations/firebase/client';
import { Link } from 'react-router-dom';

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

interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
  user_phone: string;
  shipping_address?: any;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { getTotalItems: getWishlistCount } = useWishlist();
  const { getTotalItems: getCartCount } = useCart();
  
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
        // Create default profile with phone number
        setProfile(prev => ({
          ...prev,
          phone: user?.phoneNumber || ''
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Set phone number from auth user
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
      const { data } = await FirebaseClient.getWhere('orders', [
        { field: 'user_phone', operator: '==', value: user?.phoneNumber }
      ]);
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
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

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your personal information and address</CardDescription>
                  </div>
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
              </CardHeader>
              <CardContent className="space-y-6">
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
                    <Link to="/sarees">
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
                              <p className="text-lg font-bold mt-1">₹{order.total.toLocaleString()}</p>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
