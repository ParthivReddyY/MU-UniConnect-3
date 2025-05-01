import React, { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../contexts/AuthContext';
import api from '../../../../../utils/axiosConfig';
import PresentationCreationForm from './PresentationCreationForm';
import PresentationGrading from './PresentationGrading';
import { Menu, Transition } from '@headlessui/react';

const PresentationManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [presentations, setPresentations] = useState([]);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [showGradingView, setShowGradingView] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [defaultTargetAudience, setDefaultTargetAudience] = useState({
    year: [],
    school: [],
    department: []
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/college/bookings/manage-presentations' } });
      return;
    }

    fetchPresentations();
    loadDefaultTargetAudience();
  }, [currentUser, navigate]);
  
  // Load default target audience settings from localStorage
  const loadDefaultTargetAudience = () => {
    try {
      const savedSettings = localStorage.getItem('presentation_target_audience_settings');
      if (savedSettings) {
        setDefaultTargetAudience(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading target audience settings:', error);
    }
  };

  const fetchPresentations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/presentations/faculty');
      
      if (response.data && Array.isArray(response.data)) {
        // Process slot statistics for each presentation
        const processedPresentations = response.data.map(presentation => {
          // Calculate slot statistics if not already present
          if (!presentation.slots?.totalCount && Array.isArray(presentation.slots)) {
            const totalCount = presentation.slots.length;
            const bookedCount = presentation.slots.filter(slot => 
              slot.status === 'booked' || slot.status === 'in-progress' || slot.status === 'completed'
            ).length;
            
            return {
              ...presentation,
              slots: {
                ...presentation.slots,
                totalCount,
                bookedCount
              }
            };
          }
          return presentation;
        });
        
        setPresentations(processedPresentations);
      } else {
        console.warn("Response data is not an array:", response.data);
        setPresentations([]);
      }
    } catch (error) {
      console.error("Error fetching presentations:", error);
      toast.error(error.response?.data?.message || 'Failed to load presentations');
      setPresentations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePresentation = (newPresentation) => {
    setPresentations(prevPresentations => [newPresentation, ...prevPresentations]);
    setShowCreationForm(false);
    toast.success('Presentation event created successfully!');
  };

  const handleDeletePresentation = async (id) => {
    if (window.confirm('Are you sure you want to delete this presentation event? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/api/presentations/${id}`);
        
        if (response.status === 200 || response.status === 204) {
          setPresentations(prevPresentations => prevPresentations.filter(p => p._id !== id));
          toast.success('Presentation event deleted successfully');
        }
      } catch (error) {
        console.error("Error deleting presentation:", error);
        
        // Provide more specific error messages
        if (error.response?.status === 403) {
          toast.error('You do not have permission to delete this presentation');
        } else {
          toast.error(error.response?.data?.message || 'Failed to delete presentation event');
        }
      }
    }
  };

  const handleGradePresentation = (presentation) => {
    if (!presentation || !presentation._id) {
      toast.error('Unable to access presentation grading. Invalid presentation data.');
      return;
    }
    
    // Navigate to the presentation detail page with grading view active
    navigate(`/college/bookings/presentation/${presentation._id}/details`);
  };

  const handleGradingComplete = () => {
    setShowGradingView(false);
    setSelectedPresentation(null);
    fetchPresentations();
    toast.success('Presentation grading completed');
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
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };

  const getStatusBadge = (presentation) => {
    if (!presentation || !presentation.registrationPeriod || !presentation.presentationPeriod) {
      return null;
    }
    
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

  // Filter presentations based on selected filter
  const filteredPresentations = React.useMemo(() => {
    if (!Array.isArray(presentations)) return [];
    
    return presentations.filter(presentation => {
      if (!presentation || !presentation.presentationPeriod) return false;
      
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
    });
  }, [presentations, activeFilter]);

  // Format date properly for display (without time)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate slot statistics
  const getSlotStats = (presentation) => {
    if (!presentation) return { totalCount: 0, bookedCount: 0 };
    
    // If already calculated
    if (presentation.slots?.totalCount !== undefined && presentation.slots?.bookedCount !== undefined) {
      return {
        totalCount: presentation.slots.totalCount || 0,
        bookedCount: presentation.slots.bookedCount || 0
      };
    }
    
    // Calculate from slots array
    if (Array.isArray(presentation.slots)) {
      const totalCount = presentation.slots.length;
      const bookedCount = presentation.slots.filter(slot => 
        slot.status === 'booked' || slot.status === 'in-progress' || slot.status === 'completed'
      ).length;
      
      return { totalCount, bookedCount };
    }
    
    return { totalCount: 0, bookedCount: 0 };
  };

  const MoreOptionsMenu = ({ presentation, onGrade, onDelete }) => {
    return (
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
            <i className="fas fa-ellipsis-v"></i>
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to={`/college/bookings/presentation/${presentation._id}/details`}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } block px-4 py-2 text-sm text-gray-700`}
                >
                  <i className="fas fa-info-circle mr-2"></i>
                  View Details
                </Link>
              )}
            </Menu.Item>
            {presentation?.presentationPeriod && new Date() >= new Date(presentation.presentationPeriod.start) && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onGrade(presentation)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                  >
                    <i className="fas fa-clipboard-check mr-2"></i>
                    Grade Presentations
                  </button>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(presentation._id);
                  }}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } block w-full text-left px-4 py-2 text-sm text-red-600`}
                >
                  <i className="fas fa-trash-alt mr-2"></i>
                  Delete
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  };

  if (showCreationForm) {
    return (
      <PresentationCreationForm 
        onPresentationCreated={handleCreatePresentation}
        onCancel={() => setShowCreationForm(false)}
        defaultTargetAudience={defaultTargetAudience}
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
              className={`pb-2 px-1 ${activeFilter === 'all' ? 'border-b-2 border-indigo-500 font-medium text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
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
          <div className="space-y-6">
            {filteredPresentations.map(presentation => {
              const slotStats = getSlotStats(presentation);
              return (
                <motion.div
                  key={presentation._id}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Left content with color indicator */}
                    <div className="w-2 md:h-auto bg-indigo-500 flex-shrink-0"></div>
                    
                    {/* Main content area */}
                    <div className="flex-grow p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 hidden md:block">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                                <path d="M6 8h.01M6 12h.01M6 16h.01M18 8h.01M18 12h.01M18 16h.01"></path>
                                <rect x="9" y="7" width="6" height="10" rx="1"></rect>
                              </svg>
                            </div>
                          </div>
                          
                          <div className="md:ml-4">
                            <div className="flex items-center space-x-3">
                              {getStatusBadge(presentation)}
                              <h3 className="text-xl font-semibold text-gray-800">
                                {presentation.title}
                              </h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                                  <p className="text-sm text-gray-500">Period</p>
                                  <p className="text-gray-800">
                                    {formatDate(presentation.presentationPeriod?.start)} - {formatDate(presentation.presentationPeriod?.end)}
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
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                          <MoreOptionsMenu 
                            presentation={presentation} 
                            onGrade={handleGradePresentation}
                            onDelete={handleDeletePresentation}
                          />
                        </div>
                      </div>
                      
                      {/* Progress bar and stats */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Slot Statistics</span>
                          <span className="text-sm text-gray-600">
                            {slotStats.bookedCount} / {slotStats.totalCount} slots booked
                          </span>
                        </div>
                        <div className="bg-gray-100 h-2.5 rounded-full">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ 
                              width: `${slotStats.totalCount ? (slotStats.bookedCount / slotStats.totalCount) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action column */}
                    <div className="bg-gray-50 p-6 flex flex-col justify-center items-center space-y-3 md:w-56">
                      <Link
                        to={`/college/bookings/presentation/${presentation._id}/details`}
                        className="w-full px-4 py-2 bg-indigo-600 text-white text-center rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        <i className="fas fa-info-circle mr-2"></i>
                        View Details
                      </Link>
                      
                      {presentation.presentationPeriod && new Date() >= new Date(presentation.presentationPeriod.start) && (
                        <button
                          onClick={() => handleGradePresentation(presentation)}
                          className="w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
                        >
                          <i className="fas fa-star mr-2"></i>
                          Grade
                        </button>
                      )}
                      
                      <button
                        onClick={() => copyToClipboard(generateShareableLink(presentation._id))}
                        className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-link mr-2"></i>
                        Share Link
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationManagement;
