import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zM10 10c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <Sparkles className="h-8 w-8 text-saree-gold opacity-60" />
      </div>
      <div className="absolute top-32 right-20 animate-float" style={{ animationDelay: '1s' }}>
        <Star className="h-6 w-6 text-saree-saffron opacity-50" />
      </div>
      <div className="absolute bottom-32 left-16 animate-float" style={{ animationDelay: '2s' }}>
        <Sparkles className="h-10 w-10 text-saree-burgundy opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-fade-up">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 rounded-full bg-saree-gold/10 text-saree-burgundy text-sm font-medium border border-saree-gold/20 animate-scale-in">
                ✨ Premium Collection 2024
              </span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
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

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl">
              Discover our exquisite collection of handcrafted sarees, where tradition meets contemporary fashion. Each piece tells a story of heritage and artistry.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="gradient-primary text-primary-foreground hover:scale-105 transition-smooth shadow-elegant group"
              >
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
              >
                View Catalog
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-border">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Unique Designs</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-sm text-muted-foreground">Years Legacy</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative overflow-hidden rounded-2xl shadow-elegant hover-lift">
                <div 
                  className="aspect-[3/4] bg-gradient-primary flex items-center justify-center text-primary-foreground"
                  style={{ minHeight: '500px' }}
                >
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="w-24 h-24 mx-auto bg-primary-foreground/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Featured Saree</h3>
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