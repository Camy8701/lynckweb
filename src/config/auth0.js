// Auth0 Configuration
const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || 'placeholder.auth0.com',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || 'placeholder-client-id',
  redirectUri: `${window.location.origin}/callback`,
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || '', // Your API identifier
  scope: "openid profile email", // Requested scopes
  
  // Additional configuration
  cacheLocation: 'localstorage', // Store tokens in localStorage
  useRefreshTokens: true,
  
  // Supabase integration
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co',
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key',
};

// Named export
export { auth0Config };

// Validate required environment variables
const requiredEnvVars = [
  'REACT_APP_AUTH0_DOMAIN',
  'REACT_APP_AUTH0_CLIENT_ID',
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file and ensure all Auth0 and Supabase variables are set.');
}

export default auth0Config;