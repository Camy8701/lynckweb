import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../contexts/Auth0Context';
import Header from '../components/Header';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, user } = useAuth0();
  const { profile } = useAuth();

  useEffect(() => {
    console.log('AuthCallback: isLoading=', isLoading, 'isAuthenticated=', isAuthenticated, 'user=', user, 'profile=', profile);
    
    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log('User authenticated, waiting for profile...');
        // Wait a moment for profile to be created/updated
        const timer = setTimeout(() => {
          console.log('Redirecting user, profile=', profile);
          if (profile) {
            // Redirect based on user role
            const redirectPath = profile.role === 'teacher' ? '/teacher' : '/student';
            console.log('Redirecting to:', redirectPath);
            navigate(redirectPath);
          } else {
            // Fallback if profile isn't ready yet
            console.log('Profile not ready, redirecting to /student');
            navigate('/student');
          }
        }, 3000); // Increased wait time

        return () => clearTimeout(timer);
      } else if (error) {
        console.error('Auth0 callback error:', error);
        navigate('/login?error=auth_failed');
      } else {
        console.log('Not authenticated, redirecting to login');
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, error, user, profile, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Completing sign in...</p>
            <p className="text-gray-300 text-sm mt-2">Please wait while we set up your account</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Error</h2>
            <p className="text-gray-300 mb-6">Something went wrong during sign in. Please try again.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not loading and not authenticated, redirect to login
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Default loading state
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Redirecting...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;