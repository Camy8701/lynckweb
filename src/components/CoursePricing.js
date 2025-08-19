import React, { useState } from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { PRICING_TIERS, formatPrice } from '../config/stripe';

const CoursePricing = ({ 
  course, 
  onSelectTier, 
  selectedTier = 'foundation',
  loading = false,
  userSubscription = null 
}) => {
  const [activeTier, setActiveTier] = useState(selectedTier);

  const handleTierSelect = (tier) => {
    setActiveTier(tier);
    onSelectTier(tier);
  };

  // Check if user has premium subscription for discounts
  const hasPremiumSubscription = userSubscription?.plan_name === 'premium';
  const hasTeacherSubscription = userSubscription?.plan_name === 'teacher';

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'foundation':
        return <Star className="w-6 h-6" />;
      case 'advanced':
        return <Zap className="w-6 h-6" />;
      case 'mastery':
        return <Crown className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getTierPrice = (tier) => {
    if (!course) return 0;
    
    const basePrice = course[`price_${tier}`] || 0;
    
    // Apply discounts for subscribers
    if (hasPremiumSubscription) {
      return Math.round(basePrice * 0.8); // 20% discount for premium subscribers
    }
    if (hasTeacherSubscription) {
      return Math.round(basePrice * 0.7); // 30% discount for teachers
    }
    
    return basePrice;
  };

  const getDiscountLabel = () => {
    if (hasPremiumSubscription) return '20% Premium Discount';
    if (hasTeacherSubscription) return '30% Teacher Discount';
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Discount Notice */}
      {getDiscountLabel() && (
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">{getDiscountLabel()} Applied!</span>
          </div>
        </div>
      )}

      {/* Pricing Tiers */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(PRICING_TIERS).map(([tier, tierData]) => {
          const isActive = activeTier === tier;
          const isPopular = tier === 'advanced';
          const price = getTierPrice(tier);
          const originalPrice = course?.[`price_${tier}`] || 0;
          const hasDiscount = price < originalPrice;

          return (
            <div
              key={tier}
              className={`relative backdrop-blur-md border rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                isActive
                  ? 'border-blue-500 bg-blue-600/20 scale-105'
                  : 'border-white/20 bg-white/10 hover:border-white/40 hover:scale-102'
              }`}
              onClick={() => handleTierSelect(tier)}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white'
                }`}>
                  {getTierIcon(tier)}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${
                  isActive ? 'text-blue-300' : 'text-white'
                }`}>
                  {tierData.name}
                </h3>
                
                <p className="text-gray-300 text-sm">{tierData.description}</p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                {hasDiscount && (
                  <div className="text-gray-400 line-through text-sm mb-1">
                    {formatPrice(originalPrice)}
                  </div>
                )}
                <div className={`text-3xl font-bold ${
                  isActive ? 'text-blue-400' : 'text-white'
                }`}>
                  {formatPrice(price)}
                </div>
                <div className="text-gray-400 text-sm mt-1">one-time payment</div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {tierData.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className={`w-5 h-5 mt-0.5 ${
                      isActive ? 'text-blue-400' : 'text-green-400'
                    }`} />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              <button
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white/10 text-white hover:bg-white/20'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isActive ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Course Access Summary */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">What You'll Get</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-blue-300 mb-2">Course Content</h5>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• {course?.total_lessons || 12} video lessons</li>
              <li>• {course?.total_hours || 8} hours of content</li>
              <li>• Downloadable resources</li>
              <li>• Mobile and desktop access</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-purple-300 mb-2">Support & Community</h5>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• Community forum access</li>
              <li>• Q&A with instructor</li>
              <li>• Progress tracking</li>
              <li>• Certificate of completion</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg px-4 py-2">
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-green-300 text-sm font-medium">
            30-Day Money Back Guarantee
          </span>
        </div>
      </div>
    </div>
  );
};

export default CoursePricing;