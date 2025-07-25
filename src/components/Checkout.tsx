import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, MapPin, User, Phone, CreditCard, Check,  } from 'lucide-react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import EmailAuth from './EmailAuth';
import { toast } from 'sonner';
import { FirebaseClient } from '@/integrations/firebase/client';
import { emailService } from '@/services/emailService';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  buyNowItem?: {
    id: string;
    productId: string;
    name: string;
    price: number;
    color: string;
    size: string;
    quantity: number;
    image?: string;
  };
}

interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose, buyNowItem }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isSignedIn } = useAuth();
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [step, setStep] = useState<'auth' | 'details' | 'payment' | 'confirmation'>('auth');
  const [loading, setLoading] = useState(false);

  // Determine which items to use: buyNowItem for "Buy Now" or cart items for regular checkout
  const checkoutItems = buyNowItem ? [buyNowItem] : items;
  
  // Calculate total based on checkout items
  const getCheckoutTotal = () => {
    if (buyNowItem) {
      return buyNowItem.price * buyNowItem.quantity;
    }
    return getTotalPrice();
  };
  
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  // Auto-advance to details step if user is already signed in
  useEffect(() => {
    if (isSignedIn && step === 'details') {
      loadUserProfile();
    }
  }, [isSignedIn, step]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price / 100);
  };

  const totalPrice = getCheckoutTotal();
  const shippingFee = 5000; // ₹50 shipping (5000 paise = ₹50)
  const taxAmount = Math.round(totalPrice * 0.18); // 18% GST (already in paise)
  const finalTotal = totalPrice + shippingFee + taxAmount;

  // Function to save user profile for future autofill
  const saveUserProfile = async () => {
    if (!user) return;

    try {
      const profileData = {
        user_id: user.uid,
        user_phone: shippingDetails.phone,
        user_email: user.email || '',
        name: shippingDetails.fullName,
        email: shippingDetails.email,
        phone: shippingDetails.phone,
        address: {
          street: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state,
          pincode: shippingDetails.pincode
        },
        landmark: shippingDetails.landmark || '',
        updated_at: new Date().toISOString()
      };

      // Check if profile exists
      const { data: existingProfile } = await FirebaseClient.getSingle('user_profiles', [
        { field: 'user_id', operator: '==', value: user.uid }
      ]);

      if (existingProfile) {
        // Update existing profile
        await FirebaseClient.update('user_profiles', existingProfile.id, profileData);
      } else {
        // Create new profile
        await FirebaseClient.add('user_profiles', {
          ...profileData,
          created_at: new Date().toISOString()
        });
      }
      
      console.log('User profile saved successfully');
    } catch (error) {
      console.error('Error saving user profile:', error);
      // Don't throw error here as it shouldn't block order placement
    }
  };

  // Function to load user profile for autofill
  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile } = await FirebaseClient.getSingle('user_profiles', [
        { field: 'user_id', operator: '==', value: user.uid }
      ]);

      if (profile) {
        setShippingDetails(prev => ({
          ...prev,
          fullName: profile.name || user.displayName || '',
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          address: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          pincode: profile.address?.pincode || '',
          landmark: profile.landmark || ''
        }));
        toast.success('Address details loaded from your profile');
      } else {
        // Set basic user info from Firebase if no profile exists
        setShippingDetails(prev => ({
          ...prev,
          fullName: user.displayName || '',
          email: user.email || '',
          phone: ''
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to basic user info from Firebase
      setShippingDetails(prev => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || '',
        phone: ''
      }));
    }
  };

  const handleShippingSubmit = () => {
    const { fullName, email, phone, address, city, state, pincode } = shippingDetails;
    
    if (!fullName || !email || !phone || !address || !city || !state || !pincode) {
      toast.error('Please fill in all required shipping details');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      return;
    }

    setLoading(true);
    
    try {
      // Save user profile for future autofill
      await saveUserProfile();

      // Create order in Firebase with proper structure matching the database
      const orderData = {
        customer_name: user.displayName || shippingDetails.fullName || 'Customer',
        customer_email: shippingDetails.email || user.email || '',
        customer_phone: shippingDetails.phone,
        user_phone: shippingDetails.phone, // Add this field for OrderService compatibility
        user_email: user.email || '', // Add user_email for OrderService compatibility
        user_id: user.uid, // Add user_id for better tracking
        order_items: checkoutItems.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          color: item.color,
          size: item.size,
          quantity: item.quantity
        })),
        items: checkoutItems.map(item => ({ // Add items field for OrderService compatibility
          productId: item.productId,
          name: item.name,
          price: item.price,
          color: item.color,
          size: item.size,
          quantity: item.quantity
        })),
        shipping_address: {
          name: shippingDetails.fullName,
          phone: shippingDetails.phone,
          street: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state,
          pincode: shippingDetails.pincode,
          country: 'India'
        },
        subtotal: totalPrice,
        shipping_cost: shippingFee,
        tax_amount: taxAmount,
        total_amount: finalTotal,
        total: finalTotal, // Add total field for OrderService compatibility
        payment_method: 'cod',
        payment_status: 'pending',
        status: 'pending',
        shipping_provider: 'delhivery',
        tracking_number: '',
        notes: shippingDetails.landmark || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert order into Firebase
      const result = await FirebaseClient.add('orders', orderData);

      if (!result.data) {
        throw new Error('Failed to create order');
      }

      // Generate order number for email
      const orderNumber = `VT${Date.now().toString().slice(-6)}`;
      
      // Send email notifications
      try {
        // Prepare email data
        const emailData = {
          orderNumber,
          customerName: orderData.customer_name,
          customerEmail: orderData.customer_email,
          customerPhone: orderData.customer_phone,
          items: orderData.order_items,
          totalAmount: orderData.total_amount,
          shippingAddress: orderData.shipping_address
        };

        // Send admin notification email
        console.log('📧 Sending admin notification email...');
        const adminEmailSent = await emailService.sendOrderNotificationToAdmin(emailData);
        if (adminEmailSent) {
          console.log('✅ Admin notification email sent successfully');
        } else {
          console.log('⚠️ Admin notification email failed');
        }

        // Send customer confirmation email
        if (orderData.customer_email) {
          console.log('📧 Sending customer confirmation email...');
          const customerEmailSent = await emailService.sendOrderConfirmationToCustomer(emailData);
          if (customerEmailSent) {
            console.log('✅ Customer confirmation email sent successfully');
            toast.success('Order placed! Check your email for confirmation.');
          } else {
            console.log('⚠️ Customer confirmation email failed');
            toast.success('Order placed successfully!');
          }
        } else {
          toast.success('Order placed successfully!');
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the order if email fails
        toast.success('Order placed successfully! (Email notification pending)');
      }

      // Clear cart only if it's not a "Buy Now" purchase
      if (!buyNowItem) {
        clearCart();
      }
      setStep('confirmation');
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('auth');
    setShippingDetails({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    });
    onClose();
  };

  const renderAuthStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Phone className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Secure Checkout</h3>
        <p className="text-muted-foreground">
          Please Signin with your account to continue with your order
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Items ({checkoutItems.length})</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{formatPrice(shippingFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (GST 18%)</span>
            <span>{formatPrice(taxAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </CardContent>
      </Card>

      {isSignedIn && user ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Verified: {user.email || user.phoneNumber || 'User'}
            </span>
          </div>
          <Button onClick={() => setStep('details')} className="w-full">
            Continue to Shipping Details
          </Button>
        </div>
      ) : (
        <Button onClick={() => setShowEmailAuth(true)} className="w-full">
          <User className="mr-2 h-4 w-4" />
          Sign In to Continue
        </Button>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Details
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={shippingDetails.fullName}
              onChange={(e) => setShippingDetails(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={shippingDetails.email}
              onChange={(e) => setShippingDetails(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={shippingDetails.phone}
              onChange={(e) => setShippingDetails(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your 10-digit phone number"
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={shippingDetails.address}
              onChange={(e) => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
              placeholder="House number, street name, area"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={shippingDetails.city}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={shippingDetails.state}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, state: e.target.value }))}
                placeholder="State"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={shippingDetails.pincode}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                placeholder="6-digit pincode"
                maxLength={6}
              />
            </div>
            <div>
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                value={shippingDetails.landmark}
                onChange={(e) => setShippingDetails(prev => ({ ...prev, landmark: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('auth')} className="flex-1">
          Back
        </Button>
        <Button onClick={handleShippingSubmit} className="flex-1">
          Continue to Payment
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment & Order Review
        </h3>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{shippingDetails.fullName}</p>
              <p>{shippingDetails.address}</p>
              <p>{shippingDetails.city}, {shippingDetails.state} - {shippingDetails.pincode}</p>
              {shippingDetails.landmark && <p>Landmark: {shippingDetails.landmark}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">
                      {item.color} • {item.size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST 18%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h4 className="font-medium">Payment Method</h4>
                <div className="p-3 border-2 border-primary rounded-lg bg-primary/5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Cash on Delivery (COD)</p>
                      <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
          Back
        </Button>
        <Button onClick={handlePlaceOrder} disabled={loading} className="flex-1">
          {loading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="h-6 w-6 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Order Placed Successfully!</h3>
        <p className="text-muted-foreground">
          Thank you for your order. We'll send you updates via SMS.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Order Total</span>
              <span className="font-semibold">{formatPrice(finalTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span>Cash on Delivery</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>5-7 business days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleClose} className="w-full">
        Continue Shopping
      </Button>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Checkout
              {step !== 'auth' && step !== 'confirmation' && (
                <Badge variant="secondary" className="ml-auto">
                  Step {step === 'details' ? '2' : '3'} of 3
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {step === 'auth' && renderAuthStep()}
            {step === 'details' && renderDetailsStep()}
            {step === 'payment' && renderPaymentStep()}
            {step === 'confirmation' && renderConfirmationStep()}
          </div>
        </DialogContent>
      </Dialog>

      <EmailAuth
        isOpen={showEmailAuth}
        onClose={() => setShowEmailAuth(false)}
        onSuccess={() => setShowEmailAuth(false)}
      />
    </>
  );
};

export default Checkout;
