import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/Auth0Context';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, isLoading, error, isDevelopmentMode } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (mode === 'signup' && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup') {
      if (!formData.fullName.trim()) {
        errors.fullName = 'Full name is required';
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isDevelopmentMode) {
      alert(`${mode === 'login' ? 'Login' : 'Signup'} submitted! (Development mode)`);
      onClose();
      return;
    }

    try {
      if (mode === 'login') {
        await login();
      } else {
        // Handle signup logic here
        alert('Signup functionality will be implemented with Auth0');
      }
    } catch (err) {
      console.error('Authentication error:', err);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
    setFormErrors({});
    setShowPassword(false);
  };

  if (!isOpen) return null;

  const isLogin = mode === 'login';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl p-1 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl flex overflow-hidden">
          
          {/* Left Side - Visual */}
          <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30"></div>
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=600&fit=crop&crop=face"
              alt="Professional woman"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center space-x-2 text-white/80">
                <div className="w-5 h-5 border border-white/40 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white/60 rounded-sm"></div>
                </div>
                <span className="text-sm">Visual channel</span>
                <span className="text-xs ml-auto">1:1 layout</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2 text-white/60 text-xs">
                  <div className="w-4 h-4 border border-white/30 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                  </div>
                  <span>End-to-end ready</span>
                </div>
                <div className="flex items-center space-x-2 text-white/60 text-xs">
                  <div className="w-4 h-4 border border-white/30 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                  </div>
                  <span>Fast handoff</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-8 relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="mb-8 pt-4">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded"></div>
                </div>
                <span className="text-white font-medium">LYNCK</span>
                <span className="text-xs text-gray-400 ml-auto">v1.0</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome back' : 'Join LYNCK'}
              </h2>
              <p className="text-gray-300">
                {isLogin 
                  ? 'Sign in to continue your learning journey.' 
                  : 'Create your account to start learning.'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors"
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.fullName}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-300 mb-2">Email or username</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-300">Password</label>
                  {isLogin && (
                    <button type="button" className="text-sm text-orange-400 hover:text-orange-300">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors"
                    />
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-orange-400 bg-transparent border border-white/30 rounded focus:ring-orange-400 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">Remember me</span>
                </label>
                <button type="button" className="text-sm text-orange-400 hover:text-orange-300">
                  Need help?
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-xl">
                  <p className="text-red-400 text-sm">{error.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                    <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={switchMode}
                className="w-full text-center text-sm text-gray-300 hover:text-white transition-colors mt-4"
              >
                {isLogin ? (
                  <>Don't have an account? <span className="text-orange-400 font-medium">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="text-orange-400 font-medium">Sign in</span></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;