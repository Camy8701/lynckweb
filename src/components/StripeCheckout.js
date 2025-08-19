import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check, AlertCircle, CreditCard, Lock } from 'lucide-react';
import getStripe, { formatPrice } from '../config/stripe';
import { useAuth } from '../contexts/Auth0Context';
import { paymentService } from '../services/paymentService';

const CheckoutForm = ({ 
  course, 
  selectedTier, 
  amount, 
  onSuccess, 
  onError, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, profile } = useAuth();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, [course.id, selectedTier, amount]);

  const createPaymentIntent = async () => {
    try {
      const result = await paymentService.createCoursePaymentIntent(
        course.id,
        selectedTier,
        amount,
        profile.id
      );

      if (result.success) {
        setPaymentIntent(result.paymentIntent);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to initialize payment');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !paymentIntent) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.name || profile?.full_name,
              email: user?.email || profile?.email,
            },
          },
        }
      );

      if (error) {
        setError(error.message);
        onError?.(error);
      } else if (confirmedPaymentIntent.status === 'succeeded') {
        // Payment succeeded, process the course purchase
        const purchaseResult = await paymentService.processCoursePayment(
          confirmedPaymentIntent.id,
          course.id,
          selectedTier,
          amount,
          profile.id,
          course.teacher_id
        );

        if (purchaseResult.success) {
          onSuccess?.(purchaseResult.purchase);
        } else {
          setError('Payment succeeded but failed to process course access. Please contact support.');
          onError?.(purchaseResult.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      onError?.(err);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#9ca3af',
        },
        backgroundColor: 'transparent',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
        
        <div className="flex items-start space-x-4 mb-4">
          <img
            src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop'}
            alt={course.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h4 className="font-medium text-white">{course.title}</h4>
            <p className="text-gray-300 text-sm">by {course.instructor || 'Instructor'}</p>
            <p className="text-blue-400 text-sm capitalize">{selectedTier} Tier</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">{formatPrice(amount)}</div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between items-center text-white">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">{formatPrice(amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Payment Information</h3>
        </div>

        {/* Card Element */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            Card Details
          </label>
          <div className="bg-black/30 border border-white/20 rounded-lg p-4">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mb-6 bg-green-500/20 border border-green-400/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm">
              Your payment information is secure and encrypted
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-500 text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
            disabled={processing}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!stripe || processing}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay ${formatPrice(amount)}`
            )}
          </button>
        </div>
      </div>

      {/* Terms */}
      <div className="text-center">
        <p className="text-gray-400 text-xs">
          By completing your purchase, you agree to our{' '}
          <a href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
        </p>
      </div>
    </form>
  );
};

const StripeCheckout = ({ course, selectedTier, amount, onSuccess, onError, onCancel }) => {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        course={course}
        selectedTier={selectedTier}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripeCheckout;