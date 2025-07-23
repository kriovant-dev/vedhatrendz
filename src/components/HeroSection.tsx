import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Sparkles } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[80vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zM10 10c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements - Hidden on mobile for performance */}
      <div className="absolute top-20 left-10 animate-float hidden sm:block">
        <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-saree-gold opacity-60" />
      </div>
      <div className="absolute top-32 right-20 animate-float hidden sm:block" style={{ animationDelay: '1s' }}>
        <Star className="h-4 w-4 sm:h-6 sm:w-6 text-saree-saffron opacity-50" />
      </div>
      <div className="absolute bottom-32 left-16 animate-float hidden sm:block" style={{ animationDelay: '2s' }}>
        <Sparkles className="h-6 w-6 sm:h-10 sm:w-10 text-saree-burgundy opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto mobile-padding">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-fade-up">
            <div className="mb-4 sm:mb-6">
              <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-saree-gold/10 text-saree-burgundy mobile-small-text sm:text-sm font-medium border border-saree-gold/20 animate-scale-in">
                ✨ Premium Collection 2025
              </span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 sm:mb-6">
              <span className="gradient-primary bg-clip-text text-transparent">
                Timeless
              </span>
              <br />
              <span className="text-foreground">
                Elegance
              </span>
              <br />
              <span className="text-saree-saffron">
                Redefined
              </span>
            </h1>

            <p className="mobile-text sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-xl">
              Discover our exquisite collection of handcrafted sarees, where tradition meets contemporary fashion. Each piece tells a story of heritage and artistry.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="gradient-primary text-primary-foreground hover:scale-105 transition-smooth shadow-elegant group mobile-button sm:px-6 sm:py-3"
                onClick={() => navigate('/sarees')}
              >
                Explore Collection
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-smooth" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
              <div className="text-center lg:text-left">
                <div className="text-lg sm:text-2xl font-bold text-primary">500+</div>
                <div className="mobile-small-text text-muted-foreground">Unique Designs</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-lg sm:text-2xl font-bold text-primary">1000+</div>
                <div className="mobile-small-text text-muted-foreground">Happy Customers</div>
              </div>
              {/* <div className="text-center lg:text-left">
                <div className="text-lg sm:text-2xl font-bold text-primary">1+</div>
                <div className="mobile-small-text text-muted-foreground">Years Legacy</div>
              </div> */}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in mt-8 lg:mt-0">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative overflow-hidden rounded-2xl shadow-elegant hover-lift">
                <div 
                  className="aspect-[3/4] bg-gradient-primary flex items-center justify-center text-primary-foreground"
                  style={{ minHeight: '400px' }}
                >
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-primary-foreground/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 sm:w-12 sm:h-12" />
                      </div>
                    </div>
                    <h3 className="mobile-text sm:text-2xl font-bold mb-2">Featured Saree</h3>
                    <p className="text-primary-foreground/80">Handwoven Banarasi Silk</p>
                  </div>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-smooth">
                  <div className="absolute bottom-6 left-6 text-white">
                    <h4 className="text-xl font-semibold mb-2">Royal Heritage</h4>
                    <p className="text-white/90">From ₹15,999</p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-saree-gold rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-saree-saffron rounded-full blur-2xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-6 top-1/4 animate-float">
              <div className="bg-card border border-border rounded-lg p-4 shadow-soft backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-saree-gold fill-current" />
                  <span className="text-sm font-medium">4.9 Rating</span>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 bottom-1/4 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="bg-card border border-border rounded-lg p-4 shadow-soft backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">Free</div>
                  <div className="text-xs text-muted-foreground">Shipping</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;