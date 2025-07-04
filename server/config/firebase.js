const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

try {
  // Check if required environment variables exist
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('⚠️  Missing Firebase environment variables. Server will start but Firebase features will be limited.');
    console.warn('Please create a .env file with your Firebase credentials for full functionality.');
    
    // For development/testing, initialize with a mock config
    admin.initializeApp({
      projectId: 'avlys-ai-3e461'
    });
    firebaseInitialized = true;
  } else {
    // Validate private key format
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // Handle different private key formats
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // If it's just the key without headers, add them
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
    }
    
    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.error('Server will continue without Firebase functionality');
  
  // Create a minimal app to prevent crashes
  try {
    admin.initializeApp({
      projectId: 'avlys-ai-3e461'
    });
    firebaseInitialized = true;
    console.log('✅ Firebase initialized with minimal config');
  } catch (fallbackError) {
    console.error('❌ Even fallback Firebase initialization failed:', fallbackError.message);
  }
}

// Export Firebase services with error handling
const getFirestore = () => {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized');
  }
  return admin.firestore();
};

const getAuth = () => {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized');
  }
  return admin.auth();
};

module.exports = { 
  db: getFirestore(), 
  auth: getAuth(), 
  admin,
  firebaseInitialized 
};