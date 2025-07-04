import React from 'react';
import { motion } from 'framer-motion';
import './features.css';
import { HiGlobe, HiPhotograph, HiFilm, HiCube, HiUpload, HiChartBar, HiShieldCheck } from 'react-icons/hi';

const featureList = [
  { icon: <HiGlobe className="feature-icon-react" />, title: 'Multilingual Content Creation', desc: 'Generate captions, headlines, emails, and SMS in English, Hindi, Bengali, and 19+ other Indian languages using fine-tuned LLMs and Bhashini API.', benefit: 'Reach regional audiences with personalized, vernacular content.' },
  { icon: <HiPhotograph className="feature-icon-react" />, title: 'Visual Generation', desc: 'Create branded posters and images with DALL-E and Canva APIs, tailored to your brand guidelines.', benefit: 'Professional-grade visuals without a designer.' },
  { icon: <HiFilm className="feature-icon-react" />, title: 'Video Content Creation', desc: 'Produce 15-30 second videos with multilingual voiceovers and avatars using Synthesia and Runway APIs.', benefit: 'Boost engagement with dynamic video content.' },
  { icon: <HiCube className="feature-icon-react" />, title: 'Agentic Automation', desc: 'Autonomous AI agents manage strategy, content creation, publishing, and optimization with Kafka/RabbitMQ workflows.', benefit: 'A fully automated marketing department.' },
  { icon: <HiUpload className="feature-icon-react" />, title: 'Auto Publishing', desc: 'Publish campaigns across WhatsApp, Instagram, Facebook, LinkedIn, email, and SMS via Meta, LinkedIn, SendGrid, and Twilio APIs.', benefit: 'Reach audiences on their preferred platforms.' },
  { icon: <HiChartBar className="feature-icon-react" />, title: 'Real-Time Analytics Dashboard', desc: 'Track clicks, conversions, and ROI with Google Analytics, Meta Pixel, and LinkedIn Insight Tag, powered by AWS Redshift and Pinecone.', benefit: 'Optimize campaigns with actionable insights.' },
  { icon: <HiShieldCheck className="feature-icon-react" />, title: 'Scalability & Security', desc: 'Scale with Kubernetes and AWS Lambda, secured with AES-256 encryption and GDPR compliance.', benefit: 'Grow confidently with a secure platform.' },
];

function Features() {
  return (
    <div className="features-page">
      <section className="features" id="features">
        <div className="section-header">
          <h2>Core Features</h2>
          <div className="separator"></div>
        </div>
        <section className="features-grid">
          {featureList.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card glass-effect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <div className="feature-benefit">
                <strong>Key Benefit:</strong> {feature.benefit}
              </div>
            </motion.div>
          ))}
        </section>
      </section>
    </div>
  );
}

export default Features;