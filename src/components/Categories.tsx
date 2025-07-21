import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const Categories = () => {
  const categories = [
    {
      id: 1,
      name: "Wedding Sarees",
      description: "Luxurious bridal collection",
      productCount: 156,
      image: "wedding-sarees",
      gradient: "bg-gradient-to-br from-saree-burgundy to-saree-gold"
    },
    {
      id: 2,
      name: "Silk Sarees",
      description: "Premium silk varieties",
      productCount: 203,
      image: "silk-sarees",
      gradient: "bg-gradient-to-br from-saree-royal-blue to-saree-emerald"
    },
    {
      id: 3,
      name: "Cotton Sarees",
      description: "Comfort meets style",
      productCount: 298,
      image: "cotton-sarees",
      gradient: "bg-gradient-to-br from-saree-saffron to-saree-rose"
    },
    {
      id: 4,
      name: "Designer Sarees",
      description: "Contemporary fusion",
      productCount: 142,
      image: "designer-sarees",
      gradient: "bg-gradient-to-br from-saree-emerald to-saree-burgundy"
    },
    {
      id: 5,
      name: "Festive Sarees",
      description: "Celebration ready",
      productCount: 187,
      image: "festive-sarees",
      gradient: "bg-gradient-to-br from-saree-gold to-saree-saffron"
    },
    {
      id: 6,
      name: "Office Wear",
      description: "Professional elegance",
      productCount: 95,
      image: "office-wear",
      gradient: "bg-gradient-to-br from-saree-royal-blue to-saree-burgundy"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Shop by </span>
            <span className="gradient-primary bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collections designed for every occasion and style preference
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={category.id}
              className="group cursor-pointer border-border hover-lift transition-smooth overflow-hidden animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                <div className="relative">
                  {/* Category Image/Gradient */}
                  <div className={`aspect-[4/3] ${category.gradient} flex items-center justify-center relative overflow-hidden`}>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zM10 10c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '40px 40px'
                      }} />
                    </div>

                    {/* Category Icon */}
                    <div className="relative z-10 text-center text-white">
                      <div className="mb-4">
                        <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-2xl">👗</span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-smooth" />
                  </div>

                  {/* Category Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-smooth mb-1">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {category.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {category.productCount} products
                      </span>
                      <div className="h-1 w-12 bg-primary/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Special Offers Banner */}
        <div className="mt-16 animate-fade-up">
          <Card className="border-saree-gold/30 bg-gradient-gold overflow-hidden">
            <CardContent className="p-8 text-center">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
                Special Collection Launch
              </h3>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                Discover our exclusive new arrivals featuring handwoven masterpieces from master artisans across India
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center justify-center gap-2 text-primary-foreground/90">
                  <span className="text-sm">🎉 Up to 40% OFF</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-primary-foreground/90">
                  <span className="text-sm">🚚 Free Shipping</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-primary-foreground/90">
                  <span className="text-sm">💎 Premium Quality</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Categories;