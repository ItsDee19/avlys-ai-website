import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './components/BlogPost';
import './styles/style.css';
import UseCases from './pages/UseCases';
import SignIn from './pages/SignIn';

function App() {
  return (
    <Router>
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
        <div className="orb-1"></div>
        <div className="orb-2"></div>
        <div className="orb-3"></div>
        <div className="orb-4"></div>
        <div className="orb-5"></div>
      </div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/use-cases" element={<UseCases />} />
        {/* Redirect routes for not-yet-implemented pages */}
        <Route path="/privacy" element={<Navigate to="/about" />} />
        <Route path="/terms" element={<Navigate to="/about" />} />
        <Route path="/security" element={<Navigate to="/about" />} />
        <Route path="/signin" element={<SignIn />} />
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

