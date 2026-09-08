import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { EnvelopeOpenIcon } from '@heroicons/react/24/solid';

export default function Messages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
  const API_URL = isLocal ? 'http://127.0.0.1:5000' : (configuredApiUrl && !/^https?:\/\//i.test(configuredApiUrl) ? `https://${configuredApiUrl}` : configuredApiUrl);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/messages`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  const handleToggleRead = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/api/messages/${id}`, { isRead: !currentStatus });
      fetchMessages();
    } catch (error) {
      console.error('Error updating message', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await axios.delete(`${API_URL}/api/messages/${id}`);
        fetchMessages();
      } catch (error) {
        console.error('Error deleting message', error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contact Messages</h2>

      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg._id} className={`bg-gray-900 border ${msg.isRead ? 'border-gray-800' : 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]'} rounded-xl p-6 transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center">
                  {msg.name}
                  {!msg.isRead && <span className="ml-3 px-2 py-0.5 text-xs bg-indigo-600 rounded-full">New</span>}
                </h3>
                <div className="text-gray-400 text-sm mt-1 flex space-x-4">
                  <a href={`mailto:${msg.email}`} className="hover:text-indigo-400">{msg.email}</a>
                  {msg.phone && <span>{msg.phone}</span>}
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleToggleRead(msg._id, msg.isRead)}
                  className={`p-2 rounded ${msg.isRead ? 'text-gray-500 hover:text-white' : 'text-indigo-400 hover:text-indigo-300'}`}
                  title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  {msg.isRead ? <EnvelopeOpenIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => handleDelete(msg._id)}
                  className="p-2 text-rose-400 hover:text-rose-300 rounded"
                  title="Delete message"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg text-gray-300 whitespace-pre-wrap">
              {msg.message}
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
            No messages received yet.
          </div>
        )}
      </div>
    </div>
  );
}
