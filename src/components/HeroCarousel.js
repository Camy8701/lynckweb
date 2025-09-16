import React, { useEffect, useRef, useState } from 'react';
import { Play, ExternalLink, BookOpen, Users, Award, Zap } from 'lucide-react';

const HeroCarousel = () => {
  const cylinderRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  
  // Configurable carousel items - each can be customized independently
  const carouselItems = [
    {
      id: 1,
      type: 'video',
      title: 'AI Course Creation',
      description: 'Watch how AI transforms your content into professional courses',
      backgroundImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
      videoUrl: '#',
      icon: Play,
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      id: 2,
      type: 'feature',
      title: 'Interactive Learning',
      description: 'Engage students with AI-powered interactive lessons',
      backgroundImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
      link: '/courses',
      icon: Users,
      gradient: 'from-green-500 to-cyan-500'
    },
    {
      id: 3,
      type: 'demo',
      title: 'Smart Analytics',
      description: 'Track student progress with advanced AI insights',
      backgroundImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      link: '/teacher',
      icon: Award,
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: 4,
      type: 'feature',
      title: 'Global Reach',
      description: 'Connect with students worldwide through our platform',
      backgroundImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80',
      link: '/become-teacher',
      icon: BookOpen,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 5,
      type: 'highlight',
      title: 'Instant Publishing',
      description: 'Publish your courses instantly with one-click deployment',
      backgroundImage: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80',
      link: '#',
      icon: Zap,
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      id: 6,
      type: 'community',
      title: 'Learning Community',
      description: 'Join thousands of educators transforming online learning',
      backgroundImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80',
      link: '/courses',
      icon: Users,
      gradient: 'from-pink-500 to-purple-600'
    }
  ];

  const cylinderHeight = 2000;
  const faceCount = carouselItems.length;
  const faceHeight = (cylinderHeight / faceCount) * 1.2;
  const radius = cylinderHeight / (2 * Math.PI);

  useEffect(() => {
    let animationId;
    if (isAutoplay && !isDragging) {
      const animate = () => {
        setRotation(prev => prev + 0.2);
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    }
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAutoplay, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart(e.clientY);
    setIsAutoplay(false);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStart;
    setRotation(prev => prev + deltaY * 0.05);
    setDragStart(e.clientY);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setTimeout(() => setIsAutoplay(true), 2000);
  };

  const handleItemClick = (item) => {
    if (item.videoUrl) {
      // Handle video play
      window.open(item.videoUrl, '_blank');
    } else if (item.link && item.link !== '#') {
      // Handle navigation
      window.location.href = item.link;
    }
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e) => handleMouseMove(e);
    const handleMouseUpGlobal = () => handleMouseUp();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, dragStart]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)',
            filter: 'blur(40px)',
            animation: 'aurora 12s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: 'linear-gradient(-45deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 50%, rgba(236, 72, 153, 0.08) 100%)',
            filter: 'blur(60px)',
            animation: 'aurora 15s ease-in-out infinite reverse',
            animationDelay: '-2s'
          }}
        />
      </div>

      {/* Carousel Container */}
      <div className="relative flex items-center justify-center w-full h-full z-10">
        {/* Top gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-32 z-20 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none" />
        
        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 w-full h-32 z-20 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        
        {/* Gallery Container */}
        <div 
          className="flex h-96 items-center justify-center w-full"
          style={{ perspective: '1000px' }}
        >
          <div
            ref={cylinderRef}
            className="relative cursor-grab active:cursor-grabbing"
            style={{
              height: `${cylinderHeight}px`,
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => !isDragging && setIsAutoplay(false)}
            onMouseLeave={() => !isDragging && setTimeout(() => setIsAutoplay(true), 1000)}
          >
            {carouselItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="absolute flex items-center justify-center p-8 group cursor-pointer"
                  style={{
                    height: `${faceHeight}px`,
                    transform: `rotateX(${(360 / faceCount) * index}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'hidden'
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Glass Frame */}
                  <div className="relative w-full max-w-2xl h-60 rounded-3xl overflow-hidden group-hover:scale-105 transition-all duration-300 shadow-2xl">
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.backgroundImage})` }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-80`} />
                    
                    {/* Glass Effect Border */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-white/20 bg-white/5 backdrop-blur-sm" />
                    
                    {/* Content */}
                    <div className="relative z-10 p-8 h-full flex flex-col justify-center text-white">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium">
                          #{item.id.toString().padStart(2, '0')}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-white/90 transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-white/80 mb-4 leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center text-sm font-medium">
                        {item.type === 'video' ? (
                          <span className="flex items-center space-x-2">
                            <Play className="w-4 h-4" />
                            <span>Watch Demo</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-2">
                            <ExternalLink className="w-4 h-4" />
                            <span>Learn More</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes aurora {
          0% {
            transform: translateX(-100%) skewX(-15deg);
            opacity: 0.6;
          }
          25% {
            transform: translateX(-50%) skewX(10deg);
            opacity: 0.8;
          }
          50% {
            transform: translateX(0%) skewX(-5deg);
            opacity: 1;
          }
          75% {
            transform: translateX(50%) skewX(8deg);
            opacity: 0.7;
          }
          100% {
            transform: translateX(100%) skewX(-10deg);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;