-- =============================================
-- STUDENT PROGRESS AND ENROLLMENT SCHEMA
-- =============================================

-- Enrollment status
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'paused', 'dropped', 'refunded');

-- Course enrollments
CREATE TABLE public.course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Enrollment identification
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Enrollment details
    status enrollment_status NOT NULL DEFAULT 'active',
    tier_level TEXT, -- 'foundation', 'advanced', 'mastery' for tiered courses
    enrollment_source TEXT DEFAULT 'direct', -- 'direct', 'promotion', 'gift', etc.
    
    -- Progress tracking
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    lessons_completed INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    modules_completed INTEGER DEFAULT 0,
    total_modules INTEGER DEFAULT 0,
    
    -- Time tracking
    total_watch_time_seconds INTEGER DEFAULT 0,
    estimated_completion_date DATE,
    
    -- Completion tracking
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    completion_percentage_required DECIMAL(5,2) DEFAULT 80.00,
    
    -- Access control
    access_expires_at TIMESTAMPTZ, -- For time-limited access
    is_lifetime_access BOOLEAN DEFAULT true,
    
    -- Timestamps
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    
    UNIQUE(course_id, user_id)
);

-- Student overall progress and achievements
CREATE TABLE public.student_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Overall statistics
    courses_enrolled INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    courses_in_progress INTEGER DEFAULT 0,
    
    total_learning_time_seconds INTEGER DEFAULT 0,
    total_lessons_completed INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    
    -- Skill tracking
    skill_badges JSONB DEFAULT '[]', -- [{skill, level, earned_date}, ...]
    certificates_earned INTEGER DEFAULT 0,
    
    -- Learning preferences (updated based on behavior)
    preferred_categories TEXT[] DEFAULT '{}',
    preferred_difficulty TEXT DEFAULT 'beginner',
    average_session_duration_minutes INTEGER DEFAULT 0,
    
    -- Gamification
    experience_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    achievements JSONB DEFAULT '[]', -- [{achievement_id, earned_date, points}, ...]
    
    -- Timestamps
    first_enrollment_date DATE,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Learning streaks and activity
CREATE TABLE public.learning_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Daily activity metrics
    lessons_completed INTEGER DEFAULT 0,
    total_watch_time_seconds INTEGER DEFAULT 0,
    quizzes_taken INTEGER DEFAULT 0,
    assignments_submitted INTEGER DEFAULT 0,
    
    -- Engagement metrics
    courses_accessed INTEGER DEFAULT 0,
    session_count INTEGER DEFAULT 1,
    first_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, activity_date)
);

-- Course reviews and ratings
CREATE TABLE public.course_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    
    -- Review metadata
    is_verified_purchase BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    
    -- Helpfulness tracking
    helpful_count INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(course_id, user_id)
);

-- Bookmarks and favorites
CREATE TABLE public.course_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    -- Bookmark details
    bookmark_type TEXT DEFAULT 'favorite', -- 'favorite', 'watchlist', 'completed'
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, course_id, bookmark_type)
);

-- Learning goals and objectives
CREATE TABLE public.learning_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    
    -- Goal tracking
    target_courses_to_complete INTEGER DEFAULT 1,
    target_completion_date DATE,
    target_learning_time_hours INTEGER DEFAULT 10,
    
    -- Progress
    courses_completed INTEGER DEFAULT 0,
    total_learning_time_seconds INTEGER DEFAULT 0,
    is_achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMPTZ,
    
    -- Goal settings
    is_active BOOLEAN DEFAULT true,
    reminder_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'none'
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add updated_at triggers
CREATE TRIGGER student_progress_updated_at
    BEFORE UPDATE ON public.student_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER course_reviews_updated_at
    BEFORE UPDATE ON public.course_reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER learning_goals_updated_at
    BEFORE UPDATE ON public.learning_goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX idx_enrollments_status ON public.course_enrollments(status);
CREATE INDEX idx_enrollments_enrolled_at ON public.course_enrollments(enrolled_at);

CREATE INDEX idx_student_progress_user ON public.student_progress(user_id);
CREATE INDEX idx_student_progress_level ON public.student_progress(level);

CREATE INDEX idx_learning_activity_user ON public.learning_activity(user_id);
CREATE INDEX idx_learning_activity_date ON public.learning_activity(activity_date);
CREATE INDEX idx_learning_activity_user_date ON public.learning_activity(user_id, activity_date);

CREATE INDEX idx_course_reviews_course ON public.course_reviews(course_id);
CREATE INDEX idx_course_reviews_user ON public.course_reviews(user_id);
CREATE INDEX idx_course_reviews_rating ON public.course_reviews(rating);
CREATE INDEX idx_course_reviews_public ON public.course_reviews(is_public) WHERE is_public = true;

CREATE INDEX idx_bookmarks_user ON public.course_bookmarks(user_id);
CREATE INDEX idx_bookmarks_course ON public.course_bookmarks(course_id);

CREATE INDEX idx_learning_goals_user ON public.learning_goals(user_id);
CREATE INDEX idx_learning_goals_active ON public.learning_goals(is_active) WHERE is_active = true;

-- Row Level Security Policies

-- Course Enrollments
CREATE POLICY "Users can view own enrollments" ON public.course_enrollments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can enroll themselves" ON public.course_enrollments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own enrollments" ON public.course_enrollments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Instructors can view enrollments for own courses" ON public.course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = course_enrollments.course_id 
            AND (courses.instructor_id = auth.uid() OR auth.uid() = ANY(courses.co_instructors))
        )
    );

-- Student Progress
CREATE POLICY "Users can manage own progress" ON public.student_progress
    FOR ALL USING (user_id = auth.uid());

-- Learning Activity
CREATE POLICY "Users can manage own learning activity" ON public.learning_activity
    FOR ALL USING (user_id = auth.uid());

-- Course Reviews
CREATE POLICY "Anyone can view public reviews" ON public.course_reviews
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own reviews" ON public.course_reviews
    FOR ALL USING (user_id = auth.uid());

-- Course Bookmarks
CREATE POLICY "Users can manage own bookmarks" ON public.course_bookmarks
    FOR ALL USING (user_id = auth.uid());

-- Learning Goals
CREATE POLICY "Users can manage own learning goals" ON public.learning_goals
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;