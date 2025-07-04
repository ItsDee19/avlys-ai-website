import React, { useState } from 'react';
import CodeIcon from '@mui/icons-material/Code';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CampaignIcon from '@mui/icons-material/Campaign';
import BrushIcon from '@mui/icons-material/Brush';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { motion } from 'framer-motion';

const Founders = () => {
  const founders = [
    {
      name: "Deepak Sahu",
      role: "Chief Technology Officer",
      linkedin: "https://www.linkedin.com/in/deepak-sahu-9ab150214/",
      image: "/team/deepak.jpg"
    },
    {
      name: "Gaurav Purohit",
      role: "Chief Executive Officer",
      linkedin: "https://www.linkedin.com/in/gaurav-purohit-230463285?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app ",
      image: "/team/gaurav.jpg"
    },
    {
      name: "Aadil Ahmed Khan",
      role: "Head of Design",
      linkedin: "http://www.linkedin.com/in/aadil-ahmad-khan-681272254",
      image: "/team/aadil.jpg"
    },
    {
      name: "Rohan Purohit",
      role: "Chief Marketing Officer",
      linkedin: "https://www.linkedin.com/in/rohan-purohit-04860517b/",
      image: "/team/rohan.jpg"
    },
    {
      name: "Roshan Dharua",
      role: "Head of Creativity",
      linkedin: "https://www.linkedin.com/in/roshan-dharua-27b540234?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      image: "/team/roshan.jpg"
    }
  ];

  const icons = [
    <CodeIcon key="code" sx={{ fontSize: 40, color: 'white' }} />,
    <BusinessIcon key="business" sx={{ fontSize: 40, color: 'white' }} />,
    <AccountBalanceIcon key="finance" sx={{ fontSize: 40, color: 'white' }} />,
    <CampaignIcon key="marketing" sx={{ fontSize: 40, color: 'white' }} />,
    <BrushIcon key="creativity" sx={{ fontSize: 40, color: 'white' }} />
  ];

  const getGradientByIndex = (index) => {
    const gradients = [
      "linear-gradient(135deg, #4a9fff, #00eeff)",
      "linear-gradient(135deg, #9c5bff, #4a9fff)",
      "linear-gradient(135deg, #00eeff, #9c5bff)",
      "linear-gradient(135deg, #9c5bff, #00eeff)",
      "linear-gradient(135deg, #4a9fff, #9c5bff)"
    ];
    
    return gradients[index % gradients.length];
  };

  // Track hovered state for each card
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div style={{ width: "100%" }}>
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "2rem",
          width: "100%"
        }}
      >
        {founders.map((founder, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
              background: "rgba(20, 20, 40, 0.7)",
              borderRadius: "12px",
              padding: "2rem",
              border: hoveredIndex === index ? "1px solid rgba(56, 255, 221, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: hoveredIndex === index 
                ? "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(56, 255, 221, 0.2)" 
                : "0 10px 30px rgba(0, 0, 0, 0.3)",
              minHeight: "300px",
              transform: hoveredIndex === index ? "translateY(-15px)" : "translateY(0)",
              transition: "all 0.3s ease",
              cursor: "default",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                overflow: "hidden",
                marginBottom: "1.5rem",
                position: "relative"
              }}
            >
              <img 
                src={founder.image}
                alt={founder.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "3px solid",
                  borderColor: hoveredIndex === index ? "var(--accent-cyan)" : "transparent",
                  transition: "all 0.3s ease"
                }}
              />
              <div 
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: getGradientByIndex(index),
                  opacity: 0.2,
                  borderRadius: "50%"
                }}
              />
            </motion.div>
            
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column"
            }}>
              <h3 style={{
                fontFamily: "var(--font-primary)",
                fontSize: "1.3rem",
                marginBottom: "0.5rem",
                color: hoveredIndex === index ? "var(--accent-cyan)" : "var(--secondary-color)",
                transition: "color 0.3s ease"
              }}>
                {founder.name}
              </h3>
              
              <h4 style={{
                fontSize: "1rem",
                color: "var(--accent-cyan)",
                fontWeight: 500,
                marginBottom: "0.8rem",
                fontFamily: "var(--font-primary)"
              }}>
                {founder.role}
              </h4>
              
              <div style={{
                height: "2px",
                background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))",
                margin: "0.8rem 0 1.2rem",
                borderRadius: "2px",
                width: hoveredIndex === index ? "100%" : "80%",
                transition: "width 0.3s ease"
              }}></div>

              <a 
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: hoveredIndex === index ? "var(--accent-cyan)" : "var(--secondary-color)",
                  textDecoration: "none",
                  marginTop: "1rem",
                  transition: "all 0.3s ease"
                }}
              >
                <LinkedInIcon style={{ marginRight: "0.5rem" }} />
                Connect on LinkedIn
              </a>

              {hoveredIndex === index && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "radial-gradient(circle at top right, rgba(0, 238, 255, 0.1) 0%, transparent 70%)",
                  zIndex: -1,
                  borderRadius: "12px",
                  opacity: 0.6
                }} />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Founders;