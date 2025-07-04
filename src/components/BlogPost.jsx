import React from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/blog.css';

function BlogPost() {
  const { slug } = useParams();

  // Blog data mapping with complete content
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
        {
          type: 'section',
          title: "2. Hyper-Personalized Content Generation",
          text: "AI tools now generate personalized content for different customer segments. A clothing store can automatically create different ad copy for college students vs. working professionals, all from the same product catalog."
        },
        {
          type: 'section',
          title: "3. Smart Budget Optimization",
          text: "AI continuously monitors campaign performance and automatically reallocates budget to the best-performing ads and time slots. This means your marketing budget works harder without constant manual intervention."
        },
        {
          type: 'section',
          title: "4. Predictive Customer Behavior",
          text: "AI analyzes customer data to predict when someone is most likely to make a purchase. This allows businesses to send targeted offers at the perfect moment, significantly increasing conversion rates."
        },
        {
          type: 'section',
          title: "5. Automated A/B Testing",
          text: "AI runs thousands of A/B tests simultaneously, optimizing everything from ad copy to landing page design. What used to take months now happens in real-time."
        },
        {
          type: 'section',
          title: "6. Voice Search Optimization",
          text: "With voice search growing rapidly, AI helps optimize content for natural language queries. This is especially important for local businesses targeting \"near me\" searches."
        },
        {
          type: 'section',
          title: "7. Social Media Automation",
          text: "AI tools can schedule posts, respond to comments, and even create content variations for different platforms—all while maintaining your brand voice."
        },
        {
          type: 'section',
          title: "8. Real-Time Analytics & Insights",
          text: "AI provides actionable insights in real-time, helping businesses understand what's working and what needs adjustment immediately, not days later."
        }
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
        {
          type: 'section',
          title: "The Power of Pin-Code Precision",
          text: "Traditional WhatsApp marketing often feels like shouting in a crowded room. AI changes this by enabling pin-code level targeting, ensuring your messages reach only the customers who can actually visit your store."
        },
        {
          type: 'section',
          title: "Smart Segmentation Strategies",
          text: "AI analyzes customer behavior patterns to create micro-segments. A restaurant can now send different messages to lunch crowds vs. dinner crowds, or target office workers vs. families."
        },
        {
          type: 'section',
          title: "Dynamic Content Personalization",
          text: "AI automatically personalizes message content based on customer preferences, purchase history, and location. A clothing store can send monsoon-specific offers to customers in rainy areas."
        },
        {
          type: 'section',
          title: "Automated Response Systems",
          text: "AI-powered chatbots handle common queries instantly, while routing complex questions to human staff. This ensures 24/7 customer service without overwhelming your team."
        },
        {
          type: 'section',
          title: "Conversion Tracking & Optimization",
          text: "AI tracks which messages lead to actual sales, automatically optimizing future campaigns for better results. This creates a continuous improvement loop."
        },
        {
          type: 'section',
          title: "Integration with Business Systems",
          text: "AI seamlessly integrates WhatsApp campaigns with your existing CRM, inventory, and POS systems, creating a unified customer experience across all touchpoints."
        }
      ]
    }
  };

  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="blog-container">
        <div className="blog-post">
          <h1>Blog Post Not Found</h1>
          <p>The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="back-to-blog">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <div className="reading-progress-bar" />
      
      <div className="blog-title-nav-wrapper">
        <Link to="/blog" className="back-to-blog">
          ← Back to Blog
        </Link>
        <h1 className="blog-post-main-title">{post.title}</h1>
      </div>
      
      <article className="blog-post">
        <div className="blog-content">
          {/* Show intro text prominently */}
          {post.content
            .filter(section => section.type === 'intro')
            .map((section, index) => (
              <div key={index} className="blog-intro-section">
                <p className="blog-intro-text">{section.text}</p>
              </div>
            ))}
          
          {/* Show main content sections */}
          {post.content
            .filter(section => section.type !== 'intro')
            .map((section, index) => (
              <div key={index} className={'blog-section'}>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
              </div>
            ))}
        </div>
        
        <div className="blog-footer">
          <div className="share-section">
            <h3>Share this article</h3>
            <div className="share-buttons">
              <button className="share-btn linkedin" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')}>
                LinkedIn
              </button>
              <button className="share-btn twitter" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(post.title)}`, '_blank')}>
                Twitter
              </button>
              <button className="share-btn whatsapp" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`, '_blank')}>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default BlogPost;