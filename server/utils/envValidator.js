/**
 * Environment Variable Validator
 * Validates required environment variables on startup
 */

class EnvironmentValidator {
  constructor() {
    this.requiredVars = {
      // Core application
      NODE_ENV: 'string',
      PORT: 'number',
      
      // Firebase (required for core functionality)
      FIREBASE_PROJECT_ID: 'string',
      
      // JWT (required for authentication)
      JWT_SECRET: 'string',
      JWT_REFRESH_SECRET: 'string',
      
      // AI Services (at least one required)
      OPENAI_API_KEY: 'string',
      ANTHROPIC_API_KEY: 'string',
      GEMINI_API_KEY: 'string',
      DEEPSEEK_API_KEY: 'string',
      MISTRAL_API_KEY: 'string',
      OPENROUTER_API_KEY: 'string',
      
      // Optional services
      AI_ML_API_KEY: 'string',
      FAL_KEY: 'string',
      REPLICATE_API_TOKEN: 'string',
      
      // Scraper service
      SERPAPI_KEY: 'string',
      GROQ_API_KEY: 'string',
      
      // Payment processing
      STRIPE_SECRET_KEY: 'string',
      STRIPE_PUBLISHABLE_KEY: 'string',
      
      // Monitoring
      SENTRY_DSN: 'string'
    };
    
    this.optionalVars = {
      FRONTEND_URL: 'string',
      FIREBASE_CLIENT_EMAIL: 'string',
      FIREBASE_PRIVATE_KEY: 'string',
      JWT_EXPIRES_IN: 'string',
      JWT_REFRESH_EXPIRES_IN: 'string',
      RATE_LIMIT_WINDOW_MS: 'number',
      RATE_LIMIT_MAX_REQUESTS: 'number',
      ALLOWED_ORIGINS: 'string',
      DEBUG: 'boolean',
      LOG_LEVEL: 'string',
      SSL_CERT_PATH: 'string',
      SSL_KEY_PATH: 'string',
      CDN_URL: 'string',
      ENABLE_AI_CONTENT_GENERATION: 'boolean',
      ENABLE_SCRAPER_SERVICE: 'boolean',
      ENABLE_PAYMENT_PROCESSING: 'boolean',
      ENABLE_EMAIL_NOTIFICATIONS: 'boolean',
      ENABLE_ANALYTICS: 'boolean'
    };
  }

  /**
   * Validate environment variables
   * @returns {Object} Validation result
   */
  validate() {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      missing: [],
      available: [],
      services: {
        firebase: false,
        ai: false,
        scraper: false,
        payment: false,
        monitoring: false
      }
    };

    // Check required variables
    for (const [varName, expectedType] of Object.entries(this.requiredVars)) {
      const value = process.env[varName];
      
      if (!value) {
        if (this.isCritical(varName)) {
          result.errors.push(`Missing required environment variable: ${varName}`);
          result.isValid = false;
        } else {
          result.warnings.push(`Missing optional environment variable: ${varName}`);
        }
        result.missing.push(varName);
      } else {
        result.available.push(varName);
        
        // Type validation
        if (!this.validateType(value, expectedType)) {
          result.errors.push(`Invalid type for ${varName}: expected ${expectedType}`);
          result.isValid = false;
        }
      }
    }

    // Check optional variables
    for (const [varName, expectedType] of Object.entries(this.optionalVars)) {
      const value = process.env[varName];
      if (value && !this.validateType(value, expectedType)) {
        result.warnings.push(`Invalid type for ${varName}: expected ${expectedType}`);
      }
    }

    // Check service availability
    result.services = this.checkServiceAvailability();

    return result;
  }

  /**
   * Check if a variable is critical for application startup
   * @param {string} varName - Environment variable name
   * @returns {boolean}
   */
  isCritical(varName) {
    const criticalVars = [
      'NODE_ENV',
      'PORT',
      'FIREBASE_PROJECT_ID',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET'
    ];
    return criticalVars.includes(varName);
  }

  /**
   * Validate variable type
   * @param {string} value - Environment variable value
   * @param {string} expectedType - Expected type
   * @returns {boolean}
   */
  validateType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string' && value.length > 0;
      case 'number':
        return !isNaN(Number(value));
      case 'boolean':
        return ['true', 'false', '1', '0'].includes(value.toLowerCase());
      default:
        return true;
    }
  }

  /**
   * Check which services are available
   * @returns {Object} Service availability status
   */
  checkServiceAvailability() {
    return {
      firebase: !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY),
      ai: !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || 
             process.env.DEEPSEEK_API_KEY || process.env.MISTRAL_API_KEY || process.env.OPENROUTER_API_KEY),
      scraper: !!(process.env.SERPAPI_KEY && process.env.GROQ_API_KEY),
      payment: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY),
      monitoring: !!process.env.SENTRY_DSN
    };
  }

  /**
   * Get environment summary
   * @returns {Object} Environment summary
   */
  getSummary() {
    const validation = this.validate();
    const services = validation.services;
    
    return {
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5001,
      services: {
        firebase: services.firebase ? '✅ Available' : '❌ Not configured',
        ai: services.ai ? '✅ Available' : '❌ Not configured',
        scraper: services.scraper ? '✅ Available' : '❌ Not configured',
        payment: services.payment ? '✅ Available' : '❌ Not configured',
        monitoring: services.monitoring ? '✅ Available' : '❌ Not configured'
      },
      warnings: validation.warnings.length,
      errors: validation.errors.length
    };
  }

  /**
   * Print environment validation report
   */
  printReport() {
    const validation = this.validate();
    const summary = this.getSummary();
    
    console.log('\n🔍 Environment Validation Report');
    console.log('================================');
    console.log(`Environment: ${summary.environment}`);
    console.log(`Port: ${summary.port}`);
    console.log('\n📦 Service Status:');
    
    Object.entries(summary.services).forEach(([service, status]) => {
      console.log(`  ${service}: ${status}`);
    });
    
    if (validation.errors.length > 0) {
      console.log('\n❌ Critical Errors:');
      validation.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      validation.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }
    
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      console.log('\n✅ All environment variables are properly configured!');
    }
    
    console.log('\n📝 Setup Instructions:');
    console.log('1. Copy env.example to .env');
    console.log('2. Fill in your API keys and configuration');
    console.log('3. Restart the application');
    console.log('================================\n');
  }
}

module.exports = new EnvironmentValidator(); 