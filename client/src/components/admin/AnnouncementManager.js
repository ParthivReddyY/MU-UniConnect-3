import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

const AnnouncementManager = () => {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for creating/editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    icon: 'bell',
    buttonText: 'Learn More',
    link: '/college?tab=news',
    isActive: true,
    priority: 0
  });
  
  // Available FontAwesome icons that work well for announcements
  const iconOptions = [
    { value: 'bell', label: 'Bell' },
    { value: 'bullhorn', label: 'Bullhorn' },
    { value: 'calendar-alt', label: 'Calendar' },
    { value: 'exclamation-circle', label: 'Alert' },
    { value: 'graduation-cap', label: 'Graduation' },
    { value: 'award', label: 'Award' },
    { value: 'star', label: 'Star' },
    { value: 'info-circle', label: 'Info' },
    { value: 'clock', label: 'Clock' },
    { value: 'certificate', label: 'Certificate' }
  ];

  // Fetch all announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/announcements');
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
      } else {
        setError('Failed to load announcements');
      }
    } catch (err) {
      setError(err.message || 'Error fetching announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Reset form to default state
  const resetForm = () => {
    setFormData({
      text: '',
      icon: 'bell',
      buttonText: 'Learn More',
      link: '/college?tab=news',
      isActive: true,
      priority: 0
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  // Load announcement into form for editing
  const handleEdit = (announcement) => {
    setFormData({
      text: announcement.text,
      icon: announcement.icon || 'bell',
      buttonText: announcement.buttonText || 'Learn More',
      link: announcement.link || '/college?tab=news',
      isActive: announcement.isActive !== false,
      priority: announcement.priority || 0
    });
    setIsEditing(true);
    setCurrentId(announcement._id);
  };

  // Submit the form to create or update an announcement
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      toast.error('Announcement text is required');
      return;
    }
    
    try {
      let response;
      
      if (isEditing) {
        response = await api.put(`/api/announcements/${currentId}`, formData);
        if (response.data.success) {
          toast.success('Announcement updated successfully');
        }
      } else {
        response = await api.post('/api/announcements', formData);
        if (response.data.success) {
          toast.success('Announcement created successfully');
        }
      }
      
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving announcement');
      console.error('Error saving announcement:', err);
    }
  };

  // Delete an announcement
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    
    try {
      const response = await api.delete(`/api/announcements/${id}`);
      if (response.data.success) {
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting announcement');
      console.error('Error deleting announcement:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If user is not an admin, show access denied
  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 my-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p>You do not have permission to manage announcements.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 my-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Announcement' : 'Create Announcement'}
      </h2>
      
      {/* Form for creating/editing announcements */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="text">
              Announcement Text *
            </label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
              rows="3"
              placeholder="Enter announcement text (required)"
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="icon">
              Icon
            </label>
            <select
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
            >
              {iconOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-center">
              <i className={`fas fa-${formData.icon} text-xl text-primary-red mr-2`}></i>
              <span className="text-xs text-gray-500">Icon preview</span>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="buttonText">
              Button Text
            </label>
            <input
              type="text"
              id="buttonText"
              name="buttonText"
              value={formData.buttonText}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
              placeholder="Learn More"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="link">
              Link URL
            </label>
            <input
              type="text"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
              placeholder="/college?tab=news"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="priority">
              Priority (Higher numbers appear first)
            </label>
            <input
              type="number"
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
              min="0"
              max="10"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
            />
            <label className="ml-2 block text-gray-700" htmlFor="isActive">
              Active (visible on website)
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-primary-red hover:bg-secondary-red text-white font-medium rounded-md shadow-sm transition-colors"
          >
            {isEditing ? 'Update Announcement' : 'Create Announcement'}
          </button>
          
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Current Announcements</h3>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-red border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading announcements...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
          <p>{error}</p>
          <button
            onClick={fetchAnnouncements}
            className="mt-2 text-primary-red hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-md">
          <p className="text-gray-500">No announcements found. Create one above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Announcement
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Button
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <tr key={announcement._id} className={!announcement.isActive ? 'bg-gray-50 opacity-70' : ''}>
                  <td className="px-6 py-4 whitespace-normal">
                    <div className="flex items-start">
                      <i className={`fas fa-${announcement.icon || 'bell'} text-primary-red mt-1 mr-2`}></i>
                      <span className="font-medium text-gray-900 max-w-md break-words">{announcement.text}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {announcement.buttonText || 'Learn More'} 
                      <span className="text-xs text-gray-400 block">
                        → {announcement.link || '/college?tab=news'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {announcement.isActive !== false ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                    <span className="ml-2 text-xs text-gray-500">
                      Priority: {announcement.priority || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(announcement.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManager;