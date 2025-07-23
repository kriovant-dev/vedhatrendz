import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ClerkPhoneAuth from '@/components/ClerkPhoneAuth';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Phone, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

const AuthExample: React.FC = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [showAuth, setShowAuth] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    toast.success('Welcome to VedhaTrendz!');
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Clerk Phone Authentication Demo
          </h1>
          <p className="text-muted-foreground">
            Simple phone-only authentication with Clerk API
          </p>
        </div>

        {isSignedIn ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome Back!
              </CardTitle>
              <CardDescription>
                You are successfully authenticated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Phone:</strong> {user.primaryPhoneNumber?.phoneNumber || 'Not available'}</p>
                <p><strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
              
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Authentication
              </CardTitle>
              <CardDescription>
                Sign in or create account with just your phone number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAuth(true)} className="w-full">
                Continue with Phone Number
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Embedded version example */}
        {!isSignedIn && (
          <Card>
            <CardHeader>
              <CardTitle>Embedded Authentication</CardTitle>
              <CardDescription>
                You can also use the component embedded directly in your page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClerkPhoneAuth 
                embedded={true}
                onSuccess={handleAuthSuccess}
              />
            </CardContent>
          </Card>
        )}

        {/* Dialog version */}
        <ClerkPhoneAuth 
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
};

export default AuthExample;
