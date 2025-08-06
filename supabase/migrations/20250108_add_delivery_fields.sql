-- Run this in your Supabase SQL Editor or through the Supabase CLI

-- Migration: Add delivery date fields to products table
-- Date: 2025-01-08

-- Add delivery date columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS delivery_days_min INTEGER,
ADD COLUMN IF NOT EXISTS delivery_days_max INTEGER;

-- Add check constraints to ensure valid delivery days
ALTER TABLE products 
ADD CONSTRAINT check_delivery_days_min_positive 
CHECK (delivery_days_min IS NULL OR delivery_days_min > 0);

ALTER TABLE products 
ADD CONSTRAINT check_delivery_days_max_positive 
CHECK (delivery_days_max IS NULL OR delivery_days_max > 0);

ALTER TABLE products 
ADD CONSTRAINT check_delivery_days_range 
CHECK (delivery_days_max IS NULL OR delivery_days_min IS NULL OR delivery_days_max >= delivery_days_min);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_delivery_days ON products(delivery_days_min, delivery_days_max);
