import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import newsService from '../../services/newsService';

const NewsManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allNews, setAllNews] = useState([]);
  const [editingNews, setEditingNews] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mode, setMode] = useState('both'); // Default mode shows both forms
  
  // Add these new state variables for character tracking
  const [titleChars, setTitleChars] = useState(0);
  const [excerptChars, setExcerptChars] = useState(0);
  
  // Constants for character limits
  const TITLE_LIMIT = 100;
  const EXCERPT_LIMIT = 300;
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'announcement',
    categoryLabel: 'Announcement',
    author: '',
    featured: false
  });

  // Categories
  const categories = [
    { value: 'announcement', label: 'Announcement' },
    { value: 'academic', label: 'Academic' },
    { value: 'campus', label: 'Campus Life' },
    { value: 'placement', label: 'Placement' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'research', label: 'Research' }
  ];

  // Check if user is admin and determine mode from URL
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/unauthorized');
    } else {
      fetchNews();
      
      // Get mode from URL parameter
      const searchParams = new URLSearchParams(location.search);
      const modeParam = searchParams.get('mode');
      if (modeParam === 'add' || modeParam === 'edit') {
        setMode(modeParam);
      }
    }
  }, [currentUser, navigate, location.search]);

  // Fetch all news
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsService.getAllNews();
      setAllNews(response.news);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Update character counts
    if (name === 'title') {
      setTitleChars(value.length);
    } else if (name === 'excerpt') {
      setExcerptChars(value.length);
    }
    
    // Special handler for category
    if (name === 'category') {
      const selectedCategory = categories.find(cat => cat.value === value);
      setFormData({
        ...formData,
        category: value,
        categoryLabel: selectedCategory ? selectedCategory.label : ''
      });
    } else {
      // Regular input handling
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Set form data when editing a news item
  const handleEditNews = (news) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      image: news.image,
      category: news.category,
      categoryLabel: news.categoryLabel,
      author: news.author,
      featured: news.featured
    });
    
    // Update character counts for title and excerpt
    setTitleChars(news.title.length);
    setExcerptChars(news.excerpt.length);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form
  const resetForm = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      image: '',
      category: 'announcement',
      categoryLabel: 'Announcement',
      author: '',
      featured: false
    });
    setTitleChars(0);
    setExcerptChars(0);
    setError(null);
    setSuccess(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate character limits before submission
    if (titleChars > TITLE_LIMIT || excerptChars > EXCERPT_LIMIT) {
      setError('Please fix the character limit issues before submitting.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Format date
      const today = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = today.toLocaleDateString('en-US', options);
      
      const newsData = {
        ...formData,
        date: formattedDate
      };
      
      let response;
      
      if (editingNews) {
        // Update existing news
        response = await newsService.updateNews(editingNews._id, newsData);
        setSuccess('News item updated successfully!');
        
        // Update the news list
        setAllNews(prevNews => 
          prevNews.map(item => 
            item._id === editingNews._id ? response.newsItem : item
          )
        );
      } else {
        // Create new news
        response = await newsService.createNews(newsData);
        setSuccess('News item created successfully!');
        
        // Add the new news to the list
        setAllNews(prevNews => [response.newsItem, ...prevNews]);
      }
      
      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error('Error saving news:', error);
      setError(error.response?.data?.message || 'Failed to save news. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete news
  const handleDeleteNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news item? This action cannot be undone.')) {
      return;
    }
    
    try {
      await newsService.deleteNews(id);
      setSuccess('News item deleted successfully!');
      
      // Remove the news from the list
      setAllNews(prevNews => prevNews.filter(item => item._id !== id));
      
      // Reset form if we were editing the deleted news
      if (editingNews && editingNews._id === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      setError(error.response?.data?.message || 'Failed to delete news. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">News Management</h1>
          <p className="text-gray-600">
            {mode === 'add' ? 'Add new news items' : 
             mode === 'edit' ? 'Edit existing news items' : 
             'Add, edit, or delete news items'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/college?tab=news')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to News
          </button>
          
          {mode === 'add' ? (
            <button
              onClick={() => navigate('/admin/news?mode=edit')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center"
            >
              <i className="fas fa-edit mr-2"></i>
              Switch to Edit Mode
            </button>
          ) : mode === 'edit' ? (
            <button
              onClick={() => navigate('/admin/news?mode=add')}
              className="px-4 py-2 bg-primary-red hover:bg-red-600 text-white rounded-lg flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Switch to Add Mode
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin/news')}
              className="px-4 py-2 bg-primary-teal hover:bg-teal-600 text-white rounded-lg flex items-center"
            >
              <i className="fas fa-sync mr-2"></i>
              Show Both
            </button>
          )}
        </div>
      </div>
      
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{success}</p>
        </div>
      )}
      
      {/* Only show add form if mode is 'add' or 'both' */}
      {(mode === 'add' || mode === 'both') && !editingNews && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-10">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
                    Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      titleChars > TITLE_LIMIT ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-red'
                    }`}
                    required
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Max 100 characters</p>
                    <p className={`text-xs ${
                      titleChars > TITLE_LIMIT ? 'text-red-500 font-medium' : 'text-gray-500'
                    }`}>
                      {titleChars}/{TITLE_LIMIT} characters
                      {titleChars > TITLE_LIMIT && ' (limit exceeded)'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="excerpt">
                    Excerpt*
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows="3"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      excerptChars > EXCERPT_LIMIT ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-red'
                    }`}
                    required
                  ></textarea>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Brief summary (max 300 characters)</p>
                    <p className={`text-xs ${
                      excerptChars > EXCERPT_LIMIT ? 'text-red-500 font-medium' : 'text-gray-500'
                    }`}>
                      {excerptChars}/{EXCERPT_LIMIT} characters
                      {excerptChars > EXCERPT_LIMIT && ' (limit exceeded)'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
                    Category*
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="author">
                    Author*
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
                    Image URL*
                  </label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Direct link to image (recommended size: 800x500)</p>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="content">
                    Content*
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows="8"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                    required
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-primary-red focus:ring-primary-red border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-gray-700">
                    Featured News
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-primary-red text-white rounded-md hover:bg-red-600 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Add News'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Only show edit form if mode is 'edit' or 'both' and we're editing a news item */}
      {(mode === 'edit' || mode === 'both') && editingNews && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
            Edit News Item
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
                    Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      titleChars > TITLE_LIMIT ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-600'
                    }`}
                    required
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Max 100 characters</p>
                    <p className={`text-xs ${
                      titleChars > TITLE_LIMIT ? 'text-red-500 font-medium' : 'text-gray-500'
                    }`}>
                      {titleChars}/{TITLE_LIMIT} characters
                      {titleChars > TITLE_LIMIT && ' (limit exceeded)'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="excerpt">
                    Excerpt*
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows="3"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      excerptChars > EXCERPT_LIMIT ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-600'
                    }`}
                    required
                  ></textarea>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Brief summary (max 300 characters)</p>
                    <p className={`text-xs ${
                      excerptChars > EXCERPT_LIMIT ? 'text-red-500 font-medium' : 'text-gray-500'
                    }`}>
                      {excerptChars}/{EXCERPT_LIMIT} characters
                      {excerptChars > EXCERPT_LIMIT && ' (limit exceeded)'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
                    Category*
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="author">
                    Author*
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
                    Image URL*
                  </label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Direct link to image (recommended size: 800x500)</p>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="content">
                    Content*
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows="8"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-gray-700">
                    Featured News
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Update News'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Show a prompt to select a news item when in edit mode but nothing is being edited */}
      {mode === 'edit' && !editingNews && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 mb-10 text-center">
          <div className="text-5xl mb-4 text-indigo-500">
            <i className="fas fa-edit"></i>
          </div>
          <h3 className="text-xl font-medium mb-2 text-indigo-800">Select a News Item to Edit</h3>
          <p className="text-indigo-600 mb-2">
            Please select a news item from the list below to start editing.
          </p>
          <p className="text-sm text-indigo-400">
            Click on the "Edit" button next to any news item in the table below.
          </p>
        </div>
      )}
      
      {/* Show news list if mode is 'edit' or 'both' */}
      {(mode === 'edit' || mode === 'both') && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Existing News</h2>
          
          {allNews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No news items found. Add your first news item above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allNews.map(news => (
                    <tr key={news._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded object-cover" src={news.image} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{news.title}</div>
                            <div className="text-sm text-gray-500">{news.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {news.categoryLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {news.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {news.featured ? (
                          <span className="text-green-500">
                            <i className="fas fa-check-circle"></i>
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            <i className="fas fa-times-circle"></i>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditNews(news)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNews(news._id)}
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
      )}
    </div>
  );
};

export default NewsManagement;