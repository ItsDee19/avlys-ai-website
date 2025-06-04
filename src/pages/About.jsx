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
      <div className="about-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Mission Section */}
        <section style={{ margin: '5rem 0', padding: '2rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2>Our Mission</h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: '#fff', margin: '0 auto' }}></div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '3fr 1fr', 
            gap: '2rem', 
            alignItems: 'center',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{ 
              background: 'rgba(20, 20, 40, 0.4)', 
              padding: '2rem', 
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            className="hover-card"
            >
              <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                At AVLYS AI, we're committed to <span style={{ color: 'var(--accent-cyan)' }}>empowering businesses</span> with ultra-precise, locally-aware artificial intelligence.
              </p>
              <p>
                We believe in a future where AI understands and adapts to the unique nuances of every region, culture, and community, delivering unparalleled value and relevance.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                background: 'rgba(0,238,255,0.2)', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              className="hover-icon"
              >
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'rgba(0,0,0,0.3)', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <ExploreIcon style={{ fontSize: 40, color: 'var(--accent-cyan)' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section style={{ margin: '5rem 0', padding: '2rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2>Our Vision</h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: '#fff', margin: '0 auto' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                background: 'rgba(156,91,255,0.2)', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              className="hover-icon"
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <VisibilityIcon style={{ fontSize: 40, color: 'var(--accent-purple)' }} />
                </div>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(20, 20, 40, 0.4)', 
              padding: '2rem', 
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            className="hover-card"
            >
              <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                We envision a world <span style={{ color: 'var(--accent-purple)' }}>seamlessly integrated</span> with intelligent systems that operate with a deep understanding of local contexts.
              </p>
              <p>
                AVLYS AI strives to be the leading force in creating AI that is not just smart, but also wise to the diverse tapestry of global communities.
              </p>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section style={{ margin: '5rem 0', padding: '2rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2>The Founders of AVLYS</h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: '#fff', margin: '0 auto' }}></div>
          </div>
          <Founders />
        </section>

        {/* Join Our Journey */}
        <section style={{ margin: '5rem 0', padding: '2rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2>Join Our Journey</h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: '#fff', margin: '0 auto' }}></div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(20, 20, 40, 0.4)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '2rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          className="hover-card"
          >
            <h3 style={{ marginBottom: '1rem' }}>Be part of the hyperlocal intelligence revolution</h3>
            <p style={{ marginBottom: '2rem' }}>
              Whether you're a potential client, partner, or team member, we'd love to connect with you and explore how AVLYS AI can transform your approach to local markets.
            </p>
            <a 
              href="/contact"
              className="btn primary hover-button"
              style={{
                display: 'inline-block',
                padding: '0.8rem 2rem',
                background: 'var(--secondary-color)',
                color: 'var(--primary-color)',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              Get In Touch
            </a>
          </div>
        </section>
      </div>
      
      <style jsx="true">{`
        .hover-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 30px rgba(56, 255, 221, 0.2);
          border-color: rgba(56, 255, 221, 0.3);
        }
        
        .hover-icon:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 20px rgba(56, 255, 221, 0.5);
        }
        
        .hover-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 238, 255, 0.3);
          background-color: white;
        }
      `}</style>
    </div>
  );
}

export default About;