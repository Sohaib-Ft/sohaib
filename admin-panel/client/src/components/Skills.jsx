import { useState, useEffect } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [icon, setIcon] = useState('');

  const categories = ['Frontend', 'Backend', 'Database', 'API', 'Other'];

  useEffect(() => {
    fetchSkills();
  }, []);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
  const API_URL = isLocal ? 'http://127.0.0.1:5000' : (configuredApiUrl && !/^https?:\/\//i.test(configuredApiUrl) ? `https://${configuredApiUrl}` : configuredApiUrl);

  const fetchSkills = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/skills`);
      setSkills(res.data);
    } catch (error) {
      console.error('Error fetching skills', error);
    }
  };

  const openModal = (skill = null) => {
    if (skill) {
      setCurrentSkill(skill);
      setName(skill.name);
      setCategory(skill.category);
      setIcon(skill.icon);
    } else {
      setCurrentSkill(null);
      setName('');
      setCategory('Frontend');
      setIcon('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name, category, icon };

    try {
      if (currentSkill) {
        await axios.put(`${API_URL}/api/skills/${currentSkill._id}`, data);
      } else {
        await axios.post(`${API_URL}/api/skills`, data);
      }
      fetchSkills();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving skill', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await axios.delete(`${API_URL}/api/skills/${id}`);
        fetchSkills();
      } catch (error) {
        console.error('Error deleting skill', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tech Stack Management</h2>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Skill
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="p-4 text-sm font-semibold text-gray-300">Icon</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Category</th>
              <th className="p-4 text-sm font-semibold text-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map(skill => (
              <tr key={skill._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="p-4">
                  {skill.icon.startsWith('http') ? (
                    <img src={skill.icon} alt={skill.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center text-xs">ICON</div>
                  )}
                </td>
                <td className="p-4 font-medium">{skill.name}</td>
                <td className="p-4 text-gray-400">
                  <span className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">{skill.category}</span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openModal(skill)} className="p-2 text-gray-400 hover:text-white mx-1">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(skill._id)} className="p-2 text-rose-400 hover:text-rose-300 mx-1">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {skills.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">No skills found. Add some to your stack!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">{currentSkill ? 'Edit Skill' : 'Add New Skill'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-indigo-500">
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Icon URL</label>
                <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} required placeholder="https://cdn.jsdelivr.net/..." className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-indigo-500" />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors">Save Skill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
