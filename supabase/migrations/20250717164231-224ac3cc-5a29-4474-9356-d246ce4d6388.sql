
-- Create orders table to store order information
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL,
  order_items JSONB NOT NULL, -- Array of order items with product details
  subtotal INTEGER NOT NULL, -- in paise
  shipping_cost INTEGER DEFAULT 0, -- in paise
  tax_amount INTEGER DEFAULT 0, -- in paise
  total_amount INTEGER NOT NULL, -- in paise
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own orders
CREATE POLICY "Users can view their own orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for admin access (we'll check for admin role)
CREATE POLICY "Admins can manage all orders" 
  ON public.orders 
  FOR ALL 
  USING (true);

-- Create user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy for users to view their own roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Insert sample orders for testing
INSERT INTO public.orders (customer_email, customer_name, customer_phone, shipping_address, order_items, subtotal, shipping_cost, tax_amount, total_amount, status, payment_status, payment_method, created_at) VALUES
('customer1@example.com', 'Priya Sharma', '+91 9876543210', '{"street": "123 MG Road", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "country": "India"}', '[{"productId": "1", "name": "Royal Banarasi Silk Saree", "price": 1599900, "quantity": 1, "color": "burgundy", "size": "M"}]', 1599900, 0, 0, 1599900, 'confirmed', 'paid', 'UPI', now() - interval '2 hours'),
('customer2@example.com', 'Anita Gupta', '+91 9876543211', '{"street": "456 Brigade Road", "city": "Bangalore", "state": "Karnataka", "pincode": "560001", "country": "India"}', '[{"productId": "2", "name": "Designer Georgette Saree", "price": 899900, "quantity": 2, "color": "rose", "size": "L"}]', 1799800, 5000, 179980, 1984780, 'processing', 'paid', 'Credit Card', now() - interval '1 day'),
('customer3@example.com', 'Rekha Patel', '+91 9876543212', '{"street": "789 CP", "city": "Delhi", "state": "Delhi", "pincode": "110001", "country": "India"}', '[{"productId": "3", "name": "Traditional Cotton Saree", "price": 399900, "quantity": 1, "color": "emerald", "size": "S"}]', 399900, 5000, 39990, 444890, 'shipped', 'paid', 'Debit Card', now() - interval '3 days'),
('customer4@example.com', 'Meera Singh', '+91 9876543213', '{"street": "321 Park Street", "city": "Kolkata", "state": "West Bengal", "pincode": "700001", "country": "India"}', '[{"productId": "4", "name": "Kanjivaram Silk Masterpiece", "price": 2299900, "quantity": 1, "color": "gold", "size": "M"}]', 2299900, 0, 229990, 2529890, 'delivered', 'paid', 'UPI', now() - interval '1 week'),
('customer5@example.com', 'Sunita Reddy', '+91 9876543214', '{"street": "654 Banjara Hills", "city": "Hyderabad", "state": "Telangana", "pincode": "500034", "country": "India"}', '[{"productId": "5", "name": "Embroidered Net Saree", "price": 1299900, "quantity": 1, "color": "black", "size": "L"}]', 1299900, 5000, 129990, 1434890, 'pending', 'pending', NULL, now() - interval '30 minutes');

-- Make the first user an admin for testing (replace with actual user ID when needed)
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-user-id-here', 'admin');
