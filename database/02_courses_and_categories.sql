-- =============================================
-- COURSES AND CATEGORIES SCHEMA
-- =============================================

-- Course categories
CREATE TABLE public.course_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT, -- Lucide icon name
    color TEXT DEFAULT '#3B82F6', -- Hex color
    parent_id UUID REFERENCES public.course_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.course_categories (name, slug, description, icon, color) VALUES
('Web Development', 'web-development', 'Build websites and web applications', 'Code', '#3B82F6'),
('Data Science', 'data-science', 'Analyze data and build ML models', 'BarChart3', '#8B5CF6'),
('Digital Marketing', 'digital-marketing', 'Online marketing strategies', 'TrendingUp', '#EF4444'),
('Design', 'design', 'UI/UX and graphic design', 'Palette', '#F59E0B'),
('Business', 'business', 'Business strategy and management', 'Briefcase', '#10B981'),
('Photography', 'photography', 'Photo techniques and editing', 'Camera', '#EC4899'),
('Music', 'music', 'Music theory and production', 'Music', '#6366F1'),
('Language Learning', 'language-learning', 'Learn new languages', 'Globe', '#14B8A6'),
('Personal Development', 'personal-development', 'Self-improvement and productivity', 'User', '#F97316');

-- Course difficulty levels
CREATE TYPE course_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- Course status
CREATE TYPE course_status AS ENUM ('draft', 'review', 'published', 'archived');

-- Course pricing types
CREATE TYPE pricing_type AS ENUM ('free', 'paid', 'subscription', 'tiered');

-- Main courses table
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Course identification
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT,
    description TEXT,
    
    -- Course organization
    category_id UUID REFERENCES public.course_categories(id),
    tags TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'EN',
    difficulty course_difficulty NOT NULL DEFAULT 'beginner',
    
    -- Course media
    thumbnail_url TEXT,
    preview_video_url TEXT,
    cover_image_url TEXT,
    
    -- Course metadata
    estimated_duration_minutes INTEGER DEFAULT 0, -- Total course duration
    total_lessons INTEGER DEFAULT 0,
    total_modules INTEGER DEFAULT 0,
    
    -- Instructor
    instructor_id UUID NOT NULL REFERENCES public.profiles(id),
    co_instructors UUID[] DEFAULT '{}', -- Array of profile IDs
    
    -- Pricing and access
    pricing_type pricing_type NOT NULL DEFAULT 'free',
    base_price DECIMAL(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    
    -- Course tiers (for tiered pricing)
    tiers JSONB DEFAULT '{}', -- {foundation: {price: 49, features: []}, advanced: {price: 97, features: []}, mastery: {price: 197, features: []}}
    
    -- Course status and visibility
    status course_status NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    publish_date TIMESTAMPTZ,
    
    -- Learning objectives and requirements
    learning_objectives TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    target_audience TEXT[] DEFAULT '{}',
    
    -- SEO and discoverability
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}',
    
    -- Analytics and engagement
    view_count INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_content_update TIMESTAMPTZ DEFAULT NOW()
);

-- Course modules (organize lessons into sections)
CREATE TABLE public.course_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Module settings
    is_free_preview BOOLEAN DEFAULT false,
    estimated_duration_minutes INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at
CREATE TRIGGER courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER course_modules_updated_at
    BEFORE UPDATE ON public.course_modules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_category ON public.courses(category_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_pricing_type ON public.courses(pricing_type);
CREATE INDEX idx_courses_difficulty ON public.courses(difficulty);
CREATE INDEX idx_courses_created_at ON public.courses(created_at);
CREATE INDEX idx_courses_featured ON public.courses(is_featured) WHERE is_featured = true;
CREATE INDEX idx_courses_public ON public.courses(is_public) WHERE is_public = true;

CREATE INDEX idx_course_modules_course ON public.course_modules(course_id);
CREATE INDEX idx_course_modules_sort ON public.course_modules(course_id, sort_order);

-- Row Level Security Policies
CREATE POLICY "Anyone can view published courses" ON public.courses
    FOR SELECT USING (status = 'published' AND is_public = true);

CREATE POLICY "Instructors can manage own courses" ON public.courses
    FOR ALL USING (instructor_id = auth.uid() OR auth.uid() = ANY(co_instructors));

CREATE POLICY "Anyone can view course categories" ON public.course_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view course modules for published courses" ON public.course_modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = course_modules.course_id 
            AND courses.status = 'published' 
            AND courses.is_public = true
        )
    );

CREATE POLICY "Instructors can manage own course modules" ON public.course_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = course_modules.course_id 
            AND (courses.instructor_id = auth.uid() OR auth.uid() = ANY(courses.co_instructors))
        )
    );

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;