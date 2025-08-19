-- =============================================
-- COURSES SYSTEM WITH PAYMENT INTEGRATION
-- Complete course management with Stripe pricing
-- =============================================

-- Create course categories table
CREATE TABLE public.course_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT, -- Icon name for UI
    color TEXT DEFAULT '#3B82F6', -- Hex color for category
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic info
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    
    -- Teacher info
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Category
    category_id UUID REFERENCES public.course_categories(id),
    
    -- Media
    thumbnail_url TEXT,
    preview_video_url TEXT,
    
    -- Course content info
    total_lessons INTEGER DEFAULT 0,
    total_hours DECIMAL DEFAULT 0,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    
    -- Pricing (in cents)
    price_foundation INTEGER NOT NULL DEFAULT 4700, -- $47.00
    price_advanced INTEGER NOT NULL DEFAULT 9700,   -- $97.00 
    price_mastery INTEGER NOT NULL DEFAULT 19700,   -- $197.00
    
    -- Course status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Stats (updated by triggers)
    total_students INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Create course modules table
CREATE TABLE public.course_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    
    is_published BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(course_id, order_index)
);

-- Create lessons table
CREATE TABLE public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    content TEXT, -- HTML content
    
    -- Video info
    video_url TEXT,
    video_duration INTEGER, -- in seconds
    
    -- Lesson details
    order_index INTEGER NOT NULL,
    lesson_type TEXT DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment')),
    
    -- Access control
    is_free BOOLEAN DEFAULT false, -- Free preview lessons
    is_published BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(course_id, order_index)
);

-- Create enrollments table
CREATE TABLE public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    -- Enrollment details
    tier TEXT NOT NULL CHECK (tier IN ('foundation', 'advanced', 'mastery')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'refunded')),
    
    -- Progress tracking
    progress DECIMAL(5,2) DEFAULT 0, -- Percentage completed
    completed_lessons INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0, -- in seconds
    
    -- Payment reference
    purchase_id UUID REFERENCES public.course_purchases(id),
    
    -- Access control
    access_until TIMESTAMPTZ, -- For time-limited access
    
    -- Timestamps
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    UNIQUE(student_id, course_id)
);

-- Create course ratings table
CREATE TABLE public.course_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(student_id, course_id)
);

-- Create lesson progress table
CREATE TABLE public.lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    -- Progress details
    is_completed BOOLEAN DEFAULT false,
    watch_time INTEGER DEFAULT 0, -- in seconds
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(student_id, lesson_id)
);

-- Create indexes for better performance
CREATE INDEX idx_courses_teacher_id ON public.courses(teacher_id);
CREATE INDEX idx_courses_category_id ON public.courses(category_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_is_featured ON public.courses(is_featured);
CREATE INDEX idx_courses_created_at ON public.courses(created_at DESC);

CREATE INDEX idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);

CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_lessons_order_index ON public.lessons(course_id, order_index);

CREATE INDEX idx_lesson_progress_student_id ON public.lesson_progress(student_id);
CREATE INDEX idx_lesson_progress_course_id ON public.lesson_progress(course_id);

-- Add updated_at triggers
CREATE TRIGGER courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER course_modules_updated_at
    BEFORE UPDATE ON public.course_modules  
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER course_ratings_updated_at
    BEFORE UPDATE ON public.course_ratings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses" ON public.courses
    FOR SELECT USING (status = 'published');

CREATE POLICY "Teachers can manage own courses" ON public.courses
    FOR ALL USING (teacher_id = (SELECT id FROM public.profiles WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Admins can manage all courses" ON public.courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE email = auth.jwt() ->> 'email' AND role = 'admin'
        )
    );

-- RLS Policies for enrollments
CREATE POLICY "Students can view own enrollments" ON public.enrollments
    FOR SELECT USING (student_id = (SELECT id FROM public.profiles WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Teachers can view enrollments in their courses" ON public.enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            JOIN public.profiles p ON c.teacher_id = p.id
            WHERE c.id = course_id AND p.email = auth.jwt() ->> 'email'
        )
    );

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories" ON public.course_categories
    FOR SELECT USING (is_active = true);

