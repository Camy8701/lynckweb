-- =============================================
-- USERS AND PROFILES SCHEMA
-- =============================================

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- User role and status
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'inactive')),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Teacher-specific fields
    teacher_title TEXT, -- e.g., "PhD in Computer Science"
    teacher_expertise TEXT[], -- Array of expertise areas
    teacher_bio TEXT,
    teacher_website TEXT,
    teacher_social_links JSONB DEFAULT '{}', -- {linkedin, twitter, etc}
    
    -- Student-specific fields  
    learning_preferences JSONB DEFAULT '{}', -- {topics, difficulty_level, etc}
    student_level TEXT DEFAULT 'beginner' CHECK (student_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, email_verified)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- Row Level Security Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles viewable by everyone" ON public.profiles
    FOR SELECT USING (true); -- Allow reading all profiles for teacher discovery

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;