
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
import { r2Service } from '@/services/cloudflareR2Service';
import { ColorService, CustomColor } from '@/services/colorService';
import { ResponsiveImage, BlurUpImage, ThumbnailImage } from '@/components/R2OptimizedImages';
import { getDeliveryText } from '@/utils/deliveryUtils';

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
  color_images?: { [color: string]: string[] };
  size_prices?: { default: number; [size: string]: number }; // Size-based pricing with default fallback
  delivery_days_min: number | null;
  delivery_days_max: number | null;
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
  const [allColors, setAllColors] = useState<CustomColor[]>([]);

  // Fetch all colors (default + custom)
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const colors = await ColorService.getAllColors();
        setAllColors(colors);
      } catch (error) {
        console.error('Error fetching colors:', error);
        setAllColors(ColorService.getDefaultColors());
      }
    };
    fetchColors();
  }, []);

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
    
    // Get valid sizes using the same logic as display
    if (product?.sizes) {
      const validSizes = product.sizes.filter(size => {
        const price = product.size_prices?.[size];
        // Valid if: no size_prices entry (base size) OR has price > 0 (custom size)
        if (price === undefined) return true; // Base size
        return price > 0; // Custom size with valid price
      });
      
      if (validSizes.length > 0) {
        setSelectedSize(validSizes[0]);
      }
    }
  }, [product]);

  useEffect(() => {
    // Reset image index when color changes
    setCurrentImageIndex(0);
  }, [selectedColor]);

  const getDisplayImages = () => {
    if (product?.color_images && selectedColor && product.color_images[selectedColor]) {
      return product.color_images[selectedColor];
    }
    return product?.images || [];
  };

  const formatPrice = (price: number) => {
    console.log('formatPrice input (paise):', price, 'output (rupees):', price / 100);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price / 100);
  };

  // Get price based on selected size (uses size-specific pricing if available)
  const getPrice = (): number => {
    if (!product) return 0;
    
    console.log('Product size_prices:', product.size_prices);
    console.log('Selected size:', selectedSize);
    
    if (product.size_prices && selectedSize) {
      // size_prices are stored in paise (cents)
      // Try to find size-specific price, fallback to default
      const sizePrice = product.size_prices[selectedSize];
      const defaultPrice = product.size_prices.default;
      
      if (sizePrice && sizePrice > 0) {
        console.log('Using size-specific price:', sizePrice);
        return sizePrice;
      }
      
      if (defaultPrice && defaultPrice > 0) {
        console.log('Using default price:', defaultPrice);
        return defaultPrice;
      }
    }
    
    // Fallback to product price if no size pricing
    console.log('Using base product price:', product.price);
    return product.price;
  };

  const getValidSizes = (): string[] => {
    if (!product || !product.sizes) return [];
    
    // If no size_prices configured, all sizes are valid
    if (!product.size_prices) {
      console.log('No size_prices configured, showing all sizes:', product.sizes);
      return product.sizes;
    }
    
    // A size is valid if:
    // 1. It HAS a price in size_prices (custom size with price)
    // 2. It DOESN'T have an entry in size_prices (base size, uses default)
    // 
    // A size is INVALID only if:
    // 3. It's in size_prices with 0 or undefined price (deleted custom size)
    const validSizes = product.sizes.filter(size => {
      const price = product.size_prices?.[size];
      
      // If size not in size_prices, it's a base size -> VALID
      if (price === undefined) {
        console.log(`Size ${size}: not in size_prices (base size) -> VALID`);
        return true;
      }
      
      // If size is in size_prices with valid price -> VALID
      if (price > 0) {
        console.log(`Size ${size}: price=${price} in size_prices -> VALID`);
        return true;
      }
      
      // If size is in size_prices with 0 price (deleted) -> INVALID
      console.log(`Size ${size}: price=${price} in size_prices (deleted) -> INVALID`);
      return false;
    });
    
    console.log('Valid sizes after filtering:', validSizes);
    return validSizes;
  };

  const getColorHex = (colorName: string): string => {
    // Find the color in our colors array
    const colorObj = allColors.find(c => 
      c.name.toLowerCase() === colorName.toLowerCase()
    );
    return colorObj?.hex_code || '#6b7280'; // Default to gray if not found
  };

  // Helper component for color display with hex code
  const ColorSwatch = ({ colorName }: { colorName: string }) => {
    const hexCode = getColorHex(colorName);
    return (
      <div 
        className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
        style={{ backgroundColor: hexCode }}
        title={`${colorName} - ${hexCode}`}
      />
    );
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedColor || !selectedSize) {
      toast.error('Please select color and size');
      return;
    }
    
    const displayImages = getDisplayImages();
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: getPrice(), // Use size-specific price if available
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
      image: displayImages[0] || product.images?.[0] || '',
      stock_quantity: product.stock_quantity
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
      const displayImages = getDisplayImages();
      
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: getPrice(), // Use size-specific price if available
        originalPrice: product.original_price,
        image: displayImages[0] || product.images?.[0] || '',
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

  // Calculate discount based on current price (which may be size-specific)
  const currentPrice = getPrice();
  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - currentPrice) / product.original_price) * 100)
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
          {/* Product Images - Optimized with ResponsiveImage */}
          <div className="space-y-3 sm:space-y-4">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
              {getDisplayImages().length > 0 ? (
                <BlurUpImage
                  src={getDisplayImages()[currentImageIndex]}
                  alt={product.name}
                  transformation={{ width: 800, height: 1200, format: 'webp' }}
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
            
            {/* Thumbnail Gallery - Optimized with ThumbnailImage */}
            {getDisplayImages().length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getDisplayImages().map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <ThumbnailImage
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      size={80}
                      className="w-full h-full"
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
                  {formatPrice(getPrice())}
                </span>
                {product.original_price && product.original_price > getPrice() && (
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

              {/* Delivery Information */}
              {(product.delivery_days_min) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Delivery Information</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {getDeliveryText(product.delivery_days_min, product.delivery_days_max)}
                  </p>
                </div>
              )}
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
                        className={`relative w-8 h-8 rounded-full border-2 ${
                          selectedColor === color ? 'ring-2 ring-primary/30' : ''
                        }`}
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                      <span className="text-xs font-medium capitalize">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {getValidSizes().length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {getValidSizes().map((size) => (
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
        onOpen={() => setShowCheckout(true)}
        onClose={() => setShowCheckout(false)}
        buyNowItem={showCheckout && product ? {
          id: `buynow-${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: getPrice(), // ✅ FIXED: Use getPrice() to get size-specific price
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
