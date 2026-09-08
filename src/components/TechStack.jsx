import { useState, useEffect } from 'react';
import './TechStack.css';

const categoryMeta = {
  Frontend: { color: '#3b82f6', title: 'Frontend' },
  Backend:  { color: '#22c55e', title: 'Backend' },
  Database: { color: '#f59e0b', title: 'Databases' },
  API:      { color: '#ef4444', title: 'APIs' },
  Tools:    { color: '#06b6d4', title: 'DevOps & Tools' },
  Other:    { color: '#8b5cf6', title: 'Other' },
};

// Fallback data in case the API is unavailable
const fallbackCategories = [
  {
    title: 'Frontend', color: '#3b82f6',
    techs: [
      { name: 'HTML', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
      { name: 'CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
      { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
      { name: 'Bootstrap', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg' },
      { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
      { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
    ],
  },
  {
    title: 'Backend', color: '#22c55e',
    techs: [
      { name: 'PHP', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg' },
      { name: 'Laravel', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg' },
      { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
      { name: 'Express.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg' },
    ],
  },
  {
    title: 'Databases', color: '#f59e0b',
    techs: [
      { name: 'MySQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg' },
      { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
      { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg' },
    ],
  },
  {
    title: 'APIs', color: '#ef4444',
    techs: [
      { name: 'REST APIs', icon: null },
      { name: 'GraphQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/graphql/graphql-plain.svg' },
    ],
  },
  {
    title: 'DevOps & Tools', color: '#06b6d4',
    techs: [
      { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg', role: 'Version Control' },
      { name: 'GitHub', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg', role: 'Code Hosting' },
      { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg', role: 'Containerization' },
      { name: 'Vercel', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg', role: 'Hosting' },
    ],
  },
];

export default function TechStack() {
  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    const fetchSkills = async () => {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_URL = isLocal ? 'http://127.0.0.1:5000' : (import.meta.env.VITE_API_URL || '');

      try {
        const res = await fetch(`${API_URL}/api/skills`);
        if (res.ok) {
          const skills = await res.json();
          if (Array.isArray(skills) && skills.length > 0) {
            const grouped = {};
            
            // Group database skills by category
            skills.forEach(skill => {
              const cat = skill.category || 'Other';
              if (!grouped[cat]) grouped[cat] = [];
              
              grouped[cat].push({ name: skill.name, icon: skill.icon || null, role: skill.role || null });
            });

            // Convert to array with meta, maintaining predefined order
            const cats = Object.keys(categoryMeta)
              .filter(key => grouped[key] && grouped[key].length > 0)
              .map(key => ({
                title: categoryMeta[key].title,
                color: categoryMeta[key].color,
                techs: grouped[key],
              }));

            setCategories(cats);
          } else {
            // If API succeeds but is empty, clear the categories (so deleted skills stay deleted)
            setCategories([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch skills:', err);
      }
    };

    fetchSkills();
  }, []);

  return (
    <section className="techstack section" id="techstack">
      <div className="container">
        <div className="section-header">
          <span className="section-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Tech Stack
          </span>
          <h2 className="section-title">Technologies I Work With</h2>
          <p className="section-subtitle">My toolkit for building modern, scalable web applications from frontend to backend.</p>
        </div>

        <div className="techstack__grid">
          {categories.map((cat, catIdx) => (
            <div className={`techstack__category animate-in delay-${catIdx + 1}`} key={cat.title}>
              <div className="techstack__category-header">
                <span className="techstack__category-dot" style={{ background: cat.color }}></span>
                <h3 className="techstack__category-title">{cat.title}</h3>
              </div>
              <div className="techstack__items">
                {cat.techs.map((tech) => (
                  <div className="techstack__item" key={tech.name}>
                    <div className="techstack__item-icon">
                      {tech.icon ? (
                        <img src={tech.icon} alt={tech.name} width="28" height="28" loading="lazy" />
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      )}
                    </div>
                    <div className="techstack__item-content" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="techstack__item-name">{tech.name}</span>
                      {tech.role && <span className="techstack__item-role" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tech.role}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
