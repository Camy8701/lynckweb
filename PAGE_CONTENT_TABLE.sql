-- =============================================
-- PAGE CONTENT TABLE FOR EDIT SYSTEM
-- Stores editable content with positioning and media
-- =============================================

-- Create page_content table for storing editable elements
CREATE TABLE public.page_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Element identification
    element_id TEXT UNIQUE NOT NULL,
    page_url TEXT DEFAULT '/' NOT NULL,
    
    -- Content data
    content TEXT,                    -- HTML/text content
    background_media TEXT,           -- URL to background image/video
    media_type TEXT,                 -- MIME type of media
    
    -- Text positioning and styling
    text_position JSONB DEFAULT '{}',  -- {position, top, left, transform, textAlign}
    text_styles JSONB DEFAULT '{}',    -- {color, fontSize, fontWeight, etc}
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_page_content_element_id ON public.page_content(element_id);
CREATE INDEX idx_page_content_page_url ON public.page_content(page_url);
CREATE INDEX idx_page_content_updated_at ON public.page_content(updated_at DESC);

-- Create trigger for automatic updated_at
CREATE TRIGGER page_content_updated_at
    BEFORE UPDATE ON public.page_content
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for now, can be tightened later)
CREATE POLICY "Anyone can read page content" ON public.page_content
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert page content" ON public.page_content
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update page content" ON public.page_content
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete page content" ON public.page_content
    FOR DELETE USING (true);

-- Verify the setup
SELECT 'Page content table created successfully!' as status;

-- =============================================
-- SETUP COMPLETE!
-- 
-- This table will store:
-- - Text content changes from EditableText components
-- - Background media (images/videos) from EditableCard uploads
-- - Text positioning data from the move button
-- - Text styling (colors, fonts) from the color picker
-- =============================================