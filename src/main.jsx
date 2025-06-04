import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnimations, initParallaxEffect, initScrollReveal, initHeroEffects } from './utils/animationUtils.js'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>
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
