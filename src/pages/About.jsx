import React from 'react';
import { motion } from 'framer-motion';
import ExploreIcon from '@mui/icons-material/Explore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LanguageIcon from '@mui/icons-material/Language';
import BarChartIcon from '@mui/icons-material/BarChart';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimelineIcon from '@mui/icons-material/Timeline';
import Founders from '../components/Founders';

function About() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero about-hero">
        <div className="hero-content">
          <div className="hero-text-container">
            <h1>
              <span className="hero-title-main">
                About AVLYS AI
              </span>
            </h1>
            <p className="hero-subtitle">
              Pioneering the future of hyperlocal intelligence through innovative agent-based solutions.
            </p>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </section>
      
      {/* Main Content Container */}
      <div className="about-container">
        {/* Mission Section */}
        <section className="about-section">
          <div className="section-header">
            <h2>Our Mission</h2>
            <div className="separator"></div>
          </div>
          
          <div className="about-split">
            <div className="about-text">
              <p className="emphasized-text">
                At AVLYS AI, we're committed to <span className="highlight-text">empowering businesses</span> with ultra-precise, locally-aware artificial intelligence.
              </p>
              <p>
                We believe in a future where AI understands and adapts to the unique nuances of every region, culture, and community, delivering unparalleled value and relevance.
              </p>
            </div>
            <div className="about-visual">
              <div className="about-icon-container">
                <div className="pulsing-icon">
                  <ExploreIcon className="material-icons" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="about-section">
          <div className="section-header">
            <h2>Our Vision</h2>
            <div className="separator"></div>
          </div>
          
          <div className="about-split reverse">
            <div className="about-visual">
              <div className="about-icon-container">
                <div className="pulsing-icon">
                  <VisibilityIcon className="material-icons" />
                </div>
              </div>
            </div>
            <div className="about-text">
              <p className="emphasized-text">
                We envision a world <span className="highlight-text">seamlessly integrated</span> with intelligent systems that operate with a deep understanding of local contexts.
              </p>
              <p>
                AVLYS AI strives to be the leading force in creating AI that is not just smart, but also wise to the diverse tapestry of global communities.
              </p>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="about-section">
          <div className="section-header">
            <h2>The Founders of AVLYS</h2>
            <div className="separator"></div>
          </div>
          <Founders />
        </section>

        {/* Join Our Journey */}
        <section className="about-section">
          <div className="section-header">
            <h2>Join Our Journey</h2>
            <div className="separator"></div>
          </div>
          
          <div className="cta-container">
            <h3>Be part of the hyperlocal intelligence revolution</h3>
            <p>
              Whether you're a potential client, partner, or team member, we'd love to connect with you and explore how AVLYS AI can transform your approach to local markets.
            </p>
            <a 
              href="/contact"
              className="btn primary"
            >
              Get In Touch
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;