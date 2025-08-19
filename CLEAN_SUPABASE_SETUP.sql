-- =============================================
-- LYNCK ACADEMY - SIMPLE PROFILES TABLE
-- FOR AUTH0 INTEGRATION
-- =============================================
-- 
-- Copy and paste this into your Supabase SQL Editor
-- This creates a standalone profiles table that works with Auth0
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (standalone, no auth.users dependency)
CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic user info
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- User role and status
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'inactive')),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Optional fields for future use
    phone TEXT,
    date_of_birth DATE,
    location TEXT,
    timezone TEXT DEFAULT 'UTC',
    language_preference TEXT DEFAULT 'en',
    
    -- Teacher-specific fields (only used if role = 'teacher')
    teacher_title TEXT,
    teacher_expertise TEXT[],
    teacher_bio TEXT,
    teacher_website TEXT,
    teacher_social_links JSONB DEFAULT '{}',
    
    -- Student-specific fields (only used if role = 'student')
    learning_preferences JSONB DEFAULT '{}',
    student_level TEXT DEFAULT 'beginner' CHECK (student_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for now, can be tightened later)
CREATE POLICY "Anyone can read profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update profiles" ON public.profiles
    FOR UPDATE USING (true);

-- Insert a test profile to verify the setup
INSERT INTO public.profiles (
    email, 
    full_name, 
    role, 
    account_status,
    email_verified
) VALUES (
    'test@lynckacademy.com',
    'Test User',
    'student',
    'active',
    true
);

-- Verify the setup
SELECT 'Profiles table created successfully!' as status,
       COUNT(*) as profile_count 
FROM public.profiles;

-- =============================================
-- SETUP COMPLETE!
-- 
-- Your profiles table is now ready for Auth0 integration.
-- The app will create user profiles automatically when users sign up.
-- =============================================