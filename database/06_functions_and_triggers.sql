-- =============================================
-- USEFUL FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update course statistics when lessons change
CREATE OR REPLACE FUNCTION update_course_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update course lesson and module counts
    UPDATE public.courses 
    SET 
        total_lessons = (
            SELECT COUNT(*) 
            FROM public.lessons 
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
            AND status = 'published'
        ),
        total_modules = (
            SELECT COUNT(*) 
            FROM public.course_modules 
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        ),
        estimated_duration_minutes = (
            SELECT COALESCE(SUM(video_duration_seconds), 0) / 60
            FROM public.lessons 
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
            AND status = 'published'
        ),
        last_content_update = NOW()
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for course statistics
CREATE TRIGGER lessons_update_course_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION update_course_statistics();

CREATE TRIGGER modules_update_course_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.course_modules
    FOR EACH ROW EXECUTE FUNCTION update_course_statistics();

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_lessons_count INTEGER;
    completed_lessons_count INTEGER;
    total_modules_count INTEGER;
    completed_modules_count INTEGER;
    new_progress DECIMAL(5,2);
BEGIN
    -- Get total lessons and modules for the course
    SELECT 
        c.total_lessons,
        c.total_modules
    INTO total_lessons_count, total_modules_count
    FROM public.courses c
    JOIN public.lessons l ON l.course_id = c.id
    WHERE l.id = NEW.lesson_id;
    
    -- Get completed lessons count for this user and course
    SELECT COUNT(*)
    INTO completed_lessons_count
    FROM public.lesson_completions lc
    JOIN public.lessons l ON l.id = lc.lesson_id
    WHERE l.course_id = (
        SELECT course_id 
        FROM public.lessons 
        WHERE id = NEW.lesson_id
    )
    AND lc.user_id = NEW.user_id
    AND lc.is_completed = true;
    
    -- Calculate progress percentage
    IF total_lessons_count > 0 THEN
        new_progress = (completed_lessons_count::DECIMAL / total_lessons_count::DECIMAL) * 100;
    ELSE
        new_progress = 0;
    END IF;
    
    -- Update course enrollment progress
    UPDATE public.course_enrollments
    SET 
        progress_percentage = new_progress,
        lessons_completed = completed_lessons_count,
        total_lessons = total_lessons_count,
        total_modules = total_modules_count,
        last_accessed_at = NOW(),
        completed_at = CASE 
            WHEN new_progress >= completion_percentage_required AND completed_at IS NULL 
            THEN NOW() 
            ELSE completed_at 
        END,
        status = CASE 
            WHEN new_progress >= completion_percentage_required AND status = 'active'
            THEN 'completed'::enrollment_status
            ELSE status
        END
    WHERE course_id = (
        SELECT course_id 
        FROM public.lessons 
        WHERE id = NEW.lesson_id
    )
    AND user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for enrollment progress updates
CREATE TRIGGER lesson_completion_update_progress
    AFTER INSERT OR UPDATE OF is_completed ON public.lesson_completions
    FOR EACH ROW 
    WHEN (NEW.is_completed = true)
    EXECUTE FUNCTION update_enrollment_progress();

-- Function to update student progress statistics
CREATE OR REPLACE FUNCTION update_student_progress()
RETURNS TRIGGER AS $$
DECLARE
    user_record UUID;
    total_enrolled INTEGER;
    total_completed INTEGER;
    total_in_progress INTEGER;
    total_learning_time INTEGER;
    total_lessons INTEGER;
