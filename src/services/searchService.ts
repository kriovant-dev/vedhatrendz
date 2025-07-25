import { FirebaseClient } from '../integrations/firebase/client';

export interface SearchResult {
  type: 'product' | 'search';
  productId?: string;
  redirectUrl: string;
}

export class SearchService {
  /**
   * Enhanced search that handles both product codes and regular text search
   * @param query - Search query (can be product code or text)
   * @returns SearchResult with type and redirect URL
   */
  static async performSearch(query: string): Promise<SearchResult> {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      return {
        type: 'search',
        redirectUrl: '/products'
      };
    }

    // First, try to find exact product by product_code
    try {
      console.log('🔍 Searching for product with code:', trimmedQuery);
      
      const { data: productByCode, error: codeError } = await FirebaseClient.getWhere('products', [
        { field: 'product_code', operator: '==', value: trimmedQuery }
      ]);

      if (!codeError && productByCode && productByCode.length > 0) {
        console.log('✅ Found product by code:', productByCode[0]);
        return {
          type: 'product',
          productId: productByCode[0].id,
          redirectUrl: `/product/${productByCode[0].id}`
        };
      }

      // If no exact match by code, try to find all products and filter client-side for case-insensitive match
      const { data: allProducts, error: allError } = await FirebaseClient.getAll('products');

      if (!allError && allProducts) {
        const matchingProduct = allProducts.find(product => 
          product.product_code?.toLowerCase() === trimmedQuery.toLowerCase()
        );

        if (matchingProduct) {
          console.log('✅ Found product by case-insensitive code:', matchingProduct);
          return {
            type: 'product',
            productId: matchingProduct.id,
            redirectUrl: `/product/${matchingProduct.id}`
          };
        }
      }

    } catch (error) {
      console.error('❌ Error searching for product by code:', error);
    }

    // If no product found by code, treat as regular search
    console.log('🔍 No product found by code, treating as text search');
    return {
      type: 'search',
      redirectUrl: `/products?search=${encodeURIComponent(trimmedQuery)}`
    };
  }

  /**
   * Check if a query looks like a product code
   * @param query - Search query
   * @returns boolean indicating if it might be a product code
   */
  looksLikeProductCode(query: string): boolean {
    const trimmed = query.trim();
    
    // Basic heuristics for product codes:
    // - No spaces
    // - Contains letters and numbers
    // - Reasonable length (3-20 characters)
    // - Common patterns like VT001, SAR-123, etc.
    
    if (trimmed.length < 3 || trimmed.length > 20) return false;
    if (trimmed.includes(' ')) return false;
    
    // Check if it contains both letters and numbers (common in product codes)
    const hasLetters = /[a-zA-Z]/.test(trimmed);
    const hasNumbers = /[0-9]/.test(trimmed);
    
    return hasLetters && hasNumbers;
  }
}

export const searchService = new SearchService();
