import { useState, useEffect } from 'react';
import axios from 'axios';
import skillLibrary from './skillLibrary';
import './index.css';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_URL = isLocal ? 'http://127.0.0.1:5000' : (
  configuredApiUrl && !/^https?:\/\//i.test(configuredApiUrl)
    ? `https://${configuredApiUrl}`
    : configuredApiUrl
);
const API = `${API_URL}/api`;
const BASE_URL = API_URL;

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'dark');
  
  // Data state
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);

  // Drag and Drop state
  const [draggedSkill, setDraggedSkill] = useState(null);
  const [dragOverSkill, setDragOverSkill] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // 'skill' | 'project' | null
  const [editItem, setEditItem] = useState(null);

  // Skill form
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Frontend', icon: '', role: '' });
  // Project form
  const [projectForm, setProjectForm] = useState({ title: '', description: '', github: '', tags: '', isPrivate: false });
  const [projectImage, setProjectImage] = useState(null);

  // Theme toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  // Fetch all data
  useEffect(() => {
    fetchSkills();
    fetchProjects();
    fetchMessages();
  }, []);

  const fetchSkills = async () => {
    try { const res = await axios.get(`${API}/skills`); setSkills(res.data); } 
    catch (e) { console.error(e); }
  };

  const fetchProjects = async () => {
    try { const res = await axios.get(`${API}/projects`); setProjects(res.data); } 
    catch (e) { console.error(e); }
  };

  const fetchMessages = async () => {
    try { const res = await axios.get(`${API}/messages`); setMessages(res.data); } 
    catch (e) { console.error(e); }
  };

  // ========================================
  // SKILL CRUD
  // ========================================
  const openSkillModal = (skill = null) => {
    if (skill) {
      setEditItem(skill);
      setSkillForm({ name: skill.name, category: skill.category, icon: skill.icon, role: skill.role || '' });
    } else {
      setEditItem(null);
      setSkillForm({ name: '', category: 'Frontend', icon: '', role: '' });
    }
    setModal('skill');
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`${API}/skills/${editItem._id}`, skillForm);
      } else {
        await axios.post(`${API}/skills`, skillForm);
      }
      fetchSkills();
      setModal(null);
    } catch (e) { console.error(e); }
  };

  const deleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try { await axios.delete(`${API}/skills/${id}`); fetchSkills(); } 
    catch (e) { console.error(e); }
  };

  const handleDragStart = (e, skill) => {
    setDraggedSkill(skill);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, skill) => {
    setDragOverSkill(skill);
  };

  const handleDragEnd = async () => {
    if (!draggedSkill || !dragOverSkill || draggedSkill._id === dragOverSkill._id) {
      setDraggedSkill(null);
      setDragOverSkill(null);
      return;
    }

    const newSkills = [...skills];
    const draggedIdx = newSkills.findIndex(s => s._id === draggedSkill._id);
    const overIdx = newSkills.findIndex(s => s._id === dragOverSkill._id);
    
    newSkills.splice(draggedIdx, 1);
    newSkills.splice(overIdx, 0, draggedSkill);
    
    setSkills(newSkills);
    setDraggedSkill(null);
    setDragOverSkill(null);

    try {
      const orderedIds = newSkills.map(s => s._id);
      await axios.put(`${API}/skills/reorder`, { orderedIds });
    } catch (e) {
      console.error(e);
      fetchSkills(); // revert on error
    }
  };

  // ========================================
  // PROJECT CRUD
  // ========================================
  const openProjectModal = (project = null) => {  
    if (project) {
      setEditItem(project);
      setProjectForm({ title: project.title, description: project.description, github: project.github, tags: project.tags?.join(', ') || '', isPrivate: project.isPrivate || false });
    } else {
      setEditItem(null);
      setProjectForm({ title: '', description: '', github: '', tags: '', isPrivate: false });
    }
    setProjectImage(null);
    setModal('project');
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', projectForm.title);
    formData.append('description', projectForm.description);
    formData.append('github', projectForm.github);
    formData.append('tags', projectForm.tags);
    formData.append('isPrivate', projectForm.isPrivate);
    if (projectImage) formData.append('image', projectImage);

    try {
      if (editItem) {
        await axios.put(`${API}/projects/${editItem._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post(`${API}/projects`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      fetchProjects();
      setModal(null);
    } catch (e) { console.error(e); }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { await axios.delete(`${API}/projects/${id}`); fetchProjects(); } 
    catch (e) { console.error(e); }
  };

  // ========================================
  // MESSAGE ACTIONS
  // ========================================
  const toggleRead = async (msg) => {
    try { await axios.put(`${API}/messages/${msg._id}`, { isRead: !msg.isRead }); fetchMessages(); } 
    catch (e) { console.error(e); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try { await axios.delete(`${API}/messages/${id}`); fetchMessages(); } 
    catch (e) { console.error(e); }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;
  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
    const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
    return dateB - dateA;
  });
  const categories = ['Frontend', 'Backend', 'Database', 'API', 'Tools', 'Other'];

  // Skills tab: 'mine' or 'library'
  const [skillsTab, setSkillsTab] = useState('mine');
  const [libraryFilter, setLibraryFilter] = useState('All');
  const [addingSkill, setAddingSkill] = useState(null); // name of skill being added

  // Check if a library skill is already added
  const isSkillAdded = (libSkill) => skills.some(s => s.name.toLowerCase() === libSkill.name.toLowerCase());

  // One-click add from library
  const quickAddSkill = async (libSkill) => {
    if (isSkillAdded(libSkill)) return;
    setAddingSkill(libSkill.name);
    try {
      await axios.post(`${API}/skills`, {
        name: libSkill.name,
        category: libSkill.category,
        icon: libSkill.icon,
        role: libSkill.role || '',
      });
      await fetchSkills();
    } catch (e) { console.error(e); }
    setTimeout(() => setAddingSkill(null), 600);
  };

  // Library categories for filter tabs
  const libCategories = ['All', 'Frontend', 'Backend', 'Database', 'API', 'Tools', 'Other'];
  const filteredLibrary = libraryFilter === 'All' ? skillLibrary : skillLibrary.filter(s => s.category === libraryFilter);

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="admin-app">
      {/* ===== NAVBAR ===== */}
      <nav className="admin-nav">
        <div className="admin-nav__brand">
          <div className="admin-nav__logo">SF</div>
          <span className="admin-nav__title">Admin Panel</span>
        </div>
        <div className="admin-nav__actions">
          <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
      </nav>

      <main className="admin-main">

        {/* ===== SKILLS SECTION ===== */}
        <section>
          <div className="section-head">
            <div className="section-head__left">
              <div className="section-head__icon section-head__icon--skills">🧩</div>
              <div>
                <h2 className="section-head__title">Skills & Technologies</h2>
                <p className="section-head__count">{skills.length} technologies</p>
              </div>
            </div>
            <div className="section-head__right">
              <button className="btn-add" onClick={() => openSkillModal()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Custom
              </button>
            </div>
          </div>

          {/* Tab Toggle */}
          <div className="tabs">
            <button className={`tab ${skillsTab === 'mine' ? 'tab--active' : ''}`} onClick={() => setSkillsTab('mine')}>
              My Skills
              <span className="tab__badge">{skills.length}</span>
            </button>
            <button className={`tab ${skillsTab === 'library' ? 'tab--active' : ''}`} onClick={() => setSkillsTab('library')}>
              📚 Library
              <span className="tab__badge">{skillLibrary.length}</span>
            </button>
          </div>

          {/* MY SKILLS VIEW */}
          {skillsTab === 'mine' && (
            <>
              {categories.map(cat => {
                const catSkills = skills.filter(s => s.category === cat);
                if (catSkills.length === 0) return null;
                const catColors = { Frontend: '#3b82f6', Backend: '#22c55e', Database: '#f59e0b', API: '#ef4444', Tools: '#06b6d4', Other: '#8b5cf6' };
                const catLabels = { Frontend: 'Frontend', Backend: 'Backend', Database: 'Databases', API: 'APIs', Tools: 'DevOps & Tools', Other: 'Mobile & Other' };
                return (
                  <div key={cat} className="skill-category">
                    <div className="skill-category__header">
                      <span className="skill-category__dot" style={{ background: catColors[cat] }}></span>
                      <h3 className="skill-category__title">{catLabels[cat] || cat}</h3>
                      <span className="skill-category__count">{catSkills.length}</span>
                    </div>
                    <div className="cards-grid">
                      {catSkills.map(skill => (
                        <div 
                          className={`skill-card ${draggedSkill?._id === skill._id ? 'opacity-50' : ''} ${dragOverSkill?._id === skill._id ? 'border-dashed border-2 border-primary' : ''}`} 
                          key={skill._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, skill)}
                          onDragEnter={(e) => handleDragEnter(e, skill)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                          style={{ cursor: 'grab' }}
                        >
                          <div className="skill-card__actions">
                            <button className="card-btn card-btn--edit" onClick={() => openSkillModal(skill)}>✏️</button>
                            <button className="card-btn card-btn--delete" onClick={() => deleteSkill(skill._id)}>🗑</button>
                          </div>
                          {skill.icon && skill.icon.startsWith('http') ? (
                            <img src={skill.icon} alt={skill.name} className="skill-card__icon" />
                          ) : (
                            <div className="skill-card__icon-placeholder">⚡</div>
                          )}
                          <span className="skill-card__name">{skill.name}</span>
                          {skill.role && <span className="skill-card__role" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{skill.role}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {skills.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state__icon">🛠</div>
                  <p>No skills yet. Switch to the Library tab to add technologies!</p>
                </div>
              )}
            </>
          )}

          {/* LIBRARY VIEW */}
          {skillsTab === 'library' && (
            <>
              <div className="lib-filters">
                {libCategories.map(cat => (
                  <button
                    key={cat}
                    className={`lib-filter ${libraryFilter === cat ? 'lib-filter--active' : ''}`}
                    onClick={() => setLibraryFilter(cat)}
                  >
                    {cat === 'All' ? '🌐 All' : cat === 'Frontend' ? '🎨 Frontend' : cat === 'Backend' ? '⚙️ Backend' : cat === 'Database' ? '🗄 Database' : cat === 'API' ? '🔌 APIs' : cat === 'Tools' ? '🔧 Tools' : '📱 Mobile'}
                  </button>
                ))}
              </div>
              <div className="cards-grid cards-grid--library">
                {filteredLibrary.map(libSkill => {
                  const added = isSkillAdded(libSkill);
                  const isAdding = addingSkill === libSkill.name;
                  return (
                    <div className={`lib-card ${added ? 'lib-card--added' : ''} ${isAdding ? 'lib-card--adding' : ''}`} key={libSkill.name}>
                      <img src={libSkill.icon} alt={libSkill.name} className="lib-card__icon" />
                      <span className="lib-card__name">{libSkill.name}</span>
                      {libSkill.role && <span style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-8px', textAlign: 'center'}}>{libSkill.role}</span>}
                      {added ? (
                        <span className="lib-card__status">✓ Added</span>
                      ) : (
                        <button className="lib-card__add" onClick={() => quickAddSkill(libSkill)} disabled={isAdding}>
                          {isAdding ? '...' : '+ Add'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* ===== PROJECTS SECTION ===== */}
        <section>
          <div className="section-head">
            <div className="section-head__left">
              <div className="section-head__icon section-head__icon--projects">🚀</div>
              <div>
                <h2 className="section-head__title">Projects</h2>
                <p className="section-head__count">{projects.length} projects</p>
              </div>
            </div>
            <button className="btn-add" onClick={() => openProjectModal()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Project
            </button>
          </div>

          <div className="cards-grid cards-grid--projects">
            {projects.map(project => (
              <div className="project-card" key={project._id}>
                {project.image ? (
                  <img
                    src={project.image.startsWith('http') ? project.image : `${BASE_URL}${project.image}`}
                    alt={project.title}
                    className="project-card__image"
                  />
                ) : (
                  <div className="project-card__image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-muted)' }}>📁</div>
                )}
                <div className="project-card__body">
                  <h3 className="project-card__title">{project.title}</h3>
                  <p className="project-card__desc">{project.description}</p>
                  {project.tags?.length > 0 && (
                    <div className="project-card__tags">
                      {project.tags.map((tag, i) => <span className="project-card__tag" key={i}>{tag}</span>)}
                    </div>
                  )}
                  <div className="project-card__footer">
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-card__link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      GitHub
                    </a>
                    <div className="project-card__btns">
                      <button className="card-btn card-btn--edit" onClick={() => openProjectModal(project)}>✏️</button>
                      <button className="card-btn card-btn--delete" onClick={() => deleteProject(project._id)}>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="empty-state">
                <div className="empty-state__icon">📂</div>
                <p>No projects yet. Showcase your work!</p>
              </div>
            )}
          </div>
        </section>

        {/* ===== MESSAGES SECTION ===== */}
        <section className="messages-section">
          <div className="section-head">
            <div className="section-head__left">
              <div className="section-head__icon section-head__icon--messages">📬</div>
              <div>
                <h2 className="section-head__title">
                  Messages
                  {unreadCount > 0 && <span className="badge badge--danger" style={{ marginLeft: '10px', fontSize: '0.7rem' }}>{unreadCount}</span>}
                </h2>
                <p className="section-head__count">{messages.length} total messages</p>
              </div>
            </div>
          </div>

          {sortedMessages.length > 0 && (
            <div className="messages-table-wrap">
              <table className="messages-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Sent</th>
                    <th>Message</th>
                    <th className="messages-table__actions-heading">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMessages.map(msg => {
                    const sentAt = msg.createdAt || msg.created_at;
                    return (
                      <tr className={!msg.isRead ? 'message-row--unread' : ''} key={msg._id}>
                        <td data-label="Name">
                          <span className="message-table__name">
                            {msg.name}
                            {!msg.isRead && <span className="badge badge--new">New</span>}
                          </span>
                        </td>
                        <td data-label="Email"><a href={`mailto:${msg.email}`} className="message-table__link">{msg.email}</a></td>
                        <td data-label="Phone">{msg.phone || <span className="message-table__muted">Not provided</span>}</td>
                        <td data-label="Sent" className="message-table__date">
                          {sentAt ? new Date(sentAt).toLocaleString() : 'Unknown'}
                        </td>
                        <td data-label="Message" className="message-table__message-cell">
                          <details className="message-preview">
                            <summary>{msg.message || 'No message content'}</summary>
                            <p>{msg.message}</p>
                          </details>
                        </td>
                        <td data-label="Actions">
                          <div className="message-card__actions">
                            <button className="card-btn card-btn--edit" onClick={() => toggleRead(msg)} title={msg.isRead ? 'Mark unread' : 'Mark read'}>
                              {msg.isRead ? '📩' : '✅'}
                            </button>
                            <button className="card-btn card-btn--delete" onClick={() => deleteMessage(msg._id)} title="Delete">🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <p>No messages yet.</p>
            </div>
          )}
        </section>
      </main>

      {/* ===== SKILL MODAL ===== */}
      {modal === 'skill' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">{editItem ? 'Edit Skill' : 'Add New Skill'}</h3>
              <button className="modal__close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSkillSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" type="text" value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} placeholder="e.g. React" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {skillForm.category === 'Tools' && (
                  <div className="form-group">
                    <label className="form-label">Role (e.g. Hosting, Testing)</label>
                    <input className="form-input" type="text" value={skillForm.role} onChange={e => setSkillForm({...skillForm, role: e.target.value})} placeholder="e.g. Hosting" />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Icon URL</label>
                  <input className="form-input" type="text" value={skillForm.icon} onChange={e => setSkillForm({...skillForm, icon: e.target.value})} placeholder="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" />
                </div>
                {skillForm.icon && skillForm.icon.startsWith('http') && (
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <img src={skillForm.icon} alt="preview" style={{ width: 48, height: 48, objectFit: 'contain', margin: '0 auto' }} />
                  </div>
                )}
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== PROJECT MODAL ===== */}
      {modal === 'project' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">{editItem ? 'Edit Project' : 'Add New Project'}</h3>
              <button className="modal__close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleProjectSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub Link</label>
                  <input className="form-input" type="url" value={projectForm.github} onChange={e => setProjectForm({...projectForm, github: e.target.value})} required={!projectForm.isPrivate} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" type="text" value={projectForm.tags} onChange={e => setProjectForm({...projectForm, tags: e.target.value})} placeholder="React, Node, MongoDB" />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="isPrivate" checked={projectForm.isPrivate} onChange={e => setProjectForm({...projectForm, isPrivate: e.target.checked})} />
                  <label htmlFor="isPrivate" className="form-label" style={{ marginBottom: 0 }}>Private Repository (Hide Source Code Button)</label>
                </div>
                <div className="form-group">
                  <label className="form-label">Image {editItem && '(leave blank to keep current)'}</label>
                  <input className="form-input" type="file" accept="image/*" onChange={e => setProjectImage(e.target.files[0])} />
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
