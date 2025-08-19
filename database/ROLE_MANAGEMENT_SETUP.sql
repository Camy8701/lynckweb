-- =============================================
-- ROLE MANAGEMENT & ADMIN SYSTEM
-- Add role switching, teacher approval, and admin features
-- =============================================

-- Add role request tracking table
CREATE TABLE public.role_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User making the request
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    requested_role TEXT NOT NULL CHECK (requested_role IN ('teacher', 'admin')),
    current_role TEXT NOT NULL,
    
    -- Request details
    reason TEXT NOT NULL, -- Why they want to become a teacher
    qualifications TEXT, -- Their qualifications/experience
    portfolio_url TEXT, -- Link to portfolio/CV
    additional_info JSONB DEFAULT '{}', -- Any additional data
    
    -- Verification
    email_verified BOOLEAN DEFAULT false,
    verification_token TEXT,
    documents_uploaded BOOLEAN DEFAULT false,
    
    -- Approval process
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'requires_changes')),
    reviewed_by UUID REFERENCES public.profiles(id), -- Admin who reviewed
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT, -- Admin's decision notes
    rejection_reason TEXT, -- If rejected, why
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for role requests
CREATE INDEX idx_role_requests_user_id ON public.role_requests(user_id);
CREATE INDEX idx_role_requests_status ON public.role_requests(status);
CREATE INDEX idx_role_requests_created_at ON public.role_requests(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER role_requests_updated_at
    BEFORE UPDATE ON public.role_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add admin activity log
CREATE TABLE public.admin_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'approve_teacher', 'reject_teacher', 'create_admin', etc.
    target_user_id UUID REFERENCES public.profiles(id), -- User affected by action
    target_type TEXT, -- 'user', 'course', 'role_request', etc.
    target_id UUID, -- ID of the affected entity
    
    details JSONB DEFAULT '{}', -- Action-specific data
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for admin activities
CREATE INDEX idx_admin_activities_admin_id ON public.admin_activities(admin_id);
CREATE INDEX idx_admin_activities_action ON public.admin_activities(action);
CREATE INDEX idx_admin_activities_created_at ON public.admin_activities(created_at DESC);

-- Add permissions table for fine-grained access control
CREATE TABLE public.permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    role TEXT NOT NULL,
    resource TEXT NOT NULL, -- 'courses', 'users', 'analytics', etc.
    action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'approve'
    conditions JSONB DEFAULT '{}', -- Additional conditions (own content only, etc.)
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(role, resource, action)
);

-- Insert default permissions
INSERT INTO public.permissions (role, resource, action, conditions) VALUES
-- Student permissions
('student', 'courses', 'read', '{"scope": "enrolled"}'),
('student', 'lessons', 'read', '{"scope": "enrolled"}'),
('student', 'profile', 'read', '{"scope": "own"}'),
('student', 'profile', 'update', '{"scope": "own"}'),
('student', 'progress', 'read', '{"scope": "own"}'),
('student', 'progress', 'update', '{"scope": "own"}'),
('student', 'certificates', 'read', '{"scope": "own"}'),
('student', 'role_requests', 'create', '{"target_roles": ["teacher"]}'),

-- Teacher permissions
('teacher', 'courses', 'read', '{}'),
('teacher', 'courses', 'create', '{}'),
('teacher', 'courses', 'update', '{"scope": "own"}'),
('teacher', 'courses', 'delete', '{"scope": "own"}'),
('teacher', 'lessons', 'create', '{"scope": "own_courses"}'),
('teacher', 'lessons', 'read', '{}'),
('teacher', 'lessons', 'update', '{"scope": "own"}'),
('teacher', 'lessons', 'delete', '{"scope": "own"}'),
('teacher', 'students', 'read', '{"scope": "enrolled_in_own_courses"}'),
('teacher', 'analytics', 'read', '{"scope": "own_courses"}'),
('teacher', 'profile', 'read', '{"scope": "own"}'),
('teacher', 'profile', 'update', '{"scope": "own"}'),

