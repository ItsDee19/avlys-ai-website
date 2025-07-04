import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import { initAnimations, initParallaxEffect, initScrollReveal, initHeroEffects } from './utils/animationUtils.js'
import './pages/CampaignDashboard.css'
// Sentry configuration commented out - replace with valid DSN when ready
// import * as Sentry from "@sentry/react"
// 
// Sentry.init({
//   dsn: "YOUR_SENTRY_DSN_HERE", // Replace with your Sentry DSN
//   integrations: [
//     Sentry.browserTracingIntegration(),
//     Sentry.replayIntegration({
//       maskAllText: false,
//       blockAllMedia: false,
//     }),
//   ],
//   // Performance Monitoring
//   tracesSampleRate: 1.0, 
//   // Session Replay
//   replaysSessionSampleRate: 0.1, 
//   replaysOnErrorSampleRate: 1.0, 
// })

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)

// Initialize animations after the app is rendered
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initAnimations()
    initParallaxEffect()
    initScrollReveal()
    initHeroEffects()
  }, 100)
})