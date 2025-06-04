import { useState } from 'react';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Thank you for subscribing!');
    setEmail('');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <section className="newsletter">
      <div className="newsletter-content">
        <h2>Stay at the Forefront</h2>
        <p>Subscribe to our newsletter for the latest in AI innovation</p>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn primary">Subscribe</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </section>
  );
}

export default Newsletter;