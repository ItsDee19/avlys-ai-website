# 🚀 Avyls AI Website

**AI-powered marketing campaign management platform** with real-time analytics, content generation, and deployment capabilities.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Features
- **User Authentication** - Firebase Auth with JWT tokens
- **Campaign Builder** - Multi-step AI-powered campaign creation
- **Real-time Analytics** - Live performance metrics and visualizations
- **AI Content Generation** - Captions, ad copy, hashtags, and images
- **Research Integration** - Automated business research and insights
- **Deployment Center** - Multi-platform campaign deployment
- **Responsive Design** - Mobile-first, modern UI

### 🤖 AI Capabilities
- **Multiple AI Providers** - OpenAI, Anthropic, Google Gemini, Mistral, DeepSeek
- **Content Types** - Social media posts, ad copy, hashtags, images, videos
- **Research Agent** - Automated business research and market analysis
- **Smart Recommendations** - AI-powered campaign optimization

### 🔒 Security Features
- **HTTP-Only Cookies** - XSS protection for authentication
- **CSRF Protection** - Cross-site request forgery prevention
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Comprehensive data sanitization
- **Session Management** - Automatic timeout and refresh

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18 + Vite | Modern UI framework |
| **Backend** | Node.js + Express | API server |
| **Database** | Firebase Firestore | Real-time data storage |
| **Authentication** | Firebase Auth + JWT | User management |
| **AI Services** | Multiple providers | Content generation |
| **Scraper** | Python + FastAPI | Research automation |
| **Styling** | Tailwind CSS | Responsive design |
| **Testing** | Jest + React Testing Library | Quality assurance |
| **Deployment** | Vercel/Netlify | Frontend hosting |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Firebase project
- AI service API keys

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/avyls-ai-website.git
cd avyls-ai-website

# Run setup script
npm run setup

# Install dependencies
npm install
cd server && npm install
cd ../scraper && pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy and edit environment file
cp env.example .env

# Add your API keys to .env file
# See env.example for all required variables
```

### 3. Start Development
```bash
# Start all services (frontend, backend, scraper)
npm run dev:all

# Or start individually:
npm run dev          # Frontend (port 3000)
npm run server:dev   # Backend (port 5001)
npm run scraper      # Scraper (port 8000)
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Scraper API**: http://localhost:8000
- **Health Check**: http://localhost:5001/health

## 📖 Detailed Setup

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Core Application
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# AI Service API Keys (at least one required)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GEMINI_API_KEY=your-gemini-key
MISTRAL_API_KEY=your-mistral-key

# Scraper Service
SERPAPI_KEY=your-serpapi-key
GROQ_API_KEY=gsk_your-groq-key
```

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication and Firestore

2. **Configure Authentication**
   - Enable Email/Password authentication
   - Add authorized domains

3. **Setup Firestore**
   - Create database in test mode
   - Set up security rules

4. **Get Service Account**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download JSON file

### AI Service Setup

#### Required Services (at least one)
- **OpenAI**: [Get API Key](https://platform.openai.com/api-keys)
- **Anthropic**: [Get API Key](https://console.anthropic.com/)
- **Google Gemini**: [Get API Key](https://makersuite.google.com/app/apikey)
- **Mistral AI**: [Get API Key](https://console.mistral.ai/)

#### Optional Services
- **SerpAPI**: For web scraping
- **Groq**: For AI insights
- **FAL AI**: For video generation
- **Replicate**: For image/video generation

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start frontend development server
npm run server:dev       # Start backend development server
npm run scraper          # Start Python scraper service
npm run dev:all          # Start all services concurrently

# Testing
npm run test             # Run frontend tests
npm run test:all         # Run all tests (frontend + backend)

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Maintenance
npm run setup            # Run setup script
npm run audit:fix        # Fix security vulnerabilities
npm run clean            # Clean install dependencies
npm run scraper:install  # Install Python dependencies
```

## 🧪 Testing

### Frontend Tests
```bash
npm test                 # Run all tests
npm test -- --watch      # Run tests in watch mode
npm test -- --coverage   # Run tests with coverage
```

### Backend Tests
```bash
cd server
npm test                 # Run all tests
npm test -- --watch      # Run tests in watch mode
```

### Test Coverage
- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **Integration**: API endpoint testing
- **E2E**: User flow testing (planned)

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect to GitHub for automatic deployments
```

### Backend Deployment (Railway/Heroku)
```bash
# Set environment variables
# Deploy using your preferred platform
```

### Scraper Deployment (Railway/DigitalOcean)
```bash
# Deploy Python service
# Set environment variables
# Configure health checks
```

### Environment Variables for Production
```env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Firebase Connection Issues
```bash
# Check Firebase configuration
npm run server:dev
# Look for Firebase initialization messages
```

#### 2. AI Service Errors
```bash
# Verify API keys in .env file
# Check API key permissions and quotas
# Review AI service logs
```

#### 3. Scraper Service Issues
```bash
# Install Python dependencies
npm run scraper:install

# Check Python version (3.8+ required)
python --version

# Verify environment variables
cd scraper && python start.py
```

#### 4. Authentication Problems
- Check JWT secrets in .env
- Verify Firebase configuration
- Clear browser cache and cookies

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm run dev:all

# Check server logs
cd server && DEBUG=* npm start
```

### Health Checks
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001/health
- **Scraper**: http://localhost:8000/health

## 📚 Documentation

- [AI Setup Guide](AI_SETUP.md) - AI service configuration
- [Authentication Guide](AUTHENTICATION_TROUBLESHOOTING.md) - Auth setup and issues
- [Token Refresh Guide](TOKEN_REFRESH_GUIDE.md) - JWT token management
- [API Documentation](server/openapi.json) - Backend API specs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Follow conventional commits

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

**Unauthorized copying, use, or distribution of this code is not permitted except under the terms of the AGPL-3.0 license.**

For more details, see the [LICENSE](LICENSE) file.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/avyls-ai-website/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/avyls-ai-website/discussions)
- **Documentation**: Check the docs folder and markdown files

## 🎯 Roadmap

- [ ] E2E testing with Playwright
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced AI model selection
- [ ] Real-time collaboration
- [ ] Advanced deployment options
- [ ] Mobile app (React Native)

---

**Made with ❤️ by the Avyls AI Team**
