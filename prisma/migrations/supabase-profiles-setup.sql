-- Create the public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  -- Telemedicine platform specific fields:
  role TEXT CHECK (role IN ('psychologist', 'patient')),
  psychologist_license_id TEXT,
  timezone TEXT,

  PRIMARY KEY (id),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50) -- Example constraint
);

-- Enable Row Level Security on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow individuals to read their own profile.
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow individuals to insert their own profile.
-- This is typically handled by the trigger, but can be a fallback or for initial setup.
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow individuals to update their own profile.
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Optional: Allow authenticated users to view limited public information from other profiles
-- CREATE POLICY "Authenticated users can view public profile info."
--   ON public.profiles FOR SELECT TO authenticated
--   USING (true); -- Or more specific conditions like (is_public = true) if you add such a column

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_profile_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update 'updated_at' before any update on profiles table
DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_profile_update_timestamp();

-- Function to handle new user creation and populate public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public -- Ensures function can access public.profiles
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role) -- Add other fields as needed from raw_user_meta_data
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name', -- Expect 'full_name' in signUp options.data
    NEW.raw_user_meta_data->>'avatar_url', -- Expect 'avatar_url' in signUp options.data
    NEW.raw_user_meta_data->>'role'        -- Expect 'role' in signUp options.data
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function after a new user is inserted into auth.users
-- Drop existing trigger if it exists from previous examples
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created_populate_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user_profile();
