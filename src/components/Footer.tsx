import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  CreditCard,
  Shield,
  Truck
} from 'lucide-react';
import { newsletterService } from '@/services/newsletterService';
import { CategoryService } from '@/services/categoryService';
import { useToast } from '@/hooks/use-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ['footer-categories'],
    queryFn: CategoryService.getCategories,
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubscribing(true);
    try {
      const success = await newsletterService.subscribe(email);
      if (success) {
        toast({
          title: "Successfully Subscribed!",
          description: "Thank you for subscribing to our newsletter. You'll receive updates about new collections and exclusive offers.",
        });
        setEmail('');
      } else {
        toast({
          title: "Already Subscribed",
          description: "This email is already subscribed to our newsletter.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: "There was an error subscribing to our newsletter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // Create dynamic footer sections using database categories
  const footerSections = [
    {
      title: "Legal & Policies",
      links: [
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Shipping Policy", href: "/shipping-policy" },
        { label: "Refund Policy", href: "/refund-policy" },
      ]
    },
    {
      title: "Shop & Discover",
      links: [
        { label: "All Sarees", href: "/sarees" },
        ...categories.slice(0, 6).map(category => ({
          label: category.name,
          href: `/sarees?category=${encodeURIComponent(category.name)}`
        }))
      ]
    },
    {
      title: "Customer Support",
      links: [
        { label: "Contact Us", href: "/contact" },
        { label: "FAQ", href: "/faq" },
        { label: "Care Instructions", href: "/care-instructions" },
        { label: "Track Your Order", href: "/orders" },
        { label: "About Us", href: "/about" },
        { label: "Admin Panel", href: "/admin" }
      ]
    }
  ];

  const paymentMethods = ["visa", "mastercard", "paypal", "razorpay", "upi"];
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/vedhatrendz/", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold mb-4">
                Stay in Style
              </h3>
              <p className="text-primary-foreground/80 mb-4">
                Subscribe to our newsletter and be the first to know about new collections, exclusive offers, and styling tips.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Heart className="h-4 w-4" />
                <span>Join 50,000+ fashion enthusiasts</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                  disabled={isSubscribing}
                />
                <Button 
                  type="submit"
                  variant="secondary" 
                  className="bg-saree-gold text-primary hover:bg-saree-gold/90 whitespace-nowrap"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
              <p className="text-xs text-primary-foreground/60">
                By subscribing, you agree to our{' '}
                <Link to="/privacy" className="text-saree-gold hover:underline">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link to="/terms" className="text-saree-gold hover:underline">
                  Terms & Conditions
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold mb-2">
                Vedha Trendz
              </h2>
              <p className="text-primary-foreground/80 leading-relaxed">
                Artistry in every drape - handpicked, handcrafted and unique <br></br>We have sarees for every occasion ranging from festivals, cocktail parties, daytime social events or simply elegant everyday wear .
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-saree-gold" />
                <span className="text-sm text-primary-foreground/80">
                  Vizag, Andhra Pradesh, India
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-saree-gold" />
                <span className="text-sm text-primary-foreground/80">
                  +91 7702284509
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-saree-gold" />
                <span className="text-sm text-primary-foreground/80">
                  vedhatrendz@gmail.com
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 bg-primary-foreground/10 hover:bg-saree-gold hover:text-primary transition-smooth"
                    aria-label={social.label}
                    onClick={() => window.open(social.href, "_blank", "noopener,noreferrer")}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-primary-foreground mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/80 hover:text-saree-gold transition-smooth"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Truck className="h-8 w-8 text-saree-gold" />
              <div className="text-sm font-medium">Free Shipping</div>
              <div className="text-xs text-primary-foreground/60">On orders above ₹999</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-saree-gold" />
              <div className="text-sm font-medium">Secure Payment</div>
              <div className="text-xs text-primary-foreground/60">100% protected</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart className="h-8 w-8 text-saree-gold" />
              <div className="text-sm font-medium">Quality Assured</div>
              <div className="text-xs text-primary-foreground/60">Handpicked collection</div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-primary-foreground/10" />

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-primary-foreground/60">
            © 2025 VedhaTrendz. All rights reserved. | Made with ❤️ in India
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-foreground/60">We accept:</span>
            <div className="flex gap-2">
              {paymentMethods.map((method) => (
                <div
                  key={method}
                  className="w-8 h-6 bg-primary-foreground/20 rounded flex items-center justify-center"
                >
                  <span className="text-xs text-primary-foreground/60">
                    {method.slice(0, 3).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
