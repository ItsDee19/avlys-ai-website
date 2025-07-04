import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/blog.css';
import { addNewsletterEmail } from '../utils/firestoreUtils';

function Blog() {
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // idle | loading | success | error
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const blogs = [
    {
      id: 1,
      category: "AI & Marketing",
      title: "8 Ways AI Supercharges SME Marketing in 2025",
      date: "January 2024",
      readTime: "5 min read",
      audience: "For SMEs & MSMEs",
      intro: "Indian MSMEs and SMEs no longer need deep pockets—or a team of data scientists—to punch above their weight online. Affordable AI marketing tools now handle the heavy lifting, from local SEO to full-blown brand-awareness campaigns.",
      slug: "ai-supercharges-sme-marketing-2025"
    },
    {
      id: 2,
      category: "WhatsApp Marketing",
      title: "AI Personalization on WhatsApp: Pin-Code Targeting That Turns Local Chats into Sales",
      date: "January 2024",
      readTime: "6 min read",
      audience: "For Local Businesses",
      intro: "Indian SMEs and MSMEs already treat WhatsApp like the front desk of their business. Now, affordable AI marketing layers let you move past broadcast blasts and send hyper-relevant offers—only to customers inside the exact pin code you serve.",
      slug: "whatsapp-ai-personalization"
    }
  ];

  useEffect(() => {
    const updateReadingProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus('error');
      setNewsletterMsg('Please enter a valid email address.');
      return;
    }
    setNewsletterStatus('loading');
    setNewsletterMsg('');
    try {
      await addNewsletterEmail(newsletterEmail);
      setNewsletterStatus('success');
      setNewsletterMsg('Thank you for subscribing!');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterMsg('There was an error. Please try again later.');
    }
  };

  return (
    <main className="blog-container">
      <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />
      
      {/* Blog Header */}
      <div className="blog-header-section">
        <h1>AI Marketing Insights</h1>
        <p>Discover how artificial intelligence is revolutionizing marketing for Indian SMEs and MSMEs. Get practical insights, strategies, and tips to supercharge your business growth.</p>
        <div className="blog-stats">
          <div className="stat">
            <span className="stat-number">{blogs.length}</span>
            <span className="stat-label">Articles</span>
          </div>
          <div className="stat">
            <span className="stat-number">5+</span>
            <span className="stat-label">Min Read</span>
          </div>
          <div className="stat">
            <span className="stat-number">2025</span>
            <span className="stat-label">Focus</span>
          </div>
        </div>
      </div>
      
      <section className="blog-grid">
        {blogs.map(blog => (
          <article key={blog.id} className="blog-card glass-effect">
            <div className="blog-card-content">
              <div className="blog-category">{blog.category}</div>
              <h2>{blog.title}</h2>
              <div className="blog-meta">
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span>{blog.date}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  <span>{blog.readTime}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">👥</span>
                  <span>{blog.audience}</span>
                </div>
              </div>
              <p className="blog-intro">{blog.intro}</p>
              <Link to={`/blog/${blog.slug}`} className="read-more-btn">
                Read More →
              </Link>
            </div>
          </article>
        ))}
      </section>
      
      {/* Newsletter Signup */}
      <div className="newsletter-section">
        <div className="newsletter-content">
          <h3>
            <span className="newsletter-icon">
              <img src="/assets/newsletter/mail-ai.png" alt="Newsletter" style={{width: 24, height: 24}} />
            </span>
            Stay Updated with AI Marketing Trends
          </h3>
          <p>Get the latest insights on AI-powered marketing strategies delivered to your inbox. No spam, just actionable ideas for Indian SMEs & MSMEs.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              disabled={newsletterStatus === 'loading'}
            />
            <button type="submit" disabled={newsletterStatus === 'loading'}>
              {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {newsletterStatus === 'success' && (
            <div style={{ color: '#10b981', marginTop: 10, fontWeight: 500 }}>{newsletterMsg}</div>
          )}
          {newsletterStatus === 'error' && (
            <div style={{ color: '#ef4444', marginTop: 10, fontWeight: 500 }}>{newsletterMsg}</div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Blog;