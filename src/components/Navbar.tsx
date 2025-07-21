
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Menu, 
  X, 
  Heart,
  Home,
  Grid3X3,
  Info,
  Phone
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from '@/components/CartDrawer';
import ClerkAuthComponent, { UserProfile } from '@/components/ClerkAuthComponent';
import { useUser } from '@clerk/clerk-react';

const Navbar = () => {
  const { getTotalItems } = useCart();
  const { isSignedIn } = useUser();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const cartCount = getTotalItems();

  const navigationItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Sarees', href: '/sarees', icon: Grid3X3 },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Phone },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to sarees page with search query
      window.location.href = `/sarees?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="font-display text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                VedhaTrendz
              </h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wide">SAREE COLLECTION</p>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-smooth font-medium relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search sarees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-muted/50 border-border focus:border-primary"
                />
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Search Button - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="hover-glow">
                <Heart className="h-5 w-5" />
              </Button>

              {/* Profile */}
              {isSignedIn ? (
                <UserProfile />
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover-glow"
                  onClick={() => setIsAuthOpen(true)}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}

              {/* Shopping Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover-glow"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-saree-saffron text-primary-foreground animate-pulse-slow"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="mb-6">
                      <h2 className="font-display text-xl font-bold gradient-primary bg-clip-text text-transparent">
                        Navigation
                      </h2>
                    </div>
                    {navigationItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.href}
                          className="flex items-center space-x-3 text-foreground hover:text-primary transition-smooth py-2 px-3 rounded-lg hover:bg-muted/50"
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-fade-in">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search sarees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-muted/50 border-border focus:border-primary"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>
      </nav>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ClerkAuthComponent 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        mode="signin" 
      />
    </>
  );
};

export default Navbar;
