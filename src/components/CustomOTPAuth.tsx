import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useClerk, useSignIn } from '@clerk/clerk-react';

interface CustomOTPAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CustomOTPAuth: React.FC<CustomOTPAuthProps> = ({ isOpen, onClose, onSuccess }) => {
  const { setActive } = useClerk();
  const { signIn, isLoaded } = useSignIn();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState<string>('');

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Add country code if missing (assuming India +91)
    if (cleanPhone.length === 10) {
      return `+91${cleanPhone}`;
    }
    
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      return `+${cleanPhone}`;
    }
    
    return phone.startsWith('+') ? phone : `+${cleanPhone}`;
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (phoneNumber.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!isLoaded || !signIn) {
      setError('Authentication service not ready');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Create sign-in attempt with Clerk
      const result = await signIn.create({
        identifier: formattedPhone,
      });

      // Prepare phone number verification and store phone number ID
      const phoneVerification = result.supportedFirstFactors.find(
        (factor: any) => factor.strategy === 'phone_code'
      ) as any;

      if (phoneVerification?.phoneNumberId) {
        setPhoneNumberId(phoneVerification.phoneNumberId);
        await result.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId: phoneVerification.phoneNumberId,
        });
      } else {
        throw new Error('Phone verification not available');
      }

      setStep('otp');
      toast.success('OTP sent to your phone number');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      
      // Handle specific Clerk errors
      if (err.errors && err.errors.length > 0) {
        const errorMessage = err.errors[0].message;
        if (errorMessage.includes('identifier')) {
          setError('Phone number not found. Please sign up first.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify the OTP
      const result = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code: otp,
      });

      if (result.status === 'complete') {
        // Sign-in successful
        await setActive({ session: result.createdSessionId });
        toast.success('Successfully signed in!');
        onSuccess?.();
        handleClose();
      } else {
        setError('Sign-in incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      
      if (err.errors && err.errors.length > 0) {
        const errorMessage = err.errors[0].message;
        if (errorMessage.includes('code')) {
          setError('Invalid OTP. Please check and try again.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      if (phoneNumberId) {
        await signIn.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId: phoneNumberId,
        });
        toast.success('OTP resent successfully');
      } else {
        setError('Phone number not found. Please try again.');
      }
    } catch (err: any) {
      console.error('Error resending OTP:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    setError('');
    setPhoneNumberId('');
    onClose();
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
    setPhoneNumberId('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {step === 'phone' ? 'Enter Phone Number' : 'Verify OTP'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                We'll send you an OTP to verify your phone number
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  className="text-center"
                />
                <div className="text-xs text-muted-foreground text-center">
                  Format: 9876543210 or +919876543210
                </div>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Send OTP
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-primary mb-2" />
                <div className="text-sm text-muted-foreground">
                  Enter the 6-digit OTP sent to
                </div>
                <div className="font-medium">{formatPhoneNumber(phoneNumber)}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify OTP
                    </>
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBackToPhone}
                    disabled={loading}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="flex-1"
                  >
                    Resend OTP
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomOTPAuth;
