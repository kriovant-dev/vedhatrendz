// Example: How to update FeaturedProducts.tsx to use Cloudflare R2

import React from 'react';
// OLD ImageKit import
// import { LazyImage } from '@/components/OptimizedImages';

// NEW R2 import
import { LazyImage } from '@/components/R2OptimizedImages';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* LazyImage now uses Cloudflare R2 instead of ImageKit */}
          <LazyImage
            src={product.images[0]} // R2 URL
            alt={product.name}
            width={300}
            height={300}
            quality={80}
            className="w-full h-64 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-xl font-bold text-primary">₹{product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedProducts;