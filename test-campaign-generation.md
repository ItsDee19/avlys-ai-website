# Campaign Generation Test Guide

## Prerequisites
1. Make sure your server is running: `cd server && npm run dev`
2. Make sure your frontend is running: `npm run dev`
3. Ensure you have Firebase environment variables set in `server/.env`

## Test Steps

### 1. User Authentication
1. Go to your website
2. Click "Sign In" or "Get Started"
3. Sign in with Google or create an account
4. Verify user data is stored in localStorage

### 2. Campaign Generation
1. Navigate to `/campaign-builder`
2. Fill out all the steps:
   - Business Name: "Test Business"
   - Industry: "E-commerce & Retail"
   - Business Size: "Startup"
   - Goals: Select "Brand Awareness" and "Lead Generation"
   - Budget: "$500 - $1,000"
   - Target Audience: "Young professionals aged 25-35"
   - Preferred Channels: Select "Facebook" and "Instagram"
   - Timeline: "Within 1 month"
3. Click "🚀 Generate My Campaign"

### 3. Expected Results
- Campaign should be created in Firestore `campaigns` collection
- User should be redirected to `/dashboard`
- Dashboard should show the created campaign
- Campaign should have status "draft"

### 4. Database Verification
Check your Firestore database for:
- `users` collection: Should have a user document with `firebaseUserId`
- `campaigns` collection: Should have a campaign document with:
  - `userId`: Reference to the user
  - `name`: "Test Business"
  - `status`: "draft"
  - `businessName`, `industry`, `goals`, etc.

## Troubleshooting

### If campaign generation fails:
1. Check browser console for errors
2. Check server console for errors
3. Verify Firebase environment variables
4. Check Firestore security rules

### If user authentication fails:
1. Check if user is properly stored in localStorage
2. Verify Firebase Auth is working
3. Check if user document is created in Firestore

## Expected Firestore Structure

```javascript
// users collection
{
  id: "auto-generated",
  firebaseUserId: "firebase-auth-uid",
  username: "user_abc12345",
  email: "",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  profile: { ... },
  settings: { ... },
  subscription: { ... }
}

// campaigns collection
{
  id: "auto-generated",
  userId: "user-document-id",
  name: "Test Business",
  businessName: "Test Business",
  industry: "ecommerce",
  businessSize: "startup",
  goals: ["brand-awareness", "lead-generation"],
  budget: "500-1000",
  targetAudience: "Young professionals aged 25-35",
  preferredChannels: ["facebook", "instagram"],
  timeline: "Within 1 month",
  status: "draft",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  analytics: { ... },
  targetAudience: { ... },
  platforms: { ... },
  strategy: { ... }
}
``` 