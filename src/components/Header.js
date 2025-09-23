import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/Auth0Context';
import AuthModal from './AuthModal';
import { EditToggleButton } from './EditSystem';
import { ChevronDown, Globe, Menu, X, Search } from 'lucide-react';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    { code: 'en', flag: '🇺🇸', name: 'English' },
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch' }
  ];

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Don't navigate here since logout will handle the redirect
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback navigation if logout fails
      navigate('/');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'backdrop-blur-md bg-black/80 border-b border-white/20 shadow-sm' 
        : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-white">Lynck Academy</span>
          </Link>

          {/* Search Bar and Navigation */}
          <div className="hidden md:flex items-center space-x-6 flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </form>
            
            <div className="flex items-center space-x-6">
              <Link 
                to="/courses" 
                className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
              >
                Courses
              </Link>
              <Link 
                to="/my-story" 
                className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
              >
                My Story
              </Link>
              <Link 
                to="/about" 
                className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
              >
                About
              </Link>
              <Link 
                to="/teacher" 
                className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
              >
                Teach
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {languages.find(l => l.code === language)?.flag}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 py-1 z-50">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLanguageOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-white/10 transition-colors text-white"
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated && (user || profile) ? (
              <div className="flex items-center space-x-4">
                <EditToggleButton />
                <Link
                  to={
                    profile?.role === 'admin' ? '/admin' :
                    profile?.role === 'teacher' ? '/teacher' : 
                    '/student'
                  }
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                >
                  <img 
                    src={user?.picture || profile?.avatar_url || '/default-avatar.svg'} 
                    alt={user?.name || profile?.full_name || 'User'}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.target.src = '/default-avatar.svg';
                    }}
                  />
                  <span className="hidden md:block text-sm font-medium">{user?.name || profile?.full_name || 'User'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <EditToggleButton />
                <button 
                  onClick={() => openAuthModal('login')}
                  className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-zinc-900/95 backdrop-blur-sm border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              <Link 
                to="/courses" 
                className="block text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link 
                to="/my-story" 
                className="block text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Story
              </Link>
              <Link 
                to="/about" 
                className="block text-gray-300 hover:text-blue-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="block">
                <EditToggleButton className="w-full justify-center" />
              </div>
              {!isAuthenticated ? (
                <>
                  <button 
                    onClick={() => {
                      openAuthModal('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      openAuthModal('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-300 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal} 
        initialMode={authMode}
      />
    </header>
  );
};

export default Header;