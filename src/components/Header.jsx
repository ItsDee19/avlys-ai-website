import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  // Function to handle scrolling to section when Use Cases is clicked
  const scrollToUseCases = (e) => {
    e.preventDefault();
    setMobileNavOpen(false);
    const useCasesSection = document.getElementById('use-cases');
    if (useCasesSection) {
      useCasesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on home page, navigate to home then scroll
      window.location.href = '/#use-cases';
    }
  };

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <nav className="navbar">
        <div className="logo">
          <Link to="/">AVLYS AI</Link>
        </div>
        <button
          className={`mobile-toggle ${mobileNavOpen ? 'active' : ''}`}
          onClick={toggleMobileNav}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={`nav-links ${mobileNavOpen ? 'active' : ''}`}>
          <li><Link to="/about" onClick={() => setMobileNavOpen(false)}>About</Link></li>
          <li><Link to="/features" onClick={() => setMobileNavOpen(false)}>Features</Link></li>
          <li><a href="#use-cases" onClick={scrollToUseCases}>Use Cases</a></li>
          <li><Link to="/blog" onClick={() => setMobileNavOpen(false)}>Blog</Link></li>
          <li><Link to="/contact" onClick={() => setMobileNavOpen(false)}>Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;