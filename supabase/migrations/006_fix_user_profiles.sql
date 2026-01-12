-- Fix user_profiles table schema
-- Run this in Supabase SQL Editor

-- Add missing columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS treatment TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS age_group_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gender_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS prefecture_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS illness_duration_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS treatment_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS device_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS bio_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hba1c_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS links_public BOOLEAN DEFAULT true;

-- Add unique constraint on user_id if not exists (for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_user_id_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create policies
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
