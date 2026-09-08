import { useState, useEffect } from 'react';
import './Projects.css';

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
    <div className={`projects__card animate-in delay-${(index % 3) + 1}`}>
      <div className="projects__card-image">
        {project.image ? (
          <img src={project.image} alt={project.title} loading="lazy" />
        ) : (
          <div className="projects__card-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>No preview available</span>
          </div>
        )}
        {showRepo && (
          <div className="projects__card-overlay">
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="projects__card-link"
            >
              <GHIcon />
              View on GitHub
            </a>
          </div>
        )}
      </div>

      <div className="projects__card-content">
        <div className="projects__card-header">
          <span className="projects__card-dot" style={{ background: project.color }} />
          <h3 className="projects__card-title">{project.title}</h3>
        </div>
        {project.fullTitle !== project.title && (
          <p className="projects__card-full-title">{project.fullTitle}</p>
        )}
        <p className="projects__card-desc">{project.description}</p>
        <div className="projects__card-tags">
          {(project.tags || []).map((tag, i) => (
            <span className="projects__card-tag" key={i}>{tag}</span>
          ))}
        </div>
        {showRepo && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="projects__card-btn"
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

export default function Projects({ onViewAll }) {
  const [allProjects, setAllProjects] = useState([]);
  const [apiLoaded, setApiLoaded] = useState(false);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
  const API_URL = isLocal ? 'http://127.0.0.1:5000' : (
    configuredApiUrl && !/^https?:\/\//i.test(configuredApiUrl)
      ? `https://${configuredApiUrl}`
      : configuredApiUrl
  );

  useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Backend already sorts by (order asc, featured desc, createdAt desc).
          // Preserve that order — don't re-sort by date here or we'd lose the admin's manual order.
          const mapped = data.map((p, i) => ({
            title: p.title || 'Untitled',
            fullTitle: p.title || 'Untitled',
            description: p.description || '',
            image: p.image
              ? (p.image.startsWith('/uploads/') ? `${API_URL}${p.image}` : p.image)
              : '',
            tags: Array.isArray(p.tags) ? p.tags : [],
            isPrivate: p.isPrivate || false,
            featured: !!p.featured,
            github: p.github || '#',
            color: COLORS[i % COLORS.length],
          }));
          setAllProjects(mapped);
          setApiLoaded(true);
        }
      })
      .catch(() => {
        // API unreachable, fallback will be used
      });
  }, []);

  // Keep sample projects only for local development; production must show the API state.
  // Backend already ordered by (order asc, featured desc, createdAt desc).
  let displayProjects;
  if (apiLoaded && allProjects.length > 0) {
    const featured = allProjects.filter((p) => p.featured);
    const source = featured.length > 0 ? featured : allProjects;
    displayProjects = source.slice(0, 4);
  } else {
    displayProjects = isLocal ? FALLBACK : [];
  }

  // Local intersection observer to trigger animations on dynamically loaded cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = document.querySelectorAll('#projects .animate-in');
    cards.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [displayProjects]);

  const totalCount = apiLoaded ? allProjects.length : (isLocal ? FALLBACK.length : 0);

  return (
    <section className="projects section" id="projects">
      <div className="container">
        <div className="section-header">
          <span className="section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Projects
          </span>
          <h2 className="section-title">Featured Work</h2>
          <p className="section-subtitle">A selection of projects that showcase my skills and passion for development.</p>
        </div>

        <div className="projects__grid">
          {displayProjects.map((project, i) => (
            <ProjectCard key={`${project.title}-${i}`} project={project} index={i} />
          ))}
        </div>

        <div className="projects__toggle-wrap">
          <div className="projects__toggle-line" />
          <button
            className="projects__toggle-btn"
            onClick={onViewAll}
            id="toggle-all-projects"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <span>View All Projects</span>
            <span className="projects__toggle-count">{totalCount}</span>
          </button>
          <div className="projects__toggle-line" />
        </div>
      </div>
    </section>
  );
}
