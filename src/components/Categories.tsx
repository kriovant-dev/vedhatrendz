import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { CategoryService } from '@/services/categoryService';
import { seedDefaultCategories } from '@/utils/seedCategories';

const Categories = () => {
  const navigate = useNavigate();
  
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const categories = await CategoryService.getCategories();
      
      // If no categories found, seed default ones
      if (categories.length === 0) {
        console.log('🌱 No categories found, seeding default categories...');
        return await seedDefaultCategories();
      }
      
      return categories;
    },
  });

  // Default categories as fallback if no categories are found in database
  const defaultCategories = [
    { id: 'silk', name: 'Silk Sarees', slug: 'silk-sarees', description: 'Luxurious silk sarees for special occasions' },
    { id: 'cotton', name: 'Cotton Sarees', slug: 'cotton-sarees', description: 'Comfortable cotton sarees for daily wear' },
    { id: 'wedding', name: 'Wedding Sarees', slug: 'wedding-sarees', description: 'Bridal and wedding collection' },
    { id: 'designer', name: 'Designer Collection', slug: 'designer-collection', description: 'Exclusive designer sarees' },
    { id: 'casual', name: 'Casual Wear', slug: 'casual-wear', description: 'Everyday casual sarees' },
    { id: 'festive', name: 'Festive Collection', slug: 'festive-collection', description: 'Festival and celebration sarees' }
  ];

  // Use database categories if available, otherwise use defaults
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  // Debug logging
  React.useEffect(() => {
    console.log('📋 Categories Debug Info:');
    console.log(`- Database categories count: ${categories.length}`);
    console.log(`- Display categories count: ${displayCategories.length}`);
    console.log('- Categories data:', categories);
    console.log('- Display categories:', displayCategories);
  }, [categories, displayCategories]);

  // Handle category click - navigate to sarees page with category filter
  const handleCategoryClick = (category: any) => {
    // Create a URL-friendly slug for navigation
    const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/sarees?category=${encodeURIComponent(category.name)}`);
  };

  // Get appropriate icon for category
  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('silk')) return '🧵';
    if (name.includes('cotton')) return '🌿';
    if (name.includes('wedding')) return '💒';
    if (name.includes('designer')) return '✨';
    if (name.includes('party')) return '🎉';
    if (name.includes('casual')) return '👗';
    if (name.includes('festive')) return '🪔';
    if (name.includes('traditional')) return '🏛️';
    return '👗'; // Default icon
  };

  // Gradient options for categories
  const gradientOptions = [
    "bg-gradient-to-br from-saree-burgundy to-saree-gold",
    "bg-gradient-to-br from-saree-royal-blue to-saree-emerald",
    "bg-gradient-to-br from-saree-saffron to-saree-rose",
    "bg-gradient-to-br from-saree-emerald to-saree-burgundy",
    "bg-gradient-to-br from-saree-gold to-saree-saffron",
    "bg-gradient-to-br from-saree-royal-blue to-saree-burgundy",
  ];

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-foreground">Shop by </span>
              <span className="gradient-primary bg-clip-text text-transparent">
                Category
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <div className="p-6">
                    <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-up">
          <h2 className="font-display mobile-heading font-bold mb-4">
            <span className="text-foreground">Shop by </span>
            <span className="gradient-primary bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="mobile-text text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collections designed for every occasion and style preference
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {displayCategories
            .slice(0, 6) // Limit to 6 categories for the home page
            .map((category, index) => (
            <Card 
              key={category.id}
              className="group mobile-card cursor-pointer border-border hover-lift transition-smooth overflow-hidden animate-fade-up hover:shadow-lg hover:border-primary/20 active:scale-[0.98]"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleCategoryClick(category)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCategoryClick(category);
                }
              }}
              aria-label={`Browse ${category.name} collection`}
            >
              <CardContent className="p-0">
                <div className="relative">
                  {/* Category Image/Gradient */}
                  <div className={`aspect-[4/3] sm:aspect-[4/3] ${gradientOptions[index % gradientOptions.length]} flex items-center justify-center relative overflow-hidden`}>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zM10 10c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '40px 40px'
                      }} />
                    </div>

                    {/* Category Icon */}
                    <div className="relative z-10 text-center text-white">
                      <div className="mb-2 sm:mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                          <span className="text-lg sm:text-2xl">{getCategoryIcon(category.name)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-smooth" />
                  </div>

                  {/* Category Info */}
                  <div className="p-3 sm:p-6">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div>
                        <h3 className="mobile-text sm:text-xl font-semibold text-foreground group-hover:text-primary transition-smooth mb-1">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground mobile-small-text hidden sm:block">
                          {category.description || "Discover our collection"}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth flex-shrink-0" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="mobile-small-text text-muted-foreground group-hover:text-primary transition-colors">
                        Click to explore
                      </span>
                      <div className="h-1 w-8 sm:w-12 bg-primary/20 rounded-full overflow-hidden">
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
          <Card 
            className="border-saree-gold/30 bg-gradient-gold overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.99]"
            onClick={() => navigate('/sarees?sort=newest')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/sarees?sort=newest');
              }
            }}
            aria-label="Browse new arrivals collection"
          >
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
              <div className="mt-4 text-primary-foreground/80 text-sm font-medium">
                Click to explore new arrivals →
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Categories;