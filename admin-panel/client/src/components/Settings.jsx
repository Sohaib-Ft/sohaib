import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Settings() {
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    email: '',
    location: '',
    about: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://127.0.0.1:5000' : '');

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/profile`);
      if (res.data) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error('Error fetching profile', error);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/profile`, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile', error);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={profile.name} 
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Professional Title</label>
              <input 
                type="text" 
                name="title"
                value={profile.title} 
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={profile.email} 
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
              <input 
                type="text" 
                name="location"
                value={profile.location} 
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">About Section Text</label>
            <textarea 
              name="about"
              value={profile.about} 
              onChange={handleChange}
              rows="6" 
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-800">
            {saved && <span className="text-emerald-400 text-sm">Settings saved successfully!</span>}
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
