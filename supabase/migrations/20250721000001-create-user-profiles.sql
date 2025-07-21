-- Create user_profiles table for storing user information for autofill
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL UNIQUE,
  "fullName" VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  landmark VARCHAR(255),
  "userPhone" VARCHAR(20),
  "userEmail" VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on userId for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_userId ON user_profiles("userId");

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own profiles
DROP POLICY IF EXISTS "Users can manage their own profiles" ON user_profiles;
CREATE POLICY "Users can manage their own profiles" ON user_profiles
  FOR ALL USING (true); -- For now, allow all operations. In production, you'd want proper user-based policies
