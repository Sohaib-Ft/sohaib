import { useState, useEffect } from 'react';
import './AllProjects.css';

const FALLBACK = [
  {
    title: 'CMMS',
    fullTitle: 'Computerized Maintenance Management System',
    description: 'A comprehensive maintenance management platform designed to streamline equipment tracking, work orders, preventive maintenance scheduling, and asset lifecycle management.',
    image: '/images/cmms.png',
    tags: ['Laravel', 'React', 'MySQL', 'REST API'],
    github: 'https://github.com/Sohaib-Ft',
    color: '#3b82f6',
  },
  {
    title: 'LinkedU',
    fullTitle: 'University Networking Platform',
    description: 'A professional networking platform tailored for university students and graduates to connect, share opportunities, and build their academic and professional network.',
    image: '/images/linkedu.png',
    tags: ['Node.js', 'React', 'MongoDB', 'Express'],
    github: 'https://github.com/Sohaib-Ft',
    color: '#8b5cf6',
  },
  {
    title: 'Book Review',
    fullTitle: 'Book Review Platform',
    description: 'An interactive book review application where users can browse, rate, and review books. Features include reading lists, personalized recommendations, and community discussions.',
    image: '/images/book-review.png',
    tags: ['PHP', 'Laravel', 'PostgreSQL', 'Bootstrap'],
    github: 'https://github.com/Sohaib-Ft',
    color: '#f59e0b',
  },
  {
    title: 'OFPPT Cours',
    fullTitle: 'OFPPT Cours Récapitulatifs',
    description: 'An e-learning platform providing comprehensive course summaries and study materials for OFPPT students, featuring organized modules, progress tracking, and downloadable resources.',
    image: '/images/ofppt.png',
    tags: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    github: 'https://github.com/Sohaib-Ft',
    color: '#22c55e',
  },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#06b6d4'];

const GHIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const hasRepo = (project) => {
  if (!project || project.isPrivate) return false;
  const url = (project.github || '').trim();
  if (!url || url === '#') return false;
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') return false;
    const parts = u.pathname.split('/').filter(Boolean);
    return parts.length >= 2;
  } catch {
    return false;
  }
};

function ProjectCard({ project, index }) {
  const showRepo = hasRepo(project);
  return (
    <div className={`allprojects__card animate-in delay-${(index % 3) + 1}`}>
      <div className="allprojects__card-image">
        {project.image ? (
          <img src={project.image} alt={project.title} loading="lazy" />
        ) : (
          <div className="allprojects__card-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>No preview available</span>
          </div>
        )}
        {showRepo && (
          <div className="allprojects__card-overlay">
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="allprojects__card-link"
            >
              <GHIcon />
              View on GitHub
            </a>
          </div>
        )}
      </div>

      <div className="allprojects__card-content">
        <div className="allprojects__card-header">
          <span className="allprojects__card-dot" style={{ background: project.color }} />
          <h3 className="allprojects__card-title">{project.title}</h3>
        </div>
        {project.fullTitle !== project.title && (
          <p className="allprojects__card-full-title">{project.fullTitle}</p>
        )}
        <p className="allprojects__card-desc">{project.description}</p>
        <div className="allprojects__card-tags">
          {(project.tags || []).map((tag, i) => (
            <span className="allprojects__card-tag" key={i}>{tag}</span>
          ))}
        </div>
        {showRepo && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="allprojects__card-btn"
          >
            <GHIcon />
            Source Code
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

export default function AllProjects({ onBack }) {
  const [projects, setProjects] = useState(FALLBACK);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = isLocal ? 'http://127.0.0.1:5000' : (import.meta.env.VITE_API_URL || 'https://portfolio-backend-sohaib.fly.dev');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/api/projects`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Backend already sorts by (order asc, featured desc, createdAt desc). Preserve it.
            const mapped = data.map((p, i) => ({
              title: p.title || 'Untitled',
              fullTitle: p.title || 'Untitled',
              description: p.description || '',
              image: p.image
                ? (p.image.startsWith('/uploads/') ? `${API_URL}${p.image}` : p.image)
                : '',
              tags: Array.isArray(p.tags) ? p.tags : [],
              isPrivate: p.isPrivate || false,
              github: p.github || '#',
              color: COLORS[i % COLORS.length],
            }));
            setProjects(mapped);
            return;
          }
        }
      } catch (err) {
        console.error('Fetch failed:', err);
      }

      // If DB empty or fetch fails, just keep the initial fallback state.
    };

    fetchProjects();
  }, []);
  // Local scroll observer to trigger animations on cards & text in AllProjects view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.allprojects-view .animate-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [projects]);

  return (
    <div className="allprojects-view">
      {/* Dynamic Header */}
      <header className="allprojects-header">
        <div className="container allprojects-header__wrap">
          <button onClick={onBack} className="allprojects-back-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Back to Portfolio</span>
          </button>
          
         
        </div>
      </header>

      {/* Main Section */}
      <main className="container allprojects-main">
        <div className="allprojects-hero">
          <h1 className="allprojects-title animate-in">All My Works</h1>
          <p className="allprojects-subtitle animate-in delay-1">
            An extensive showroom of web applications, robust backend systems, and creative frontend concepts.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="allprojects__grid">
          {projects.map((project, i) => (
            <ProjectCard key={`${project.title}-${i}`} project={project} index={i} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="allprojects-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Sohaib Fettah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
