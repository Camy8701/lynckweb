-- =============================================
-- LESSONS AND CONTENT SCHEMA
-- =============================================

-- Lesson content types
CREATE TYPE lesson_content_type AS ENUM ('video', 'text', 'quiz', 'assignment', 'download', 'live_session');

-- Lesson status
CREATE TYPE lesson_status AS ENUM ('draft', 'published', 'archived');

-- Main lessons table
CREATE TABLE public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Lesson identification
    title TEXT NOT NULL,
    slug TEXT NOT NULL, -- Unique within course
    description TEXT,
    
    -- Course organization
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Lesson content
    content_type lesson_content_type NOT NULL DEFAULT 'video',
    content JSONB DEFAULT '{}', -- Flexible content storage based on type
    
    -- Video-specific fields
    video_url TEXT,
    video_duration_seconds INTEGER DEFAULT 0,
    video_thumbnail_url TEXT,
    video_provider TEXT DEFAULT 'upload', -- 'upload', 'youtube', 'vimeo', etc.
    video_provider_id TEXT,
    
    -- Text content
    text_content TEXT,
    
    -- Downloadable resources
    resources JSONB DEFAULT '[]', -- [{name, url, type, size}, ...]
    
    -- Lesson settings
    status lesson_status NOT NULL DEFAULT 'draft',
    is_free_preview BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT true,
    
    -- Learning objectives
    learning_objectives TEXT[] DEFAULT '{}',
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    average_completion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz questions (for quiz-type lessons)
CREATE TABLE public.lesson_quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    
    question TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'text', 'code'
    options JSONB DEFAULT '[]', -- For multiple choice: [{text, is_correct}, ...]
    correct_answer TEXT, -- For non-multiple choice
    explanation TEXT,
    points INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lesson assignments
CREATE TABLE public.lesson_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    
    -- Assignment settings
    max_points INTEGER DEFAULT 100,
    time_limit_minutes INTEGER, -- NULL = no time limit
    max_attempts INTEGER, -- NULL = unlimited
    
    -- Submission settings
    submission_type TEXT DEFAULT 'text', -- 'text', 'file', 'url', 'code'
    allowed_file_types TEXT[] DEFAULT '{}',
    max_file_size_mb INTEGER DEFAULT 10,
    
    due_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lesson completion tracking
CREATE TABLE public.lesson_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Completion tracking
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    watch_time_seconds INTEGER DEFAULT 0, -- For video lessons
    
    -- Quiz/Assignment results
    quiz_score INTEGER DEFAULT 0,
    quiz_max_score INTEGER DEFAULT 0,
    quiz_attempts INTEGER DEFAULT 0,
    assignment_score INTEGER DEFAULT 0,
    assignment_submission TEXT,
    assignment_submitted_at TIMESTAMPTZ,
    assignment_graded_at TIMESTAMPTZ,
    assignment_feedback TEXT,
    
    -- Timestamps
    first_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(lesson_id, user_id)
);

-- Lesson notes (student notes for lessons)
CREATE TABLE public.lesson_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    timestamp_seconds INTEGER, -- For video lessons - which part of video
    is_private BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add updated_at triggers
CREATE TRIGGER lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER lesson_notes_updated_at
    BEFORE UPDATE ON public.lesson_notes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_lessons_course ON public.lessons(course_id);
CREATE INDEX idx_lessons_module ON public.lessons(module_id);
CREATE INDEX idx_lessons_sort ON public.lessons(course_id, sort_order);
CREATE INDEX idx_lessons_status ON public.lessons(status);
CREATE INDEX idx_lessons_content_type ON public.lessons(content_type);

CREATE INDEX idx_quiz_questions_lesson ON public.lesson_quiz_questions(lesson_id);
CREATE INDEX idx_assignments_lesson ON public.lesson_assignments(lesson_id);

CREATE INDEX idx_lesson_completions_user ON public.lesson_completions(user_id);
CREATE INDEX idx_lesson_completions_lesson ON public.lesson_completions(lesson_id);
CREATE INDEX idx_lesson_completions_completed ON public.lesson_completions(lesson_id, user_id, is_completed);

CREATE INDEX idx_lesson_notes_user ON public.lesson_notes(user_id);
CREATE INDEX idx_lesson_notes_lesson ON public.lesson_notes(lesson_id);

-- Row Level Security Policies

-- Lessons
CREATE POLICY "Anyone can view published lessons of published courses" ON public.lessons
    FOR SELECT USING (
        status = 'published' AND
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = lessons.course_id 
            AND courses.status = 'published' 
            AND courses.is_public = true
        )
    );

CREATE POLICY "Instructors can manage own course lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE courses.id = lessons.course_id 
            AND (courses.instructor_id = auth.uid() OR auth.uid() = ANY(courses.co_instructors))
        )
    );

-- Quiz Questions
CREATE POLICY "Anyone can view quiz questions for accessible lessons" ON public.lesson_quiz_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lessons l
            JOIN public.courses c ON c.id = l.course_id
            WHERE l.id = lesson_quiz_questions.lesson_id 
            AND l.status = 'published' 
            AND c.status = 'published' 
            AND c.is_public = true
        )
    );

CREATE POLICY "Instructors can manage quiz questions for own courses" ON public.lesson_quiz_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.lessons l
            JOIN public.courses c ON c.id = l.course_id
            WHERE l.id = lesson_quiz_questions.lesson_id 
            AND (c.instructor_id = auth.uid() OR auth.uid() = ANY(c.co_instructors))
        )
    );

-- Lesson Completions
CREATE POLICY "Users can manage own lesson completions" ON public.lesson_completions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Instructors can view completions for own courses" ON public.lesson_completions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lessons l
            JOIN public.courses c ON c.id = l.course_id
            WHERE l.id = lesson_completions.lesson_id 
            AND (c.instructor_id = auth.uid() OR auth.uid() = ANY(c.co_instructors))
        )
    );

-- Lesson Notes
CREATE POLICY "Users can manage own lesson notes" ON public.lesson_notes
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;