-- Create categories table for dynamic category management
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, slug, description, sort_order) VALUES
('Sarees', 'sarees', 'Traditional Indian sarees collection', 1),
('Silk Sarees', 'silk-sarees', 'Premium silk sarees', 2),
('Cotton Sarees', 'cotton-sarees', 'Comfortable cotton sarees for daily wear', 3),
('Designer Sarees', 'designer-sarees', 'Contemporary and designer sarees', 4),
('Wedding Sarees', 'wedding-sarees', 'Luxurious bridal and wedding collection', 5),
('Festive Sarees', 'festive-sarees', 'Perfect for celebrations and festivals', 6),
('Office Wear', 'office-wear', 'Professional and elegant office wear', 7);