BEGIN
    user_record = COALESCE(NEW.user_id, OLD.user_id);
    
    -- Get enrollment statistics
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'active' AND progress_percentage > 0)
    INTO total_enrolled, total_completed, total_in_progress
    FROM public.course_enrollments 
    WHERE user_id = user_record;
    
    -- Get total learning time
    SELECT COALESCE(SUM(total_watch_time_seconds), 0)
    INTO total_learning_time
    FROM public.course_enrollments
    WHERE user_id = user_record;
    
    -- Get total lessons completed
    SELECT COUNT(*)
    INTO total_lessons
    FROM public.lesson_completions
    WHERE user_id = user_record AND is_completed = true;
    
    -- Update or insert student progress
    INSERT INTO public.student_progress (
        user_id,
        courses_enrolled,
        courses_completed,
        courses_in_progress,
        total_learning_time_seconds,
        total_lessons_completed,
        updated_at
    ) VALUES (
        user_record,
        total_enrolled,
        total_completed,
        total_in_progress,
        total_learning_time,
        total_lessons,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        courses_enrolled = EXCLUDED.courses_enrolled,
        courses_completed = EXCLUDED.courses_completed,
        courses_in_progress = EXCLUDED.courses_in_progress,
        total_learning_time_seconds = EXCLUDED.total_learning_time_seconds,
        total_lessons_completed = EXCLUDED.total_lessons_completed,
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for student progress updates
CREATE TRIGGER enrollment_update_student_progress
    AFTER INSERT OR UPDATE OR DELETE ON public.course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_student_progress();

-- Function to update daily learning activity
CREATE OR REPLACE FUNCTION update_learning_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.learning_activity (
        user_id,
        activity_date,
        lessons_completed,
        last_activity_at
    ) VALUES (
        NEW.user_id,
        CURRENT_DATE,
        CASE WHEN NEW.is_completed THEN 1 ELSE 0 END,
        NOW()
    )
    ON CONFLICT (user_id, activity_date) DO UPDATE SET
        lessons_completed = learning_activity.lessons_completed + CASE WHEN NEW.is_completed THEN 1 ELSE 0 END,
        last_activity_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for learning activity tracking
CREATE TRIGGER lesson_completion_activity_tracking
    AFTER INSERT OR UPDATE OF is_completed ON public.lesson_completions
    FOR EACH ROW 
    WHEN (NEW.is_completed = true)
    EXECUTE FUNCTION update_learning_activity();

-- Function to update course ratings when reviews are added/updated
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_count INTEGER;
BEGIN
    -- Calculate new average rating and review count
    SELECT 
        ROUND(AVG(rating)::NUMERIC, 2),
        COUNT(*)
    INTO avg_rating, review_count
    FROM public.course_reviews
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    AND is_public = true;
    
    -- Update course statistics
    UPDATE public.courses
    SET 
        average_rating = COALESCE(avg_rating, 0),
        review_count = review_count
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for course rating updates
CREATE TRIGGER course_review_update_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.course_reviews
    FOR EACH ROW EXECUTE FUNCTION update_course_rating();

-- Function to update instructor earnings
CREATE OR REPLACE FUNCTION update_instructor_earnings()
RETURNS TRIGGER AS $$
DECLARE
    instructor_record UUID;
BEGIN
    instructor_record = COALESCE(NEW.instructor_id, OLD.instructor_id);
    
    -- Only process completed payments
    IF NEW.status = 'completed' OR (OLD.status != 'completed' AND NEW.status = 'completed') THEN
        INSERT INTO public.instructor_earnings (instructor_id)
        VALUES (instructor_record)
        ON CONFLICT (instructor_id) DO NOTHING;
        
        -- Update earnings summary
        WITH earnings_data AS (
            SELECT 
                COALESCE(SUM(instructor_payout), 0) as total_earnings,
                COUNT(*) as total_sales,
                COUNT(DISTINCT user_id) as total_students,
                COALESCE(SUM(CASE 
                    WHEN DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', NOW()) 
                    THEN instructor_payout 
                    ELSE 0 
                END), 0) as current_month_earnings,
                COUNT(CASE 
                    WHEN DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', NOW()) 
                    THEN 1 
                END) as current_month_sales
            FROM public.payments
            WHERE instructor_id = instructor_record
            AND status = 'completed'
        )
        UPDATE public.instructor_earnings
        SET 
            total_earnings = earnings_data.total_earnings,
            total_sales = earnings_data.total_sales,
            total_students = earnings_data.total_students,
            current_month_earnings = earnings_data.current_month_earnings,
            current_month_sales = earnings_data.current_month_sales,
            updated_at = NOW()
        FROM earnings_data
        WHERE instructor_id = instructor_record;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for instructor earnings updates
CREATE TRIGGER payment_update_instructor_earnings
    AFTER INSERT OR UPDATE OF status ON public.payments
    FOR EACH ROW 
    WHEN (NEW.instructor_id IS NOT NULL)
    EXECUTE FUNCTION update_instructor_earnings();

-- Function to generate course slug from title
CREATE OR REPLACE FUNCTION generate_course_slug(course_title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from title
    base_slug := LOWER(TRIM(REGEXP_REPLACE(course_title, '[^a-zA-Z0-9\s]', '', 'g')));
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
    base_slug := TRIM(base_slug, '-');
    
    -- Ensure slug is unique
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.courses WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION set_course_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_course_slug(NEW.title);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for course slug generation
CREATE TRIGGER course_set_slug
    BEFORE INSERT ON public.courses
    FOR EACH ROW EXECUTE FUNCTION set_course_slug();

-- Create useful views
CREATE VIEW public.course_analytics AS
SELECT 
    c.id,
    c.title,
    c.instructor_id,
    p.full_name as instructor_name,
    c.status,
    c.enrollment_count,
    c.average_rating,
    c.review_count,
    c.total_lessons,
    c.total_modules,
    COUNT(ce.id) as active_enrollments,
    COUNT(ce.id) FILTER (WHERE ce.status = 'completed') as completed_enrollments,
    AVG(ce.progress_percentage) as avg_progress,
    COALESCE(SUM(pay.instructor_payout), 0) as total_revenue,
    c.created_at,
    c.updated_at
FROM public.courses c
LEFT JOIN public.profiles p ON p.id = c.instructor_id
LEFT JOIN public.course_enrollments ce ON ce.course_id = c.id
LEFT JOIN public.payments pay ON pay.course_id = c.id AND pay.status = 'completed'
GROUP BY c.id, p.full_name;

-- Make the view accessible to instructors
CREATE POLICY "Instructors can view analytics for own courses" ON public.course_analytics
    FOR SELECT USING (instructor_id = auth.uid());

ALTER VIEW public.course_analytics ENABLE ROW LEVEL SECURITY;