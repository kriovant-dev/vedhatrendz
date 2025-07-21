import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, MapPin, User, Phone, CreditCard, Check } from 'lucide-react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import PhoneAuth from './PhoneAuth';
import { toast } from 'sonner';
import { firebase } from '@/integrations/firebase/client';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [step, setStep] = useState<'auth' | 'details' | 'payment' | 'confirmation'>('auth');
  const [loading, setLoading] = useState(false);
  
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price / 100);
  };

  const totalPrice = getTotalPrice();
  const shippingFee = 5000; // ₹50 shipping
  const finalTotal = totalPrice + shippingFee;

  const handleAuthSuccess = (authUser: any) => {
    toast.success(`Welcome ${authUser.phoneNumber}! Please provide shipping details.`);
    setStep('details');
  };

  const handleShippingSubmit = () => {
    const { fullName, address, city, state, pincode } = shippingDetails;
    
    if (!fullName || !address || !city || !state || !pincode) {
      toast.error('Please fill in all required shipping details');
      return;
    }
    
    if (pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // Create order in Firebase
      const orderData = {
        userId: user?.uid,
        userPhone: user?.phoneNumber,
        items: items,
        shippingDetails: shippingDetails,
        totalAmount: finalTotal,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        orderNumber: `RSH${Date.now()}`
      };

      const { data, error } = await firebase
        .from('orders')
        .insert(orderData)
        .execute();

      if (error) {
        throw error;
      }

      // Clear cart and show success
      clearCart();
      setStep('confirmation');
      toast.success('Order placed successfully!');
      
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
          Please verify your phone number to continue with your order
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Items ({items.length})</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{formatPrice(shippingFee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </CardContent>
      </Card>

      {user ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">Verified: {user.phoneNumber}</span>
          </div>
          <Button onClick={() => setStep('details')} className="w-full">
            Continue to Shipping Details
          </Button>
        </div>
      ) : (
        <Button onClick={() => setShowPhoneAuth(true)} className="w-full">
          <Phone className="mr-2 h-4 w-4" />
          Verify Phone Number
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
              {items.map((item) => (
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

      <PhoneAuth
        isOpen={showPhoneAuth}
        onClose={() => setShowPhoneAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Checkout;
