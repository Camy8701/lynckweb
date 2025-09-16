import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Star, Play, Brain, Users, Globe } from 'lucide-react';

const LandingPage = () => {
  const { t } = useLanguage();

  const featuredCourses = [
    {
      id: 1,
      title: "Web Development Mastery",
      instructor: "Sarah Chen",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop",
      rating: 4.9,
      price: 97,
      students: 2341
    },
    {
      id: 2,
      title: "Data Science with Python",
      instructor: "Marcus Rodriguez",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
      rating: 4.8,
      price: 97,
      students: 1876
    },
    {
      id: 3,
      title: "Digital Marketing Strategy",
      instructor: "Emma Thompson",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
      rating: 4.7,
      price: 97,
      students: 3421
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Welcome Hero Section */}
      <section className="h-screen flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center h-full w-full">
          {/* Left Column - Text Content */}
          <div className="space-y-8 lg:pr-8">
            <h1 className="text-6xl lg:text-8xl font-bold text-white tracking-tight leading-tight">
              Welcome to<br/>
              <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Lynck Academy
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-2xl leading-relaxed">
              Create professional courses with AI-powered tools and reach students worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-6 mt-12">
              <Link
                to="/become-teacher"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
              >
                <Play className="w-6 h-6" />
                <span>Start Teaching</span>
              </Link>
              <Link
                to="/courses"
                className="border-2 border-gray-600 hover:border-purple-500 text-white hover:text-purple-300 px-8 py-4 rounded-xl text-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 hover:bg-gray-800/50 backdrop-blur-sm"
              >
                <span>Browse Courses</span>
              </Link>
            </div>
          </div>
          
          {/* Right Column - Demo Card */}
          <div className="hidden lg:block">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 hover:bg-white/15 transition-all">
              <div className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <Play className="w-16 h-16 text-white relative z-10" />
              </div>
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold text-white">Course Creation Demo</h3>
                <p className="text-gray-300">Watch how AI transforms your content into professional courses in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
                  AI-Powered Course Creation
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Transform your expertise into professional courses with our intelligent platform
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                >
                  <span>{t('hero.cta.teach')}</span>
                </Link>
                <Link 
                  to="/courses"
                  className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                >
                  <span>{t('hero.cta.browse')}</span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-white/30" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-white/30" src="https://images.unsplash.com/photo-1494790108755-2616b25b3c55?w=32&h=32&fit=crop&crop=face" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-white/30" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" alt="User" />
                  </div>
                  <span>10,000+ active learners</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span>4.9/5 rating</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 animate-float">
                <div className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <Play className="w-16 h-16 text-white relative z-10" />
                </div>
                <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-semibold text-white">Course Creation Demo</h3>
                  <p className="text-gray-300">Watch how AI transforms your content into professional courses in minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">{t('featured.title')}</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <div key={course.id} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-white/15">
                <div className="aspect-video overflow-hidden rounded-t-xl">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-white">{course.title}</h3>
                  <p className="text-gray-300 mb-4">by {course.instructor}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-white">{course.rating}</span>
                      <span className="text-sm text-gray-400">({course.students})</span>
                    </div>
                    <div className="text-xl font-bold text-cyan-400">
                      From ${course.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 text-center space-y-6 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white">{t('features.ai.title')}</h3>
              <p className="text-gray-300">{t('features.ai.desc')}</p>
            </div>
            
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 text-center space-y-6 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white">{t('features.tiered.title')}</h3>
              <p className="text-gray-300">{t('features.tiered.desc')}</p>
            </div>
            
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 text-center space-y-6 hover:bg-white/15 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white">{t('features.multilang.title')}</h3>
              <p className="text-gray-300">{t('features.multilang.desc')}</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;