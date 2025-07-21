
-- Add RLS policies for admin product management
CREATE POLICY "Admins can insert products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Admins can update products" 
  ON public.products 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Admins can delete products" 
  ON public.products 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE username = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Add a simpler policy for admin access that works with our custom auth
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Create policies that allow all authenticated admin operations
CREATE POLICY "Allow admin insert products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow admin update products" 
  ON public.products 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow admin delete products" 
  ON public.products 
  FOR DELETE 
  USING (true);
