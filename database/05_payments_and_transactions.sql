-- =============================================
-- PAYMENTS AND TRANSACTIONS SCHEMA
-- =============================================

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded');

-- Payment methods
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'crypto', 'gift_card');

-- Transaction types
CREATE TYPE transaction_type AS ENUM ('course_purchase', 'subscription', 'refund', 'payout', 'fee', 'bonus');

-- Currency codes
CREATE TYPE currency_code AS ENUM ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR');

-- Main payments table
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Payment identification
    external_id TEXT UNIQUE, -- Stripe payment intent ID, PayPal transaction ID, etc.
    order_number TEXT UNIQUE NOT NULL DEFAULT 'LYN' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT, 10, '0'),
    
    -- Payment parties
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    instructor_id UUID REFERENCES public.profiles(id), -- Who receives the payment
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency currency_code NOT NULL DEFAULT 'USD',
    payment_method payment_method NOT NULL,
    
    -- Transaction details
    transaction_type transaction_type NOT NULL DEFAULT 'course_purchase',
    status payment_status NOT NULL DEFAULT 'pending',
    
    -- Related entities
    course_id UUID REFERENCES public.courses(id),
    tier_level TEXT, -- For tiered course purchases
    enrollment_id UUID REFERENCES public.course_enrollments(id),
    
    -- Payment processor details
    payment_processor TEXT DEFAULT 'stripe', -- 'stripe', 'paypal', 'manual'
    processor_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount - COALESCE(processor_fee, 0)) STORED,
    
    -- Platform fee (Lynck Academy commission)
    platform_fee_percentage DECIMAL(5,2) DEFAULT 10.00,
    platform_fee_amount DECIMAL(10,2) GENERATED ALWAYS AS (net_amount * (platform_fee_percentage / 100)) STORED,
    instructor_payout DECIMAL(10,2) GENERATED ALWAYS AS (net_amount - (net_amount * (platform_fee_percentage / 100))) STORED,
    
    -- Payment metadata
    payment_description TEXT,
    customer_email TEXT,
    billing_address JSONB,
    
    -- Discount and promotions
    discount_code TEXT,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    original_amount DECIMAL(10,2), -- Before discount
    
    -- Refund tracking
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ -- For pending payments
);

-- Subscription plans
CREATE TABLE public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency currency_code NOT NULL DEFAULT 'USD',
    billing_interval TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly', 'weekly'
    trial_period_days INTEGER DEFAULT 0,
    
    -- Plan features
    features JSONB DEFAULT '[]', -- [{name, included, limit}, ...]
    max_courses INTEGER, -- NULL = unlimited
    max_students INTEGER, -- NULL = unlimited (for instructors)
    
    -- Plan settings
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    
    -- Subscription details
    external_subscription_id TEXT, -- Stripe subscription ID
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'past_due', 'unpaid'
    
    -- Billing
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    
    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Discount codes and promotions
CREATE TABLE public.discount_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Discount details
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed_amount'
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2), -- For percentage discounts
    
    -- Usage limits
    max_uses INTEGER, -- NULL = unlimited
    used_count INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    
    -- Validity
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    -- Applicable courses/instructors
    applicable_courses UUID[], -- Empty = all courses
    applicable_instructors UUID[], -- Empty = all instructors
    
    -- Creator
    created_by UUID REFERENCES public.profiles(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Instructor payouts
CREATE TABLE public.instructor_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    instructor_id UUID NOT NULL REFERENCES public.profiles(id),
    
    -- Payout details
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency currency_code NOT NULL DEFAULT 'USD',
    payout_method TEXT DEFAULT 'bank_transfer', -- 'bank_transfer', 'paypal', 'stripe'
    
    -- Period covered
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'failed'
    external_payout_id TEXT, -- Stripe transfer ID, PayPal batch ID, etc.
    
    -- Included payments
    payment_ids UUID[] NOT NULL,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    
    -- Payout metadata
    payout_description TEXT,
    fees_deducted DECIMAL(10,2) DEFAULT 0,
    net_payout DECIMAL(10,2) GENERATED ALWAYS AS (amount - COALESCE(fees_deducted, 0)) STORED,
    
    -- Bank details (encrypted)
    bank_details JSONB, -- Only for manual payouts
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ
);

-- Instructor earnings summary (materialized view for performance)
CREATE TABLE public.instructor_earnings (
    instructor_id UUID PRIMARY KEY REFERENCES public.profiles(id),
    
    -- Total earnings
    total_earnings DECIMAL(12,2) DEFAULT 0,
    total_payouts DECIMAL(12,2) DEFAULT 0,
    pending_payout DECIMAL(12,2) DEFAULT 0,
    
    -- Current month
    current_month_earnings DECIMAL(10,2) DEFAULT 0,
    current_month_sales INTEGER DEFAULT 0,
    
    -- All time stats
    total_sales INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    
    -- Last updated
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add triggers
CREATE TRIGGER user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER instructor_earnings_updated_at
    BEFORE UPDATE ON public.instructor_earnings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_instructor ON public.payments(instructor_id);
CREATE INDEX idx_payments_course ON public.payments(course_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at);
CREATE INDEX idx_payments_external_id ON public.payments(external_id) WHERE external_id IS NOT NULL;

CREATE INDEX idx_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan ON public.user_subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_subscriptions_period ON public.user_subscriptions(current_period_start, current_period_end);

CREATE INDEX idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX idx_discount_codes_valid ON public.discount_codes(valid_from, valid_until, is_active);

CREATE INDEX idx_payouts_instructor ON public.instructor_payouts(instructor_id);
CREATE INDEX idx_payouts_status ON public.instructor_payouts(status);
CREATE INDEX idx_payouts_period ON public.instructor_payouts(period_start, period_end);

-- Row Level Security Policies

-- Payments
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Instructors can view payments for own courses" ON public.payments
    FOR SELECT USING (instructor_id = auth.uid());

-- Subscription Plans
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- User Subscriptions
CREATE POLICY "Users can manage own subscriptions" ON public.user_subscriptions
    FOR ALL USING (user_id = auth.uid());

-- Discount Codes
CREATE POLICY "Anyone can view active discount codes" ON public.discount_codes
    FOR SELECT USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

-- Instructor Payouts
CREATE POLICY "Instructors can view own payouts" ON public.instructor_payouts
    FOR SELECT USING (instructor_id = auth.uid());

-- Instructor Earnings
CREATE POLICY "Instructors can view own earnings" ON public.instructor_earnings
    FOR SELECT USING (instructor_id = auth.uid());

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_earnings ENABLE ROW LEVEL SECURITY;