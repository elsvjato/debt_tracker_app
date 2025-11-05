-- Update database schema to fix user registration

-- Create user profile table (if not exists)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Update function for automatic creation of settings and profile on registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user settings
  INSERT INTO user_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create user profile with name from metadata
  INSERT INTO user_profiles (user_id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', user_profiles.full_name);
  
  -- Log user creation for diagnostics
  RAISE NOTICE 'New user created: % with name: %', new.id, COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Unknown');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists, if not - create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
  END IF;
END $$; 