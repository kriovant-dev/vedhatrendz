import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Heart, 
  LogOut, 
  Settings, 
  ShoppingBag,
  Phone,
  Calendar,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseClient } from '@/integrations/firebase/client';

interface FirebaseUserProfileProps {
  className?: string;
}

interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

const FirebaseUserProfile: React.FC<FirebaseUserProfileProps> = ({ className = '' }) => {
  const { user, logout, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data } = await FirebaseClient.getSingle('user_profiles', [
        { field: 'user_id', operator: '==', value: user?.uid }
      ]);
      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  if (!isSignedIn || !user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleWishlist = () => {
    setIsOpen(false);
    navigate('/wishlist');
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleOrders = () => {
    setIsOpen(false);
    navigate('/orders');
  };

  const handleCart = () => {
    setIsOpen(false);
    navigate('/cart');
  };

  // Get user initials for avatar fallback
  const getInitials = (): string => {
    if (userProfile?.name) {
      const names = userProfile.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return userProfile.name.slice(0, 2).toUpperCase();
    }
    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.displayName.slice(0, 2).toUpperCase();
    }
    if (user.phoneNumber) {
      return user.phoneNumber.slice(-2);
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = (): string => {
    if (userProfile?.name) return userProfile.name;
    if (user.displayName) return user.displayName;
    if (user.phoneNumber) return user.phoneNumber;
    return 'User';
  };

  // Get phone number
  const getPhoneNumber = (): string => {
    if (userProfile?.phone) return userProfile.phone;
    if (user.phoneNumber) return user.phoneNumber;
    return 'Not provided';
  };

  // Calculate days since joined
  const getDaysSinceJoined = (): number => {
    if (user.metadata?.creationTime) {
      const joinDate = new Date(user.metadata.creationTime);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - joinDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative h-10 w-10 rounded-full ${className}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || undefined} alt={getDisplayName()} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
        {/* User Info Header */}
        <div className="p-4 bg-primary/5 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.photoURL || undefined} alt={getDisplayName()} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {getDisplayName()}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Phone className="h-3 w-3 mr-1" />
                <span className="truncate">{getPhoneNumber()}</span>
              </div>
              {getDaysSinceJoined() > 0 && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    Member for {getDaysSinceJoined()} days
                  </span>
                  <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0.5">
                    <Shield className="h-2 w-2 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <DropdownMenuItem 
            className="cursor-pointer p-3 rounded-md"
            onClick={handleProfile}
          >
            <User className="h-4 w-4 mr-3 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">My Profile</span>
              <span className="text-xs text-muted-foreground">
                Manage account settings
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer p-3 rounded-md"
            onClick={handleOrders}
          >
            <ShoppingBag className="h-4 w-4 mr-3 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">My Orders</span>
              <span className="text-xs text-muted-foreground">
                Track and manage orders
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer p-3 rounded-md"
            onClick={handleWishlist}
          >
            <Heart className="h-4 w-4 mr-3 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">My Wishlist</span>
              <span className="text-xs text-muted-foreground">
                Saved items and favorites
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer p-3 rounded-md"
            onClick={handleCart}
          >
            <ShoppingBag className="h-4 w-4 mr-3 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">Shopping Cart</span>
              <span className="text-xs text-muted-foreground">
                View cart items
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem 
            className="cursor-pointer p-3 rounded-md text-destructive focus:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <div className="flex flex-col">
              <span className="font-medium">Sign Out</span>
              <span className="text-xs opacity-80">
                Sign out of your account
              </span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FirebaseUserProfile;
