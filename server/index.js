// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Import environment validator
const envValidator = require('./utils/envValidator');

// Import Firebase config first to handle initialization
const { firebaseInitialized } = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 5001;

// Validate environment on startup
console.log('🔍 Validating environment configuration...');
envValidator.printReport();

const validation = envValidator.validate();
if (!validation.isValid) {
  console.error('❌ Critical environment errors found. Please fix them before starting the server.');
  process.exit(1);
}

// Middleware
app.use(helmet());

// Cookie parser middleware for secure authentication
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-firebase-user-id']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const services = envValidator.checkServiceAvailability();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    firebase: firebaseInitialized ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    services: services,
    version: '1.0.0'
  });
});

// Routes
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const contactsRoutes = require('./routes/contacts');
const newsletterRoutes = require('./routes/newsletter');
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
// const paymentRoutes = require('./routes/payments');
const analyticsRoutes = require('./routes/analytics');
const deploymentsRoutes = require('./routes/deployments');

app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
// app.use('/api/payments', paymentRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/deployments', deploymentsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token or credentials'
    });
  }
  
  if (err.message.includes('Firestore is not available')) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Database service is currently unavailable. Please try again later.'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Firebase status: ${firebaseInitialized ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  if (!firebaseInitialized) {
    console.log('⚠️  Firebase is not properly configured. Some features may not work.');
    console.log('📝 Please check your .env file and Firebase credentials.');
  }
  
  // Print service status
  const services = envValidator.checkServiceAvailability();
  console.log('\n📦 Available Services:');
  Object.entries(services).forEach(([service, available]) => {
    console.log(`  ${service}: ${available ? '✅' : '❌'}`);
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // ... existing code ...
}