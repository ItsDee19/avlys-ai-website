import React from 'react';
import { motion } from 'framer-motion';
import './UseCases.css'

const UseCases = () => {
  const useCases = [
    {
      category: "fashion",
      title: "Fashion & Apparel",
      description: "AI-driven trend prediction and personalized styling recommendations adapted to regional preferences and cultural nuances.",
      stats: {
        accuracy: "95%",
        engagement: "3.5x"
      },
      features: [
        "Trend forecasting",
        "Virtual styling",
        "Inventory optimization",
        "Customer behavior analysis"
      ]
    },
    {
      category: "real-estate",
      title: "Real Estate",
      description: "Intelligent property valuation and market analysis with hyperlocal insights for better decision-making.",
      stats: {
        accuracy: "93%",
        roi: "2.8x"
      },
      features: [
        "Market prediction",
        "Location analytics",
        "Investment scoring",
        "Demographic analysis"
      ]
    },
    {
      category: "retail",
      title: "Retail & E-commerce",
      description: "Smart inventory management and personalized shopping experiences based on local market dynamics.",
      stats: {
        sales: "+45%",
        retention: "87%"
      },
      features: [
        "Demand forecasting",
        "Price optimization",
        "Customer segmentation",
        "Supply chain optimization"
      ]
    },
    {
      category: "wellness",
      title: "Health & Wellness",
      description: "Personalized health recommendations and wellness programs adapted to regional health trends and practices.",
      stats: {
        satisfaction: "96%",
        adherence: "78%"
      },
      features: [
        "Health tracking",
        "Wellness planning",
        "Dietary recommendations",
        "Activity monitoring"
      ]
    },
    {
      category: "education",
      title: "Education",
      description: "Adaptive learning systems that cater to regional educational standards and cultural learning styles.",
      stats: {
        improvement: "40%",
        engagement: "2.5x"
      },
      features: [
        "Personalized learning",
        "Progress tracking",
        "Content adaptation",
        "Performance analytics"
      ]
    },
    {
      category: "finance",
      title: "Financial Services",
      description: "Intelligent financial analysis and recommendations based on regional economic patterns and regulations.",
      stats: {
        accuracy: "97%",
        efficiency: "3.2x"
      },
      features: [
        "Risk assessment",
        "Market analysis",
        "Fraud detection",
        "Portfolio optimization"
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="use-cases-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="use-cases-header"
      >
        <h1>Industry Applications</h1>
        <p>Discover how AVYLS AI transforms various industries with hyperlocal intelligence</p>
      </motion.div>

      <motion.div 
        className="use-cases-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {useCases.map((useCase, index) => (
          <motion.div
            key={useCase.category}
            variants={cardVariants}
            className={`use-case-card`}
            data-category={useCase.category}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          >
            <div className="use-case-content">
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
              <div className="use-case-stats">
                {Object.entries(useCase.stats).map(([key, value]) => (
                  <div key={key} className="stat">
                    <span className="stat-value">{value}</span>
                    <span className="stat-label">{key}</span>
                  </div>
                ))}
              </div>
              <ul className="use-case-features">
                {useCase.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UseCases;