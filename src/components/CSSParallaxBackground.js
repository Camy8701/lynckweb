import React from 'react';

const CSSParallaxBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"></div>
      
      {/* Animated geometric shapes */}
      <div className="absolute inset-0">
        {/* Layer 1 - Fast moving shapes */}
        <div className="animate-pulse">
          <div className="absolute top-20 left-10 w-20 h-20 border-2 border-cyan-400 rotate-45 animate-spin-slow opacity-60"></div>
          <div className="absolute top-40 right-20 w-16 h-16 border-2 border-pink-400 rounded-full animate-bounce opacity-50"></div>
          <div className="absolute top-60 left-1/4 w-24 h-24 border-2 border-green-400 transform rotate-12 animate-pulse opacity-70"></div>
          <div className="absolute bottom-40 right-10 w-18 h-18 border-2 border-yellow-400 rotate-45 animate-spin-slow opacity-60"></div>
          <div className="absolute bottom-20 left-1/3 w-22 h-22 border-2 border-purple-400 rounded-full animate-bounce opacity-50"></div>
        </div>
        
        {/* Layer 2 - Medium moving shapes */}
        <div className="animate-pulse" style={{ animationDelay: '1s' }}>
          <div className="absolute top-32 right-1/4 w-14 h-14 border border-blue-300 rotate-45 animate-spin-slow opacity-40"></div>
          <div className="absolute top-80 left-20 w-12 h-12 border border-orange-300 rounded-full animate-bounce opacity-30"></div>
          <div className="absolute bottom-60 right-1/3 w-16 h-16 border border-red-300 transform rotate-12 animate-pulse opacity-40"></div>
          <div className="absolute top-1/2 left-10 w-10 h-10 border border-indigo-300 rotate-45 animate-spin-slow opacity-30"></div>
          <div className="absolute bottom-80 right-20 w-18 h-18 border border-teal-300 rounded-full animate-bounce opacity-40"></div>
        </div>
        
        {/* Layer 3 - Slow moving background shapes */}
        <div className="animate-pulse" style={{ animationDelay: '2s' }}>
          <div className="absolute top-16 left-1/2 w-8 h-8 border border-gray-400 rotate-45 animate-spin-slow opacity-20"></div>
          <div className="absolute top-96 right-1/2 w-6 h-6 border border-gray-400 rounded-full animate-bounce opacity-15"></div>
          <div className="absolute bottom-32 left-1/4 w-10 h-10 border border-gray-400 transform rotate-12 animate-pulse opacity-20"></div>
          <div className="absolute top-72 right-16 w-12 h-12 border border-gray-400 rotate-45 animate-spin-slow opacity-15"></div>
          <div className="absolute bottom-96 left-16 w-14 h-14 border border-gray-400 rounded-full animate-bounce opacity-20"></div>
        </div>
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white rounded-full opacity-10 animate-pulse`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
    </div>
  );
};

export default CSSParallaxBackground;