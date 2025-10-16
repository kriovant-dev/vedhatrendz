import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { firebase } from '@/integrations/firebase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Star, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  product_code: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  fabric: string | null;
  occasion: string | null;
  colors: string[];
  sizes: string[];
  images: string[];
  stock_quantity: number | null;
  rating: number | null;
  reviews_count: number | null;
  is_new: boolean | null;
  is_bestseller: boolean | null;
  created_at: string;
  updated_at: string;
}

const ProductSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'exact' | 'similar' | 'general'>('general');

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a product code or name to search');
      return;
    }

    setIsSearching(true);
    try {
      // Get all products
      const { data, error } = await firebase
        .from('products')
        .select('*')
        .execute();

      if (error) throw error;
      
      const allProducts = data as Product[];
      const query = searchQuery.toLowerCase().trim();
      
      // First, try to find exact product code match
      const exactMatch = allProducts.find(product => 
        product.product_code?.toLowerCase() === query
      );
      
      if (exactMatch) {
        // Exact product code match found - redirect to product page
        toast.success(`Product found! Redirecting to ${exactMatch.name}`);
        navigate(`/product/${exactMatch.id}`);
        return;
      }
      
      // If no exact match, find similar products
      const similarProducts = allProducts.filter(product => {
        return (
          product.product_code?.toLowerCase().includes(query) ||
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.fabric?.toLowerCase().includes(query) ||
          product.colors.some(color => color.toLowerCase().includes(query))
        );
      });
      
      // Set search type for display purposes
      if (similarProducts.length === 0) {
        setSearchType('general');
        toast.info('No exact match found. Try searching with different keywords.');
      } else if (similarProducts.some(p => p.product_code?.toLowerCase().includes(query))) {
        setSearchType('similar');
        toast.info(`No exact product code match. Found ${similarProducts.length} similar products`);
      } else {
        setSearchType('general');
        toast.success(`Found ${similarProducts.length} product${similarProducts.length > 1 ? 's' : ''}`);
      }
      
      setSearchResults(similarProducts);
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search products');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, navigate]);

  // Auto-search if there's a query parameter
  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery, handleSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getSearchResultsTitle = () => {
    if (searchType === 'exact') {
      return searchResults.length === 1 ? 'Product Found' : 'Multiple Products with This Code';
    } else if (searchType === 'similar') {
      return `Similar Products (${searchResults.length})`;
    } else {
      return `Search Results (${searchResults.length})`;
    }
  };

  const getSearchResultsMessage = () => {
    if (searchType === 'exact' && searchResults.length === 1) {
      return 'Click the product card to view details.';
    } else if (searchType === 'exact' && searchResults.length > 1) {
      return 'Multiple products found with this exact code. Click any product to view details.';
    } else if (searchType === 'similar') {
      return `No exact product code match for "${searchQuery}". Here are similar products:`;
    } else if (searchResults.length === 0) {
      return `No products found matching "${searchQuery}". Try searching with different keywords.`;
    } else if (searchQuery && searchResults.length > 0) {
      return 'Products matching your search. Click any product to view details.';
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Product Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter exact product code (e.g., VT-SAR-001) or search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground mt-2 space-y-1">
            <p>💡 <strong>Tip:</strong> Enter exact product code for instant redirect to product page</p>
            <p>🔍 Or search by product name, category, fabric, or color for similar results</p>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">
              {getSearchResultsTitle()}
            </h3>
            {getSearchResultsMessage() && (
              <p className="text-sm text-muted-foreground mt-1">
                {getSearchResultsMessage()}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((product) => (
              <Card 
                key={product.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleProductClick(product.id)}
              >
                <CardContent className="p-4">
                  {/* Product Image */}
                  <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-muted">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={r2Service.getOptimizedImageUrl(product.images[0], {
                          width: 300,
                          height: 300,
                          quality: 85,
                          format: 'webp'
                        })}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          console.error('🚨 Image failed to load in Search results:', {
                            originalUrl: product.images[0],
                            optimizedUrl: e.currentTarget.src,
                            product: product.name
                          });
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully in Search results:', product.name);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.is_new && (
                        <Badge className="bg-green-500 text-white text-xs">New</Badge>
                      )}
                      {product.is_bestseller && (
                        <Badge className="bg-blue-500 text-white text-xs">Bestseller</Badge>
                      )}
                    </div>

                    {/* Click indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 rounded-full p-1">
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    {/* Product Code */}
                    <div className="text-xs font-mono text-muted-foreground uppercase font-semibold">
                      {product.product_code || 'No Code'}
                    </div>
                    
                    {/* Product Name */}
                    <h4 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    
                    {/* Category & Fabric */}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.fabric && (
                        <Badge variant="outline" className="text-xs">
                          {product.fabric}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Colors: {product.colors.slice(0, 3).join(', ')}
                        {product.colors.length > 3 && ` +${product.colors.length - 3}`}
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {formatCurrency(product.price)}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.original_price)}
                        </span>
                      )}
                    </div>
                    
                    {/* Stock & Rating */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Stock: {product.stock_quantity || 0}
                      </span>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{product.rating}/5</span>
                          {product.reviews_count && (
                            <span>({product.reviews_count})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* No Results Message */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              No products found matching "{searchQuery}". Try searching with different keywords.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductSearch;
