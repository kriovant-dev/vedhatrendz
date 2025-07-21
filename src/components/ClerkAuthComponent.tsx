import { SignIn, SignUp, useUser, UserButton } from '@clerk/clerk-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Phone } from 'lucide-react';

interface ClerkAuthComponentProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
}

const ClerkAuthComponent: React.FC<ClerkAuthComponentProps> = ({ 
  isOpen, 
  onClose, 
  mode = 'signin' 
}) => {
  const { isSignedIn, user } = useUser();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(mode);

  if (isSignedIn) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {authMode === 'signin' ? (
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-primary hover:bg-primary/90',
                  card: 'shadow-none border-none'
                }
              }}
              afterSignInUrl="/"
              redirectUrl="/"
            />
          ) : (
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-primary hover:bg-primary/90',
                  card: 'shadow-none border-none'
                }
              }}
              afterSignUpUrl="/"
              redirectUrl="/"
            />
          )}
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-sm"
            >
              {authMode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Component for showing user info when signed in
export const UserProfile: React.FC = () => {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <UserButton 
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8'
          }
        }}
        afterSignOutUrl="/"
      />
      <span className="text-sm hidden sm:inline">
        {user?.primaryPhoneNumber?.phoneNumber || user?.firstName || 'User'}
      </span>
    </div>
  );
};

export default ClerkAuthComponent;
