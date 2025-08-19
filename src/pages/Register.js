import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/Auth0Context';
import Header from '../components/Header';
import { UserPlus, GraduationCap, Users, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register, isLoading, isAuthenticated, profile, error, isDevelopmentMode } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');
  const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'google'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && profile) {
      const redirectPath = profile.role === 'teacher' ? '/teacher' : '/student';
      navigate(redirectPath);
    }
  }, [isAuthenticated, profile, navigate]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // For now, we'll use Auth0's database connection
      // This would need to be implemented in your Auth0Context
      await register({ 
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        role: userType,
        connection: 'Username-Password-Authentication' // Auth0 database connection
      });
    } catch (err) {
      console.error('Email registration failed:', err);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await register({ 
        role: userType,
        connection: 'google-oauth2'
      });
    } catch (err) {
      console.error('Google registration failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white">Setting up your account...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="pt-16 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-md w-full">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Join Lynck Academy</h2>
              <p className="text-gray-300">Choose your role and get started</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {isDevelopmentMode && (
              <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-yellow-300 text-sm">⚠️ Development Mode: Auth0 not configured. Registration will be simulated.</p>
                <p className="text-yellow-200 text-xs mt-2">Configure Auth0 environment variables to enable authentication.</p>
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setUserType('student')}
                className={`w-full p-4 border-2 rounded-lg transition-all ${
                  userType === 'student' 
                    ? 'border-blue-500 bg-blue-600/20 text-white' 
                    : 'border-white/20 hover:border-blue-300 text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-6 h-6 text-blue-400" />
                  <div className="text-left">
                    <h3 className="font-semibold">I'm a Student</h3>
                    <p className="text-sm text-gray-300">I want to learn new skills</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setUserType('teacher')}
                className={`w-full p-4 border-2 rounded-lg transition-all ${
                  userType === 'teacher' 
                    ? 'border-purple-500 bg-purple-600/20 text-white' 
                    : 'border-white/20 hover:border-purple-300 text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-purple-400" />
                  <div className="text-left">
                    <h3 className="font-semibold">I'm a Teacher</h3>
                    <p className="text-sm text-gray-300">I want to create courses</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Signup Method Toggle */}
            <div className="flex mb-6 bg-black/30 rounded-lg p-1">
              <button
                onClick={() => setSignupMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  signupMethod === 'email'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </button>
              <button
                onClick={() => setSignupMethod('google')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  signupMethod === 'google'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>

            {/* Email Registration Form */}
            {signupMethod === 'email' && (
              <form onSubmit={handleEmailRegister} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.fullName ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.email ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.password ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Create a password"
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
                    <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        formErrors.confirmPassword ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                    userType === 'student' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isLoading ? 'Creating Account...' : `Create ${userType === 'student' ? 'Student' : 'Teacher'} Account`}
                </button>
              </form>
            )}

            {/* Google Registration */}
            {signupMethod === 'google' && (
              <button
                onClick={handleGoogleRegister}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-3 ${
                  userType === 'student' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{isLoading ? 'Creating Account...' : `Continue with Google as ${userType === 'student' ? 'Student' : 'Teacher'}`}</span>
              </button>
            )}

            {/* Terms and Login Link */}
            <div className="mt-6 text-center space-y-3">
              <p className="text-gray-400 text-sm">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </Link>
              </p>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-gray-300 text-sm">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;