# 🔐 Auth0 + Google OAuth Setup Guide

Complete guide to integrate Auth0 with Google OAuth for Lynck Academy.

## 📋 Prerequisites

- Auth0 account (free tier available)
- Google Cloud Console access
- Supabase project set up
- React application ready

## 🚀 Step-by-Step Setup

### 1. Configure Google OAuth

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen:
   - User Type: External
   - App name: Lynck Academy
   - User support email: your-email@domain.com
   - Authorized domains: your-domain.com
   - Developer contact: your-email@domain.com

6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: Lynck Academy Auth0
   - Authorized JavaScript origins: `https://your-auth0-domain.auth0.com`
   - Authorized redirect URIs: `https://your-auth0-domain.auth0.com/login/callback`

7. Save the **Client ID** and **Client Secret**

### 2. Configure Auth0

#### A. Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application:
   - Name: Lynck Academy
   - Type: Single Page Application (SPA)
   - Technology: React

#### B. Configure Application Settings

In your Auth0 application settings:

```
Allowed Callback URLs:
http://localhost:3000, https://your-domain.com

Allowed Logout URLs:
http://localhost:3000, https://your-domain.com

Allowed Web Origins:
http://localhost:3000, https://your-domain.com
```

#### C. Set up Google Social Connection

1. Go to **Authentication** → **Social**
2. Click **Create Connection** → **Google**
3. Enter your Google OAuth credentials:
   - Client ID: (from Google Console)
   - Client Secret: (from Google Console)
4. Configure attributes:
   - Email: ✅ 
   - Name: ✅
   - Picture: ✅
   - Email Verified: ✅
5. Enable for your application

#### D. Configure Auth0 Rules (Optional)

Create a rule to add custom claims:

```javascript
function addCustomClaims(user, context, callback) {
  const namespace = 'https://lynckacademy.com/';
  context.idToken[namespace + 'role'] = user.app_metadata?.role || 'student';
  context.idToken[namespace + 'user_metadata'] = user.user_metadata || {};
  
  callback(null, user, context);
}
```

### 3. Configure Supabase for Auth0

#### A. Enable Auth0 Provider

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Auth0**
3. Configure:
   - Auth0 URL: `https://your-auth0-domain.auth0.com`
   - JWT Secret: Your Auth0 secret (from Auth0 settings)

#### B. Set up JWT Claims

In Supabase, configure JWT claims mapping:

```sql
-- Update auth.jwt_secret if needed
-- This allows Supabase to verify Auth0 JWT tokens
```

### 4. Environment Configuration

Create/update your `.env` file:

```bash
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
REACT_APP_AUTH0_AUDIENCE=your-auth0-api-identifier

# Supabase Configuration
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Test the Integration

#### A. Test Authentication Flow

1. Start your React app: `npm start`
2. Navigate to `/login`
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. Verify user is created in Supabase `profiles` table

#### B. Test Database Integration

Check that the user profile is created:

```sql
-- In Supabase SQL Editor
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
```

## 🔧 Code Implementation

The integration is already implemented in:

- `src/config/auth0.js` - Auth0 configuration
- `src/contexts/Auth0Context.js` - Auth provider with Supabase sync
- `src/pages/Login.js` - Updated login page
- `src/pages/Register.js` - Updated registration page
- `src/App.js` - Auth0 provider wrapper

## 🔄 User Flow

1. User clicks "Continue with Google"
2. Redirected to Google OAuth
3. Google authenticates user
4. Auth0 receives Google profile
5. Auth0 creates/updates user
6. React app receives Auth0 JWT
7. JWT is used to authenticate with Supabase
8. User profile is created/updated in Supabase
9. User is redirected to dashboard

## 🛡️ Security Features

- **JWT Tokens**: Secure token-based authentication
- **HTTPS Only**: All authentication flows use HTTPS
- **Token Refresh**: Automatic token renewal
- **Role-Based Access**: Teacher/Student role separation
- **Row Level Security**: Database-level access control

## 🧪 Testing Checklist

- [ ] Google OAuth login works
- [ ] User profile created in Supabase
- [ ] Role assignment works (student/teacher)
- [ ] Dashboard redirects correctly
- [ ] Logout clears all sessions
- [ ] Token refresh works
- [ ] RLS policies enforce access control

## 🔍 Debugging

### Common Issues

1. **CORS Errors**:
   - Check Auth0 allowed origins
   - Verify callback URLs

2. **Token Verification Failed**:
   - Check Auth0 domain configuration
   - Verify JWT secret in Supabase

3. **User Not Created in Supabase**:
   - Check Auth0 → Supabase JWT integration
   - Verify profile creation trigger

4. **Infinite Redirect Loop**:
   - Check callback URL configuration
   - Verify Auth0 application type (SPA)

### Debug Commands

```bash
# Check environment variables
echo $REACT_APP_AUTH0_DOMAIN
echo $REACT_APP_SUPABASE_URL

# Test Auth0 connection
curl https://your-auth0-domain.auth0.com/.well-known/openid_configuration
```

### Browser Console Debugging

```javascript
// Check Auth0 user
console.log(auth0User);

// Check Supabase user
console.log(supabaseUser);

// Check profile data
console.log(profile);
```

## 📊 Analytics & Monitoring

Track authentication metrics:

- Login success rate
- Registration funnel
- User role distribution
- Session duration
- Error rates

## 🔄 Maintenance

Regular tasks:

- Monitor Auth0 usage limits
- Update Google OAuth credentials annually
- Review security logs
- Update dependencies
- Test authentication flow after updates

## 🚨 Troubleshooting Guide

### Auth0 Issues
- Check Auth0 logs in dashboard
- Verify social connection status
- Test with Auth0 debugger

### Supabase Issues
- Check Supabase auth logs
- Verify RLS policies
- Test database triggers

### React Issues
- Check browser console for errors
- Verify environment variables
- Test network requests

---

**Next Step**: Test the complete authentication flow and proceed with course creation features.