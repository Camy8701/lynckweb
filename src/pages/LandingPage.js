import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  EditSystemProvider, 
  EditableText, 
  EditableCard, 
  GlobalUploadModal,
  GlobalColorPicker,
  GlobalTextPositioner
} from '../components/EditSystem';
import { Star, Play, Brain, Users, Globe } from 'lucide-react';

const LandingPageContent = () => {
  const { t } = useLanguage();
  const carouselRef = useRef(null);
  const [content, setContent] = useState({
    title: 'Welcome to',
    subtitle: 'Lynck Academy',
    description: 'Create professional courses with AI-powered tools and reach students worldwide',
    videoUrl: null
  });
  
  // State for card background images and videos
  const [cardBackgrounds, setCardBackgrounds] = useState({});

  // Function to handle card background uploads
  const handleCardBackgroundUpload = (elementId, fileData, fileType) => {
    setCardBackgrounds(prev => ({
      ...prev,
      [elementId]: { 
        data: fileData, 
        type: fileType,
        isVideo: fileType.startsWith('video/')
      }
    }));
  };

  useEffect(() => {
    // Handle upload events from EditSystem
    const handleUpload = (event) => {
      const { elementId, fileData, fileType } = event.detail;
      if (elementId === 'hero-video-card') {
        handleVideoUpload(fileData, fileType);
      } else {
        // Handle all other card background uploads
        handleCardBackgroundUpload(elementId, fileData, fileType);
      }
    };

    window.addEventListener('editSystemUpload', handleUpload);

    const carousel = carouselRef.current;
    if (!carousel) return () => {
      window.removeEventListener('editSystemUpload', handleUpload);
    };

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
      window.removeEventListener('editSystemUpload', handleUpload);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (carousel) {
        carousel.removeEventListener('mouseenter', handleMouseEnter);
        carousel.removeEventListener('mouseleave', handleMouseLeave);
      }
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

  const handleContentChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVideoUpload = (fileData, fileType) => {
    setContent(prev => ({
      ...prev,
      videoUrl: fileData
    }));
  };

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

      {/* Original Welcome Hero Section (moved to top) */}
      <section className="h-screen flex items-center justify-center px-4 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start w-full h-[80vh]">
          {/* Left Column - Text Content */}
          <div className="lg:pr-8 flex flex-col h-full pt-32">
            {/* Title */}
            <div className="mb-6">
              <EditableCard
                elementId="hero-title-card"
                onTextEdit={() => console.log('Hero title edit')}
                allowImageEdit={false}
                allowMove={true}
                className="inline-block"
              >
                <EditableText
                  className="text-7xl lg:text-8xl xl:text-9xl font-bold text-white tracking-tight leading-tight"
                  onTextChange={(value) => handleContentChange('title', value)}
                  elementId="hero-title"
                >
                  {content.title}
                </EditableText>
              </EditableCard>
              <br/>
              <EditableCard
                elementId="hero-subtitle-card"
                onTextEdit={() => console.log('Hero subtitle edit')}
                allowImageEdit={false}
                allowMove={true}
                className="inline-block"
              >
                <EditableText
                  className="text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-tight bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent"
                  onTextChange={(value) => handleContentChange('subtitle', value)}
                  elementId="hero-subtitle"
                >
                  {content.subtitle}
                </EditableText>
              </EditableCard>
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <EditableCard
                elementId="hero-description-card"
                onTextEdit={() => console.log('Hero description edit')}
                allowImageEdit={false}
                allowMove={true}
                className="inline-block max-w-2xl"
              >
                <EditableText
                  className="text-xl lg:text-2xl text-gray-300 max-w-2xl leading-relaxed"
                  onTextChange={(value) => handleContentChange('description', value)}
                  elementId="hero-description"
                >
                  {content.description}
                </EditableText>
              </EditableCard>
            </div>
            
            {/* Spacer to push buttons to correct position */}
            <div className="flex-1"></div>
            
            {/* Buttons - updated to Start Learning */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/courses"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
              >
                <Play className="w-6 h-6" />
                <span>Start Learning</span>
              </Link>
            </div>
          </div>
          
          {/* Right Column - Demo Card */}
          <div className="hidden lg:block pt-40 scale-125 ml-20">
            <EditableCard
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 hover:bg-white/15 transition-all"
              elementId="hero-video-card"
              onImageUpload={handleVideoUpload}
              allowTextEdit={true}
              allowImageEdit={true}
              allowMove={true}
            >
              <div className="aspect-video rounded-lg overflow-hidden relative">
                {content.videoUrl ? (
                  content.videoUrl.startsWith('data:video/') ? (
                    <video
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                      src={content.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      className="w-full h-full object-cover"
                      src={content.videoUrl}
                      alt="Course Demo"
                    />
                  )
                ) : (
                  <video
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23059669'/%3E%3Cstop offset='100%25' style='stop-color:%231d4ed8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23grad)'/%3E%3Ctext x='400' y='225' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3ECourse Creation Demo%3C/text%3E%3C/svg%3E"
                  >
                    <source src="/course-demo-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              <div className="mt-6 space-y-4">
                <EditableText
                  className="text-xl font-semibold text-white"
                  onTextChange={(value) => console.log('Video title changed:', value)}
                  elementId="video-title"
                >
                  Course Creation Demo
                </EditableText>
                <EditableText
                  className="text-gray-300"
                  onTextChange={(value) => console.log('Video description changed:', value)}
                  elementId="video-description"
                >
                  Watch how AI transforms your content into professional courses in minutes
                </EditableText>
              </div>
            </EditableCard>
          </div>
        </div>
      </section>
      
      {/* Products And Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <EditableText
              className="text-4xl lg:text-5xl font-bold text-white mb-4"
              onTextChange={(value) => console.log('Services section title changed:', value)}
              elementId="services-section-title"
            >
              Products And Services
            </EditableText>
            <EditableText
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              onTextChange={(value) => console.log('Services section description changed:', value)}
              elementId="services-section-description"
            >
              Discover our comprehensive suite of tools and services designed to transform your teaching experience
            </EditableText>
          </div>
          
          {/* Services Carousel */}
          <div className="relative">
            <div ref={carouselRef} className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4">
              {duplicatedServices.map((service, index) => {
                const IconComponent = service.icon;
                const StatIcon = service.statIcon;
                const elementId = `service-card-${service.id}-${index}`;
                const backgroundMedia = cardBackgrounds[elementId];
                
                return (
                  <div key={`${service.id}-${index}`} className="flex-shrink-0 w-80">
                    <EditableCard
                      className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 hover:bg-white/15 transition-all h-full"
                      elementId={elementId}
                      onImageUpload={(fileData, fileType) => console.log('Service card background upload:', service.title)}
                      onTextEdit={() => console.log('Service card text edit:', service.title)}
                      onMove={() => console.log('Service card move:', service.title)}
                    >
                      <div className={`aspect-video rounded-lg flex items-center justify-center relative overflow-hidden mb-6 ${!backgroundMedia ? `bg-gradient-to-r ${service.gradient}` : ''}`}>
                        {backgroundMedia?.isVideo ? (
                          <video 
                            src={backgroundMedia.data}
                            className="absolute inset-0 w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : backgroundMedia?.data ? (
                          <img 
                            src={backgroundMedia.data}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Service background"
                          />
                        ) : null}
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
                        <EditableText
                          className="text-xl font-semibold text-white"
                          onTextChange={(value) => console.log('Service title changed:', value)}
                          elementId={`service-title-${service.id}-${index}`}
                        >
                          {service.title}
                        </EditableText>
                        <EditableText
                          className="text-gray-300 text-sm"
                          onTextChange={(value) => console.log('Service description changed:', value)}
                          elementId={`service-description-${service.id}-${index}`}
                        >
                          {service.description}
                        </EditableText>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          {typeof StatIcon === 'string' ? (
                            <span className="w-4 h-4">{StatIcon}</span>
                          ) : (
                            <StatIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          )}
                          <span>{service.stat}</span>
                        </div>
                      </div>
                    </EditableCard>
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

      {/* New Google Ads Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <EditableCard
            elementId="new-hero-headline-card"
            className="mb-8"
            allowImageEdit={false}
          >
            <EditableText
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              elementId="new-hero-headline"
            >
              Master Google Ads + AI Before Jobs Disappear
            </EditableText>
          </EditableCard>

          {/* Subhead */}
          <EditableCard
            elementId="new-hero-subhead-card"
            className="mb-12"
            allowImageEdit={false}
          >
            <EditableText
              className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-4"
              elementId="new-hero-subhead"
            >
              Learn the recession-proof skills that AI can't replace.
              Join 1,000+ people building €40-75/hour careers while most jobs get automated.
            </EditableText>
          </EditableCard>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/courses"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              🔥 Start Learning Now
            </Link>
            <button
              onClick={() => document.getElementById('lead-magnet-section').scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-all duration-300"
            >
              📖 Get Free Mini-Course
            </button>
          </div>

          {/* Social Proof */}
          <EditableCard
            elementId="new-hero-social-proof-card"
            className="mb-16"
            allowImageEdit={false}
          >
            <EditableText
              className="text-gray-400 text-sm"
              elementId="new-hero-social-proof"
            >
              ⭐⭐⭐⭐⭐ "Finally, ads that actually work" - 200+ reviews
            </EditableText>
          </EditableCard>
        </div>
      </section>

      {/* Lead Magnet Section */}
      <section id="lead-magnet-section" className="py-16 px-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto">
          <EditableCard
            elementId="lead-magnet-card"
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 md:p-12 text-center"
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              elementId="lead-magnet-title"
            >
              🎁 FREE: The Google Ads Starter Kit
            </EditableText>

            <EditableText
              className="text-xl text-gray-300 mb-8"
              elementId="lead-magnet-subtitle"
            >
              Get the exact templates and checklists I used to go from €0 to €75/hour:
            </EditableText>

            <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✅</span>
                  5-Step Campaign Launch Checklist
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✅</span>
                  Profit-Boosting Keywords Template
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✅</span>
                  AI Prompts for Ad Copy That Converts
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✅</span>
                  ROI Tracking Spreadsheet (Google Sheets)
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✅</span>
                  Client Pitch Templates
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✅</span>
                  30 Proven AI Ad Copy Prompts
                </div>
              </div>
            </div>

            <form className="max-w-md mx-auto mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Send Me The Free Kit
                </button>
              </div>
            </form>

            <EditableText
              className="text-sm text-gray-400"
              elementId="lead-magnet-disclaimer"
            >
              💡 Join 2,500+ marketers. No spam, unsubscribe anytime.
            </EditableText>
          </EditableCard>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <EditableText
            className="text-4xl font-bold text-white text-center mb-12"
            onTextChange={(value) => console.log('Featured courses title changed:', value)}
            elementId="featured-courses-title"
          >
            {t('featured.title')}
          </EditableText>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map(course => {
              const elementId = `course-card-${course.id}`;
              const backgroundMedia = cardBackgrounds[elementId];
              
              return (
                <EditableCard
                  key={course.id}
                  className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-white/15"
                  elementId={elementId}
                  onImageUpload={(fileData, fileType) => handleCardBackgroundUpload(elementId, fileData, fileType)}
                  onTextEdit={() => console.log('Course card text edit:', course.title)}
                  onMove={() => console.log('Course card move:', course.title)}
                >
                  <div className="aspect-video overflow-hidden rounded-t-xl">
                    {backgroundMedia?.isVideo ? (
                      <video 
                        src={backgroundMedia.data}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={backgroundMedia?.data || course.image} 
                        alt={course.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-6">
                  <EditableText
                    className="text-xl font-semibold mb-2 text-white"
                    onTextChange={(value) => console.log('Course title changed:', value)}
                    elementId={`course-title-${course.id}`}
                  >
                    {course.title}
                  </EditableText>
                  <EditableText
                    className="text-gray-300 mb-4"
                    onTextChange={(value) => console.log('Course instructor changed:', value)}
                    elementId={`course-instructor-${course.id}`}
                  >
                    by {course.instructor}
                  </EditableText>
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
                </EditableCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Your New Skillset Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-zinc-900/50 to-black/50">
        <div className="max-w-6xl mx-auto">
          <EditableCard
            elementId="skills-title-card"
            className="text-center mb-16"
            allowImageEdit={false}
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              elementId="skills-title"
            >
              🎯 Your New Skillset
            </EditableText>
            <EditableText
              className="text-xl text-gray-400"
              elementId="skills-subtitle"
            >
              Career security in an AI world
            </EditableText>
          </EditableCard>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="text-2xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-white mb-2">Launch profitable Google Ads in 24 hours</h3>
              <p className="text-gray-300 text-sm">Master the exact setup process we use at Google</p>
            </div>

            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="text-2xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-white mb-2">Use AI to cut campaign setup time by 80%</h3>
              <p className="text-gray-300 text-sm">Leverage AI tools for keyword research and ad copy</p>
            </div>

            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="text-2xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-white mb-2">Track and optimize for maximum ROI</h3>
              <p className="text-gray-300 text-sm">Learn professional analytics and optimization techniques</p>
            </div>

            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="text-2xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-white mb-2">Land freelance clients at €40-75/hour</h3>
              <p className="text-gray-300 text-sm">Build a profitable freelance career with proven strategies</p>
            </div>

            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="text-2xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-white mb-2">Build passive income with digital products</h3>
              <p className="text-gray-300 text-sm">Create and sell your own digital marketing products</p>
            </div>

            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="text-2xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-white mb-2">Get the exact Google workflows and templates</h3>
              <p className="text-gray-300 text-sm">Access our internal processes and tested templates</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/courses"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              🔥 Start Mastering These Skills Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <EditableCard
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 text-center space-y-6 hover:bg-white/15 transition-all"
              elementId="feature-card-ai"
              onImageUpload={(fileData, fileType) => console.log('AI feature card background upload')}
              onTextEdit={() => console.log('AI feature card text edit')}
              onMove={() => console.log('AI feature card move')}
              style={{
                backgroundImage: cardBackgrounds['feature-card-ai'] && !cardBackgrounds['feature-card-ai']?.isVideo ? `url(${cardBackgrounds['feature-card-ai'].data})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}
            >
              {cardBackgrounds['feature-card-ai']?.isVideo && (
                <video 
                  src={cardBackgrounds['feature-card-ai'].data}
                  className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto relative z-10">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <EditableText
                className="text-2xl font-semibold text-white"
                onTextChange={(value) => console.log('AI feature title changed:', value)}
                elementId="feature-ai-title"
              >
                {t('features.ai.title')}
              </EditableText>
              <EditableText
                className="text-gray-300"
                onTextChange={(value) => console.log('AI feature description changed:', value)}
                elementId="feature-ai-desc"
              >
                {t('features.ai.desc')}
              </EditableText>
            </EditableCard>
            
            <EditableCard
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 text-center space-y-6 hover:bg-white/15 transition-all"
              elementId="feature-card-tiered"
              onImageUpload={(fileData, fileType) => console.log('Tiered feature card background upload')}
              onTextEdit={() => console.log('Tiered feature card text edit')}
              onMove={() => console.log('Tiered feature card move')}
              style={{
                backgroundImage: cardBackgrounds['feature-card-tiered'] && !cardBackgrounds['feature-card-tiered']?.isVideo ? `url(${cardBackgrounds['feature-card-tiered'].data})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}
            >
              {cardBackgrounds['feature-card-tiered']?.isVideo && (
                <video 
                  src={cardBackgrounds['feature-card-tiered'].data}
                  className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto relative z-10">
                <Users className="w-8 h-8 text-white" />
              </div>
              <EditableText
                className="text-2xl font-semibold text-white"
                onTextChange={(value) => console.log('Tiered feature title changed:', value)}
                elementId="feature-tiered-title"
              >
                {t('features.tiered.title')}
              </EditableText>
              <EditableText
                className="text-gray-300"
                onTextChange={(value) => console.log('Tiered feature description changed:', value)}
                elementId="feature-tiered-desc"
              >
                {t('features.tiered.desc')}
              </EditableText>
            </EditableCard>
            
            <EditableCard
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 text-center space-y-6 hover:bg-white/15 transition-all"
              elementId="feature-card-multilang"
              onImageUpload={(fileData, fileType) => console.log('Multilang feature card background upload')}
              onTextEdit={() => console.log('Multilang feature card text edit')}
              onMove={() => console.log('Multilang feature card move')}
              style={{
                backgroundImage: cardBackgrounds['feature-card-multilang'] && !cardBackgrounds['feature-card-multilang']?.isVideo ? `url(${cardBackgrounds['feature-card-multilang'].data})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}
            >
              {cardBackgrounds['feature-card-multilang']?.isVideo && (
                <video 
                  src={cardBackgrounds['feature-card-multilang'].data}
                  className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto relative z-10">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <EditableText
                className="text-2xl font-semibold text-white"
                onTextChange={(value) => console.log('Multilang feature title changed:', value)}
                elementId="feature-multilang-title"
              >
                {t('features.multilang.title')}
              </EditableText>
              <EditableText
                className="text-gray-300"
                onTextChange={(value) => console.log('Multilang feature description changed:', value)}
                elementId="feature-multilang-desc"
              >
                {t('features.multilang.desc')}
              </EditableText>
            </EditableCard>
          </div>
        </div>
      </section>

      {/* AI Reality Check Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <EditableCard
            elementId="urgency-title-card"
            className="mb-12"
            allowImageEdit={false}
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              elementId="urgency-title"
            >
              ⚡ The AI Reality Check
            </EditableText>

            <EditableText
              className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              elementId="urgency-content"
            >
              By 2027, most traditional jobs will be automated. But businesses will always need one thing: customers.
              <br/><br/>
              That's where you come in. Google Ads + AI skills are your insurance policy.
              <br/><br/>
              While others panic, you'll profit.
            </EditableText>
          </EditableCard>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <EditableCard
            elementId="final-homepage-cta-card"
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 md:p-12"
            allowImageEdit={false}
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              elementId="final-homepage-cta-title"
            >
              🚀 Secure Your AI-Proof Career
            </EditableText>

            <EditableText
              className="text-xl text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto"
              elementId="final-homepage-cta-content"
            >
              Time is running out. Every day you wait, AI gets smarter and jobs disappear.
              <br/><br/>
              Don't be left behind.
            </EditableText>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link
                to="/courses"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                🔥 Join Now - €297 €197 (Limited Time)
              </Link>
            </div>

            <EditableText
              className="text-sm text-gray-400 mb-4"
              elementId="final-homepage-cta-guarantee"
            >
              💰 30-Day Money-Back Guarantee
            </EditableText>

            <EditableText
              className="text-sm text-gray-300"
              elementId="final-homepage-cta-urgency"
            >
              Starting Monday: 500 new students, lifetime access, proven curriculum.
            </EditableText>
          </EditableCard>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
      {/* Global Upload Modal */}
      <GlobalUploadModal />
      
      {/* Global Color Picker */}
      <GlobalColorPicker />
      
      {/* Global Text Positioner */}
      <GlobalTextPositioner />
    </div>
  );
};

// Main component with provider
const LandingPage = () => {
  return (
    <EditSystemProvider>
      <LandingPageContent />
    </EditSystemProvider>
  );
};

export default LandingPage;