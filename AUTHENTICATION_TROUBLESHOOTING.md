# Authentication Troubleshooting Guide

## Common Authentication Issues and Solutions

### Issue: "Failed to create campaign: Invalid authentication token"

This error occurs when the frontend cannot provide a valid authentication token to the backend. Here are the possible causes and solutions:

## Root Causes and Solutions

### 1. **User Not Signed In**
**Symptoms:** 
- Error appears immediately when trying to create a campaign
- No user data in browser localStorage

**Solution:**
- Make sure you're signed in through the Sign In modal
- Check if user data exists in browser localStorage (Developer Tools > Application > Local Storage)

### 2. **Firebase Authentication Issues**
**Symptoms:**
- User appears signed in but still gets authentication errors
- Console shows Firebase-related errors

**Solutions:**
- Check Firebase configuration in `src/config/firebase.js`
- Verify Firebase project settings match your `.env` file
- Ensure Firebase Auth is enabled in your Firebase console
- Check browser console for specific Firebase errors

### 3. **JWT Token Issues**
**Symptoms:**
- Authentication works initially but fails after some time
- Console shows "Token expired" or "Invalid token" errors

**Solutions:**
- Clear browser localStorage and sign in again
- Check if JWT secrets are properly configured in server `.env`
- Verify token refresh mechanism is working

### 4. **Server Configuration Issues**
**Symptoms:**
- Authentication fails consistently
- Server logs show configuration errors

**Solutions:**
- Verify all environment variables are set in `server/.env`:
  ```
  JWT_SECRET=your-jwt-secret
  JWT_ACCESS_EXPIRES_IN=15m
  JWT_REFRESH_SECRET=your-refresh-secret
  JWT_REFRESH_EXPIRES_IN=7d
  FIREBASE_PROJECT_ID=your-project-id
  FIREBASE_PRIVATE_KEY=your-private-key
  FIREBASE_CLIENT_EMAIL=your-client-email
  ```
- Restart the server after changing environment variables

## Step-by-Step Debugging

### Step 1: Check User Authentication Status
1. Open browser Developer Tools (F12)
2. Go to Application > Local Storage
3. Look for:
   - `user`: Should contain user ID and email
   - `accessToken`: JWT access token (if available)
   - `refreshToken`: JWT refresh token (if available)

### Step 2: Check Console Logs
1. Open browser Console tab
2. Try to create a campaign
3. Look for error messages related to:
   - Firebase authentication
   - Token validation
   - Network requests

### Step 3: Check Network Requests
1. Open Network tab in Developer Tools
2. Try to create a campaign
3. Check the `/api/campaigns/generate` request:
   - Request headers should include authentication
   - Response should not be 401 Unauthorized

### Step 4: Verify Server Logs
1. Check server console for error messages
2. Look for authentication-related errors
3. Verify Firebase initialization status

## Authentication Flow

### How Authentication Works
1. **User Signs In**: Firebase Auth handles login
2. **Token Exchange**: Frontend gets Firebase ID token and exchanges it for JWT tokens
3. **API Requests**: Frontend sends JWT tokens with API requests
4. **Token Validation**: Backend validates tokens using middleware
5. **Automatic Refresh**: Expired tokens are automatically refreshed

### Supported Authentication Methods
1. **Firebase Authentication**: Primary method using Firebase ID tokens
2. **JWT Authentication**: Fallback method using access/refresh tokens
3. **Hybrid Mode**: Combination of both for maximum compatibility

## Quick Fixes

### Fix 1: Clear Authentication Data
```javascript
// Run in browser console
localStorage.removeItem('user');
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
// Then sign in again
```

### Fix 2: Force Token Refresh
```javascript
// Run in browser console
fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
})
.then(response => response.json())
.then(data => {
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    console.log('Tokens refreshed successfully');
  }
});
```

### Fix 3: Test Authentication Endpoint
```javascript
// Run in browser console
fetch('/api/auth/verify', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'x-refresh-token': localStorage.getItem('refreshToken')
  }
})
.then(response => response.json())
.then(data => console.log('Auth test result:', data));
```

## Environment Setup

### Required Environment Variables

**Frontend (.env):**
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Backend (server/.env):**
```
JWT_SECRET=your-strong-jwt-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-strong-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

## Testing Authentication

### Test 1: Basic Authentication
1. Sign in through the UI
2. Check localStorage for tokens
3. Try creating a campaign

### Test 2: Token Refresh
1. Wait for access token to expire (15 minutes)
2. Try making an API request
3. Verify automatic token refresh works

### Test 3: Firebase Integration
1. Sign in with Firebase
2. Check if JWT tokens are obtained
3. Verify both authentication methods work

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No authentication token provided" | Missing Authorization header | Sign in again |
| "Invalid authentication token" | Malformed or expired token | Clear tokens and sign in |
| "Firebase authentication failed" | Firebase config issues | Check Firebase setup |
| "Token refresh failed" | Invalid refresh token | Clear tokens and sign in |
| "Authentication service unavailable" | Firebase not initialized | Check server Firebase config |

## Getting Help

If you're still experiencing issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure both frontend and backend servers are running
4. Try the quick fixes mentioned above
5. Check the server logs for additional error details

For persistent issues, please provide:
- Browser console logs
- Server console logs
- Network request details
- Environment configuration (without sensitive data)