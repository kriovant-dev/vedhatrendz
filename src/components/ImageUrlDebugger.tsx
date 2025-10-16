import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firebase } from '@/integrations/firebase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  images: string[];
}

interface ImageStatus {
  url: string;
  status: 'checking' | 'valid' | 'invalid' | 'error';
  error?: string;
}

interface ProductImageStatus {
  product: Product;
  imageStatuses: ImageStatus[];
}

const ImageUrlDebugger: React.FC = () => {
  const [imageStatuses, setImageStatuses] = useState<ProductImageStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Fetch all products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['all-products-debug'],
    queryFn: async () => {
      const { data, error } = await firebase
        .from('products')
        .select('id, name, images')
        .execute();
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const checkImageUrl = async (url: string): Promise<ImageStatus> => {
    if (!url) {
      return { url, status: 'invalid', error: 'Empty URL' };
    }

    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return { url, status: 'valid' };
      } else {
        return { 
          url, 
          status: 'invalid', 
          error: `HTTP ${response.status}: ${response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        url, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  const checkAllImages = async () => {
    setIsChecking(true);
    const results: ProductImageStatus[] = [];

    for (const product of products) {
      if (product.images && product.images.length > 0) {
        const imageStatuses: ImageStatus[] = [];
        
        for (const imageUrl of product.images) {
          const status = await checkImageUrl(imageUrl);
          imageStatuses.push(status);
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        results.push({
          product,
          imageStatuses
        });
      }
    }

    setImageStatuses(results);
    setIsChecking(false);
  };

  const getBrokenImageCount = () => {
    return imageStatuses.reduce((count, productStatus) => {
      return count + productStatus.imageStatuses.filter(
        status => status.status === 'invalid' || status.status === 'error'
      ).length;
    }, 0);
  };

  const getStatusIcon = (status: ImageStatus['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔍 Image URL Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading products...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Image URL Debugger
          {imageStatuses.length > 0 && (
            <Badge variant={getBrokenImageCount() > 0 ? "destructive" : "default"}>
              {getBrokenImageCount()} broken images found
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={checkAllImages} 
            disabled={isChecking || products.length === 0}
          >
            {isChecking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Checking Images...
              </>
            ) : (
              `Check ${products.length} Products`
            )}
          </Button>
        </div>

        {imageStatuses.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Found {imageStatuses.length} products with images
            </div>
            
            {imageStatuses.map((productStatus) => (
              <Card key={productStatus.product.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{productStatus.product.name}</h4>
                  <div className="space-y-2">
                    {productStatus.imageStatuses.map((imageStatus, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getStatusIcon(imageStatus.status)}
                        <span className={`flex-1 ${
                          imageStatus.status === 'invalid' || imageStatus.status === 'error' 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          Image {index + 1}: {imageStatus.url.substring(0, 60)}...
                        </span>
                        {imageStatus.status === 'valid' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => window.open(imageStatus.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {productStatus.imageStatuses.some(s => s.error) && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <strong>Errors:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {productStatus.imageStatuses
                            .filter(s => s.error)
                            .map((s, i) => (
                              <li key={i}>{s.error}</li>
                            ))
                          }
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUrlDebugger;