
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Checkout from '@/components/Checkout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, ShoppingBag, ArrowLeft, Share2, Truck, Shield, CreditCard } from 'lucide-react';
import { firebase } from '@/integrations/firebase/client';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  category: string;
  fabric: string;
  occasion: string;
  colors: string[];
  sizes: string[];
  images: string[];
  is_new: boolean;
  is_bestseller: boolean;
  stock_quantity: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await firebase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (product?.colors?.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

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
      white: 'bg-white border',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      cream: 'bg-amber-100',
      pink: 'bg-pink-500',
      orange: 'bg-orange-500'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-400';
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedColor || !selectedSize) {
      toast.error('Please select color and size');
      return;
    }
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
      image: product.images?.[0]
    });
    
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (!selectedColor || !selectedSize) {
      toast.error('Please select color and size');
      return;
    }
    
    // Don't add to cart for Buy Now, just open checkout with specific item
    setShowCheckout(true);
    toast.success('Proceeding to checkout...');
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
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
        sizes: product.sizes || []
      });
      toast.success('Added to wishlist!');
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: `Check out this beautiful ${product.category}: ${product.name}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    if (!product) return;
    
    const shareUrl = window.location.href;
    const shareText = `Check out this beautiful ${product.category}: ${product.name} - ${window.location.href}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Product link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Product link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate('/')} className="hover:text-primary">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-primary">Sarees</button>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <div className="text-center text-primary-foreground">
                    <div className="mb-2 text-4xl sm:text-6xl">👗</div>
                    <div className="text-sm sm:text-lg font-medium">{product.category}</div>
                  </div>
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex gap-2">
                  {product.is_new && (
                    <Badge className="bg-saree-saffron text-primary-foreground">New</Badge>
                  )}
                  {product.is_bestseller && (
                    <Badge className="bg-saree-burgundy text-primary-foreground">Bestseller</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="outline"
                    className={`mobile-icon-button ${isInWishlist(product.id) ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline"
                    className="mobile-icon-button"
                    onClick={handleShare}
                  >
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <Badge variant="outline">{product.category}</Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-lg sm:text-xl text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                    <Badge className="bg-green-100 text-green-800 w-fit">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Fabric:</span>
                  <span className="ml-2 text-muted-foreground">{product.fabric}</span>
                </div>
                <div>
                  <span className="font-medium">Occasion:</span>
                  <span className="ml-2 text-muted-foreground">{product.occasion}</span>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Color: {selectedColor}</h3>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div 
                        className={`w-8 h-8 rounded-full border-2 ${getColorClass(color)} ${
                          selectedColor === color ? 'ring-2 ring-primary/30' : ''
                        }`}
                      />
                      <span className="text-xs font-medium capitalize">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="font-medium w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground ml-4">
                  {product.stock_quantity} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button 
                  onClick={handleAddToCart}
                  variant="outline" 
                  className="flex-1"
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  className="flex-1"
                  disabled={product.stock_quantity === 0}
                >
                  Buy Now
                </Button>
              </div>
              
              {product.stock_quantity === 0 && (
                <p className="text-center text-sm text-destructive">Out of Stock</p>
              )}
            </div>

            {/* Features */}
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Authentic Product</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      
      <Checkout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        buyNowItem={showCheckout && product ? {
          id: `buynow-${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          color: selectedColor,
          size: selectedSize,
          quantity: quantity,
          image: product.images?.[0]
        } : undefined}
      />
    </div>
  );
};

export default ProductDetail;
