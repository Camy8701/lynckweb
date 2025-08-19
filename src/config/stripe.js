import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration
export const stripeConfig = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
  secretKey: process.env.REACT_APP_STRIPE_SECRET_KEY || 'sk_test_placeholder',
  webhookSecret: process.env.REACT_APP_STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
};

// Initialize Stripe
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripeConfig.publishableKey);
  }
  return stripePromise;
};

export default getStripe;

// Course pricing tiers
export const PRICING_TIERS = {
  foundation: {
    name: 'Foundation',
    description: 'Access to basic course content',
    features: [
      'All video lessons',
      'Basic exercises',
      'Community access',
      'Mobile app access'
    ]
  },
  advanced: {
    name: 'Advanced', 
    description: 'Everything in Foundation plus advanced features',
    features: [
      'Everything in Foundation',
      'Advanced projects',
      'Live Q&A sessions',
      'Direct instructor support',
      'Downloadable resources'
    ]
  },
  mastery: {
    name: 'Mastery',
    description: 'Complete learning experience with certification',
    features: [
      'Everything in Advanced',
      '1-on-1 mentoring sessions',
      'Certificate of completion',
      'Portfolio review',
      'Job placement assistance',
      'Lifetime access'
    ]
  }
};

// Subscription plans for platform access
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Access to free courses only',
      'Basic community access',
      'Limited support'
    ]
  },
  premium: {
    name: 'Premium Student',
    price: 2900, // $29.00 in cents
    priceId: 'price_premium_student', // Will be created in Stripe
    features: [
      'Access to all courses',
      'Priority support',
      'Advanced features',
      'Mobile app',
      'Download for offline viewing'
    ]
  },
  teacher: {
    name: 'Teacher',
    price: 4900, // $49.00 in cents  
    priceId: 'price_teacher_plan',
    features: [
      'Create unlimited courses',
      'Advanced analytics',
      'Student management tools',
      'Marketing tools',
      '85% revenue share'
    ]
  }
};

// Platform fee percentage
export const PLATFORM_FEE_PERCENTAGE = 15; // 15% platform fee, 85% to teacher

// Helper function to format price
export const formatPrice = (cents, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(cents / 100);
};

// Helper function to calculate platform fee
export const calculatePlatformFee = (amount) => {
  return Math.round(amount * (PLATFORM_FEE_PERCENTAGE / 100));
};

// Helper function to calculate teacher payout
export const calculateTeacherPayout = (amount) => {
  return amount - calculatePlatformFee(amount);
};