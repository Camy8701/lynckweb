import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import CoursePurchaseModal from '../components/CoursePurchaseModal';
import { coursesService } from '../services/coursesService';
import { formatPrice } from '../config/stripe';
import { useAuth } from '../contexts/Auth0Context';
import { Play, Star, Users, Clock, CheckCircle, Shield, Award, Bookmark } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('foundation');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await coursesService.getCourseById(id);
      if (result.success && result.data) {
        setCourse(result.data);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error('Error loading course:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    if (!profile) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = (purchase) => {
    setShowPurchaseModal(false);
    // You could show a success message or redirect
    alert('Course purchased successfully! Check your dashboard.');
  };

  const getTierFeatures = (tier) => {
    const baseFeatures = [
      'All video lessons',
      'Course materials',
      'Community access',
      'Mobile app access',
      'Certificate of completion'
    ];

    if (tier === 'advanced') {
      return [...baseFeatures, 'Advanced exercises', 'Code reviews', 'Weekly Q&A sessions'];
    }
    
    if (tier === 'mastery') {
      return [
        ...baseFeatures, 
        'Advanced exercises', 
        'Code reviews', 
        'Weekly Q&A sessions',
        'One-on-one mentoring',
        'Portfolio review',
        'Job placement assistance'
      ];
    }
    
    return baseFeatures;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-white mt-4">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-xl font-semibold text-white mb-2">{error || 'Course not found'}</h3>
            <Link to="/courses" className="text-blue-400 hover:text-blue-300">
              ← Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <Header />
        
        <div className="pt-16">
          {/* Breadcrumb */}
          <div className="border-b border-white/10 backdrop-blur-sm bg-black/20">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <nav className="text-sm">
                <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
                <span className="mx-2 text-gray-500">/</span>
                <Link to="/courses" className="text-gray-400 hover:text-white">Courses</Link>
                <span className="mx-2 text-gray-500">/</span>
                <span className="text-white">{course.title}</span>
              </nav>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Course Hero */}
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop'} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {course.is_featured && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded">
                        FEATURED
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all group">
                        <Play className="w-8 h-8 text-gray-900 ml-1 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium capitalize">
                        {course.difficulty_level}
                      </span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                        {course.category_name}
                      </span>
                    </div>
                    
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{course.title}</h1>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">{course.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-gray-300">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {course.instructor?.charAt(0) || 'T'}
                        </div>
                        <span className="font-medium">by {course.instructor || 'Expert Instructor'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="font-medium">{course.average_rating || 4.8}</span>
                        <span className="text-gray-400">({course.total_students || 0} students)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-5 h-5" />
                        <span>{course.total_hours}h total</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Play className="w-5 h-5" />
                        <span>{course.total_lessons} lessons</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Description */}
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">About This Course</h2>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {course.short_description || course.description}
                  </div>
                </div>

                {/* Pricing Tiers */}
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Choose Your Learning Path</h2>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {['foundation', 'advanced', 'mastery'].map((tier) => {
                      const price = course[`price_${tier}`] || 0;
                      const isSelected = selectedTier === tier;
                      
                      return (
                        <div 
                          key={tier}
                          className={`border-2 rounded-xl p-6 cursor-pointer transition-all transform hover:scale-105 ${
                            isSelected
                              ? 'border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                              : 'border-white/20 bg-white/5 hover:border-white/30'
                          }`}
                          onClick={() => setSelectedTier(tier)}
                        >
                          <div className="text-center mb-4">
                            <div className="flex justify-center mb-2">
                              {tier === 'foundation' && <Shield className="w-8 h-8 text-blue-400" />}
                              {tier === 'advanced' && <Award className="w-8 h-8 text-purple-400" />}
                              {tier === 'mastery' && <Bookmark className="w-8 h-8 text-green-400" />}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 capitalize">{tier}</h3>
                            <div className="text-3xl font-bold text-white">
                              {formatPrice(price)}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-300">
                            {getTierFeatures(tier).slice(0, 4).map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                            {getTierFeatures(tier).length > 4 && (
                              <div className="text-gray-400 text-xs pt-1">
                                +{getTierFeatures(tier).length - 4} more features
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center">
                    <button 
                      onClick={handlePurchaseClick}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Get {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Access - {formatPrice(course[`price_${selectedTier}`] || 0)}
                    </button>
                    <p className="text-gray-400 text-sm mt-2">30-day money-back guarantee</p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Price Card */}
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 sticky top-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-white mb-2">
                      {formatPrice(course[`price_${selectedTier}`] || 0)}
                    </div>
                    <div className="text-gray-400 capitalize">{selectedTier} Tier</div>
                  </div>
                  
                  <button 
                    onClick={handlePurchaseClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors mb-4 shadow-lg"
                  >
                    Enroll Now
                  </button>
                  
                  <div className="space-y-3 text-sm text-gray-300">
                    <h4 className="font-semibold text-white">This tier includes:</h4>
                    {getTierFeatures(selectedTier).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4" />
                        <span>30-day guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Purchase Modal */}
      <CoursePurchaseModal
        course={course}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </>
  );
};

export default CourseDetail;