import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon, PlusIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, Bars3Icon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [github, setGithub] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null);
  const [featured, setFeatured] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Drag state
  const dragIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
  const API_URL = isLocal ? 'http://127.0.0.1:5000' : (configuredApiUrl && !/^https?:\/\//i.test(configuredApiUrl) ? `https://${configuredApiUrl}` : configuredApiUrl);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/projects`);
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects', error);
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setCurrentProject(project);
      setTitle(project.title);
      setDescription(project.description);
      setGithub(project.github);
      setTags(project.tags.join(', '));
      setImage(null); // Can't easily pre-fill file input
      setFeatured(!!project.featured);
    } else {
      setCurrentProject(null);
      setTitle('');
      setDescription('');
      setGithub('');
      setTags('');
      setImage(null);
      setFeatured(false);
    }
    setSaveError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('github', github);
    formData.append('tags', tags);
    formData.append('featured', featured ? 'true' : 'false');
    if (image) {
      formData.append('image', image);
    }

    try {
      if (currentProject) {
        await axios.put(`${API_URL}/api/projects/${currentProject._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${API_URL}/api/projects`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchProjects();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving project', error);
      setSaveError(error.response?.data?.message || error.response?.data?.error || error.message || 'Unable to save project');
    }
  };

  const toggleFeatured = async (project) => {
    try {
      const formData = new FormData();
      formData.append('featured', project.featured ? 'false' : 'true');
      await axios.put(`${API_URL}/api/projects/${project._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchProjects();
    } catch (error) {
      console.error('Error toggling featured', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`${API_URL}/api/projects/${id}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project', error);
      }
    }
  };

  /* ---------- REORDERING ---------- */

  // Build the new order array from the current local state and persist it.
  const persistOrder = async (newList) => {
    setSavingOrder(true);
    try {
      const payload = newList.map((p, idx) => ({ id: p._id, order: idx }));
      const res = await axios.put(`${API_URL}/api/projects/reorder`, payload);
      if (Array.isArray(res.data)) setProjects(res.data);
    } catch (error) {
      console.error('Error saving order', error);
      // re-sync with server in case of conflict
      fetchProjects();
    } finally {
      setSavingOrder(false);
    }
  };

  const move = (from, to) => {
    if (from === to || to < 0 || to >= projects.length) return;
    const next = [...projects];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setProjects(next);
    persistOrder(next);
  };

  const handleDragStart = (e, index) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox
    try { e.dataTransfer.setData('text/plain', String(index)); } catch (_) {}
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDragLeave = (index) => {
    if (dragOverIndex === index) setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const from = dragIndex.current;
    dragIndex.current = null;
    setDragOverIndex(null);
    if (from === null || from === undefined) return;
    move(from, index);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Projects Management</h2>
          <p className="text-sm text-gray-400 mt-1">
            Drag cards to reorder {savingOrder && <span className="text-indigo-400 ml-1">· saving...</span>}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Project
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((project, index) => (
          <div
            key={project._id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={() => handleDragLeave(index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-gray-900 border ${dragOverIndex === index ? 'border-indigo-500' : project.featured ? 'border-yellow-500/50' : 'border-gray-800'} rounded-xl flex items-stretch overflow-hidden relative transition-all ${dragIndex.current === index ? 'opacity-50' : ''}`}
          >
            {/* Drag handle + position */}
            <div className="flex flex-col items-center justify-center px-3 bg-gray-800/60 border-r border-gray-800 cursor-grab active:cursor-grabbing select-none">
              <Bars3Icon className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1 font-mono">{index + 1}</span>
            </div>

            {/* Thumbnail */}
            <div className="w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 overflow-hidden bg-gray-800">
              {project.image && (
                <img
                  src={project.image.startsWith('http') ? project.image : `${API_URL}${project.image}`}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <h3 className="text-lg font-bold truncate">{project.title}</h3>
                {project.featured && (
                  <span className="flex-shrink-0 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded text-xs font-semibold flex items-center gap-1">
                    <StarIconSolid className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-2">{project.description}</p>
              <div className="flex items-center gap-2 mt-auto">
                {project.tags?.slice(0, 4).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 p-3 border-l border-gray-800">
              <div className="flex sm:flex-col gap-1">
                <button
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0 || savingOrder}
                  title="Move up"
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUpIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => move(index, index + 1)}
                  disabled={index === projects.length - 1 || savingOrder}
                  title="Move down"
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex sm:flex-col gap-1 sm:ml-2 sm:border-l sm:border-gray-800 sm:pl-2">
                <button
                  onClick={() => toggleFeatured(project)}
                  title={project.featured ? 'Unmark as featured' : 'Mark as featured'}
                  className={`p-1.5 rounded transition-colors ${project.featured ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800'}`}
                >
                  {project.featured ? <StarIconSolid className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openModal(project)}
                  title="Edit"
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  title="Delete"
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
            No projects yet. Click "Add Project" to create one.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">{currentProject ? 'Edit Project' : 'Add New Project'}</h3>
            {saveError && (
              <div className="mb-4 rounded border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300" role="alert">
                {saveError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-indigo-500"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">GitHub Link</label>
                <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} required className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, Node, MongoDB" className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Image {currentProject && '(leave blank to keep current)'}</label>
                <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <label className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded cursor-pointer hover:border-yellow-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500"
                />
                <div className="flex items-center gap-2">
                  <StarIconSolid className={`w-4 h-4 ${featured ? 'text-yellow-400' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium text-gray-200">Show on Featured Work section</span>
                </div>
              </label>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
