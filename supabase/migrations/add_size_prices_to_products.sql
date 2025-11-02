-- Add size_prices column to products table for size-based pricing
-- This column stores JSON with structure: { "default": 499, "S": 399, "M": 499, "L": 599, "XL": 699 }

ALTER TABLE products
ADD COLUMN IF NOT EXISTS size_prices JSONB DEFAULT NULL;

-- Add comment describing the column
COMMENT ON COLUMN products.size_prices IS 'Size-based pricing with default fallback. Structure: {"default": <price>, "<size>": <price>, ...}';

-- Create an index for better query performance on this column
CREATE INDEX IF NOT EXISTS idx_products_size_prices ON products USING GIN (size_prices);
