import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { coursesService } from '../services/coursesService';
import { formatPrice } from '../config/stripe';
import { Star, Users, Clock, Play } from 'lucide-react';

const CourseDiscovery = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load courses
      const coursesResult = await coursesService.getAllCourses();
      if (coursesResult.data) {
        setCourses(coursesResult.data);
      }

      // Load categories (simulate for now)
      setCategories([
        { id: 'all', name: 'All Courses', color: '#3B82F6' },
        { id: 'web-development', name: 'Web Development', color: '#3B82F6' },
        { id: 'design', name: 'Design', color: '#8B5CF6' },
        { id: 'data-science', name: 'Data Science', color: '#10B981' },
        { id: 'business', name: 'Business', color: '#F59E0B' },
        { id: 'programming', name: 'Programming', color: '#EF4444' }
      ]);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category_slug === selectedCategory);

  const CourseCard = ({ course }) => (
    <Link 
      to={`/course/${course.id}`}
      className="block backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105"
    >
      <div className="relative">
        <img
          src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        {course.is_featured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            FEATURED
          </div>
        )}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
          <Play className="w-3 h-3 mr-1" />
          {course.total_lessons} lessons
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-gray-300 text-sm">by {course.instructor}</p>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {course.short_description}
        </p>

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-300">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{course.rating || 4.8}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{course.students || 0} students</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{course.total_hours}h</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-2xl font-bold text-blue-400">
              {formatPrice(course.price_foundation)}
            </span>
            <span className="text-gray-400 text-sm">starting from</span>
          </div>
          <div className="text-xs text-gray-400 capitalize">
            {course.difficulty_level}
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <div className="backdrop-blur-sm bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Discover Your Next Course</h1>
            <p className="text-xl opacity-90 mb-8">Learn from expert instructors and advance your career</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-white mt-4">Loading courses...</p>
            </div>
          )}

          {/* Courses Grid */}
          {!loading && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedCategory === 'all' ? 'All Courses' : categories.find(c => c.id === selectedCategory)?.name}
                  <span className="text-gray-400 text-lg ml-2">({filteredCourses.length} courses)</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
                  <p className="text-gray-400">Try selecting a different category</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CourseDiscovery;