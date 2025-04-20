import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axiosConfig';

const AdminFeedback = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  });
  
  // Selected feedback for modal view
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Response data for updating feedback
  const [responseMessage, setResponseMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Check if user is authenticated admin on mount
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/admin/feedback' } });
    } else if (!isAdmin()) {
      navigate('/unauthorized');
    } else {
      fetchFeedbackData();
    }
  }, [currentUser, isAdmin, navigate]);

  // Fetch feedback data from API
  const fetchFeedbackData = async () => {
    setIsLoading(true);
    try {
      // Fetch all feedback
      const feedbackResponse = await api.get('/api/feedback');
      setFeedbackItems(feedbackResponse.data.feedback);
      
      // Fetch feedback stats
      const statsResponse = await api.get('/api/feedback/stats');
      setStats({
        total: statsResponse.data.totalFeedback || 0,
        pending: statsResponse.data.statusCounts?.find(item => item._id === 'pending')?.count || 0,
        inProgress: statsResponse.data.statusCounts?.find(item => item._id === 'in-progress')?.count || 0,
        resolved: statsResponse.data.statusCounts?.find(item => item._id === 'resolved')?.count || 0,
        rejected: statsResponse.data.statusCounts?.find(item => item._id === 'rejected')?.count || 0
      });
      
      setError('');
    } catch (err) {
      console.error('Error fetching feedback data:', err);
      setError('Failed to load feedback data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter feedback when activeTab, searchQuery or categoryFilter changes
  useEffect(() => {
    let results = feedbackItems;
    
    // Filter by status
    if (activeTab !== 'all') {
      results = results.filter(item => item.status === activeTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item => 
        (item.subject && item.subject.toLowerCase().includes(query)) || 
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.user?.name && item.user.name.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (categoryFilter) {
      results = results.filter(item => item.category === categoryFilter);
    }
    
    setFilteredItems(results);
  }, [activeTab, feedbackItems, searchQuery, categoryFilter]);
  
  // Get all unique categories
  const categories = [...new Set(feedbackItems.map(item => item.category))];
  
  // Handle viewing feedback details
  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setNewStatus(feedback.status);
    setResponseMessage(feedback.responseMessage || '');
    setShowDetailsModal(true);
  };
  
  // Handle updating feedback status
  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.patch(`/api/feedback/${selectedFeedback._id}/status`, {
        status: newStatus,
        responseMessage: responseMessage
      });
      
      if (response.status === 200) {
        // Update local state
        const updatedItems = feedbackItems.map(item => 
          item._id === selectedFeedback._id ? 
            { ...item, status: newStatus, responseMessage } : 
            item
        );
        
        setFeedbackItems(updatedItems);
        
        // Show success notification
        setNotification({
          show: true,
          type: 'success',
          message: `Feedback status updated to ${newStatus}`
        });
        
        // Close modal
        setShowDetailsModal(false);
        
        // Refresh data to get updated stats
        fetchFeedbackData();
      }
    } catch (err) {
      console.error('Error updating feedback:', err);
      setNotification({
        show: true,
        type: 'error',
        message: err.response?.data?.message || 'Failed to update feedback'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-800 border border-green-300';
      case 'rejected': return 'bg-gray-100 text-gray-800 border border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Website Issue': return 'bg-red-100 text-red-800 border border-red-300';
      case 'Feature Request': return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'Academic Issue': return 'bg-indigo-100 text-indigo-800 border border-indigo-300';
      case 'Campus Services': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'Other': return 'bg-gray-100 text-gray-800 border border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };
  
  // Close notification
  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };
  
  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
              <p className="text-gray-600 mt-2">View and respond to user feedback submissions</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div 
              className={`p-4 rounded-lg mb-6 ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' : 
                'bg-red-100 text-red-800'
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center">
                <span>{notification.message}</span>
                <button 
                  onClick={closeNotification}
                  className="text-sm hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{error}</span>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <button 
                className={`p-4 rounded-lg shadow-sm border ${
                  activeTab === 'all' 
                    ? 'bg-indigo-50 border-indigo-200' 
                    : 'bg-white border-gray-200 hover:bg-indigo-50'
                }`}
                onClick={() => setActiveTab('all')}
              >
                <h3 className="text-lg font-semibold text-gray-700">All</h3>
                <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
              </button>
              
              <button 
                className={`p-4 rounded-lg shadow-sm border ${
                  activeTab === 'pending' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:bg-blue-50'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </button>
              
              <button 
                className={`p-4 rounded-lg shadow-sm border ${
                  activeTab === 'in-progress' 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-white border-gray-200 hover:bg-yellow-50'
                }`}
                onClick={() => setActiveTab('in-progress')}
              >
                <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </button>
              
              <button 
                className={`p-4 rounded-lg shadow-sm border ${
                  activeTab === 'resolved' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:bg-green-50'
                }`}
                onClick={() => setActiveTab('resolved')}
              >
                <h3 className="text-lg font-semibold text-gray-700">Resolved</h3>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </button>
              
              <button 
                className={`p-4 rounded-lg shadow-sm border ${
                  activeTab === 'rejected' 
                    ? 'bg-gray-200 border-gray-300' 
                    : 'bg-white border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('rejected')}
              >
                <h3 className="text-lg font-semibold text-gray-700">Rejected</h3>
                <p className="text-2xl font-bold text-gray-600">{stats.rejected}</p>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title, description, or category..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="absolute right-3 top-2 text-gray-400">
                    <i className="fas fa-search"></i>
                  </span>
                </div>
              </div>
              <div className="md:w-64">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Feedback List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  {activeTab === 'all' ? 'All Feedback' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Feedback`}
                </h2>
              </div>
              
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg 
                    className="w-16 h-16 mx-auto mb-4 text-gray-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <h3 className="text-lg font-medium">No feedback found</h3>
                  <p className="mt-2">
                    {searchQuery || categoryFilter 
                      ? 'Try adjusting your search or filter criteria.' 
                      : `There's no ${activeTab !== 'all' ? activeTab : ''} feedback yet.`}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title & Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((feedback) => (
                        <tr key={feedback._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {feedback.subject || "No Subject"}
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getCategoryColor(feedback.category)}`}>
                                {feedback.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {feedback.isAnonymous ? 'Anonymous' : feedback.user?.name || 'Unknown'}
                              </div>
                              {!feedback.isAnonymous && feedback.contactEmail && (
                                <div className="text-sm text-gray-500">
                                  {feedback.contactEmail}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(feedback.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                              {feedback.status || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => handleViewDetails(feedback)}
                            >
                              View & Respond
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Feedback Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
            <motion.div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <i className="fas fa-comment-dots mr-2"></i>
                  Feedback Details
                </h3>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column */}
                  <div className="md:w-1/2 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <i className="fas fa-info-circle mr-2 text-indigo-500"></i>
                        Feedback Information
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-3">
                        <p>
                          <span className="font-medium">Title:</span> {selectedFeedback.subject || "No Subject"}
                        </p>
                        <p>
                          <span className="font-medium">Category:</span>{' '}
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getCategoryColor(selectedFeedback.category)}`}>
                            {selectedFeedback.category}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Submitted:</span> {formatDate(selectedFeedback.createdAt)}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{' '}
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                            {selectedFeedback.status}
                          </span>
                        </p>
                        {selectedFeedback.rating && (
                          <p>
                            <span className="font-medium">Rating:</span>{' '}
                            <span className="text-amber-500">
                              {'★'.repeat(selectedFeedback.rating)}
                              {'☆'.repeat(5 - selectedFeedback.rating)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <i className="fas fa-user mr-2 text-indigo-500"></i>
                        User Information
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        {selectedFeedback.isAnonymous ? (
                          <p className="italic">Feedback was submitted anonymously</p>
                        ) : (
                          <div className="space-y-2">
                            <p><span className="font-medium">Name:</span> {selectedFeedback.user?.name || 'Not provided'}</p>
                            <p><span className="font-medium">Email:</span> {selectedFeedback.user?.email || 'Not provided'}</p>
                            <p><span className="font-medium">Role:</span> {selectedFeedback.user?.role || 'Not provided'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="md:w-1/2 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <i className="fas fa-comment mr-2 text-indigo-500"></i>
                        Feedback Description
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm max-h-60 overflow-y-auto">
                        <p className="whitespace-pre-wrap">{selectedFeedback.description}</p>
                      </div>
                    </div>
                    
                    {/* Show attachment if any */}
                    {selectedFeedback.attachmentUrl && (
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <i className="fas fa-paperclip mr-2 text-indigo-500"></i>
                          Attachment
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                          <a 
                            href={selectedFeedback.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 flex items-center"
                          >
                            <i className="fas fa-download mr-2"></i>
                            Download Attachment
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Admin Response Form */}
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <i className="fas fa-reply mr-2 text-indigo-500"></i>
                    Admin Response
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Update Status
                      </label>
                      <select
                        className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white appearance-none"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Response Message
                      </label>
                      <textarea
                        className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        rows="4"
                        placeholder="Add your response to this feedback..."
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDetailsModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateFeedback}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Feedback'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFeedback;
