import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import '../CSS/forms.css';

const CampusHighlightForm = ({ highlight, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    icon: 'fas fa-building',
    active: true,
    order: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Common icon options for campus highlights
  const iconOptions = [
    { value: 'fas fa-building', label: 'Building' },
    { value: 'fas fa-book', label: 'Book/Library' },
    { value: 'fas fa-futbol', label: 'Sports' },
    { value: 'fas fa-flask', label: 'Research/Lab' },
    { value: 'fas fa-music', label: 'Cultural/Events' },
    { value: 'fas fa-home', label: 'Housing' },
    { value: 'fas fa-graduation-cap', label: 'Academic' },
    { value: 'fas fa-microscope', label: 'Science' },
    { value: 'fas fa-laptop-code', label: 'Technology' },
    { value: 'fas fa-users', label: 'Community' }
  ];

  // If editing an existing highlight, populate the form
  useEffect(() => {
    if (highlight) {
      setFormData({
        title: highlight.title || '',
        description: highlight.description || '',
        image: highlight.image || '',
        link: highlight.link || '',
        icon: highlight.icon || 'fas fa-building',
        active: highlight.active !== undefined ? highlight.active : true,
        order: highlight.order || 0
      });
    }
  }, [highlight]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.image.trim()) {
      setError('Image URL is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (highlight && highlight._id) {
        // Update existing highlight
        const response = await api.patch(
          `/api/campus-highlights/${highlight._id}`, 
          formData
        );
        if (response.data) {
          setSuccessMessage('Campus highlight updated successfully!');
          setTimeout(() => {
            onSuccess && onSuccess(response.data.highlight);
          }, 1500);
        }
      } else {
        // Create new highlight
        const response = await api.post('/api/campus-highlights', formData);
        if (response.data) {
          setSuccessMessage('Campus highlight created successfully!');
          setFormData({
            title: '',
            description: '',
            image: '',
            link: '',
            icon: 'fas fa-building',
            active: true,
            order: 0
          });
          setTimeout(() => {
            onSuccess && onSuccess(response.data.highlight);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error saving campus highlight:', err);
      setError(err.response?.data?.message || 'Failed to save campus highlight. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 mb-4 text-sm bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 mb-4 text-sm bg-green-100 border border-green-300 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
          required
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
          required
          maxLength={300}
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">Max 300 characters</p>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Image URL *
        </label>
        <input
          type="url"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
          required
          placeholder="https://example.com/image.jpg"
        />
        {formData.image && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Preview:</p>
            <img
              src={formData.image}
              alt="Preview"
              className="h-24 object-cover rounded-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f0f0f0"/%3E%3Ctext x="100" y="75" font-size="14" text-anchor="middle" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
          Link URL
        </label>
        <input
          type="text"
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
          placeholder="/college?tab=facilities"
        />
        <p className="text-xs text-gray-500 mt-1">Internal path (e.g., /college?tab=facilities) or external URL</p>
      </div>

      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
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
          <i className={`${formData.icon} text-xl text-primary-red mr-2`}></i>
          <span className="text-xs text-gray-500">Icon preview</span>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          Active (visible on website)
        </label>
      </div>

      <div>
        <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
          Display Order
        </label>
        <input
          type="number"
          id="order"
          name="order"
          min="0"
          max="100"
          value={formData.order}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
        />
        <p className="text-xs text-gray-500 mt-1">Lower numbers display first</p>
      </div>

      <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-red hover:bg-secondary-red focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : highlight && highlight._id ? (
            'Update Highlight'
          ) : (
            'Add Highlight'
          )}
        </button>
      </div>
    </form>
  );
};

export default CampusHighlightForm;