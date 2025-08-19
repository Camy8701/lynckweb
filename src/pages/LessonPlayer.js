import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Play } from 'lucide-react';

const LessonPlayer = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-black/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/student" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-gray-600"></div>
          <div>
            <h1 className="font-semibold">Complete Web Development Bootcamp</h1>
            <p className="text-sm text-gray-400">by Sarah Chen</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Play className="w-10 h-10 ml-1" />
            </div>
            <p className="text-gray-400">Video player coming soon!</p>
          </div>
        </div>

        <div className="w-80 bg-gray-800 p-4">
          <h3 className="font-semibold mb-4">Course Content</h3>
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Interactive lesson player with curriculum sidebar coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;