# Server Connection Test Guide

## Step 1: Check if Server is Running

1. Open a terminal and navigate to the server directory:
   ```bash
   cd server
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. You should see output like:
   ```
   [nodemon] 3.1.10
   [nodemon] to restart at any time, enter `rs`
   [nodemon] watching path(s): *.*
   [nodemon] watching extensions: js,mjs,cjs,json
   [nodemon] starting `node index.js`
   Firebase Admin SDK initialized successfully
   Server running on port 5000
   Firebase Firestore connected
   ```

## Step 2: Check Firebase Environment Variables

Make sure you have a `.env` file in the `server` directory with:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
```

## Step 3: Test API Endpoint

1. Open your browser and go to: `http://localhost:5000/api/campaigns/ai/generate-response`
2. You should see a response (even if it's an error, it means the server is running)

## Step 4: Test with curl

```bash
curl -X POST http://localhost:5000/api/campaigns/ai/generate-response \
  -H "Content-Type: application/json" \
  -d '{"step": 0, "data": {}}'
```

## Common Issues and Solutions

### Issue 1: "Cannot find module 'firebase-admin'"
**Solution**: Install dependencies
```bash
cd server
npm install
```

### Issue 2: "Missing Firebase environment variables"
**Solution**: Create `.env` file with proper Firebase credentials

### Issue 3: "Firebase initialization error"
**Solution**: Check your Firebase service account credentials

### Issue 4: "Cannot connect to localhost:5000"
**Solution**: Make sure the server is running on port 5000

## Debug Steps

1. **Check server logs** for any error messages
2. **Check browser console** for network errors
3. **Verify Firebase project** is set up correctly
4. **Test individual routes** to isolate the issue

## Expected Server Output

When everything is working correctly, you should see:
```
Firebase Admin SDK initialized successfully
Server running on port 5000
Firebase Firestore connected
```

If you see any errors, they will help identify the specific issue. 