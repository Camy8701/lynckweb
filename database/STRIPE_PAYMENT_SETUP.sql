-- =============================================
-- STRIPE PAYMENT SYSTEM SETUP
-- Complete payment processing with Stripe integration
-- =============================================

-- Create payment methods table
CREATE TABLE public.payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT NOT NULL UNIQUE,
    
    -- Payment method details
    type TEXT NOT NULL, -- 'card', 'bank_account', etc.
    card_brand TEXT, -- 'visa', 'mastercard', etc.
    card_last4 TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    
    -- Status
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    
    -- Subscription details
    plan_name TEXT NOT NULL, -- 'free', 'premium', 'teacher'
    status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'unpaid'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    
    -- Pricing
    amount INTEGER NOT NULL, -- in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    interval_type TEXT NOT NULL, -- 'month', 'year'
    
    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create course purchases table (one-time payments)
CREATE TABLE public.course_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL, -- Will reference courses table when created
    stripe_payment_intent_id TEXT NOT NULL UNIQUE,
    
    -- Purchase details
    tier TEXT NOT NULL CHECK (tier IN ('foundation', 'advanced', 'mastery')),
    amount INTEGER NOT NULL, -- in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    
    -- Teacher payout
    teacher_payout_amount INTEGER, -- Amount to be paid to teacher (after platform fee)
    platform_fee_amount INTEGER, -- Platform fee amount
    payout_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    payout_date TIMESTAMPTZ,
    stripe_transfer_id TEXT, -- Stripe transfer ID for teacher payout
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create teacher payouts table
CREATE TABLE public.teacher_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_account_id TEXT NOT NULL, -- Stripe Connect account ID
    
    -- Payout details
    amount INTEGER NOT NULL, -- in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    
    -- Related purchases
    purchase_ids UUID[] NOT NULL, -- Array of course_purchase IDs included in this payout
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_transit', 'paid', 'failed'
    stripe_payout_id TEXT, -- Stripe payout ID
    
    -- Failure details
    failure_code TEXT,
    failure_message TEXT,
    
    -- Timestamps  
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_arrival_date TIMESTAMPTZ
);

-- Create payment history table for audit
CREATE TABLE public.payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Payment details
    type TEXT NOT NULL, -- 'subscription', 'course_purchase', 'refund'
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    
    -- Related entities
    subscription_id UUID REFERENCES public.subscriptions(id),
    course_purchase_id UUID REFERENCES public.course_purchases(id),
    
    -- Stripe details
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    
    -- Status
    status TEXT NOT NULL,
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create webhook events table for Stripe webhook handling
CREATE TABLE public.stripe_webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    stripe_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT false,
    
    -- Event data
    data JSONB NOT NULL,
    
    -- Processing
    processing_attempts INTEGER DEFAULT 0,
    last_processing_error TEXT,
    processed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_payment_methods_stripe_id ON public.payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_methods_default ON public.payment_methods(user_id, is_default) WHERE is_default = true;

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE INDEX idx_course_purchases_student_id ON public.course_purchases(student_id);
CREATE INDEX idx_course_purchases_course_id ON public.course_purchases(course_id);
CREATE INDEX idx_course_purchases_status ON public.course_purchases(status);
CREATE INDEX idx_course_purchases_payout_status ON public.course_purchases(payout_status);

CREATE INDEX idx_teacher_payouts_teacher_id ON public.teacher_payouts(teacher_id);
CREATE INDEX idx_teacher_payouts_status ON public.teacher_payouts(status);
CREATE INDEX idx_teacher_payouts_created_at ON public.teacher_payouts(created_at DESC);

CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_type ON public.payment_history(type);
CREATE INDEX idx_payment_history_created_at ON public.payment_history(created_at DESC);

CREATE INDEX idx_stripe_webhook_events_stripe_id ON public.stripe_webhook_events(stripe_event_id);
CREATE INDEX idx_stripe_webhook_events_processed ON public.stripe_webhook_events(processed, created_at);

-- Add triggers for updated_at
CREATE TRIGGER payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER course_purchases_updated_at
    BEFORE UPDATE ON public.course_purchases
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER teacher_payouts_updated_at
    BEFORE UPDATE ON public.teacher_payouts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
CREATE POLICY "Users can manage own payment methods" ON public.payment_methods
    FOR ALL USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can manage subscriptions" ON public.subscriptions
    FOR ALL USING (true); -- Webhooks need full access

