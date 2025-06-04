import React from 'react';
import { useParams } from 'react-router-dom';
import '../styles/blog.css';

function BlogPost() {
  const { slug } = useParams();

  // Blog data mapping
  const blogPosts = {
    'ai-supercharges-sme-marketing-2025': {
      category: "AI & Marketing",
      title: "8 Ways AI Supercharges SME Marketing in 2025",
      date: "January 2024",
      readTime: "5 min read",
      audience: "For SMEs & MSMEs",
      content: [
        {
          type: 'intro',
          text: "Indian MSMEs and SMEs no longer need deep pockets—or a team of data scientists—to punch above their weight online. Affordable AI marketing tools now handle the heavy lifting, from local SEO to full-blown brand-awareness campaigns."
        },
        {
          type: 'section',
          title: "1. Pin-Point \"Near Me\" Targeting",
          text: "AI looks at real-time location signals, purchase intent, and even the weather to push ads or offers to customers at the perfect moment. A Patna bakery can auto-promote \"fresh rasmalai, 10 am–1 pm\" to phones within a 2-km radius—no manual geofencing required."
        },
        // ... Add more sections here
      ]
    },
    'whatsapp-ai-personalization': {
      category: "WhatsApp Marketing",
      title: "AI Personalization on WhatsApp: Pin-Code Targeting That Turns Local Chats into Sales",
      date: "January 2024",
      readTime: "6 min read",
      audience: "For Local Businesses",
      content: [
        {
          type: 'intro',
          text: "Indian SMEs and MSMEs already treat WhatsApp like the front desk of their business. Now, affordable AI marketing layers let you move past broadcast blasts and send hyper-relevant offers—only to customers inside the exact pin code you serve."
        },
        // ... Add more sections here
      ]
    }
  };

  const post = blogPosts[slug];

  if (!post) {
    return <div className="blog-container">Blog post not found</div>;
  }

  return (
    <div className="blog-container">
      <div className="reading-progress-bar" />
      <article className="blog-post">
        <header className="blog-header">
          <div className="blog-category">{post.category}</div>
          <h1>{post.title}</h1>
          <div className="blog-meta">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>{post.date}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span>{post.readTime}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">👥</span>
              <span>{post.audience}</span>
            </div>
          </div>
        </header>
        <div className="blog-content">
          {post.content.map((section, index) => (
            <div key={index} className={section.type === 'intro' ? 'blog-intro' : 'blog-section'}>
              {section.type !== 'intro' && <h2>{section.title}</h2>}
              <p>{section.text}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export default BlogPost;