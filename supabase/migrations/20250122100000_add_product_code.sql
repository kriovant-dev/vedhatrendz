-- Add product_code column to products table for search functionality
ALTER TABLE products ADD COLUMN product_code TEXT;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);

-- Make product_code unique if needed (optional)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_products_code_unique ON products(product_code);
