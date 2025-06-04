/**
 * Animation utilities for AVYLS AI website
 */

// Initialize animation observers when the page loads
export const initAnimations = () => {
  // Add observer for section animations
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          // Optional: remove class when section is no longer visible
          // Uncomment the next line if you want elements to animate again when they re-enter the viewport
          // entry.target.classList.remove('visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  // Apply to all section-animate elements
  document.querySelectorAll('.section-animate').forEach((section) => {
    sectionObserver.observe(section);
  });

  // Apply staggered animations to elements
  const staggerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          let delay = 0;
          Array.from(entry.target.children).forEach((child, index) => {
            child.style.animationDelay = `${0.1 + index * 0.1}s`;
            child.style.opacity = '0';
            child.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
              child.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            }, delay);
            
            delay += 100;
          });
        }
      });
    },
    { threshold: 0.1 }
  );

  // Apply to all stagger-children containers
  document.querySelectorAll('.stagger-children').forEach((container) => {
    staggerObserver.observe(container);
  });
};

// Add parallax effect to background elements
export const initParallaxEffect = () => {
  window.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

    const orbs = document.querySelectorAll('.orb-1, .orb-2, .orb-3, .orb-4, .orb-5');
    orbs.forEach((orb) => {
      // Apply subtle movement based on mouse position
      orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    
    // Add subtle rotation to stars with mouse movement
    const stars = document.querySelector('.stars');
    if (stars) {
      stars.style.transform = `rotate(${moveX * 0.5}deg) scale(1.1)`;
    }
    
    // Enhanced hero section parallax
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
      heroVisual.style.transform = `translate(${moveX * 2}px, ${moveY * 2}px)`;
    }
    
    // Subtle text movement for hero titles
    const heroTitleMain = document.querySelector('.hero-title-main');
    const heroTitleSub = document.querySelector('.hero-title-sub');
    
    if (heroTitleMain && heroTitleSub) {
      heroTitleMain.style.transform = `translate(${moveX * -1}px, ${moveY * -0.5}px)`;
      heroTitleSub.style.transform = `translate(${moveX * -0.8}px, ${moveY * -0.3}px)`;
    }
  });
};

// Add scroll-triggered reveal animations
export const initScrollReveal = () => {
  const revealElements = document.querySelectorAll('.reveal-text');
  
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '0';
          entry.target.classList.add('animate');
          
          setTimeout(() => {
            entry.target.style.opacity = '1';
          }, 300);
        }
      });
    },
    { threshold: 0.1 }
  );
  
  revealElements.forEach((el) => {
    revealObserver.observe(el);
  });
};

// Add special effects for the hero section
export const initHeroEffects = () => {
  // Add a glowing cursor effect that follows mouse in hero section
  const hero = document.querySelector('.hero');
  
  if (hero) {
    // Create glow element
    const glow = document.createElement('div');
    glow.className = 'hero-cursor-glow';
    glow.style.position = 'absolute';
    glow.style.width = '150px';
    glow.style.height = '150px';
    glow.style.borderRadius = '50%';
    glow.style.background = 'radial-gradient(circle, rgba(56, 255, 221, 0.15) 0%, transparent 70%)';
    glow.style.pointerEvents = 'none';
    glow.style.zIndex = '1';
    glow.style.transform = 'translate(-50%, -50%)';
    glow.style.opacity = '0.6';
    glow.style.filter = 'blur(10px)';
    hero.appendChild(glow);
    
    // Add mouse move event
    hero.addEventListener('mousemove', (e) => {
      // Get cursor position relative to hero
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Move glow to cursor position with slight lag
      glow.style.transition = 'transform 0.2s ease-out';
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    });
    
    // Hide glow when mouse leaves hero section
    hero.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });
    
    // Show glow when mouse enters hero section
    hero.addEventListener('mouseenter', () => {
      glow.style.opacity = '0.6';
    });
  }
}; 