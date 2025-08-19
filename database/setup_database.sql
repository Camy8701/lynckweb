-- =============================================
-- COMPLETE LYNCK ACADEMY DATABASE SETUP
-- =============================================
-- 
-- Run these scripts in your Supabase SQL editor in order:
-- 1. This setup file
-- 2. 01_users_and_profiles.sql
-- 3. 02_courses_and_categories.sql
-- 4. 03_lessons_and_content.sql
-- 5. 04_student_progress.sql
-- 6. 05_payments_and_transactions.sql
-- 7. 06_functions_and_triggers.sql
-- 
-- Or run all at once by copying each file's content here
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create schema for application (public schema is used by default)
-- All tables will be in public schema for simplicity

-- Create an enum for common statuses
CREATE TYPE public.status_type AS ENUM ('active', 'inactive', 'pending', 'archived');

-- Create a generic function for updating timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Utility function to generate short IDs for order numbers, etc.
CREATE OR REPLACE FUNCTION public.generate_short_id(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, (random() * length(chars))::integer + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate age from date
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Function to format currency
CREATE OR REPLACE FUNCTION public.format_currency(amount DECIMAL, currency TEXT DEFAULT 'USD')
RETURNS TEXT AS $$
BEGIN
    CASE currency
        WHEN 'USD' THEN RETURN '$' || TO_CHAR(amount, 'FM999,999,990.00');
        WHEN 'EUR' THEN RETURN '€' || TO_CHAR(amount, 'FM999,999,990.00');
        WHEN 'GBP' THEN RETURN '£' || TO_CHAR(amount, 'FM999,999,990.00');
        ELSE RETURN currency || ' ' || TO_CHAR(amount, 'FM999,999,990.00');
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create audit log table for tracking important changes
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- What was changed
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    
    -- Who made the change
    user_id UUID, -- May be null for system actions
    user_email TEXT,
    
    -- What changed
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- When and where
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Index for audit logs
CREATE INDEX idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_record ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, user_id, old_values
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, auth.uid(), to_jsonb(OLD)
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, user_id, old_values, new_values
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, auth.uid(), to_jsonb(OLD), to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, user_id, new_values
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, auth.uid(), to_jsonb(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Configuration table for app settings
CREATE TABLE public.app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Whether this setting can be read by frontend
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add some default settings
INSERT INTO public.app_settings (key, value, description, is_public) VALUES
('platform_name', '"Lynck Academy"', 'The name of the platform', true),
('default_currency', '"USD"', 'Default currency for payments', true),
('platform_fee_percentage', '10.0', 'Platform commission percentage', false),
('max_file_size_mb', '100', 'Maximum file upload size in MB', true),
('supported_video_formats', '["mp4", "mov", "avi", "webm"]', 'Supported video formats', true),
('supported_document_formats', '["pdf", "doc", "docx", "txt"]', 'Supported document formats', true),
('email_verification_required', 'true', 'Whether email verification is required', true),
('course_approval_required', 'false', 'Whether courses need admin approval', false);

-- Trigger for app_settings
CREATE TRIGGER app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public settings" ON public.app_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON public.app_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Recipient
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification content
    title TEXT NOT NULL,
    message TEXT,
    type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    
    -- Notification metadata
    action_url TEXT, -- URL to navigate when clicked
    is_read BOOLEAN DEFAULT false,
    
    -- Related entities (optional)
    related_type TEXT, -- 'course', 'lesson', 'payment', etc.
    related_id UUID,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (user_id = auth.uid());

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    recipient_id UUID,
    notification_title TEXT,
    notification_message TEXT DEFAULT NULL,
    notification_type TEXT DEFAULT 'info',
    notification_action_url TEXT DEFAULT NULL,
    notification_related_type TEXT DEFAULT NULL,
    notification_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id, title, message, type, action_url, related_type, related_id
    ) VALUES (
        recipient_id, notification_title, notification_message, notification_type,
        notification_action_url, notification_related_type, notification_related_id
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- READY FOR MAIN SCHEMA SETUP
-- =============================================
-- 
-- Now run the other migration files in order:
-- 1. 01_users_and_profiles.sql
-- 2. 02_courses_and_categories.sql  
-- 3. 03_lessons_and_content.sql
-- 4. 04_student_progress.sql
-- 5. 05_payments_and_transactions.sql
-- 6. 06_functions_and_triggers.sql
-- =============================================

-- Print completion message
SELECT 'Database setup completed! Run the migration files in order.' as status;