-- Insert sample categories
INSERT INTO public.course_categories (name, slug, description, icon, color) VALUES
('Web Development', 'web-development', 'Frontend and backend web development courses', '💻', '#3B82F6'),
('Data Science', 'data-science', 'Data analysis, machine learning, and AI courses', '📊', '#10B981'),
('Design', 'design', 'UI/UX design, graphic design, and creative courses', '🎨', '#8B5CF6'),
('Business', 'business', 'Entrepreneurship, marketing, and business strategy', '💼', '#F59E0B'),
('Programming', 'programming', 'Software development and programming languages', '⚡', '#EF4444'),
('Marketing', 'marketing', 'Digital marketing, social media, and growth hacking', '📈', '#06B6D4');

-- Insert sample courses with different teachers
INSERT INTO public.courses (
    title, slug, description, short_description, teacher_id, category_id,
    thumbnail_url, total_lessons, total_hours, difficulty_level,
    price_foundation, price_advanced, price_mastery, status, is_featured
) VALUES
-- Course 1: Web Development
(
    'Complete React Development Bootcamp',
    'complete-react-bootcamp',
    'Master React from beginner to advanced with hands-on projects. Learn React fundamentals, hooks, context, routing, testing, and deployment. Build 5 real-world projects including an e-commerce site, social media app, and task management system.',
    'Learn React from scratch and build amazing web applications',
    (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1),
    (SELECT id FROM public.course_categories WHERE slug = 'web-development'),
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    32, 24.5, 'beginner',
    4700, 9700, 19700, 'published', true
),
-- Course 2: Design  
(
    'UI/UX Design Masterclass',
    'ui-ux-design-masterclass',
    'Complete guide to user interface and user experience design. Learn design principles, typography, color theory, wireframing, prototyping, and user research. Master Figma, Adobe XD, and Sketch.',
    'Design beautiful and user-friendly interfaces',
    (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1),
    (SELECT id FROM public.course_categories WHERE slug = 'design'),
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    28, 18.0, 'intermediate',
    3700, 7700, 15700, 'published', true
),
-- Course 3: Data Science
(
    'Python Data Science & Machine Learning',
    'python-data-science-ml',
    'Comprehensive data science course using Python. Learn pandas, numpy, matplotlib, scikit-learn, and TensorFlow. Work with real datasets and build machine learning models for prediction and classification.',
    'Become a data scientist with Python and machine learning',
    (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1),
    (SELECT id FROM public.course_categories WHERE slug = 'data-science'),
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    45, 35.0, 'intermediate',
    5700, 11700, 23700, 'published', false
),
-- Course 4: Business
(
    'Digital Marketing Strategy 2024',
    'digital-marketing-strategy-2024',
    'Master digital marketing with latest strategies and tools. Learn SEO, social media marketing, email campaigns, Google Ads, Facebook advertising, content marketing, and analytics.',
    'Grow your business with proven digital marketing tactics',
    (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1),
    (SELECT id FROM public.course_categories WHERE slug = 'marketing'),
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    24, 16.5, 'beginner',
    3700, 7700, 15700, 'published', true
),
-- Course 5: Programming
(
    'JavaScript Fundamentals to Advanced',
    'javascript-fundamentals-advanced',
    'Complete JavaScript course from basics to advanced concepts. Learn ES6+, async programming, DOM manipulation, APIs, Node.js, and modern development tools. Build real projects.',
    'Master JavaScript and become a full-stack developer',
    (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1),
    (SELECT id FROM public.course_categories WHERE slug = 'programming'),
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
    38, 28.0, 'beginner',
    4200, 8700, 17700, 'published', false
);

