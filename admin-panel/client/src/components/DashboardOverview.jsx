import { useState, useEffect } from 'react';
import axios from 'axios';
import { BriefcaseIcon, CodeBracketIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    messages: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
      const API_URL = isLocal ? 'http://127.0.0.1:5000' : (configuredApiUrl && !/^https?:\/\//i.test(configuredApiUrl) ? `https://${configuredApiUrl}` : configuredApiUrl);
      try {
        const [projectsRes, skillsRes, messagesRes] = await Promise.all([
          axios.get(`${API_URL}/api/projects`),
          axios.get(`${API_URL}/api/skills`),
          axios.get(`${API_URL}/api/messages`)
        ]);

        setStats({
          projects: projectsRes.data.length,
          skills: skillsRes.data.length,
          messages: messagesRes.data.length,
          unreadMessages: messagesRes.data.filter(m => !m.isRead).length
        });
      } catch (error) {
        console.error('Error fetching stats', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center">
          <div className="p-4 bg-indigo-500/10 rounded-lg mr-4">
            <BriefcaseIcon className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-white">{stats.projects}</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center">
          <div className="p-4 bg-emerald-500/10 rounded-lg mr-4">
            <CodeBracketIcon className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Technologies</p>
            <p className="text-3xl font-bold text-white">{stats.skills}</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center">
          <div className="p-4 bg-rose-500/10 rounded-lg mr-4">
            <EnvelopeIcon className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Messages</p>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-white mr-2">{stats.messages}</p>
              {stats.unreadMessages > 0 && (
                <span className="text-sm font-medium text-rose-400">({stats.unreadMessages} unread)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
