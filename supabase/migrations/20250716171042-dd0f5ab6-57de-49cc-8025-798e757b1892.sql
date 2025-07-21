
-- Create products table to store saree information
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- price in paise (Indian currency subunit)
  original_price INTEGER,
  category TEXT NOT NULL,
  fabric TEXT,
  occasion TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{S,M,L,XL}',
  images TEXT[] DEFAULT '{}',
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read products (public catalog)
CREATE POLICY "Anyone can view products" 
  ON public.products 
  FOR SELECT 
  USING (true);

-- Insert sample products
INSERT INTO public.products (name, description, price, original_price, category, fabric, occasion, rating, reviews_count, colors, images, is_new, is_bestseller, stock_quantity) VALUES
('Royal Banarasi Silk Saree', 'Exquisite handwoven Banarasi silk saree with intricate gold zari work. Perfect for weddings and special occasions.', 1599900, 1999900, 'silk', 'Pure Silk', 'wedding', 4.8, 127, ARRAY['burgundy', 'gold', 'emerald'], ARRAY['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800'], true, false, 15),
('Designer Georgette Saree', 'Contemporary designer georgette saree with modern prints and elegant draping. Ideal for parties and celebrations.', 899900, 1199900, 'georgette', 'Georgette', 'party', 4.6, 89, ARRAY['rose', 'royal-blue', 'saffron'], ARRAY['https://images.unsplash.com/photo-1594736797933-d0ca6108ccb3?w=800'], false, true, 25),
('Traditional Cotton Saree', 'Comfortable handloom cotton saree with traditional motifs. Perfect for daily wear and casual occasions.', 399900, 599900, 'cotton', 'Cotton', 'casual', 4.7, 203, ARRAY['emerald', 'burgundy', 'saffron'], ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'], false, false, 40),
('Kanjivaram Silk Masterpiece', 'Authentic Kanjivaram silk saree with temple border design. A timeless piece for bridal occasions.', 2299900, 2799900, 'silk', 'Kanjivaram Silk', 'bridal', 4.9, 156, ARRAY['gold', 'burgundy', 'royal-blue'], ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'], true, true, 8),
('Embroidered Net Saree', 'Delicate net saree with intricate embroidery work. Perfect for evening parties and formal events.', 1299900, 1599900, 'net', 'Net', 'party', 4.6, 94, ARRAY['black', 'gold', 'silver'], ARRAY['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800'], false, false, 20),
('Contemporary Chiffon Saree', 'Lightweight chiffon saree with modern design elements. Great for office wear and semi-formal occasions.', 599900, 799900, 'chiffon', 'Chiffon', 'party', 4.5, 67, ARRAY['purple', 'silver', 'black'], ARRAY['https://images.unsplash.com/photo-1588070961754-2a5b2f7c57de?w=800'], false, false, 30);
