import { supabase } from '../lib/supabase';
import getStripe, { stripeConfig, formatPrice, calculatePlatformFee, calculateTeacherPayout } from '../config/stripe';

export const paymentService = {
  // Create Stripe customer
  async createCustomer(userProfile) {
    try {
      // This would typically be done on your backend
      // For now, we'll simulate the customer creation
      const customerData = {
        email: userProfile.email,
        name: userProfile.full_name,
        metadata: {
          user_id: userProfile.id
        }
      };

      // In a real app, this would be a backend API call
      // return await fetch('/api/stripe/create-customer', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(customerData)
      // });

      // For demo purposes, return a mock customer
      return {
        success: true,
        customer: {
          id: `cus_${userProfile.id.replace(/-/g, '').substring(0, 14)}`,
          email: userProfile.email,
          name: userProfile.full_name
        }
      };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return { success: false, error: error.message };
    }
  },

  // Create payment intent for course purchase
  async createCoursePaymentIntent(courseId, tier, amount, studentId) {
    try {
      // This should be done on your backend for security
      const paymentIntentData = {
        amount: amount, // in cents
        currency: 'usd',
        metadata: {
          course_id: courseId,
          tier: tier,
          student_id: studentId,
          type: 'course_purchase'
        }
      };

      // Backend API call (simulated)
      // const response = await fetch('/api/stripe/create-payment-intent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(paymentIntentData)
      // });

      // Mock payment intent for demo
      return {
        success: true,
        paymentIntent: {
          id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 15)}`,
          amount: amount,
          currency: 'usd',
          status: 'requires_payment_method'
        }
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return { success: false, error: error.message };
    }
  },

  // Process course purchase
  async processCoursePayment(paymentIntentId, courseId, tier, amount, studentId, teacherId) {
    try {
      // Calculate fees
      const platformFee = calculatePlatformFee(amount);
      const teacherPayout = calculateTeacherPayout(amount);

      // Create purchase record
      const { data: purchaseId, error } = await supabase
        .rpc('create_course_purchase', {
          p_student_id: studentId,
          p_course_id: courseId,
          p_stripe_payment_intent_id: paymentIntentId,
          p_tier: tier,
          p_amount: amount,
          p_teacher_payout_amount: teacherPayout,
          p_platform_fee_amount: platformFee
        });

      if (error) throw error;

      return {
        success: true,
        purchase: {
          id: purchaseId,
          course_id: courseId,
          tier: tier,
          amount: amount,
          teacher_payout: teacherPayout,
          platform_fee: platformFee
        }
      };
    } catch (error) {
      console.error('Error processing course payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Create subscription
  async createSubscription(customerId, priceId, planName) {
    try {
      // This should be done on your backend
      const subscriptionData = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      };

      // Mock subscription creation
      return {
        success: true,
        subscription: {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
          plan: planName,
          latest_invoice: {
            payment_intent: {
              client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 15)}`
            }
          }
        }
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's subscription
  async getUserSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        success: true,
        subscription: data
      };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's course purchases
  async getUserPurchases(userId) {
    try {
      const { data, error } = await supabase
        .from('course_purchases')
        .select(`
          *,
          courses:course_id (
            title,
            thumbnail_url
          )
        `)
        .eq('student_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        purchases: data || []
      };
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      return { success: false, error: error.message };
    }
  },

  // Get teacher earnings
  async getTeacherEarnings(teacherId) {
    try {
      const { data, error } = await supabase
        .from('teacher_earnings_summary')
        .select('*')
        .eq('teacher_id', teacherId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        success: true,
        earnings: data || {
          total_earnings_dollars: 0,
          pending_payout_cents: 0,
          paid_out_cents: 0,
          total_sales: 0,
          courses_with_sales: 0
        }
      };
    } catch (error) {
      console.error('Error fetching teacher earnings:', error);
      return { success: false, error: error.message };
    }
  },

  // Get payment history
  async getPaymentHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        history: data || []
      };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return { success: false, error: error.message };
    }
  },

  // Save payment method
  async savePaymentMethod(userId, stripePaymentMethodId, paymentMethodData) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([{
          user_id: userId,
          stripe_payment_method_id: stripePaymentMethodId,
          type: paymentMethodData.type,
          card_brand: paymentMethodData.card?.brand,
          card_last4: paymentMethodData.card?.last4,
          card_exp_month: paymentMethodData.card?.exp_month,
          card_exp_year: paymentMethodData.card?.exp_year,
          is_default: true // Set as default for now
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        paymentMethod: data
      };
    } catch (error) {
      console.error('Error saving payment method:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's payment methods
  async getPaymentMethods(userId) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        paymentMethods: data || []
      };
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      // This should be done on your backend
      // const response = await fetch('/api/stripe/cancel-subscription', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ subscription_id: subscriptionId })
      // });

      // Update subscription status in database
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Format price helper
  formatPrice: formatPrice,
  
  // Calculate fees helpers
  calculatePlatformFee: calculatePlatformFee,
  calculateTeacherPayout: calculateTeacherPayout
};