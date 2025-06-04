import { useState, useEffect } from 'react';

function Testimonial() {
  const testimonials = [
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
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="testimonials">
      <div className="section-header">
        <h2>Client Testimonials</h2>
        <div className="separator"></div>
      </div>
      <div className="testimonials-slider">
        <div className="testimonial-container">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className={`testimonial ${index === currentSlide ? 'active' : ''}`}
            >
              <p>{t.quote}</p>
              <div className="client">
                <h4>{t.name}</h4>
                <span>{t.title}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="slider-controls">
          {testimonials.map((_, index) => (
            <div
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonial;