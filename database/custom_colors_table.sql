-- Custom Colors Table for Dynamic Color Management
-- This table stores both default and custom colors with their hex codes

CREATE TABLE IF NOT EXISTS custom_colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  hex_code VARCHAR(7) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_colors_is_default ON custom_colors(is_default);
CREATE INDEX IF NOT EXISTS idx_custom_colors_name ON custom_colors(name);

-- Insert default colors
INSERT INTO custom_colors (name, hex_code, is_default, created_at) VALUES
  ('Red', '#ef4444', true, NOW()),
  ('Blue', '#3b82f6', true, NOW()),
  ('Green', '#22c55e', true, NOW()),
  ('Yellow', '#eab308', true, NOW()),
  ('Orange', '#f97316', true, NOW()),
  ('Purple', '#a855f7', true, NOW()),
  ('Pink', '#ec4899', true, NOW()),
  ('Black', '#000000', true, NOW()),
  ('White', '#ffffff', true, NOW()),
  ('Gray', '#6b7280', true, NOW()),
  ('Brown', '#a16207', true, NOW()),
  ('Navy', '#1e3a8a', true, NOW())
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE custom_colors ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
-- Admin users can read all colors
CREATE POLICY "Admin can read all colors" ON custom_colors
  FOR SELECT USING (true);

-- Admin users can insert custom colors (not default ones through this policy)
CREATE POLICY "Admin can insert custom colors" ON custom_colors
  FOR INSERT WITH CHECK (is_default = false);

-- Admin users can update custom colors (not default ones)
CREATE POLICY "Admin can update custom colors" ON custom_colors
  FOR UPDATE USING (is_default = false);

-- Admin users can delete custom colors (not default ones)
CREATE POLICY "Admin can delete custom colors" ON custom_colors
  FOR DELETE USING (is_default = false);

-- Public users can only read colors (for product color selection)
CREATE POLICY "Public can read colors" ON custom_colors
  FOR SELECT USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_colors_updated_at 
  BEFORE UPDATE ON custom_colors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();