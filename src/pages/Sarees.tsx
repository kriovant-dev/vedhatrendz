
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Search, Star, ShoppingBag, ArrowLeft } from 'lucide-react';
import { firebase } from '@/integrations/firebase/client';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { ImageKitService } from '@/services/imagekitService';
import { SearchService } from '../services/searchService';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number;
  images: string[];
  category: string;
  fabric: string;
  occasion: string;
  rating: number;
  reviews_count: number;
  colors: string[];
}

const Sarees = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Handle URL parameters on component mount and when searchParams change
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      console.log('Category param from URL:', categoryParam);
      setSelectedCategory(categoryParam);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }

    // Scroll to top when parameters change (especially for category navigation)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  // Scroll to top on initial page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle search form submission (same functionality as Navbar search)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const result = await SearchService.performSearch(searchQuery.trim());
        
        if (result.type === 'product') {
          // Redirect to specific product page
          navigate(result.redirectUrl);
        } else {
          // Continue with current search filtering (no redirect needed)
          console.log('🔍 Performing local search filtering for:', searchQuery.trim());
        }
      } catch (error) {
        console.error('Search error:', error);
        // Fall back to current search filtering
        console.log('🔍 Falling back to local search filtering for:', searchQuery.trim());
      }
    }
  };

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await firebase
        .from('products')
        .select('*')
        .execute();
      
      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch categories for proper matching
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await firebase
        .from('categories')
        .select('*')
        .execute();
      
      if (error) throw error;
      return data;
    },
  });

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let filtered = allProducts;

    console.log('All products:', allProducts.length);
    console.log('Selected category:', selectedCategory);
    console.log('Available categories:', categories);

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.fabric?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      // Find the category that matches either name or slug
      const matchingCategory = categories.find(cat => 
        cat.name === selectedCategory || 
        cat.slug === selectedCategory ||
        cat.name.toLowerCase() === selectedCategory.toLowerCase() ||
        cat.slug?.toLowerCase() === selectedCategory.toLowerCase()
      );

      console.log('Matching category found:', matchingCategory);

      if (matchingCategory) {
        // Filter products that match either the category slug or name
        filtered = filtered.filter(product => {
          const matches = product.category === matchingCategory.slug || 
                         product.category === matchingCategory.name ||
                         product.category.toLowerCase() === matchingCategory.name.toLowerCase() ||
                         product.category.toLowerCase() === matchingCategory.slug?.toLowerCase();
          
          if (matches) {
            console.log('Product matches category:', product.name, 'category:', product.category);
          }
          return matches;
        });
      } else {
        // Fallback: direct string matching
        filtered = filtered.filter(product => {
          const matches = product.category === selectedCategory ||
                         product.category.toLowerCase() === selectedCategory.toLowerCase();
          
          if (matches) {
            console.log('Product matches category (fallback):', product.name, 'category:', product.category);
          }
          return matches;
        });
      }
    }

    console.log('Filtered products:', filtered.length);

    // Filter by price range
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min * 100 && product.price <= max * 100;
        } else {
          return product.price >= min * 100;
        }
      });
    }

    // Sort results
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Keep original order for 'featured'
        break;
    }

    return filtered;
  }, [allProducts, searchQuery, selectedCategory, priceRange, sortBy, categories]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price / 100);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    
    if (!product.colors || product.colors.length === 0) {
      toast.error('Product has no color options available');
      return;
    }

    // Use first available color and size
    const defaultColor = product.colors[0];
    const defaultSize = 'M'; // Default size

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      color: defaultColor,
      size: defaultSize,
      quantity: 1,
      image: product.images?.[0] ? ImageKitService.getOptimizedImageUrl(product.images[0], { width: 150, height: 200 }) : undefined
    });

    toast.success('Added to cart!');
    console.log('Add to cart:', product.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button - only show if came from specific category or search */}
        {(searchParams.get('category') || searchParams.get('search')) && (
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>
        )}
        
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display mobile-heading font-bold gradient-primary bg-clip-text text-transparent mb-4">
            One stop destination for your fashion needs
          </h1>
          <p className="text-muted-foreground mobile-text">
            Discover our exquisite collection of handpicked sarees, where tradition meets contemporary fashion. Whether you are looking for a vibrant saree for a wedding, stunning lehangas, daily wear and party wear kurtisets and traditional outfits for your little ones , we have something perfect for every moment and every personality.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </form>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Filter */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-1000">Under ₹1,000</SelectItem>
                <SelectItem value="1000-3000">₹1,000 - ₹3,000</SelectItem>
                <SelectItem value="3000-5000">₹3,000 - ₹5,000</SelectItem>
                <SelectItem value="5000">Above ₹5,000</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 sm:mb-6">
          <p className="text-muted-foreground mobile-text">
            Showing {filteredProducts.length} of {allProducts.length} sarees
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="mobile-product-grid mb-12">
            {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="group mobile-card hover:shadow-elegant transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={ImageKitService.getOptimizedImageUrl(product.images[0], {
                      width: 400,
                      height: 512,
                      quality: 85,
                      format: 'webp'
                    })}
                    alt={product.name}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-48 sm:h-56 md:h-64 bg-gradient-primary flex items-center justify-center">
                    <div className="text-center text-primary-foreground">
                      <div className="mb-2 text-2xl sm:text-4xl">👗</div>
                      <div className="text-xs sm:text-sm font-medium">{product.category}</div>
                    </div>
                  </div>
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className={`absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isInWishlist(product.id) ? 'bg-red-100 text-red-600' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id);
                      toast.success('Removed from wishlist!');
                    } else {
                      addToWishlist({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        originalPrice: product.original_price,
                        image: product.images?.[0] || '',
                        category: product.category,
                        colors: product.colors || [],
                        sizes: ['Free Size']
                      });
                      toast.success('Added to wishlist!');
                    }
                  }}
                >
                  <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
                {product.original_price && product.original_price > product.price && (
                  <Badge className="absolute top-2 left-2 bg-destructive text-xs">
                    {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                  </Badge>
                )}
              </div>
              <CardContent className="p-2 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 hidden sm:block">{product.fabric}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs sm:text-sm font-medium">{product.rating || 0}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">({product.reviews_count || 0})</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
                  <span className="font-bold text-sm sm:text-lg">{formatPrice(product.price)}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xs sm:text-sm text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                <Button 
                  className="w-full text-xs sm:text-sm py-1.5 sm:py-2"
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No sarees found</h3>
            <p className="text-muted-foreground">
              {selectedCategory !== 'all' 
                ? `No products found in "${selectedCategory}" category. Try selecting a different category or adjusting your filters.`
                : 'Try adjusting your filters or search terms'
              }
            </p>
            {selectedCategory !== 'all' && (
              <Button 
                onClick={() => setSelectedCategory('all')} 
                variant="outline" 
                className="mt-4"
              >
                View All Categories
              </Button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Sarees;
