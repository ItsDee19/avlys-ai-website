import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/blog.css';

function Blog() {
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(null);

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

  return (
    <main className="blog-container">
      <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />
      
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
    </main>
  );
}

export default Blog;