-- Insert sample modules and lessons for the first course
INSERT INTO public.course_modules (course_id, title, description, order_index) VALUES
((SELECT id FROM public.courses WHERE slug = 'complete-react-bootcamp'), 'Getting Started with React', 'Learn React basics and setup your development environment', 1),
((SELECT id FROM public.courses WHERE slug = 'complete-react-bootcamp'), 'React Components & JSX', 'Master React components, JSX syntax, and component communication', 2),
((SELECT id FROM public.courses WHERE slug = 'complete-react-bootcamp'), 'State Management & Hooks', 'Learn useState, useEffect, and other React hooks', 3),
((SELECT id FROM public.courses WHERE slug = 'complete-react-bootcamp'), 'React Router & Navigation', 'Build single-page applications with React Router', 4);

-- Insert sample lessons
INSERT INTO public.lessons (course_id, module_id, title, description, order_index, video_duration, is_free) VALUES
-- Module 1 lessons
((SELECT id FROM public.courses WHERE slug = 'complete-react-bootcamp'), 
 (SELECT id FROM public.course_modules WHERE title = 'Getting Started with React'), 
 'Welcome to React', 'Introduction to React and course overview', 1, 480, true),
 
((SELECT id FROM public.courses WHERE slug = 'complete-react-bootcamp'), 
 (SELECT id FROM public.course_modules WHERE title = 'Getting Started with React'), 
 'Setting up Development Environment', 'Install Node.js, npm, and create-react-app', 2, 720, true),

-- Module 2 lessons  
((SELECT id FROM public.courses WHERE slug = 'complete-react-bootcamp'), 
 (SELECT id FROM public.course_modules WHERE title = 'React Components & JSX'), 
 'Your First React Component', 'Create and understand React components', 3, 900, false),

((SELECT id FROM public.courses WHERE slug = 'complete-react-bootcamp'), 
 (SELECT id FROM public.course_modules WHERE title = 'React Components & JSX'), 
 'JSX Syntax Deep Dive', 'Master JSX syntax and best practices', 4, 1080, false);

-- Function to enroll student in course after payment
CREATE OR REPLACE FUNCTION public.enroll_student_in_course(
    p_student_id UUID,
    p_course_id UUID,
    p_tier TEXT,
    p_purchase_id UUID
)
RETURNS UUID AS $$
DECLARE
    enrollment_id UUID;
BEGIN
    INSERT INTO public.enrollments (
        student_id,
        course_id,
        tier,
        purchase_id,
        status
    ) VALUES (
        p_student_id,
        p_course_id,
        p_tier,
        p_purchase_id,
        'active'
    )
    RETURNING id INTO enrollment_id;
    
    -- Update course student count
    UPDATE public.courses 
    SET total_students = total_students + 1
    WHERE id = p_course_id;
    
    RETURN enrollment_id;
END;
$$ LANGUAGE plpgsql;

-- Update the course purchase function to create enrollment
CREATE OR REPLACE FUNCTION public.create_course_purchase(
    p_student_id UUID,
    p_course_id UUID,
    p_stripe_payment_intent_id TEXT,
    p_tier TEXT,
    p_amount INTEGER,
    p_teacher_payout_amount INTEGER DEFAULT NULL,
    p_platform_fee_amount INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    purchase_id UUID;
    enrollment_id UUID;
BEGIN
    -- Create purchase record
    INSERT INTO public.course_purchases (
        student_id,
        course_id,
        stripe_payment_intent_id,
        tier,
        amount,
        teacher_payout_amount,
        platform_fee_amount,
        status
    ) VALUES (
        p_student_id,
        p_course_id,
        p_stripe_payment_intent_id,
        p_tier,
        p_amount,
        p_teacher_payout_amount,
        p_platform_fee_amount,
        'completed'
    )
    RETURNING id INTO purchase_id;
    
    -- Create enrollment
    SELECT public.enroll_student_in_course(
        p_student_id,
        p_course_id,
        p_tier,
        purchase_id
    ) INTO enrollment_id;
    
    RETURN purchase_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COURSES SYSTEM SETUP COMPLETE!
-- 
-- Sample courses created with payment integration
-- Ready to test the complete purchase flow
-- =============================================

SELECT 'Course system with payment integration completed!' as status;