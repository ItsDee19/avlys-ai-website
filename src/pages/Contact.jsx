import { useState } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('Thank you for your message! We will get back to you shortly.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  return (
    <div className="contact-page">
      <section className="hero contact-hero">
        <div className="hero-content">
          <h1 className="reveal-text">Get in Touch with Avlys AI</h1>
          <p className="subtitle">
            Have questions about AI-powered marketing automation? Want to explore how our agentic AI platform can help your SME or MSME grow with hyperlocal, multilingual campaigns? We'd love to hear from you.
          </p>
          <p className="subtitle">
            Whether you're curious about our workflow, pricing, integrations, or partnership opportunities—our team is here to help you automate your marketing and scale without a team.
          </p>
        </div>
        <div className="hero-overlay"></div>
      </section>

      <div className="contact-container">
        <div className="contact-grid">
          {/* Contact Form Section */}
          <section className="contact-form-section">
            <div className="section-header">
              <h2>Send Us a Message</h2>
              <div className="separator"></div>
            </div>
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  onFocus={() => handleFocus('name')}
                  onBlur={handleBlur}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  onFocus={() => handleFocus('subject')}
                  onBlur={handleBlur}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  onFocus={() => handleFocus('message')}
                  onBlur={handleBlur}
                  className="form-textarea"
                ></textarea>
              </div>
              
              <button type="submit" className="submit-button">
                <SendIcon />
                Send Message
              </button>
              
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
            </form>
          </section>
          
          {/* Contact Info Section */}
          <section className="contact-info-section">
            <div className="section-header">
              <h2>Contact Information</h2>
              <div className="separator"></div>
            </div>
            
            <div className="contact-cards">
              <div className="contact-card">
                <div className="icon-circle purple">
                  <LocationOnIcon />
                </div>
                <div className="card-content">
                  <h3>Our Office</h3>
                  <p>Regus Grandeur Offices Private Limited,08th Floor, SLN Terminus, Survey No.133, Beside Botanical Gardens, Gachibowli, Hyderabad, Telangana - 500032, India</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="icon-circle cyan">
                  <EmailIcon />
                </div>
                <div className="card-content">
                  <h3>Email Us</h3>
                  <p>official@avlysai.com</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="icon-circle blue">
                  <PhoneIcon />
                </div>
                <div className="card-content">
                  <h3>Call Us</h3>
                  <p>+91 9937730039</p>
                </div>
              </div>
            </div>
            
            <div className="map-section">
              <h4>Find Us</h4>
              <a 
                href="https://maps.app.goo.gl/vH3jTZKie5yGxmr57?g_st=com.google.maps.preview.copy"
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                <div className="map-content">
                  <LocationOnIcon />
                  <p>AVLYS AI Headquarters</p>
                  <p className="map-subtitle">Click to view on Google Maps</p>
                </div>
              </a>
            </div>
          </section>
        </div>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <div className="separator"></div>
          </div>
          
          <div className="faq-grid">
            <div className="faq-card">
              <h3>What makes AVLYS AI different?</h3>
              <p>Our hyperlocal intelligence approach gives businesses unprecedented insights into regional markets, consumer behavior, and cultural contexts, enabling more targeted and effective strategies.</p>
            </div>
            
            <div className="faq-card">
              <h3>How can I integrate AVLYS AI?</h3>
              <p>Our platform offers seamless API integration with most major business systems. Our team will work with you to ensure a smooth implementation tailored to your specific requirements.</p>
            </div>
          </div>
        </section>
      </div>
      
      <style jsx="true">{`
        .hero.contact-hero {
          height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          position: relative;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          z-index: 1;
        }

        .reveal-text {
          font-size: clamp(2rem, 5vw, 3.5rem);
          margin-bottom: 1rem;
        }

        .subtitle {
          font-size: clamp(1rem, 3vw, 1.2rem);
          line-height: 1.8;
          margin: 1rem auto;
        }

        .contact-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin: 4rem 0;
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-header h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .separator {
          width: 60px;
          height: 4px;
          background: #fff;
          margin-left: 0;
        }

        .contact-form-section,
        .contact-info-section {
          background: rgba(20, 20, 40, 0.4);
          padding: 2.5rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 1rem 1.2rem;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-textarea {
          height: 150px;
          resize: vertical;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--accent-cyan);
          box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
        }

        .submit-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: var(--accent-cyan);
          color: #000;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 238, 255, 0.3);
        }

        .success-message {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(0, 238, 255, 0.1);
          border-radius: 8px;
          text-align: center;
        }

        .contact-cards {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-card {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          background: rgba(20, 20, 40, 0.4);
          padding: 1.8rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .contact-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-circle svg {
          font-size: 30px;
          color: #000;
        }

        .purple { background: var(--accent-purple); }
        .cyan { background: var(--accent-cyan); }
        .blue { background: var(--accent-blue); }

        .card-content h3 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
        }

        .card-content p {
          opacity: 0.8;
        }

        .map-section {
          margin-top: 3rem;
        }

        .map-section h4 {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
        }

        .map-link {
          display: block;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          height: 250px;
        }

        .map-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .map-content svg {
          font-size: 40px;
          color: var(--accent-cyan);
          margin-bottom: 1rem;
        }

        .map-subtitle {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }

        .faq-section {
          margin-bottom: 6rem;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 3rem;
        }

        .faq-card {
          background: rgba(20, 20, 40, 0.4);
          padding: 2rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .faq-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }

        .faq-card h3 {
          color: var(--accent-cyan);
          margin-bottom: 1rem;
        }

        @media (max-width: 992px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            margin: 2rem 0;
          }

          .faq-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .section-header h2 {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 768px) {
          .hero.contact-hero {
            height: auto;
            min-height: 40vh;
            padding: 4rem 1rem;
          }

          .contact-container {
            padding: 0 1rem;
          }

          .contact-form-section,
          .contact-info-section {
            padding: 1.5rem;
          }

          .form-input,
          .form-textarea {
            padding: 0.875rem 1rem;
            font-size: 0.95rem;
          }

          .contact-card {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
            gap: 1rem;
          }

          .icon-circle {
            margin: 0 auto;
          }

          .card-content h3 {
            font-size: 1.1rem;
          }

          .map-link {
            height: 200px;
          }

          .submit-button {
            width: 100%;
            justify-content: center;
          }

          .faq-section {
            margin-bottom: 4rem;
          }

          .faq-card {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .reveal-text {
            font-size: 1.75rem;
          }

          .subtitle {
            font-size: 0.95rem;
          }

          .contact-container {
            padding: 0 0.75rem;
          }

          .section-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Contact;