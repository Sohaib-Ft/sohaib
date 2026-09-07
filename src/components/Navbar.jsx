import { useState, useEffect } from 'react';
import './Navbar.css';

const navLinks = [
  { 
    label: 'Home', 
    href: '#hero',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
  { 
    label: 'About', 
    href: '#about',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  },
  { 
    label: 'Tech Stack', 
    href: '#techstack',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  },
  { 
    label: 'Projects', 
    href: '#projects',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  },
  { 
    label: 'Contact', 
    href: '#contact',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  },
];

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = navLinks.map(l => l.href.replace('#', ''));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Navbar — always visible, just logo */}
      <nav className={`top-navbar ${scrolled ? 'top-navbar--scrolled' : ''}`} id="navbar">
        <div className="top-navbar__container container">
          <a href="#hero" className="top-navbar__logo" onClick={(e) => handleNavClick(e, '#hero')}>
            <span className="top-navbar__logo-icon">SF</span>
            <span className="top-navbar__logo-text">Sohaib.FT</span>
          </a>

          <button
            className="dock-navbar__link dock-navbar__theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <div className="dock-navbar__icon">
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </div>
          </button>
        </div>
      </nav>

      {/* Floating Dock Navbar (appears on scroll) */}
      <div className={`dock-navbar ${scrolled ? 'dock-navbar--visible' : ''}`}>
        <div className="dock-navbar__container">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <div className="dock-navbar__item-wrapper" key={link.href}>
                <a
                  href={link.href}
                  className={`dock-navbar__link ${isActive ? 'dock-navbar__link--active' : ''}`}
                  onClick={(e) => handleNavClick(e, link.href)}
                  aria-label={link.label}
                >
                  {isActive && <span className="dock-navbar__dot"></span>}
                  <div className="dock-navbar__icon">
                    {link.icon}
                  </div>
                </a>
                <span className="dock-navbar__tooltip">{link.label}</span>
              </div>
            );
          })}
          
        </div>
      </div>
    </>
  );
}
