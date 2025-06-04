import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SignIn from './SignIn';

// Animation hook for section animations
function useElementOnScreen(ref, options = {}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return isVisible;
}

function BrainModel() {
  const brainGroup = useRef();

  useEffect(() => {
    const group = brainGroup.current;
    const disposables = [];

    // Core brain structure (sphere)
    const brainGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: true,
      emissive: 0x222222,
      transparent: true,
      opacity: 0.8,
    });
    const brain = new THREE.Mesh(brainGeometry, brainMaterial);
    group.add(brain);
    disposables.push(brainGeometry, brainMaterial);

    // Neural connections (random lines)
    const neuralMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
    });
    for (let i = 0; i < 15; i++) {
      const points = [];
      for (let j = 0; j < 2; j++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = Math.random() * 1.4;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        points.push(new THREE.Vector3(x, y, z));
      }
      const neuralGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(neuralGeometry, neuralMaterial);
      group.add(line);
      disposables.push(neuralGeometry, neuralMaterial);
    }

    // Neural nodes (small spheres)
    const nodeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = Math.random() * 1.4;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(x, y, z);
      group.add(node);
      disposables.push(nodeGeometry, nodeMaterial);
    }

    // Orbiting rings
    const ringGeometry = new THREE.RingGeometry(2, 2.1, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    group.add(ring1);
    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring2.rotation.x = Math.PI / 2;
    group.add(ring2);
    const ring3 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring3.rotation.y = Math.PI / 2;
    group.add(ring3);
    disposables.push(ringGeometry, ringMaterial);

    return () => {
      disposables.forEach((resource) => resource.dispose());
      group.children.forEach((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    };
  }, []);

  useFrame(({ clock }) => {
    if (brainGroup.current) {
      brainGroup.current.rotation.y += 0.005 * clock.getDelta() * 60;
      brainGroup.current.rotation.x += 0.002 * clock.getDelta() * 60;
    }
  });

  return (
    <group ref={brainGroup}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={0.8} />
    </group>
  );
}

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  // Refs for animated sections
  const workflowRef = useRef(null);
  const testimonialsRef = useRef(null);
  const newsletterRef = useRef(null);
  const whyAvlysRef = useRef(null);

  // Memoized observer options
  const options = useMemo(() => ({ threshold: 0.2 }), []);

  // Check if sections are visible
  const isWorkflowVisible = useElementOnScreen(workflowRef, options);
  const isTestimonialsVisible = useElementOnScreen(testimonialsRef, options);
  const isNewsletterVisible = useElementOnScreen(newsletterRef, options);
  const isWhyAvlysVisible = useElementOnScreen(whyAvlysRef, options);

  const testimonials = useMemo(
    () => [
      {
        quote: "AVYLS AI transformed our approach to international markets with unparalleled precision in local content delivery.",
        name: "Sarah Chen",
        title: "Global Marketing Director, TechVision",
      },
      {
        quote: "The autonomous agent deployment feature saved us countless hours of manual setup and optimization.",
        name: "Marcus Reynolds",
        title: "CTO, Elevate Systems",
      },
      {
        quote: "Regional targeting capabilities helped us increase conversion rates by 47% across diverse markets.",
        name: "Elena Vega",
        title: "Head of Growth, NexusRetail",
      },
    ],
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Thank you for subscribing!');
    setEmail('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExploreClick = (e) => {
    e.preventDefault();
    setIsSignInOpen(true);
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text-container">
            <h1>
              <span className="hero-title-main">Hyperlocal Marketing Intelligence</span>
              <br />
              <span className="hero-title-sub">Powered by Agents,</span>
              <span className="hero-title-sub">Catered to INDIAN MSMEs</span>
            </h1>
            <p className="hero-subtitle">
              Agentic AI workflow to Create, Localize & Deploy marketing campaigns across social platforms- under a minute!
            </p>
          </div>
          <div className="hero-buttons">
            <a 
              href="https://studio--avlys-ai.us-central1.hosted.app" 
              className="btn primary hero-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Try Early Model
            </a>
            <button 
              onClick={handleExploreClick} 
              className="btn secondary glow-hover hero-btn"
            >
              Explore Workflow
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <BrainModel />
          </Canvas>
        </div>
      </section>

      <section className={`features section-animate ${isWhyAvlysVisible ? 'visible' : ''}`} ref={whyAvlysRef}>
        <div className="section-header">
          <h2 className="typing-effect">WHY AVLYS FOR YOUR BUSINESS?</h2>
          <div className="separator"></div>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Built for Indian MSMEs</h3>
            <p>Unlike global tools, our agentic AI understands regional nuances, festivals, and cultural contexts specific to different parts of India.</p>
          </div>
          
          <div className="feature-card">
            <h3>True End-to-End Automation</h3>
            <p>We don't just create content—we handle the entire workflow from ideation to publishing with our no-code marketing platform.</p>
          </div>
          
          <div className="feature-card">
            <h3>Hyperlocal + Multilingual</h3>
            <p>We combine location-specific messaging with language optimization to create genuinely relevant content for diverse Indian audiences.</p>
          </div>
          
          <div className="feature-card">
            <h3>Platform-Native Content</h3>
            <p>Our AI generates format-specific content optimized for each platform's algorithm, not generic posts awkwardly repurposed across channels.</p>
          </div>
        </div>
      </section>

      <section className={`workflow section-animate ${isWorkflowVisible ? 'visible' : ''}`} id="workflow" ref={workflowRef}>
        <div className="section-header">
          <h2 className="typing-effect">How It Works</h2>
          <p className="section-subtitle">Experience the power of our autonomous AI agents working in harmony</p>
          <div className="separator"></div>
        </div>
        
        <div className="workflow-container">
          <div className="workflow-steps">
            {[
              { 
                name: "Prompt",
                description: "Your brief instruction",
                icon: "💬",
                highlight: "Natural language input"
              },
              { 
                name: "Research Agent",
                description: "Analyzes trends & audience",
                icon: "🔍",
                highlight: "Real-time market analysis"
              },
              { 
                name: "Content Agent",
                description: "Creates tailored messaging",
                icon: "✍️",
                highlight: "AI-powered creativity"
              },
              { 
                name: "Translation Agent",
                description: "Localizes to dialects",
                icon: "🌏",
                highlight: "Cultural adaptation"
              },
              { 
                name: "Publishing Agent",
                description: "Deploys across platforms",
                icon: "🚀",
                highlight: "Automated deployment"
              },
              { 
                name: "Analytics Agent",
                description: "Tracks & optimizes performance",
                icon: "📊",
                highlight: "Smart optimization"
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className="workflow-step glass-effect"
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="step-number">
                  <span>{index + 1}</span>
                </div>
                <div className="step-icon">
                  <span>{step.icon}</span>
                </div>
                <h3>{step.name}</h3>
                <p>{step.description}</p>
                <div className="step-highlight">
                  <span>{step.highlight}</span>
                </div>
                {index < 5 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>

          <div className="workflow-example glass-effect">
            <h3>Example:</h3>
            <div className="example-prompt">
              <p>"Promote my bakery in Patna for Holi under ₹5,000"</p>
            </div>
            <div className="example-result">
              <div className="result-label">User Prompt</div>
              <div className="result-arrow">→</div>
              <div className="result-output">
                <span>Complete Campaign</span>
                <small>Generated & deployed in 60 seconds</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`faq section-animate ${isTestimonialsVisible ? 'visible' : ''}`} ref={testimonialsRef}>
        <div className="section-header">
          <h2 className="typing-effect">FAQ</h2>
          <div className="separator"></div>
        </div>
        <div className="faq-container">
          <div className="faq-item glass-effect">
            <h3>How quickly can I start seeing results?</h3>
            <p>Most businesses see increased engagement within the first 2 weeks of implementation. Our hyperlocal marketing approach typically delivers 3-5x better engagement than generic content, with measurable results appearing in your analytics dashboard immediately.</p>
          </div>
          
          <div className="faq-item glass-effect">
            <h3>Do I need technical knowledge to use Avlys?</h3>
            <p>Not at all. Our no-code marketing platform is designed with a simple interface that requires no technical background. If you can use social media, you can use Avlys—the agentic AI handles all the complex work behind the scenes.</p>
          </div>
          
          <div className="faq-item glass-effect">
            <h3>Can Avlys integrate with my existing marketing tools?</h3>
            <p>Yes! Avlys connects seamlessly with popular CRM systems, analytics platforms, and content calendars. Our API allows for custom integrations with your existing tech stack for automated content posting across your marketing ecosystem.</p>
          </div>
        </div>
      </section>

      <section className={`newsletter section-animate ${isNewsletterVisible ? 'visible' : ''}`} ref={newsletterRef}>
        <div className="newsletter-content">
          <h2 className="glow-hover">Stay Updated</h2>
          <p>Subscribe to our newsletter for the latest updates on AI advancements and feature releases.</p>
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email" 
              required 
              aria-label="Email address for newsletter subscription"
            />
            <button 
              type="submit" 
              className="btn primary glow-hover"
              aria-label="Subscribe to newsletter"
            >
              Subscribe
            </button>
          </form>
          {message && <p className="success-message reveal-text">{message}</p>}
        </div>
      </section>
      <SignIn 
        isOpen={isSignInOpen} 
        onClose={() => setIsSignInOpen(false)} 
      />
    </main>
  );
}

export default Home;
