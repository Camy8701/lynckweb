import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/Auth0Context';
import { auth0Config } from './config/auth0';
import ThreeParallaxBackground from './components/ThreeParallaxBackground';
import LandingPage from './pages/LandingPage';
import CourseDiscovery from './pages/CourseDiscovery';
import CourseDetail from './pages/CourseDetail';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import LessonPlayer from './pages/LessonPlayer';
import AuthCallback from './pages/AuthCallback';
import BecomeTeacher from './pages/BecomeTeacher';
import AdminDashboard from './pages/AdminDashboard';
import MyStoryPage from './pages/MyStoryPage';
import AboutPage from './pages/AboutPage';

function App() {
  // Check if Auth0 is properly configured
  const isAuth0Configured = 
    process.env.REACT_APP_AUTH0_DOMAIN && 
    process.env.REACT_APP_AUTH0_CLIENT_ID &&
    process.env.REACT_APP_AUTH0_DOMAIN !== 'placeholder.auth0.com' &&
    process.env.REACT_APP_AUTH0_CLIENT_ID !== 'placeholder-client-id';
  
  const isDevelopmentMode = !isAuth0Configured;

  // AppContent component to avoid Auth0Provider when not configured
  const AppContent = () => (
    <AuthProvider>
      <LanguageProvider>
        <div className="App min-h-screen relative overflow-hidden bg-zinc-950">
          <ThreeParallaxBackground />
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/courses" element={<CourseDiscovery />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/lesson/:id" element={<LessonPlayer />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/callback" element={<AuthCallback />} />
              <Route path="/become-teacher" element={<BecomeTeacher />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/my-story" element={<MyStoryPage />} />
              <Route path="/about" element={<AboutPage />} />
              {/* Fallback route - redirects to home if no match */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </div>
        </div>
      </LanguageProvider>
    </AuthProvider>
  );

  // In development mode, skip Auth0Provider entirely
  if (isDevelopmentMode) {
    console.log('Development mode: Auth0 not configured, running without Auth0Provider');
    return <AppContent />;
  }

  // Production mode with proper Auth0Provider
  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: auth0Config.scope,
      }}
      cacheLocation={auth0Config.cacheLocation}
      useRefreshTokens={auth0Config.useRefreshTokens}
    >
      <AppContent />
    </Auth0Provider>
  );
}

export default App;