import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertTriangle } from 'lucide-react';
import { auth } from '@/integrations/firebase/config';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { toast } from 'sonner';

interface EmailAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const EmailAuth: React.FC<EmailAuthProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleButton, setShowGoogleButton] = useState(true);

  // Handle Google redirect result when component mounts
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          toast.success('Signed in with Google successfully!');
          onSuccess(result.user);
          onClose();
          resetForm();
        }
      } catch (error: any) {
        console.error('Google redirect error:', error);
        if (error.code === 'auth/operation-not-allowed') {
          setError('Google Sign-In is not enabled. Please use email/password or contact administrator.');
          setShowGoogleButton(false);
        } else {
          setError(getErrorMessage(error.code));
        }
      }
    };

    handleRedirectResult();
  }, [onSuccess, onClose]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userCredential;
      
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast.success('Signed in successfully!');
      }
      
      onSuccess(userCredential.user);
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Email auth error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      try {
        // Try popup first (faster for desktop)
        const userCredential = await signInWithPopup(auth, provider);
        toast.success('Signed in with Google successfully!');
        onSuccess(userCredential.user);
        onClose();
        resetForm();
      } catch (popupError: any) {
        // If popup fails due to COOP or other issues, fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message.includes('Cross-Origin-Opener-Policy')) {
          await signInWithRedirect(auth, provider);
          // The redirect will handle the success automatically
        } else {
          throw popupError; // Re-throw other errors
        }
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      
      if (error.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled. Please use email/password or contact administrator.');
        setShowGoogleButton(false);
      } else {
        setError(getErrorMessage(error.code));
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(getErrorMessage(error.code));
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Trying alternative method...';
      case 'auth/popup-blocked':
        return 'Popup was blocked. Redirecting to sign-in page...';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setIsSignUp(false);
    setShowGoogleButton(true); // Reset Google button visibility
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="email-auth-description">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </DialogTitle>
        </DialogHeader>

        <div id="email-auth-description" className="space-y-4">
          {/* Google Sign In Button - only show if enabled */}
          {showGoogleButton && (
            <>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-11"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
            </>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </Button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div className="text-center space-y-2">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
              className="text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one"
              }
            </Button>

            {!isSignUp && (
              <Button
                variant="link"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-sm text-muted-foreground"
              >
                Forgot password?
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailAuth;
