-- Migration: Add delivery date fields to products table
-- Date: 2025-01-08
-- Description: Add delivery_days_min and delivery_days_max columns to support product-specific delivery timeframes

-- Add delivery date columns to products table
ALTER TABLE products 
ADD COLUMN delivery_days_min INTEGER,
ADD COLUMN delivery_days_max INTEGER;

-- Add comments to document the columns
COMMENT ON COLUMN products.delivery_days_min IS 'Minimum number of days for product delivery (required if delivery info is provided)';
COMMENT ON COLUMN products.delivery_days_max IS 'Maximum number of days for product delivery (optional, for date ranges)';

-- Create index for better query performance
CREATE INDEX idx_products_delivery_days ON products(delivery_days_min, delivery_days_max);

-- Sample update for testing (optional - remove if not needed)
-- UPDATE products SET delivery_days_min = 3, delivery_days_max = 5 WHERE category = 'Sarees';
-- UPDATE products SET delivery_days_min = 2 WHERE category = 'Kurta Sets';
