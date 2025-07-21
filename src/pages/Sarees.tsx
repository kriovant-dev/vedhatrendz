
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
import { Heart, Search, Star, ShoppingBag } from 'lucide-react';
import { firebase } from '@/integrations/firebase/client';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { ImageKitService } from '@/services/imagekitService';

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
      // Map common category names to match the actual category values in your database
      const categoryMap: { [key: string]: string } = {
        'wedding sarees': 'Wedding',
        'silk sarees': 'Silk',
        'cotton sarees': 'Cotton',
        'designer sarees': 'Designer',
        'festive sarees': 'Festive',
        'office wear': 'Office',
        'party wear': 'Party',
        'casual': 'Casual'
      };
      
      const mappedCategory = categoryMap[categoryParam.toLowerCase()] || categoryParam;
      setSelectedCategory(mappedCategory);
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

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let filtered = allProducts;

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
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

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
  }, [allProducts, searchQuery, selectedCategory, priceRange, sortBy]);

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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-4">
            Saree Collection
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover our exquisite collection of traditional and contemporary sarees
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search sarees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="silk">Silk Sarees</SelectItem>
                <SelectItem value="cotton">Cotton Sarees</SelectItem>
                <SelectItem value="georgette">Georgette Sarees</SelectItem>
                <SelectItem value="net">Net Sarees</SelectItem>
                <SelectItem value="chiffon">Chiffon Sarees</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Filter */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-5000">Under ₹5,000</SelectItem>
                <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                <SelectItem value="10000-20000">₹10,000 - ₹20,000</SelectItem>
                <SelectItem value="20000">Above ₹20,000</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
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
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {allProducts.length} sarees
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="group hover:shadow-elegant transition-all duration-300 overflow-hidden cursor-pointer"
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
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-primary flex items-center justify-center">
                    <div className="text-center text-primary-foreground">
                      <div className="mb-2 text-4xl">👗</div>
                      <div className="text-sm font-medium">{product.category}</div>
                    </div>
                  </div>
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Added to wishlist:', product.id);
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                {product.original_price && product.original_price > product.price && (
                  <Badge className="absolute top-2 left-2 bg-destructive">
                    {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.fabric}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating || 0}</span>
                  <span className="text-sm text-muted-foreground">({product.reviews_count || 0})</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                <Button 
                  className="w-full"
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No sarees found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Sarees;
