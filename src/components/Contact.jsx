import { useState } from 'react';
import './Contact.css';

const initialForm = { name: '', email: '', phone: '', message: '' };

export default function Contact() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    setErrorMessage('');

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_URL = isLocal
      ? 'http://127.0.0.1:5000'
      : (import.meta.env.VITE_API_URL || '');

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Server responded with ${res.status}`);
      }

      setStatus('success');
      setFormData(initialForm);
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again or email me directly.');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section className="contact section" id="contact">
      <div className="container">
        <div className="section-header">
          <span className="section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Contact
          </span>
          <h2 className="section-title">Let's Work Together</h2>
          <p className="section-subtitle">Have a project in mind or just want to say hello? I'd love to hear from you.</p>
        </div>

        <div className="contact__grid">
          <div className="contact__info animate-in">
            <div className="contact__info-card">
              <div className="contact__info-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <h4 className="contact__info-title">Email</h4>
                <a href="mailto:sohaibfettah01@gmail.com" className="contact__info-value">sohaibfettah01@gmail.com</a>
              </div>
            </div>

            <div className="contact__info-card">
              <div className="contact__info-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <h4 className="contact__info-title">Location</h4>
                <span className="contact__info-value">Casablanca, Morocco</span>
              </div>
            </div>

            <div className="contact__info-card">
              <div className="contact__info-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <h4 className="contact__info-title">Phone</h4>
                <a href="tel:+212657118224" className="contact__info-value">0657 11 82 24</a>
              </div>
            </div>

            <div className="contact__info-card">
              <div className="contact__info-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </div>
              <div>
                <h4 className="contact__info-title">LinkedIn</h4>
                <a href="https://www.linkedin.com/in/sohaib-fettah-4a47432a6" target="_blank" rel="noopener noreferrer" className="contact__info-value contact__info-link">Connect with me</a>
              </div>
            </div>

            <div className="contact__info-card">
              <div className="contact__info-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </div>
              <div>
                <h4 className="contact__info-title">GitHub</h4>
                <a href="https://github.com/Sohaib-Ft" target="_blank" rel="noopener noreferrer" className="contact__info-value contact__info-link">View my repos</a>
              </div>
            </div>
          </div>

          <form className="contact__form animate-in delay-2" onSubmit={handleSubmit} id="contact-form">
            <div className="contact__form-row">
              <div className="contact__form-group">
                <label className="contact__form-label" htmlFor="contact-name">Name</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="contact__form-input"
                />
              </div>
              <div className="contact__form-group">
                <label className="contact__form-label" htmlFor="contact-email">Email</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="contact__form-input"
                />
              </div>
            </div>

            <div className="contact__form-group">
              <label className="contact__form-label" htmlFor="contact-phone">Phone </label>
              <input
                type="tel"
                id="contact-phone"
                name="phone"
                placeholder="+212 6XX XXX XXX"
                value={formData.phone}
                onChange={handleChange}
                className="contact__form-input"
              />
            </div>

            <div className="contact__form-group">
              <label className="contact__form-label" htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Tell me about your project..."
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="contact__form-textarea"
              ></textarea>
            </div>

            <button
              type="submit"
              className={`contact__form-btn ${status === 'error' ? 'contact__form-btn--error' : ''}`}
              id="contact-submit"
              disabled={status === 'sending'}
            >
              {status === 'sending' && (
                <>
                  <svg className="contact__spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Sending...
                </>
              )}
              {status === 'success' && (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Message Sent!
                </>
              )}
              {status === 'error' && (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errorMessage}
                </>
              )}
              {status === 'idle' && (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
