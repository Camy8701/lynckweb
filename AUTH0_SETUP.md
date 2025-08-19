# Auth0 Configuration Setup Guide

## Current Issue
The "site can't be reached" error occurs after login attempts because Auth0 needs additional configuration in your Auth0 Dashboard.

## Auth0 Dashboard Configuration Steps

### 1. Login to Auth0 Dashboard
- Go to https://manage.auth0.com/
- Login with your Auth0 account

### 2. Configure Application Settings
Navigate to **Applications** → **Your Application** → **Settings**

#### Required Settings:
- **Allowed Callback URLs**: `http://localhost:3000`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`
- **Allowed Origins (CORS)**: `http://localhost:3000`

#### Important Notes:
- Make sure there are **no trailing slashes** in the URLs
- URLs must match exactly (including protocol: http vs https)
- Save changes after adding each URL

#### For Production:
Add your production domain to all URLs above:
- `https://yourdomain.com`

### 3. Enable Google Social Connection
Navigate to **Authentication** → **Social** → **Google**

#### Steps:
1. Click **Create Connection**
2. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
3. In **Applications** tab, enable this connection for your app
4. **Save Changes**

### 4. Enable Database Connection (for Email/Password)
Navigate to **Authentication** → **Database** → **Username-Password-Authentication**

#### Steps:
1. If not exists, click **Create DB Connection**
2. In **Applications** tab, enable this connection for your app
3. Configure **Settings**:
   - Enable **Sign Ups**
   - Configure password policy as needed
4. **Save Changes**

### 5. Configure APIs (Optional)
Navigate to **Applications** → **APIs**

#### Steps:
1. Click **Create API**
2. **Name**: `Lynck Academy API`
3. **Identifier**: `https://api.lynckacademy.com`
4. **Signing Algorithm**: `RS256`
5. **Save**

Update your `.env` file:
```
REACT_APP_AUTH0_AUDIENCE=https://api.lynckacademy.com
```

## Environment Variables Check

Ensure your `.env` file contains:
```env
REACT_APP_AUTH0_DOMAIN=dev-aqnqzrrz8yzyoydv.eu.auth0.com
REACT_APP_AUTH0_CLIENT_ID=2UtOT9BQKs32EFc7lKYQ4AniacqT7xmQ
REACT_APP_AUTH0_AUDIENCE=https://api.lynckacademy.com
REACT_APP_SUPABASE_URL=https://hfjcowcahjcggxmsnndy.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing Steps

1. **Restart your development server** after making changes:
   ```bash
   npm start
   ```

2. **Test Google Login**:
   - Go to `/login`
   - Select Google login method
   - Click "Continue with Google"
   - Should redirect to Google OAuth, then back to your app

3. **Test Email/Password**:
   - Go to `/register` 
   - Select Email signup method
   - Fill out the form and submit
   - Should create account and redirect back

## Troubleshooting

### "Site can't be reached" Error
- Verify callback URLs in Auth0 Dashboard match exactly
- Ensure both Google and Database connections are enabled
- Check browser console for Auth0 errors

### Logout "Site can't be reached" Error
- Verify **Allowed Logout URLs** in Auth0 Dashboard includes `http://localhost:3000`
- Ensure there are no trailing slashes in logout URLs
- Check Auth0 tenant logs for logout errors
- Clear browser cache and cookies

### Google Login Not Working
- Verify Google OAuth credentials in Auth0
- Enable Google connection for your application
- Check Google Console for OAuth settings

### Email/Password Not Working
- Enable Database connection in Auth0
- Ensure signup is enabled in connection settings
- Check Auth0 logs for authentication errors

## Development vs Production

### Development (localhost:3000):
- Uses Auth0 development tenant
- Callback URLs include localhost
- Debug mode enabled

### Production:
- Update all callback URLs to production domain
- Use production Auth0 tenant
- Enable proper CORS settings

---

**Note**: After completing these steps, the authentication should work properly and redirect correctly after login.