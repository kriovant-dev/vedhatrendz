
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { firebase } from '@/integrations/firebase/client';
import { useCart } from '@/contexts/CartContext';
import { ImageKitService } from '@/services/imagekitService';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number;
  rating: number;
  reviews_count: number;
  category: string;
  colors: string[];
  is_new: boolean;
  is_bestseller: boolean;
  images: string[];
}

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await firebase
        .from('products')
        .select('id, name, price, original_price, rating, reviews_count, category, colors, is_new, is_bestseller, images')
        .limit(4)
        .execute();
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price / 100);
  };

  const getColorClass = (color: string) => {
    const colorMap = {
      burgundy: 'bg-saree-burgundy',
      gold: 'bg-saree-gold',
      emerald: 'bg-saree-emerald',
      'royal-blue': 'bg-saree-royal-blue',
      saffron: 'bg-saree-saffron',
      rose: 'bg-saree-rose',
      purple: 'bg-purple-500',
      silver: 'bg-gray-400',
      black: 'bg-black',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      cream: 'bg-amber-100',
      pink: 'bg-pink-500',
      orange: 'bg-orange-500'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-400';
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    
    // Add to cart with default selections
    const defaultColor = product.colors?.[0] || 'default';
    const defaultSize = 'M';
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      color: defaultColor,
      size: defaultSize,
      quantity: 1,
      image: product.images?.[0] ? ImageKitService.getOptimizedImageUrl(product.images[0], { width: 150, height: 200 }) : undefined
    });
    
    toast.success(`${product.name} added to cart!`);
  };

  const handleLike = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    // For now, just show a toast. In a real app, you'd save to user preferences/wishlist
    toast.success('Added to wishlist!');
    console.log('Liked product:', productId);
  };

  const handleQuickView = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    // Navigate to product detail page
    navigate(`/product/${productId}`);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="gradient-primary bg-clip-text text-transparent">
                Featured
              </span>
              <span className="text-foreground"> Collection</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-[3/4] bg-muted"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
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
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">
              Featured
            </span>
            <span className="text-foreground"> Collection</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked sarees that embody the perfect blend of traditional craftsmanship and contemporary elegance
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Card 
              key={product.id} 
              className="group hover-lift transition-smooth border-border overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleProductClick(product.id)}
            >
              <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  {/* Product Image */}
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={ImageKitService.getOptimizedImageUrl(product.images[0], { 
                        width: 400, 
                        height: 533,
                        quality: 85,
                        format: 'webp'
                      })}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                      <div className="text-center text-primary-foreground">
                        <div className="mb-2 text-4xl">👗</div>
                        <div className="text-sm font-medium">{product.category}</div>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.is_new && (
                      <Badge className="bg-saree-saffron text-primary-foreground">
                        New
                      </Badge>
                    )}
                    {product.is_bestseller && (
                      <Badge className="bg-saree-burgundy text-primary-foreground">
                        Bestseller
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8 hover-glow"
                      onClick={(e) => handleLike(e, product.id)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8 hover-glow"
                      onClick={(e) => handleQuickView(e, product.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button 
                        className="w-full gradient-primary text-primary-foreground hover:scale-105 transition-smooth"
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Category */}
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-smooth">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-saree-gold text-saree-gold" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
                  </div>

                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-1 mb-3">
                      {product.colors.slice(0, 4).map((color) => (
                        <div
                          key={color}
                          className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${getColorClass(color)}`}
                        />
                      ))}
                      {product.colors.length > 4 && (
                        <div className="w-4 h-4 rounded-full bg-muted border-2 border-white shadow-sm flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">+</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>

                  {/* Discount */}
                  {product.original_price && product.original_price > product.price && (
                    <div className="mt-1">
                      <span className="text-xs text-saree-saffron font-medium">
                        {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 animate-fade-up">
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
            onClick={() => navigate('/sarees')}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
