import React, { useEffect, useRef, useState } from 'react';

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
      type: 'course',
      title: 'AI Course Creation Demo',
      description: 'Watch how AI transforms your content into professional courses in minutes',
      backgroundImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
      videoUrl: '#',
      link: '/become-teacher'
    },
    {
      id: 2,
      type: 'feature',
      title: 'Interactive Learning Platform',
      description: 'Engage students with AI-powered interactive lessons and real-time feedback',
      backgroundImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      link: '/courses'
    },
    {
      id: 3,
      type: 'analytics',
      title: 'Smart Learning Analytics',
      description: 'Track student progress with advanced AI insights and personalized recommendations',
      backgroundImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
      link: '/teacher'
    },
    {
      id: 4,
      type: 'community',
      title: 'Global Learning Community',
      description: 'Connect with students worldwide and build your teaching empire',
      backgroundImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
      link: '/courses'
    },
    {
      id: 5,
      type: 'technology',
      title: 'Next-Gen EdTech',
      description: 'Experience the future of online education with cutting-edge technology',
      backgroundImage: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80',
      link: '/become-teacher'
    },
    {
      id: 6,
      type: 'success',
      title: 'Teaching Success Stories',
      description: 'Join thousands of successful educators transforming lives through education',
      backgroundImage: 'https://images.unsplash.com/photo-1444065381814-865dc9da92c0?auto=format&fit=crop&w=800&q=80',
      link: '/courses'
    },
    {
      id: 7,
      type: 'innovation',
      title: 'Educational Innovation',
      description: 'Pioneer the next wave of educational innovation with LYNCK Academy',
      backgroundImage: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
      link: '/become-teacher'
    },
    {
      id: 8,
      type: 'growth',
      title: 'Unlimited Growth Potential',
      description: 'Scale your teaching business and reach unlimited students globally',
      backgroundImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
      link: '/teacher'
    }
  ];

  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth <= 640 : false;
  const cylinderHeight = isSmallScreen ? 1600 : 2000;
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

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientY);
    setIsAutoplay(false);
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - dragStart;
    setRotation(prev => prev + deltaY * 0.05);
    setDragStart(e.touches[0].clientY);
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setTimeout(() => setIsAutoplay(true), 2000);
  };

  const handleItemClick = (item) => {
    if (item.videoUrl && item.videoUrl !== '#') {
      window.open(item.videoUrl, '_blank');
    } else if (item.link && item.link !== '#') {
      window.location.href = item.link;
    }
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e) => handleMouseMove(e);
    const handleMouseUpGlobal = () => handleMouseUp();
    const handleTouchMoveGlobal = (e) => handleTouchMove(e);
    const handleTouchEndGlobal = () => handleTouchEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
      document.addEventListener('touchmove', handleTouchMoveGlobal);
      document.addEventListener('touchend', handleTouchEndGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
      document.removeEventListener('touchmove', handleTouchMoveGlobal);
      document.removeEventListener('touchend', handleTouchEndGlobal);
    };
  }, [isDragging, dragStart]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora Animated Background */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* First Aurora Wave */}
        <div className="absolute inset-0" style={{
          animation: 'aurora 12s ease-in-out infinite'
        }}>
          <div className="absolute top-1/2 left-0 w-full h-32 opacity-60" style={{
            background: 'linear-gradient(90deg, #3A29FF 0%, #FF94B4 50%, #FF3232 100%)',
            filter: 'blur(20px)',
            transform: 'translateY(-50%) rotate(-2deg)'
          }} />
        </div>
        
        {/* Second Aurora Wave */}
        <div className="absolute inset-0" style={{
          animation: 'aurora 15s ease-in-out infinite reverse',
          animationDelay: '-2s'
        }}>
          <div className="absolute top-1/2 left-0 w-full h-24 opacity-50" style={{
            background: 'linear-gradient(90deg, #FF3232 0%, #3A29FF 50%, #FF94B4 100%)',
            filter: 'blur(25px)',
            transform: 'translateY(-30px) rotate(1deg)'
          }} />
        </div>
        
        {/* Third Aurora Wave */}
        <div className="absolute inset-0" style={{
          animation: 'aurora 18s ease-in-out infinite',
          animationDelay: '-4s'
        }}>
          <div className="absolute top-1/2 left-0 w-full h-40 opacity-40" style={{
            background: 'linear-gradient(90deg, #FF94B4 0%, #FF3232 50%, #3A29FF 100%)',
            filter: 'blur(30px)',
            transform: 'translateY(20px) rotate(-1deg)'
          }} />
        </div>
      </div>

      {/* Rolling Gallery + Gradients */}
      <div className="relative flex flex-col items-center justify-center w-full h-full z-10">
        {/* Top gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-32 z-20 pointer-events-none" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0) 0%, #111827 100%)'
        }} />
        
        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 w-full h-32 z-20 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, #111827 100%)'
        }} />
        
        {/* Gallery container */}
        <div className="flex h-96 items-center justify-center w-full" style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}>
          <div
            ref={cylinderRef}
            className="flex min-w-[600px] items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              height: `${cylinderHeight}px`,
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseEnter={() => !isDragging && setIsAutoplay(false)}
            onMouseLeave={() => !isDragging && setTimeout(() => setIsAutoplay(true), 1000)}
          >
            {carouselItems.map((item, index) => (
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
                {/* Glass effect frame wrapping the image */}
                <div 
                  className="flex items-center justify-center rounded-3xl transition-transform duration-300 ease-out group-hover:scale-105 shadow-lg overflow-hidden"
                  style={{
                    width: '600px',
                    height: '240px',
                    border: '3px solid rgba(255,255,255,0.35)',
                    background: 'rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    boxShadow: '0 2px 30px 0 rgba(255,255,255,0.10) inset, 0 1.5px 10px 0 rgba(255,255,255,0.12)'
                  }}
                >
                  <img
                    src={item.backgroundImage}
                    alt="LYNCK Academy feature"
                    className="pointer-events-none h-full w-full rounded-3xl object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
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