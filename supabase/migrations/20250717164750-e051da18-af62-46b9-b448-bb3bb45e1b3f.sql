
-- Create admin_users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users (only allow select for authentication)
CREATE POLICY "Allow admin authentication" 
  ON public.admin_users 
  FOR SELECT 
  USING (true);

-- Insert the admin user with hashed password
-- Note: In production, you should use proper password hashing
-- For this demo, we'll use a simple approach
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('admin', 'admin@123');