-- RLS Policies for course_purchases  
CREATE POLICY "Students can view own purchases" ON public.course_purchases
    FOR SELECT USING (student_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Teachers can view purchases of their courses" ON public.course_purchases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() 
            AND p.role = 'teacher'
            -- Add course ownership check when courses table is ready
        )
    );

CREATE POLICY "System can manage course purchases" ON public.course_purchases
    FOR ALL USING (true); -- Webhooks need full access

-- RLS Policies for teacher_payouts
CREATE POLICY "Teachers can view own payouts" ON public.teacher_payouts
    FOR SELECT USING (teacher_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all payouts" ON public.teacher_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can manage payouts" ON public.teacher_payouts
    FOR ALL USING (true); -- System processes need full access

-- RLS Policies for payment_history
CREATE POLICY "Users can view own payment history" ON public.payment_history
    FOR SELECT USING (user_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for webhook events (admin only)
CREATE POLICY "Admins can view webhook events" ON public.stripe_webhook_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to create a course purchase record
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
BEGIN
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
    
    -- Create enrollment record (when enrollments table exists)
    -- INSERT INTO public.enrollments (student_id, course_id, tier, access_level)
    -- VALUES (p_student_id, p_course_id, p_tier, 'full');
    
    -- Add to payment history
    INSERT INTO public.payment_history (
        user_id,
        type,
        amount,
        course_purchase_id,
        stripe_payment_intent_id,
        status,
        description
    ) VALUES (
        p_student_id,
        'course_purchase',
        p_amount,
        purchase_id,
        p_stripe_payment_intent_id,
        'completed',
        'Course purchase: ' || p_tier || ' tier'
    );
    
    RETURN purchase_id;
END;
$$ LANGUAGE plpgsql;

-- Function to handle subscription creation/update
CREATE OR REPLACE FUNCTION public.handle_subscription_change(
    p_user_id UUID,
    p_stripe_subscription_id TEXT,
    p_stripe_customer_id TEXT,
    p_plan_name TEXT,
    p_status TEXT,
    p_amount INTEGER,
    p_current_period_start TIMESTAMPTZ,
    p_current_period_end TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
    subscription_id UUID;
BEGIN
    -- Upsert subscription
    INSERT INTO public.subscriptions (
        user_id,
        stripe_subscription_id,
        stripe_customer_id,
        plan_name,
        status,
        amount,
        current_period_start,
        current_period_end
    ) VALUES (
        p_user_id,
        p_stripe_subscription_id,
        p_stripe_customer_id,
        p_plan_name,
        p_status,
        p_amount,
        p_current_period_start,
        p_current_period_end
    )
    ON CONFLICT (stripe_subscription_id) DO UPDATE SET
        status = p_status,
        amount = p_amount,
        current_period_start = p_current_period_start,
        current_period_end = p_current_period_end,
        updated_at = NOW()
    RETURNING id INTO subscription_id;
    
    -- Update user's subscription status in profiles
    UPDATE public.profiles 
    SET updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for teacher earnings summary
CREATE VIEW public.teacher_earnings_summary AS
SELECT 
    p.id as teacher_id,
    p.full_name as teacher_name,
    p.email as teacher_email,
    
    -- Total earnings
    COALESCE(SUM(cp.teacher_payout_amount), 0) as total_earnings_cents,
    COALESCE(SUM(cp.teacher_payout_amount), 0) / 100.0 as total_earnings_dollars,
    
    -- Pending payouts
    COALESCE(SUM(CASE WHEN cp.payout_status = 'pending' THEN cp.teacher_payout_amount ELSE 0 END), 0) as pending_payout_cents,
    
    -- Completed payouts
    COALESCE(SUM(CASE WHEN cp.payout_status = 'paid' THEN cp.teacher_payout_amount ELSE 0 END), 0) as paid_out_cents,
    
    -- Course sales count
    COUNT(cp.id) as total_sales,
    COUNT(DISTINCT cp.course_id) as courses_with_sales,
    
    -- Date ranges
    MIN(cp.created_at) as first_sale_date,
    MAX(cp.created_at) as latest_sale_date
    
FROM public.profiles p
LEFT JOIN public.course_purchases cp ON cp.student_id = p.id AND cp.status = 'completed'
WHERE p.role = 'teacher'
GROUP BY p.id, p.full_name, p.email;

-- =============================================
-- PAYMENT SYSTEM SETUP COMPLETE!
-- 
-- Next steps:
-- 1. Set up Stripe webhook endpoints
-- 2. Configure Stripe products and prices
-- 3. Implement payment flows in React
-- =============================================

SELECT 'Stripe payment system database setup completed!' as status;