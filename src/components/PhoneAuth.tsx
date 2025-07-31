import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { auth } from '@/integrations/firebase/config';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';
import { toast } from 'sonner';

interface PhoneAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({ isOpen, onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Initialize reCAPTCHA verifier
  const initializeRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
        }
      });
      setRecaptchaVerifier(verifier);
      return verifier;
    }
    return recaptchaVerifier;
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      setError('Please enter a valid phone number');
      return;
    }

    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    setLoading(true);
    setError('');
    setShowSetupGuide(false);

    try {
      const verifier = initializeRecaptcha();
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Phone authentication is not configured in Firebase Console.';
        setShowSetupGuide(true);
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
      }
      
      setError(errorMessage);
      
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || !confirmationResult) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      toast.success('Phone number verified successfully!');
      onSuccess(user);
      handleClose();
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    setOtp('');
    setStep('phone');
    setError('');
    setConfirmationResult(null);
    setShowSetupGuide(false);
    
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      setRecaptchaVerifier(null);
    }
    
    onClose();
  };

  const handleResendOTP = async () => {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      setRecaptchaVerifier(null);
    }
    setStep('phone');
    setOtp('');
    setError('');
    setShowSetupGuide(false);
    await handleSendOTP();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Phone Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {showSetupGuide ? (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Phone authentication needs to be enabled in Firebase Console first.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://console.firebase.google.com/project/vedhatrendz-demo/authentication/providers', '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Firebase Console
                </Button>
                
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Quick Setup:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to Authentication → Sign-in method</li>
                    <li>Enable "Phone" provider</li>
                    <li>Save and refresh this page</li>
                  </ol>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSetupGuide(false);
                    setError('');
                  }}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              {step === 'phone' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                        +91
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="rounded-l-none"
                        maxLength={10}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We'll send you a verification code via SMS
                    </p>
                  </div>

                  <Button 
                    onClick={handleSendOTP} 
                    disabled={loading || phoneNumber.length !== 10}
                    className="w-full"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Phone className="mr-2 h-4 w-4" />
                    Send OTP
                  </Button>
                </>
              )}

              {step === 'otp' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code sent to +91{phoneNumber}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={handleVerifyOTP} 
                      disabled={loading || otp.length !== 6}
                      className="w-full"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify & Continue
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="w-full"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Hidden reCAPTCHA container */}
          <div id="recaptcha-container"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneAuth;
