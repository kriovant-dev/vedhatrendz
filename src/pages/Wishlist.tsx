import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
  const { items, removeFromWishlist, clearWishlist, getTotalItems } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    const cartItem = {
      productId: item.productId,
      name: item.name,
      price: item.price,
      color: item.colors[0] || '',
      size: item.sizes[0] || '',
      quantity: 1,
      image: item.image
    };
    addToCart(cartItem);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold text-saree-primary mb-2">Your Wishlist</h1>
          <p className="text-gray-600 mb-6">You haven't added any items to your wishlist yet.</p>
          <Link to="/sarees">
            <Button className="bg-saree-accent hover:bg-saree-accent/90">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-saree-primary mb-2">My Wishlist</h1>
          <p className="text-gray-600">{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} saved</p>
        </div>
        {items.length > 0 && (
          <Button
            variant="outline"
            onClick={clearWishlist}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                  onClick={() => removeFromWishlist(item.productId)}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Link to={`/product/${item.productId}`}>
                <CardTitle className="text-lg mb-2 hover:text-saree-accent transition-colors line-clamp-2">
                  {item.name}
                </CardTitle>
              </Link>
              <CardDescription className="mb-3">
                <Badge variant="secondary" className="mb-2">
                  {item.category}
                </Badge>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-saree-primary">
                    ₹{item.price.toLocaleString()}
                  </span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardDescription>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-gray-600">Colors:</span>
                  {item.colors.slice(0, 3).map((color, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                  {item.colors.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.colors.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1 bg-saree-accent hover:bg-saree-accent/90"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromWishlist(item.productId)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Added on {new Date(item.addedAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
