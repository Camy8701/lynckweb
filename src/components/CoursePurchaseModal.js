import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import CoursePricing from './CoursePricing';
import StripeCheckout from './StripeCheckout';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../contexts/Auth0Context';

const CoursePurchaseModal = ({ 
  course, 
  isOpen, 
  onClose, 
  onPurchaseSuccess 
}) => {
  const { profile } = useAuth();
  const [step, setStep] = useState('pricing'); // 'pricing', 'checkout', 'success', 'error'
  const [selectedTier, setSelectedTier] = useState('foundation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);

  useEffect(() => {
    if (isOpen && profile) {
      loadUserSubscription();
      setStep('pricing');
      setError(null);
    }
  }, [isOpen, profile]);

  const loadUserSubscription = async () => {
    try {
      const result = await paymentService.getUserSubscription(profile.id);
      if (result.success) {
        setUserSubscription(result.subscription);
      }
    } catch (err) {
      console.error('Error loading user subscription:', err);
    }
  };

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
  };

  const handleProceedToCheckout = () => {
    setStep('checkout');
  };

  const handlePaymentSuccess = (purchase) => {
    setPurchaseData(purchase);
    setStep('success');
    onPurchaseSuccess?.(purchase);
  };

  const handlePaymentError = (error) => {
    setError(error);
    setStep('error');
  };

  const handleClose = () => {
    setStep('pricing');
    setError(null);
    setPurchaseData(null);
    onClose();
  };

  const getTierPrice = (tier) => {
    if (!course) return 0;
    
    const basePrice = course[`price_${tier}`] || 0;
    
    // Apply subscription discounts
    if (userSubscription?.plan_name === 'premium') {
      return Math.round(basePrice * 0.8); // 20% discount
    }
    if (userSubscription?.plan_name === 'teacher') {
      return Math.round(basePrice * 0.7); // 30% discount
    }
    
    return basePrice;
  };

  const currentPrice = getTierPrice(selectedTier);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="backdrop-blur-md bg-zinc-900/95 border border-white/20 rounded-xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                {step === 'pricing' && 'Choose Your Plan'}
                {step === 'checkout' && 'Complete Purchase'}
                {step === 'success' && 'Purchase Successful!'}
                {step === 'error' && 'Payment Failed'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'pricing' && (
                <div>
                  <CoursePricing
                    course={course}
                    selectedTier={selectedTier}
                    onSelectTier={handleTierSelect}
                    userSubscription={userSubscription}
                    loading={loading}
                  />
                  
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleProceedToCheckout}
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {step === 'checkout' && (
                <div>
                  {/* Back Button */}
                  <button
                    onClick={() => setStep('pricing')}
                    className="mb-6 text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    ← Back to Pricing
                  </button>

                  <StripeCheckout
                    course={course}
                    selectedTier={selectedTier}
                    amount={currentPrice}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={() => setStep('pricing')}
                  />
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Welcome to {course.title}!
                  </h3>
                  <p className="text-gray-300 mb-8 max-w-md mx-auto">
                    Your purchase was successful. You now have full access to the {selectedTier} tier content.
                  </p>
                  
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 mb-8 max-w-md mx-auto">
                    <h4 className="font-semibold text-white mb-2">Purchase Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Course:</span>
                        <span className="text-white">{course.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Tier:</span>
                        <span className="text-white capitalize">{selectedTier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Amount:</span>
                        <span className="text-white">{paymentService.formatPrice(currentPrice)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={handleClose}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleClose();
                        // Navigate to course - you can implement this based on your routing
                        window.location.href = `/course/${course.id}`;
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              )}

              {step === 'error' && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Payment Failed
                  </h3>
                  <p className="text-gray-300 mb-8 max-w-md mx-auto">
                    {error || 'Something went wrong with your payment. Please try again.'}
                  </p>
                  
                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={handleClose}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setError(null);
                        setStep('checkout');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePurchaseModal;