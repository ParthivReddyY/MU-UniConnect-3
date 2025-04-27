import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../contexts/AuthContext';
import api from '../../../../../utils/axiosConfig';
import PresentationCreationForm from './PresentationCreationForm';
import PresentationGrading from './PresentationGrading';

const PresentationManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [presentations, setPresentations] = useState([]);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [showGradingView, setShowGradingView] = useState(false);
  const [activeFilter, setActiveFilter] = useState('upcoming');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/college/bookings/manage-presentations' } });
      return;
    }

    fetchPresentations();
  }, [currentUser, navigate]);

  const fetchPresentations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/presentations/host');
      // Ensure we're setting an array even if the API returns something unexpected
      setPresentations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching presentations:', error);
      toast.error('Failed to load presentations');
      setPresentations([]); // Ensure we always have an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePresentation = (newPresentation) => {
    setPresentations([newPresentation, ...presentations]);
    setShowCreationForm(false);
    toast.success('Presentation event created successfully!');
  };

  // Remove unused function since we're not currently implementing edit functionality
  // If you need this function later, you can uncomment it
  /* 
  const handleEditPresentation = (updatedPresentation) => {
    setPresentations(presentations.map(p => 
      p._id === updatedPresentation._id ? updatedPresentation : p
    ));
    setSelectedPresentation(null);
    toast.success('Presentation event updated successfully!');
  };
  */

  const handleDeletePresentation = async (id) => {
    if (window.confirm('Are you sure you want to delete this presentation event? This action cannot be undone.')) {
      try {
        await api.delete(`/api/presentations/${id}`);
        setPresentations(presentations.filter(p => p._id !== id));
        toast.success('Presentation event deleted successfully');
      } catch (error) {
        console.error('Error deleting presentation:', error);
        toast.error('Failed to delete presentation event');
      }
    }
  };

  const handleGradePresentation = (presentation) => {
    setSelectedPresentation(presentation);
    setShowGradingView(true);
  };

  const handleGradingComplete = () => {
    setShowGradingView(false);
    setSelectedPresentation(null);
    fetchPresentations();
  };

  const generateShareableLink = (presentationId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/college/bookings/presentation/${presentationId}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy link');
      });
  };

  const getStatusBadge = (presentation) => {
    const now = new Date();
    const registrationStart = new Date(presentation.registrationPeriod.start);
    const registrationEnd = new Date(presentation.registrationPeriod.end);
    const presentationStart = new Date(presentation.presentationPeriod.start);
    const presentationEnd = new Date(presentation.presentationPeriod.end);
    
    if (now < registrationStart) {
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Upcoming</span>;
    } else if (now >= registrationStart && now <= registrationEnd) {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Registration Open</span>;
    } else if (now > registrationEnd && now < presentationStart) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Registration Closed</span>;
    } else if (now >= presentationStart && now <= presentationEnd) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">In Progress</span>;
    } else {
      return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>;
    }
  };

  const filteredPresentations = Array.isArray(presentations) ? presentations.filter(presentation => {
    const now = new Date();
    const presentationStart = new Date(presentation.presentationPeriod.start);
    const presentationEnd = new Date(presentation.presentationPeriod.end);
    
    switch (activeFilter) {
      case 'upcoming':
        return presentationStart > now;
      case 'ongoing':
        return now >= presentationStart && now <= presentationEnd;
      case 'past':
        return presentationEnd < now;
      default:
        return true;
    }
  }) : [];

  if (showCreationForm) {
    return (
      <PresentationCreationForm 
        onPresentationCreated={handleCreatePresentation}
        onCancel={() => setShowCreationForm(false)}
      />
    );
  }

  if (showGradingView && selectedPresentation) {
    return (
      <PresentationGrading 
        presentation={selectedPresentation}
        onClose={handleGradingComplete}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Presentations</h1>
            <p className="text-gray-600 mt-1">Create and manage student presentation events</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreationForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Create New Event
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              className={`pb-2 px-1 ${activeFilter === 'upcoming' ? 'border-b-2 border-indigo-500 font-medium text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`pb-2 px-1 ${activeFilter === 'ongoing' ? 'border-b-2 border-indigo-500 font-medium text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveFilter('ongoing')}
            >
              Ongoing
            </button>
            <button
              className={`pb-2 px-1 ${activeFilter === 'past' ? 'border-b-2 border-indigo-500 font-medium text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveFilter('past')}
            >
              Past
            </button>
            <button
              className={`pb-2 px-1 ${activeFilter === 'all' ? 'border-b-2 border-indigo-500 font-medium text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : !Array.isArray(presentations) || filteredPresentations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-calendar-times text-indigo-600 text-2xl"></i>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">No Presentations Found</h4>
            <p className="text-gray-600 mb-6">
              {activeFilter === 'upcoming' && "You don't have any upcoming presentation events."}
              {activeFilter === 'ongoing' && "You don't have any ongoing presentation events."}
              {activeFilter === 'past' && "You don't have any past presentation events."}
              {activeFilter === 'all' && "You haven't created any presentation events yet."}
            </p>
            <button
              onClick={() => setShowCreationForm(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresentations.map(presentation => (
              <motion.div
                key={presentation._id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-xs font-medium">
                      {getStatusBadge(presentation)}
                    </div>
                    <div className="relative">
                      <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      {/* Actions menu could be added here */}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {presentation.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <i className="fas fa-map-marker-alt mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Venue</p>
                        <p className="text-gray-800">{presentation.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-calendar-day mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Presentation Period</p>
                        <p className="text-gray-800">
                          {new Date(presentation.presentationPeriod.start).toLocaleDateString()} - {new Date(presentation.presentationPeriod.end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-users mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Participation</p>
                        <p className="text-gray-800">
                          {presentation.participationType === 'individual' ? 'Individual' : `Team (${presentation.teamSizeMin}-${presentation.teamSizeMax} members)`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Slot Statistics</span>
                    </div>
                    
                    <div className="bg-gray-100 h-2 rounded-full">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${presentation.slots?.bookedCount ? (presentation.slots.bookedCount / presentation.slots.totalCount) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-600">
                        {presentation.slots?.bookedCount || 0} booked
                      </span>
                      <span className="text-gray-600">
                        {presentation.slots?.totalCount || 0} total
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => copyToClipboard(generateShareableLink(presentation._id))}
                      className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      <i className="fas fa-link mr-1"></i>
                      Share
                    </button>
                    
                    <Link
                      to={`/college/bookings/presentation/${presentation._id}/details`}
                      className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      <i className="fas fa-info-circle mr-1"></i>
                      Details
                    </Link>
                    
                    {new Date() >= new Date(presentation.presentationPeriod.start) && (
                      <button
                        onClick={() => handleGradePresentation(presentation)}
                        className="inline-flex items-center text-xs text-green-600 hover:text-green-800"
                      >
                        <i className="fas fa-star mr-1"></i>
                        Grade
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeletePresentation(presentation._id)}
                      className="inline-flex items-center text-xs text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-trash-alt mr-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationManagement;
