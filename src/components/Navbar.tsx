
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Menu, 
  X, 
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
import EmailAuth from '@/components/EmailAuth';
import FirebaseUserProfile from '@/components/FirebaseUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { SearchService } from '../services/searchService';

const Navbar = () => {
  const { getTotalItems } = useCart();
  const { isSignedIn } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const cartCount = getTotalItems();

  const navigationItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Collections', href: '/sarees', icon: Grid3X3 },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Phone },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const result = await SearchService.performSearch(searchQuery.trim());
        
        if (result.type === 'product') {
          // Redirect to specific product page
          window.location.href = result.redirectUrl;
        } else {
          // Fall back to search page
          window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
        }
      } catch (error) {
        console.error('Search error:', error);
        // Fall back to search page on error
        window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      }
    }
  };

  return (
    <>
      <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-soft">
        <div className="max-w-7xl mx-auto mobile-padding">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="font-display text-xl sm:text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                VedhaTrendz
              </h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wide hidden sm:block">SAREE COLLECTION</p>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-smooth font-medium relative group mobile-text"
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
                  className="pl-10 pr-4 py-2 w-48 xl:w-64 bg-muted/50 border-border focus:border-primary text-sm"
                />
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Button - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mobile-icon-button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Profile */}
              {isSignedIn ? (
                <FirebaseUserProfile />
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover-glow mobile-icon-button"
                  onClick={() => setIsAuthOpen(true)}
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              )}

              {/* Shopping Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover-glow relative mobile-icon-button"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 text-xs p-0 flex items-center justify-center"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden mobile-icon-button"
                  >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
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
            <div className="lg:hidden py-3 sm:py-4 border-t border-border animate-fade-in">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search sarees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-muted/50 border-border focus:border-primary text-sm sm:text-base"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>
      </nav>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <EmailAuth 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={() => setIsAuthOpen(false)}
      />
    </>
  );
};

export default Navbar;
