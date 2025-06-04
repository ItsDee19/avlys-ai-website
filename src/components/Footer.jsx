import { Link } from 'react-router-dom';

function Footer() {
    return (
      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <h3>AVLYS AI</h3>
            <p>Hyperlocal Intelligence, Powered by Agents</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/about#team">Team</Link></li>
                <li><Link to="/about#careers">Careers</Link></li>
                <li><Link to="/blog">Blog</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li><Link to="/features#documentation">Documentation</Link></li>
                <li><Link to="/features#api">API</Link></li>
                <li><Link to="/contact">Support</Link></li>
                <li><a href="https://github.com/avyls-ai" target="_blank" rel="noopener noreferrer">Community</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><Link to="/privacy">Privacy</Link></li>
                <li><Link to="/terms">Terms</Link></li>
                <li><Link to="/security">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="social-icons">
            <a href="https://www.instagram.com/avlysai?igsh=b2pvNWFpYzd2N2Zh" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="social-icon"
               aria-label="Follow us on Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/avlys-ai/" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="social-icon"
               aria-label="Connect with us on LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>
        <div className="copyright">
          © 2025 AVLYS AI. All rights reserved.
        </div>
      </footer>
    );
}

export default Footer;