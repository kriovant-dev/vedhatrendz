
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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

const Footer = () => {
  const footerSections = [
    {
      title: "Help",
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Shipping Policy", href: "/shipping-policy" },
        { label: "Refund Policy", href: "/refund-policy" },
        { label: "Reset Password", href: "/reset-password" }
      ]
    },
    {
      title: "Discover",
      links: [
        { label: "Shop", href: "/sarees" },
        { label: "My Orders", href: "/orders" },
        { label: "My Account", href: "/profile" },
        { label: "About Us", href: "/about" },
        { label: "Admin Panel", href: "/admin" }
      ]
    },
    {
      title: "Customer Care",
      links: [
        { label: "Size Guide", href: "/size-guide" },
        { label: "Care Instructions", href: "/care" },
        { label: "Shipping Info", href: "/shipping" },
        { label: "Returns & Exchange", href: "/returns" },
        { label: "Track Order", href: "/track" },
        { label: "FAQ", href: "/faq" }
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
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button 
                  variant="secondary" 
                  className="bg-saree-gold text-primary hover:bg-saree-gold/90 whitespace-nowrap"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-primary-foreground/60">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
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
                Your trusted destination for authentic, handcrafted sarees that celebrate the rich heritage of Indian textiles. Quality, tradition, and elegance in every thread.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-saree-gold" />
                <span className="text-sm text-primary-foreground/80">
                  Somewhere in the world, Gujarat, India 530001
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-saree-gold" />
                <span className="text-sm text-primary-foreground/80">
                  +91 XXXXX XXXXX 
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-saree-gold" />
                <span className="text-sm text-primary-foreground/80">
                  info@vedhatrendz.com
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
                    <a
                      href={link.href}
                      className="text-sm text-primary-foreground/80 hover:text-saree-gold transition-smooth"
                    >
                      {link.label}
                    </a>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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
            <div className="flex flex-col items-center gap-2">
              <CreditCard className="h-8 w-8 text-saree-gold" />
              <div className="text-sm font-medium">Easy Returns</div>
              <div className="text-xs text-primary-foreground/60">30-day policy</div>
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
