import React, { useState } from 'react';
import { useClerk, useSignIn, useSignUp } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Phone, Lock, ArrowLeft } from 'lucide-react';

interface ClerkPhoneAuthProps {
  isOpen?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
  embedded?: boolean; // Whether to show as dialog or embedded component
}

const ClerkPhoneAuth: React.FC<ClerkPhoneAuthProps> = ({ 
  isOpen = true, 
  onSuccess, 
  onClose, 
  embedded = false 
}) => {
  const { setActive } = useClerk();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Format phone number with country code
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with country code, use as is
    if (digits.startsWith('91') && digits.length === 12) {
      return `+${digits}`;
    }
    
    // If it's a 10-digit Indian number, add +91
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    
    // Return with + if not present
    return digits.startsWith('+') ? digits : `+${digits}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInLoaded || !signUpLoaded) {
      toast.error('Authentication not ready. Please try again.');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('Attempting phone auth for:', formattedPhone);

      // First, try to sign in with existing phone number
      try {
        const signInAttempt = await signIn.create({
          identifier: formattedPhone,
        });

        if (signInAttempt.status === 'needs_first_factor') {
          // Phone number exists, prepare for OTP verification
          const phoneCodeFactor = signInAttempt.supportedFirstFactors.find(
            (factor) => factor.strategy === 'phone_code'
          );

          if (phoneCodeFactor) {
            await signIn.prepareFirstFactor({
              strategy: 'phone_code',
              phoneNumberId: phoneCodeFactor.phoneNumberId,
            });

            setStep('verification');
            setAttemptId('signin');
            toast.success('OTP sent to your phone number');
          } else {
            throw new Error('Phone verification not supported for this number');
          }
        } else if (signInAttempt.status === 'complete') {
          // Already authenticated
          await setActive({ session: signInAttempt.createdSessionId });
          toast.success('Signed in successfully!');
          onSuccess?.();
        }
      } catch (signInError: any) {
        console.log('Sign in failed, trying sign up:', signInError.message);

        // If sign in fails, try to sign up (new user)
        try {
          const signUpAttempt = await signUp.create({
            phoneNumber: formattedPhone,
          });

          if (signUpAttempt.status === 'missing_requirements') {
            // Need to verify phone number
            await signUp.preparePhoneNumberVerification({
              strategy: 'phone_code',
            });

            setStep('verification');
            setAttemptId('signup');
            toast.success('OTP sent to your phone number');
          } else if (signUpAttempt.status === 'complete') {
            // Registration complete
            await setActive({ session: signUpAttempt.createdSessionId });
            toast.success('Account created and signed in successfully!');
            onSuccess?.();
          }
        } catch (signUpError: any) {
          console.error('Sign up error:', signUpError);
          toast.error(signUpError.errors?.[0]?.message || 'Failed to send OTP. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Phone auth error:', error);
      toast.error('Failed to process phone number. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);

    try {
      if (attemptId === 'signin') {
        // Complete sign in
        const result = await signIn.attemptFirstFactor({
          strategy: 'phone_code',
          code: verificationCode,
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          toast.success('Signed in successfully!');
          onSuccess?.();
        } else {
          toast.error('Verification failed. Please try again.');
        }
      } else if (attemptId === 'signup') {
        // Complete sign up
        const result = await signUp.attemptPhoneNumberVerification({
          code: verificationCode,
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          toast.success('Account created successfully!');
          onSuccess?.();
        } else {
          toast.error('Verification failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.errors?.[0]?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (attemptId === 'signin') {
        const phoneCodeFactor = signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'phone_code'
        );
        
        if (phoneCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId: phoneCodeFactor.phoneNumberId,
          });
        }
      } else if (attemptId === 'signup') {
        await signUp.preparePhoneNumberVerification({
          strategy: 'phone_code',
        });
      }
      toast.success('New OTP sent to your phone');
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhoneNumber('');
    setVerificationCode('');
    setAttemptId(null);
  };

  const PhoneStep = () => (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">Welcome to VedhaTrendz</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your phone number to sign in or create an account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-foreground">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number (e.g., 9876543210)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-center text-lg h-12"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              We'll send you a verification code via SMS
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base" 
            disabled={isLoading || !phoneNumber.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
        
        {!embedded && onClose && (
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const VerificationStep = () => (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">Verify Your Phone</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter the 6-digit code sent to <span className="font-medium">{phoneNumber}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleVerificationSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-medium text-foreground">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-xl tracking-[0.5em] h-12 font-mono"
              disabled={isLoading}
              autoFocus
              maxLength={6}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base" 
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Continue'
            )}
          </Button>
        </form>
        
        <div className="space-y-3">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleResendCode}
            disabled={isLoading}
            className="w-full text-sm"
          >
            Didn't receive code? Resend
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetForm}
            disabled={isLoading}
            className="w-full text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Phone Number
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const content = step === 'phone' ? <PhoneStep /> : <VerificationStep />;

  if (embedded) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Phone Authentication</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default ClerkPhoneAuth;