-- Admin permissions (can do everything)
('admin', 'users', 'read', '{}'),
('admin', 'users', 'update', '{}'),
('admin', 'users', 'delete', '{}'),
('admin', 'courses', 'read', '{}'),
('admin', 'courses', 'update', '{}'),
('admin', 'courses', 'delete', '{}'),
('admin', 'courses', 'approve', '{}'),
('admin', 'role_requests', 'read', '{}'),
('admin', 'role_requests', 'approve', '{}'),
('admin', 'role_requests', 'reject', '{}'),
('admin', 'analytics', 'read', '{}'),
('admin', 'platform_settings', 'read', '{}'),
('admin', 'platform_settings', 'update', '{}'),
('admin', 'admin_activities', 'read', '{}'),
('admin', 'payments', 'read', '{}'),
('admin', 'notifications', 'create', '{"scope": "all_users"}');

-- Add platform statistics view for admin dashboard
CREATE VIEW public.platform_stats AS
SELECT
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'teacher') as total_teachers,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as total_admins,
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.role_requests WHERE status = 'pending') as pending_teacher_requests,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE) as new_users_today,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_this_week,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_this_month;

-- Function to create first admin (call this with your email)
CREATE OR REPLACE FUNCTION public.create_first_admin(admin_email TEXT)
RETURNS TEXT AS $$
DECLARE
    admin_profile_id UUID;
    result_message TEXT;
BEGIN
    -- Check if any admin exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
        RETURN 'Admin already exists. Use existing admin to create new admins.';
    END IF;
    
    -- Find user by email
    SELECT id INTO admin_profile_id 
    FROM public.profiles 
    WHERE email = admin_email;
    
    IF admin_profile_id IS NULL THEN
        RETURN 'User with email ' || admin_email || ' not found. Please sign up first.';
    END IF;
    
    -- Update user to admin
    UPDATE public.profiles 
    SET 
        role = 'admin',
        updated_at = NOW()
    WHERE id = admin_profile_id;
    
    -- Log the action
    INSERT INTO public.admin_activities (
        admin_id, action, target_user_id, details
    ) VALUES (
        admin_profile_id, 'create_first_admin', admin_profile_id, 
        '{"method": "system_function"}'
    );
    
    result_message := 'Successfully created first admin: ' || admin_email;
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Function to approve teacher role requests
CREATE OR REPLACE FUNCTION public.approve_teacher_request(
    request_id UUID,
    admin_id UUID,
    admin_notes_text TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    req_record public.role_requests%ROWTYPE;
    result_message TEXT;
BEGIN
    -- Get the request
    SELECT * INTO req_record FROM public.role_requests WHERE id = request_id;
    
    IF NOT FOUND THEN
        RETURN 'Role request not found';
    END IF;
    
    IF req_record.status != 'pending' THEN
        RETURN 'Request has already been processed';
    END IF;
    
    -- Update user role
    UPDATE public.profiles 
    SET 
        role = req_record.requested_role,
        updated_at = NOW()
    WHERE id = req_record.user_id;
    
    -- Update request status
    UPDATE public.role_requests 
    SET 
        status = 'approved',
        reviewed_by = admin_id,
        reviewed_at = NOW(),
        admin_notes = admin_notes_text,
        updated_at = NOW()
    WHERE id = request_id;
    
    -- Log admin activity
    INSERT INTO public.admin_activities (
        admin_id, action, target_user_id, target_type, target_id, details
    ) VALUES (
        admin_id, 'approve_teacher_request', req_record.user_id, 'role_request', request_id,
        jsonb_build_object('requested_role', req_record.requested_role, 'notes', admin_notes_text)
    );
    
    -- Create notification for user
    INSERT INTO public.notifications (
        user_id, title, message, type, action_url
    ) VALUES (
        req_record.user_id,
        'Teacher Application Approved! 🎉',
        'Congratulations! Your teacher application has been approved. You now have access to create and manage courses.',
        'success',
        '/teacher'
    );
    
    result_message := 'Successfully approved teacher request for user ID: ' || req_record.user_id;
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_requests
CREATE POLICY "Users can view own role requests" ON public.role_requests
    FOR SELECT USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create role requests" ON public.role_requests
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all role requests" ON public.role_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update role requests" ON public.role_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for admin_activities
CREATE POLICY "Admins can view admin activities" ON public.admin_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert admin activities" ON public.admin_activities
    FOR INSERT WITH CHECK (true);

-- RLS Policies for permissions (read-only for now)
CREATE POLICY "Anyone can read permissions" ON public.permissions
    FOR SELECT USING (true);

-- =============================================
-- SETUP INSTRUCTIONS:
-- 
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Create your first admin by running:
--    SELECT public.create_first_admin('your-email@example.com');
-- 3. The system will then support role switching and approvals
-- =============================================

SELECT 'Role management system created successfully!' as status;