import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const AuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth0();

  useEffect(() => {
    // Check if this is an Auth0 callback (has code and state parameters)
    const urlParams = new URLSearchParams(location.search);
    const hasAuthCode = urlParams.has('code') && urlParams.has('state');
    
    console.log('AuthHandler: Current URL:', location.pathname + location.search);
    console.log('AuthHandler: Has auth code:', hasAuthCode);
    console.log('AuthHandler: isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

    if (hasAuthCode && !isLoading) {
      console.log('Auth0 callback detected, redirecting to /callback');
      navigate('/callback' + location.search, { replace: true });
    }
  }, [location, navigate, isLoading]);

  return null; // This component doesn't render anything
};

export default AuthHandler;