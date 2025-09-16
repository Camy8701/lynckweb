import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Star, Play, Brain, Users, Globe } from 'lucide-react';

const LandingPage = () => {
  const { t } = useLanguage();
  const carouselRef = useRef(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let animationId;
    let isHovered = false;
    
    const autoScroll = () => {
      if (!isHovered) {
        carousel.scrollLeft += 1; // Smooth 1px per frame movement
        
        // Reset to beginning when reaching halfway point (since we duplicate content)
        const maxScroll = carousel.scrollWidth / 2;
        if (carousel.scrollLeft >= maxScroll) {
          carousel.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    };

    // Start the animation
    animationId = requestAnimationFrame(autoScroll);

    // Pause auto-scroll on hover
    const handleMouseEnter = () => {
      isHovered = true;
    };
    
    const handleMouseLeave = () => {
      isHovered = false;
    };

    carousel.addEventListener('mouseenter', handleMouseEnter);
    carousel.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      carousel.removeEventListener('mouseenter', handleMouseEnter);
      carousel.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const services = [
    {
      id: 1,
      title: "AI Course Creation",
      description: "Transform your expertise into professional courses with our intelligent AI-powered platform in minutes.",
      icon: Brain,
      gradient: "from-blue-600 to-purple-600",
      stat: "4.9/5 rating",
      statIcon: Star
    },
    {
      id: 2,
      title: "Student Management",
      description: "Comprehensive dashboard to track student progress, engagement, and performance analytics.",
      icon: Users,
      gradient: "from-green-600 to-cyan-600",
      stat: "10,000+ students",
      statIcon: Users
    },
    {
      id: 3,
      title: "Global Reach",
      description: "Multi-language support and global infrastructure to reach students worldwide seamlessly.",
      icon: Globe,
      gradient: "from-purple-600 to-pink-600",
      stat: "50+ countries",
      statIcon: Globe
    },
    {
      id: 4,
      title: "Analytics Dashboard",
      description: "Advanced analytics and reporting tools to optimize your course performance and student engagement.",
      icon: "chart",
      gradient: "from-orange-600 to-red-600",
      stat: "Real-time data",
      statIcon: "📊"
    },
    {
      id: 5,
      title: "Certification System",
      description: "Professional certificates and badges to validate student achievements and boost course credibility.",
      icon: "certificate",
      gradient: "from-indigo-600 to-blue-600",
      stat: "Verified certificates",
      statIcon: "🏆"
    }
  ];

  // Duplicate services for infinite scroll
  const duplicatedServices = [...services, ...services];

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
            <h1 className="text-8xl lg:text-9xl xl:text-[12rem] font-bold text-white tracking-tight leading-tight">
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
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23059669'/%3E%3Cstop offset='100%25' style='stop-color:%231d4ed8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23grad)'/%3E%3Ctext x='400' y='225' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3ECourse Creation Demo%3C/text%3E%3C/svg%3E"
                >
                  <source src="/course-demo-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold text-white">Course Creation Demo</h3>
                <p className="text-gray-300">Watch how AI transforms your content into professional courses in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Products And Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Products And Services
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover our comprehensive suite of tools and services designed to transform your teaching experience
            </p>
          </div>
          
          {/* Services Carousel */}
          <div className="relative">
            <div ref={carouselRef} className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4">
              {duplicatedServices.map((service, index) => {
                const IconComponent = service.icon;
                const StatIcon = service.statIcon;
                
                return (
                  <div key={`${service.id}-${index}`} className="flex-shrink-0 w-80">
                    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 hover:bg-white/15 transition-all h-full">
                      <div className={`aspect-video bg-gradient-to-r ${service.gradient} rounded-lg flex items-center justify-center relative overflow-hidden mb-6`}>
                        <div className="absolute inset-0 bg-black/20"></div>
                        {typeof IconComponent === 'string' ? (
                          <div className="w-16 h-16 text-white relative z-10 flex items-center justify-center">
                            {service.icon === 'chart' ? (
                              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                              </svg>
                            ) : (
                              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        ) : (
                          <IconComponent className="w-16 h-16 text-white relative z-10" />
                        )}
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                        <p className="text-gray-300 text-sm">{service.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          {typeof StatIcon === 'string' ? (
                            <span className="w-4 h-4">{StatIcon}</span>
                          ) : (
                            <StatIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          )}
                          <span>{service.stat}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Scroll Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
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