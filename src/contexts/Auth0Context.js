import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { supabase } from '../lib/supabase';
import { auth0Config } from '../config/auth0';

// Create Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Check if Auth0 is properly configured
  const isAuth0Configured = 
    process.env.REACT_APP_AUTH0_DOMAIN && 
    process.env.REACT_APP_AUTH0_CLIENT_ID &&
    process.env.REACT_APP_AUTH0_DOMAIN !== 'placeholder.auth0.com' &&
    process.env.REACT_APP_AUTH0_CLIENT_ID !== 'placeholder-client-id';
  
  const isDevelopmentMode = !isAuth0Configured;

  // If in development mode, provide mock Auth0 behavior
  const mockAuth0 = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    loginWithRedirect: () => console.log('Development mode: Auth0 not configured'),
    logout: () => console.log('Development mode: Auth0 not configured'),
    getAccessTokenSilently: () => Promise.resolve('mock-token'),
    getIdTokenClaims: () => Promise.resolve({ __raw: 'mock-id-token' })
  };

  let auth0Hook;
  try {
    // Try to use Auth0 hook, but it may not be available in development mode
    auth0Hook = isDevelopmentMode ? mockAuth0 : useAuth0();
  } catch (error) {
    // If useAuth0 fails (no Auth0Provider), use mock behavior
    console.log('Auth0Provider not found, using development mode');
    auth0Hook = mockAuth0;
  }
  
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    getIdTokenClaims
  } = auth0Hook;

  const [profile, setProfile] = useState(null);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync user with Supabase when Auth0 user changes
  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (isDevelopmentMode) {
        // In development mode, skip Supabase sync
        console.log('Development mode: Skipping Supabase authentication');
        setLoading(false);
        return;
      }

      if (isAuthenticated && user) {
        try {
          setLoading(true);
          console.log('Auth0 user authenticated:', user);
          
          // Skip Supabase JWT integration for now - create profile directly
          // Get or create user profile in Supabase using regular API
          await getOrCreateUserProfileDirect(user);
          
        } catch (error) {
          console.error('Error syncing user with Supabase:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        // User is not authenticated, clear state
        setSupabaseUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    if (!isLoading) {
      syncUserWithSupabase();
    }
  }, [isAuthenticated, user, isLoading, isDevelopmentMode]);

  // Get or create user profile in Supabase using direct API (no JWT)
  const getOrCreateUserProfileDirect = async (auth0User) => {
    try {
      // Use Auth0 user email as unique identifier (since we don't have Supabase auth)
      const userEmail = auth0User.email;
      console.log('Looking for profile with email:', userEmail);
      
      // First, try to get existing profile by email
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no rows found

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        // Only set error for actual database errors, not "no rows found"
        if (fetchError.code !== 'PGRST116') {
          setError(fetchError.message);
          return;
        }
      }

      let userProfile = existingProfile;

      // If profile doesn't exist, create it
      if (!existingProfile) {
        console.log('Creating new profile for user:', auth0User);
        // Generate a UUID for the profile (we'll use a simple approach)
        const profileId = crypto.randomUUID();
        
        const newProfile = {
          id: profileId,
          email: auth0User.email,
          full_name: auth0User.name,
          avatar_url: auth0User.picture,
          email_verified: auth0User.email_verified || false,
          role: 'student', // Default role
          account_status: 'active'
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setError(createError.message);
          return;
        }

        userProfile = createdProfile;
        console.log('Profile created successfully:', userProfile);
      } else {
        console.log('Profile found, updating:', existingProfile);
        // Update existing profile with latest Auth0 data
        const updates = {
          full_name: auth0User.name,
          avatar_url: auth0User.picture,
          email_verified: auth0User.email_verified || existingProfile.email_verified,
          last_active_at: new Date().toISOString()
        };

        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('email', userEmail)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating profile:', updateError);
          setError(updateError.message);
          return;
        }

        userProfile = updatedProfile;
        console.log('Profile updated successfully:', userProfile);
      }

      setProfile(userProfile);
      
    } catch (error) {
      console.error('Error in getOrCreateUserProfileDirect:', error);
      setError(error.message);
    }
  };

  // Get or create user profile in Supabase (old JWT method - kept for reference)
  const getOrCreateUserProfile = async (auth0User, supabaseAuthUser) => {
    try {
      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseAuthUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', fetchError);
        setError(fetchError.message);
        return;
      }

      let userProfile = existingProfile;

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const newProfile = {
          id: supabaseAuthUser.id,
          email: auth0User.email,
          full_name: auth0User.name,
          avatar_url: auth0User.picture,
          email_verified: auth0User.email_verified || false,
          role: 'student', // Default role
          account_status: 'active'
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setError(createError.message);
          return;
        }

        userProfile = createdProfile;
      } else {
        // Update existing profile with latest Auth0 data
        const updates = {
          full_name: auth0User.name,
          avatar_url: auth0User.picture,
          email_verified: auth0User.email_verified || existingProfile.email_verified,
          last_active_at: new Date().toISOString()
        };

        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', supabaseAuthUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating profile:', updateError);
          setError(updateError.message);
          return;
        }

        userProfile = updatedProfile;
      }

      setProfile(userProfile);
      
    } catch (error) {
      console.error('Error in getOrCreateUserProfile:', error);
      setError(error.message);
    }
  };

  // Login function
  const login = async (options = {}) => {
    if (isDevelopmentMode) {
      console.log('Development mode: Simulating login with options:', options);
      setError(null);
      return;
    }

    try {
      setError(null);
      
      // Use the provided connection or default to Google OAuth
      const loginOptions = {
        redirectUri: `${window.location.origin}/callback`,
        connection: options.connection || 'google-oauth2',
        ...options
      };

      console.log('Auth0 login options:', loginOptions);
      await loginWithRedirect(loginOptions);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

  // Register function
  const register = async (userData = {}) => {
    if (isDevelopmentMode) {
      console.log('Development mode: Simulating registration with data:', userData);
      setError(null);
      return;
    }

    try {
      setError(null);
      
      // Use the provided connection or default to Google OAuth
      const registerOptions = {
        redirectUri: `${window.location.origin}/callback`,
        connection: userData.connection || 'google-oauth2',
        screen_hint: 'signup',
        ...userData
      };

      console.log('Auth0 register options:', registerOptions);
      await loginWithRedirect(registerOptions);
    } catch (error) {
      console.error('Register error:', error);
      setError(error.message);
    }
  };

  // Logout function
  const handleLogout = async () => {
    if (isDevelopmentMode) {
      console.log('Development mode: Simulating logout');
      // Clear local state
      setProfile(null);
      setSupabaseUser(null);
      setError(null);
      // Redirect to home page
      window.location.href = '/';
      return;
    }

    try {
      setError(null);
      
      // Clear local state first
      setProfile(null);
      setSupabaseUser(null)
      
      // Sign out from Auth0 with proper configuration
      logout({
        returnTo: window.location.origin
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      
      // If Auth0 logout fails, at least clear local state and redirect
      setProfile(null);
      setSupabaseUser(null);
      window.location.href = '/';
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    if (!supabaseUser || !profile) {
      throw new Error('User not authenticated');
    }

    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', supabaseUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
      throw error;
    }
  };

  // Get Supabase client with auth
  const getSupabaseClient = () => {
    return supabase;
  };

  // Helper functions
  const isTeacher = profile?.role === 'teacher';
  const isStudent = profile?.role === 'student';
  const isAdmin = profile?.role === 'admin';

  const value = {
    // Auth0 user data
    user,
    isAuthenticated,
    isLoading: isLoading || loading,
    
    // Supabase user data
    profile,
    supabaseUser,
    
    // Authentication methods
    login,
    register,
    logout: handleLogout,
    
    // Profile management
    updateProfile,
    
    // Utilities
    getSupabaseClient,
    getAccessTokenSilently,
    
    // Role helpers
    isTeacher,
    isStudent,
    isAdmin,
    
    // Development mode status
    isDevelopmentMode,
    
    // Error state
    error,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};