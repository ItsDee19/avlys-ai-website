# Automatic Token Refresh Implementation Guide

This guide explains the automatic token refresh functionality implemented in the Avyls AI application.

## Overview

The application now supports automatic token refresh to provide a seamless user experience without requiring users to log in again when their access tokens expire.

## Architecture

### Backend Implementation

#### 1. JWT Utility (`server/utils/jwt.js`)
- **Dual Token System**: Generates both access tokens (15 minutes) and refresh tokens (7 days)
- **Token Verification**: Separate methods for verifying access and refresh tokens
- **Expiry Detection**: Built-in methods to check if tokens are expired

#### 2. Authentication Middleware (`server/middleware/auth.js`)
- **Automatic Refresh**: When an access token expires, the middleware automatically attempts to refresh it using the refresh token
- **Header-based Refresh**: New tokens are returned in response headers (`x-new-access-token`, `x-new-refresh-token`)
- **Fallback Support**: Maintains backward compatibility with existing JWT and Firebase authentication

#### 3. Auth Routes (`server/routes/auth.js`)
- **Updated Endpoints**: Login and register endpoints now return both access and refresh tokens
- **Refresh Endpoint**: New `/auth/refresh` endpoint for manual token refresh
- **Enhanced Verification**: The `/auth/verify` endpoint now indicates if tokens were refreshed

### Frontend Implementation

#### 1. Auth Utilities (`src/utils/authUtils.js`)
- **Token Management**: Handles storage and retrieval of both access and refresh tokens
- **Automatic Refresh**: Built-in logic to refresh tokens when they expire
- **Authenticated Fetch**: Wrapper for API calls that automatically handles token refresh
- **Token Validation**: Client-side token expiry checking

#### 2. Auth Hook (`src/hooks/useAuth.js`)
- **React Context**: Provides authentication state throughout the application
- **Automatic Monitoring**: Continuously monitors token expiry and refreshes proactively
- **Protected Routes**: HOC for protecting routes that require authentication

## Configuration

### Environment Variables

Add these variables to your `server/.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Token Expiry Times

- **Access Token**: 15 minutes (configurable via `JWT_EXPIRES_IN`)
- **Refresh Token**: 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Auto-refresh Trigger**: 2 minutes before access token expiry

## Usage

### Backend API Calls

#### Login/Register Response
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Manual Token Refresh
```javascript
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Automatic Refresh Headers
When making authenticated requests, include both tokens:
```javascript
Authorization: Bearer <access_token>
x-refresh-token: <refresh_token>
```

If tokens are refreshed, the response will include:
```javascript
x-new-access-token: <new_access_token>
x-new-refresh-token: <new_refresh_token>
```

### Frontend Usage

#### Using the Auth Hook
```javascript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.email}!</div>;
}
```

#### Making Authenticated API Calls
```javascript
import AuthUtils from '../utils/authUtils';

// This automatically handles token refresh
const response = await AuthUtils.authenticatedFetch('/api/campaigns', {
  method: 'GET'
});
```

#### Protecting Routes
```javascript
import { withAuth } from '../hooks/useAuth';

const ProtectedComponent = withAuth(function Dashboard() {
  return <div>Protected Dashboard Content</div>;
});
```

## Security Features

1. **Separate Secrets**: Access and refresh tokens use different secrets
2. **Short-lived Access Tokens**: 15-minute expiry reduces exposure risk
3. **Automatic Cleanup**: Expired refresh tokens are automatically cleared
4. **Secure Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
5. **Token Type Validation**: Refresh tokens are explicitly marked and validated

## Error Handling

### Backend Errors
- **Token Expired**: Automatically attempts refresh
- **Invalid Refresh Token**: Returns 401, requires re-authentication
- **Missing Tokens**: Returns 401 with appropriate error message

### Frontend Errors
- **Refresh Failed**: Automatically redirects to login page
- **Network Errors**: Graceful degradation with error messages
- **Invalid Tokens**: Clears storage and redirects to login

## Migration Guide

### For Existing Code

1. **Update API Calls**: Replace direct fetch calls with `AuthUtils.authenticatedFetch()`
2. **Token Storage**: Update code to handle both access and refresh tokens
3. **Error Handling**: Update error handling to account for automatic refresh

### Example Migration

**Before:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('/api/campaigns', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**After:**
```javascript
const response = await AuthUtils.authenticatedFetch('/api/campaigns');
```

## Testing

### Manual Testing
1. Log in to the application
2. Wait for the access token to expire (15 minutes)
3. Make an API call - it should automatically refresh
4. Check browser network tab for refresh requests

### Automated Testing
```javascript
// Test token refresh
const expiredToken = 'expired.jwt.token';
const refreshToken = 'valid.refresh.token';

// Should automatically refresh and retry
const response = await AuthUtils.authenticatedFetch('/api/test');
expect(response.ok).toBe(true);
```

## Troubleshooting

### Common Issues

1. **Tokens not refreshing**: Check that refresh token is being sent in headers
2. **Infinite refresh loops**: Verify refresh token expiry and validity
3. **CORS issues**: Ensure custom headers are allowed in CORS configuration
4. **Storage issues**: Check localStorage availability and permissions

### Debug Mode
Enable debug logging by setting:
```javascript
AuthUtils.DEBUG = true;
```

## Production Considerations

1. **Use httpOnly Cookies**: Consider using httpOnly cookies instead of localStorage for token storage
2. **Implement Token Rotation**: Rotate refresh tokens on each use
3. **Add Rate Limiting**: Implement rate limiting on refresh endpoint
4. **Monitor Token Usage**: Log and monitor token refresh patterns
5. **Implement Logout on Suspicious Activity**: Detect and respond to unusual token usage

## Benefits

1. **Improved UX**: Users don't need to log in repeatedly
2. **Enhanced Security**: Short-lived access tokens reduce exposure
3. **Seamless Integration**: Automatic refresh is transparent to application code
4. **Backward Compatibility**: Existing authentication flows continue to work
5. **Scalable**: Works with multiple concurrent requests

This implementation provides a robust, secure, and user-friendly authentication system with automatic token refresh capabilities.