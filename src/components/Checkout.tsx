import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, MapPin, User, Phone, CreditCard, Check, Shield } from 'lucide-react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import EmailAuth from './EmailAuth';
import { toast } from 'sonner';
import { FirebaseClient } from '@/integrations/firebase/client';
import { emailService } from '@/services/emailService';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
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

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose, onOpen, buyNowItem }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isSignedIn } = useAuth();
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [step, setStep] = useState<'auth' | 'details' | 'payment' | 'confirmation'>('auth');
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay'));
        document.body.appendChild(script);
      });
    };

    const cleanup = () => {
      // Clean up any leftover Razorpay elements
      if ((window as any).originalStyles) {
        document.body.style.pointerEvents = (window as any).originalStyles.bodyPointerEvents;
        document.documentElement.style.pointerEvents = (window as any).originalStyles.htmlPointerEvents;
        document.body.style.overflow = (window as any).originalStyles.bodyOverflow;
        delete (window as any).originalStyles;
      }

      if ((window as any).rzpOverlay) {
        if (document.body.contains((window as any).rzpOverlay)) {
          document.body.removeChild((window as any).rzpOverlay);
        }
        delete (window as any).rzpOverlay;
      }

      // Re-enable all elements and restore styles
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      document.documentElement.style.pointerEvents = '';

      const focusableElements = document.querySelectorAll('[disabled="true"]');
      focusableElements.forEach(el => {
        (el as HTMLElement).removeAttribute('disabled');
        (el as HTMLElement).style.pointerEvents = '';
      });

      const allDialogs = document.querySelectorAll('[role="dialog"]');
      allDialogs.forEach(dialog => {
        dialog.removeAttribute('inert');
        dialog.removeAttribute('aria-hidden');
        (dialog as HTMLElement).style.pointerEvents = '';
        (dialog as HTMLElement).style.visibility = '';
        (dialog as HTMLElement).style.display = '';
        (dialog as HTMLElement).style.opacity = '';
      });
    };

    // Only load if not already loaded
    if (!window.Razorpay) {
      loadRazorpay().catch(error => {
        console.error('Failed to load Razorpay:', error);
      });
    }

    return () => {
      cleanup();
      const script = document.querySelector('script[src*="razorpay"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
  const shippingFee = 0; // Free shipping
  // const taxAmount = Math.round(totalPrice * 0.18); // 18% GST (already in paise)
  const finalTotal = totalPrice + shippingFee;

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
    } catch (error) {
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
    
    // Comprehensive validation
    if (!fullName?.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (fullName.trim().length < 2) {
      toast.error('Full name must be at least 2 characters long');
      return;
    }

    if (!email?.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!phone?.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    // Validate Indian phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9');
      return;
    }

    if (!address?.trim()) {
      toast.error('Please enter your address');
      return;
    }

    if (address.trim().length < 10) {
      toast.error('Please enter a complete address (minimum 10 characters)');
      return;
    }

    if (!city?.trim()) {
      toast.error('Please enter your city');
      return;
    }

    if (!state?.trim()) {
      toast.error('Please enter your state');
      return;
    }

    if (!pincode?.trim()) {
      toast.error('Please enter your pincode');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    
    // Additional pincode validation (basic Indian pincode check)
    const pin = parseInt(pincode.trim());
    if (pin < 100000 || pin > 999999) {
      toast.error('Please enter a valid Indian pincode');
      return;
    }
    
    setStep('payment');
  };

  // Store checkout state for restoration
  const [storedCheckoutState, setStoredCheckoutState] = useState<{
    step: typeof step;
    shippingDetails: typeof shippingDetails;
  } | null>(null);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      return;
    }

    // Validate checkout items
    if (!checkoutItems || checkoutItems.length === 0) {
      toast.error('No items in cart. Please add items before checkout.');
      return;
    }

    // Validate total amount
    if (finalTotal <= 0) {
      toast.error('Invalid order total. Please refresh and try again.');
      return;
    }

    // Validate Razorpay is loaded
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    // Validate shipping details one more time before payment
    const { fullName, email, phone, address, city, state, pincode } = shippingDetails;
    if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !address?.trim() || !city?.trim() || !state?.trim() || !pincode?.trim()) {
      toast.error('Shipping details are incomplete. Please go back and fill all required fields.');
      setStep('details');
      return;
    }

    setPaymentLoading(true);

    try {
      // Save user profile for future autofill
      await saveUserProfile();

      // Generate order number
      const orderNumber = `VT${Date.now().toString().slice(-6)}`;

      // Create Razorpay order on backend for security
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            name: shippingDetails.fullName,
            email: shippingDetails.email,
            phone: shippingDetails.phone,
            address: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}`
          }
        })
      });
      const data = await response.json();
      if (!response.ok || !data.order || !data.order.id) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      // Razorpay configuration
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
        amount: finalTotal,
        currency: 'INR',
        name: 'VedhaTrendz',
        description: `Order #${orderNumber}`,
        order_id: data.order.id, // Secure order id from backend
        prefill: {
          name: shippingDetails.fullName,
          email: shippingDetails.email,
          contact: shippingDetails.phone,
        },
        theme: {
          color: '#8B5A3C',
        },
        modal: {
          escape: false,
          ondismiss: () => {
            setPaymentLoading(false);
            toast.error('Payment cancelled');
          }
        },
        handler: async (response: any) => {
          try {
            // Verify signature before proceeding
            const verifyResponse = await fetch('/api/verify-razorpay-signature', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok || !verifyData.valid) {
              throw new Error('Payment signature verification failed');
            }

            // If verification successful, proceed with order creation
            await handleOrderCreation(response.razorpay_payment_id, orderNumber);
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
            console.error('Payment verification error:', error);
          }
        },
        notes: {
          address: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}`,
        },
      };

      // Store current checkout state
      setStoredCheckoutState({
        step,
        shippingDetails
      });

      // Close the checkout dialog
      onClose();

      // Small delay to ensure checkout is closed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Store original styles for cleanup
      (window as any).originalStyles = {
        bodyPointerEvents: document.body.style.pointerEvents,
        htmlPointerEvents: document.documentElement.style.pointerEvents,
        bodyOverflow: document.body.style.overflow,
      };

      // Open Razorpay modal
      const razorpay = new window.Razorpay({
        ...options,
        modal: {
          ...options.modal,
          backdropClose: false,  // Prevent closing on backdrop click
          escape: false, // Prevent escape key from closing
          animation: false, // Disable animation to prevent focus issues
          onopen: () => {
            const focusRazorpayFrame = () => {
              const rzpFrame = document.querySelector('iframe[src*="razorpay"]') as HTMLIFrameElement;
              if (rzpFrame) {
                // Set frame styles
                rzpFrame.style.zIndex = '999999';
                
                // Simple one-time focus
                setTimeout(() => {
                  rzpFrame.focus();
                }, 100);
                
                // Stop trying to find the frame
                return;
              }
              
              // Retry if frame not found
              setTimeout(focusRazorpayFrame, 10);
            };
            focusRazorpayFrame();
          },
          ondismiss: () => {
            // Restore original styles
            if ((window as any).originalStyles) {
              document.body.style.pointerEvents = (window as any).originalStyles.bodyPointerEvents;
              document.documentElement.style.pointerEvents = (window as any).originalStyles.htmlPointerEvents;
              document.body.style.overflow = (window as any).originalStyles.bodyOverflow;
              delete (window as any).originalStyles;
            }
            
            // Remove any overlay
            if ((window as any).rzpOverlay) {
              if (document.body.contains((window as any).rzpOverlay)) {
                document.body.removeChild((window as any).rzpOverlay);
              }
              delete (window as any).rzpOverlay;
            }

            // Re-enable all focusable elements
            const focusableElements = document.querySelectorAll('[disabled="true"]');
            focusableElements.forEach(el => {
              (el as HTMLElement).removeAttribute('disabled');
              (el as HTMLElement).style.pointerEvents = '';
            });

            // Remove inert attribute from dialogs
            const allDialogs = document.querySelectorAll('[role="dialog"]');
            allDialogs.forEach(dialog => {
              dialog.removeAttribute('inert');
              dialog.removeAttribute('aria-hidden');
              (dialog as HTMLElement).style.pointerEvents = '';
              (dialog as HTMLElement).style.visibility = '';
              (dialog as HTMLElement).style.display = '';
              (dialog as HTMLElement).style.opacity = '';
            });

            // Ensure body scroll is restored
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';
            document.documentElement.style.pointerEvents = '';

            setPaymentLoading(false);
            toast.error('Payment cancelled');
            
            // Reopen the checkout dialog with stored state
            if (storedCheckoutState) {
              onClose(); // Close first to avoid flash
              setTimeout(() => {
                setStep(storedCheckoutState.step);
                setShippingDetails(storedCheckoutState.shippingDetails);
                onOpen();
                setStoredCheckoutState(null);
              }, 100);
            }
          }
        }
      });
      razorpay.open();

    } catch (error) {
      toast.error('Failed to initialize payment. Please try again.');
      setPaymentLoading(false);
    }
  };

  const handleOrderCreation = async (paymentId: string, orderNumber: string) => {
    try {
      // Create order in Firebase with proper structure matching the database
      const orderData = {
        order_number: orderNumber,
        customer_name: user?.displayName || shippingDetails.fullName || 'Customer',
        customer_email: shippingDetails.email || user?.email || '',
        customer_phone: shippingDetails.phone,
        user_phone: shippingDetails.phone,
        user_email: user?.email || '',
        user_id: user?.uid,
        order_items: checkoutItems.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          color: item.color,
          size: item.size,
          quantity: item.quantity
        })),
        items: checkoutItems.map(item => ({
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
        total_amount: finalTotal,
        total: finalTotal,
        payment_method: 'razorpay',
        payment_status: 'completed',
        payment_id: paymentId,
        status: 'confirmed',
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

      // Send email notifications
      try {
        const emailData = {
          orderNumber,
          customerName: orderData.customer_name,
          customerEmail: orderData.customer_email,
          customerPhone: orderData.customer_phone,
          items: orderData.order_items,
          totalAmount: orderData.total_amount,
          shippingAddress: orderData.shipping_address,
          paymentId
        };

        // Send admin notification email
        const adminEmailSent = await emailService.sendOrderNotificationToAdmin(emailData);

        // Send customer confirmation email
        if (orderData.customer_email) {
          const customerEmailSent = await emailService.sendOrderConfirmationToCustomer(emailData);
        }
      } catch (emailError) {
        // Don't fail the order if email fails
      }

      // Clear cart only if it's not a "Buy Now" order
      if (!buyNowItem) {
        clearCart();
      }

      // Restore original checkout state
      onClose();  // Close first to avoid flash
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      
      // Reopen checkout and restore state
      setStep('confirmation');
      onClose();
      onOpen();
      
      toast.success('Order placed successfully! Payment completed.');

    } catch (error) {
      toast.error('Order creation failed. Please contact support with your payment ID: ' + paymentId);
    } finally {
      setPaymentLoading(false);
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
        <User className="mx-auto h-12 w-12 text-primary mb-4" />
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
            <span>Shipping (Free)</span>
            <span>{formatPrice(shippingFee)}</span>
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
                  <span>Shipping (Free)</span>
                  <span>{formatPrice(shippingFee)} </span>
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
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Secure Payment
                </h4>
                <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Razorpay Secure Payment</p>
                      <p className="text-sm text-muted-foreground">
                        Pay securely using Cards, UPI, Net Banking, or Wallets
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>256-bit SSL encrypted • PCI DSS compliant</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-1">Accepted Payment Methods:</p>
                  <p>💳 Visa, Mastercard, RuPay • 📱 UPI, PhonePe, Google Pay • 🏦 Net Banking • 💰 Wallets</p>
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
        <Button 
          onClick={handlePayment} 
          disabled={paymentLoading} 
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {paymentLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Pay Securely
            </>
          )}
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
        <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground">
          Your order has been confirmed and payment is completed. We'll send you updates via email and SMS.
        </p>
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Order Status:</strong> Confirmed<br />
            <strong>Payment Status:</strong> Completed<br />
            <strong>Next Step:</strong> Order processing & shipping
          </p>
        </div>
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
