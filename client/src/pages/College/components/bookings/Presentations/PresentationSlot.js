import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../../contexts/AuthContext';
import api from '../../../../../utils/axiosConfig';

const PresentationSlot = () => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [fileInfo, setFileInfo] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // User search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchingUser, setSearchingUser] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);
  const searchDropdownRef = useRef(null);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/presentations/available');
        
        // Log the response data to see what we're working with
        console.log("Presentations API response:", response.data);
        
        if (Array.isArray(response.data)) {
          // Ensure all slot data is properly formatted with required fields
          const processedPresentations = response.data.map(presentation => {
            // Make sure the slots array is always accessible
            const slots = presentation.slots || [];
            
            // Filter to only show available slots
            const availableSlots = Array.isArray(slots) 
              ? slots.filter(slot => !slot.booked)
              : [];
            
            return {
              ...presentation,
              // Properly format the date objects for presentation and registration periods
              presentationPeriod: {
                start: presentation.presentationPeriod?.start ? new Date(presentation.presentationPeriod.start) : null,
                end: presentation.presentationPeriod?.end ? new Date(presentation.presentationPeriod.end) : null
              },
              registrationPeriod: {
                start: presentation.registrationPeriod?.start ? new Date(presentation.registrationPeriod.start) : null,
                end: presentation.registrationPeriod?.end ? new Date(presentation.registrationPeriod.end) : null
              },
              slots: availableSlots.map(slot => ({
                ...slot,
                // Ensure each slot has an id (either from slot.id or slot._id)
                id: slot.id || (slot._id ? slot._id.toString() : null),
                // Ensure time is a proper Date object
                time: slot.time ? new Date(slot.time) : null
              }))
            };
          });
          
          setPresentations(processedPresentations);
        } else {
          console.warn('API did not return an array of presentations:', response.data);
          setPresentations([]);
        }
      } catch (err) {
        console.error('Error fetching presentations:', err);
        setError('Failed to load available presentation slots');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentations();
  }, []);

  // Handle clicks outside of the search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search for users when query changes
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchingUser(true);
    const timer = setTimeout(async () => {
      try {
        const response = await api.get(`/api/auth/search-users?query=${encodeURIComponent(searchQuery)}`);
        setSearchResults(response.data || []);
      } catch (error) {
        console.error('Error searching for users:', error);
        toast.error('Failed to search for users');
      } finally {
        setSearchingUser(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePresentationSelect = (presentation) => {
    setSelectedPresentation(presentation);
    setSelectedSlot(null);
    setTeamMembers([{ 
      id: currentUser._id, 
      name: currentUser.name, 
      email: currentUser.email, 
      rollNumber: currentUser.studentId || '' 
    }]);
    setTeamName('');
    setTopic('');
    setAttachmentFile(null);
    setFileInfo('');
  };
  
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };
  
  const addTeamMember = () => {
    if (teamMembers.length >= selectedPresentation?.teamSizeMax) {
      toast.warning(`Maximum team size is ${selectedPresentation.teamSizeMax}`);
      return;
    }
    
    setTeamMembers([...teamMembers, { id: '', name: '', email: '', rollNumber: '' }]);
    setActiveSearchIndex(teamMembers.length);
    setSearchQuery('');
  };
  
  const removeTeamMember = (index) => {
    // Don't allow removing the current user (first member)
    if (index === 0) return;
    
    const updatedMembers = [...teamMembers];
    updatedMembers.splice(index, 1);
    setTeamMembers(updatedMembers);
  };
  
  const handleTeamMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setTeamMembers(updatedMembers);

    // If we're changing the search field, update the search query
    if (field === 'name' || field === 'email' || field === 'rollNumber') {
      setActiveSearchIndex(index);
      setSearchQuery(value);
      setShowSearchResults(true);
    }
  };

  const handleUserSelect = (user, index) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      rollNumber: user.studentId || '' 
    };
    setTeamMembers(updatedMembers);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAttachmentFile(null);
      setFileInfo('');
      return;
    }

    // Check file size (limit to 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB limit');
      e.target.value = '';
      return;
    }

    setAttachmentFile(file);
    setFileInfo(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  };
  
  const bookSlot = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/college/bookings/presentation-slot' } });
      return;
    }
    
    if (!selectedPresentation) {
      toast.error('Please select a presentation event');
      return;
    }
    
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }
    
    if (selectedPresentation.participationType === 'team') {
      // Validate team size
      if (teamMembers.length < selectedPresentation.teamSizeMin) {
        toast.error(`Minimum team size is ${selectedPresentation.teamSizeMin}`);
        return;
      }
      
      // Validate team name for team presentations
      if (!teamName.trim()) {
        toast.error('Please enter a team name');
        return;
      }
      
      // Validate team members have names, emails and roll numbers
      const emptyNameIndex = teamMembers.findIndex((m, idx) => idx > 0 && !m.name.trim());
      if (emptyNameIndex !== -1) {
        toast.error(`Please enter a name for team member ${emptyNameIndex + 1}`);
        return;
      }

      const emptyEmailIndex = teamMembers.findIndex((m, idx) => idx > 0 && !m.email.trim());
      if (emptyEmailIndex !== -1) {
        toast.error(`Please enter an email for team member ${emptyEmailIndex + 1}`);
        return;
      }

      const emptyRollNumberIndex = teamMembers.findIndex((m, idx) => idx > 0 && !m.rollNumber.trim());
      if (emptyRollNumberIndex !== -1) {
        toast.error(`Please enter a roll number for team member ${emptyRollNumberIndex + 1}`);
        return;
      }
    }
    
    // Validate topic
    if (!topic.trim()) {
      toast.error('Please enter a presentation topic');
      return;
    }

    try {
      setBookingInProgress(true);
      
      // Create form data if there's a file attachment
      let bookingData = {
        presentationId: selectedPresentation._id,
        slotId: selectedSlot.id,
        topic,
        teamMembers: teamMembers,
        teamName: selectedPresentation.participationType === 'team' ? teamName : undefined
      };

      let response;
      
      if (attachmentFile) {
        const formData = new FormData();
        formData.append('file', attachmentFile);
        formData.append('data', JSON.stringify(bookingData));
        
        response = await api.post(`/api/presentations/${selectedPresentation._id}/book-with-file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.post(`/api/presentations/${selectedPresentation._id}/book`, bookingData);
      }
      
      if (response.data.success) {
        toast.success('Presentation slot booked successfully!');
        // Reset form
        setSelectedPresentation(null);
        setSelectedSlot(null);
        navigate('/dashboard');
      } else {
        toast.error(response.data.message || 'Failed to book presentation slot');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book presentation slot');
    } finally {
      setBookingInProgress(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Display booking form if a presentation is selected
  if (selectedPresentation) {
    return (
      <div className="px-6 py-10 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedPresentation(null)}
              className="mr-4 bg-white hover:bg-gray-50 text-gray-700 py-2 px-3 rounded-md transition-colors flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{selectedPresentation.title}</h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start mb-6">
                <div className="md:w-1/2 md:pr-6 mb-6 md:mb-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <i className="fas fa-map-marker-alt mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Venue</p>
                        <p className="text-gray-800">{selectedPresentation.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-calendar-day mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Presentation Period</p>
                        <p className="text-gray-800">
                          {formatDate(selectedPresentation.presentationPeriod.start)} - {formatDate(selectedPresentation.presentationPeriod.end)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-users mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Participation</p>
                        <p className="text-gray-800">
                          {selectedPresentation.participationType === 'individual' ? 'Individual' : `Team (${selectedPresentation.teamSizeMin}-${selectedPresentation.teamSizeMax} members)`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-clock mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Slot Duration</p>
                        <p className="text-gray-800">
                          {selectedPresentation.slotConfig.duration} minutes (with {selectedPresentation.slotConfig.buffer} min buffer)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a Time Slot</h3>
                  
                  {selectedPresentation.slots && selectedPresentation.slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {selectedPresentation.slots.map(slot => (
                        <button
                          key={slot.id}
                          className={`p-2 border rounded-md text-sm ${
                            selectedSlot?.id === slot.id 
                              ? 'bg-blue-50 border-blue-300 text-blue-700' 
                              : slot.booked 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => !slot.booked && handleSlotSelect(slot)}
                          disabled={slot.booked}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {slot.booked && <i className="fas fa-lock text-gray-400"></i>}
                          </div>
                          <div className="text-xs mt-1">
                            {new Date(slot.time).toLocaleDateString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No slots available for booking</p>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Presentation Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Presentation Topic*
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter the topic of your presentation"
                    />
                  </div>
                  
                  {selectedPresentation.participationType === 'team' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team Name*
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your team name"
                      />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {selectedPresentation.participationType === 'team' ? 'Team Members*' : 'Presenter Information'}
                      </label>
                      {selectedPresentation.participationType === 'team' && teamMembers.length < selectedPresentation.teamSizeMax && (
                        <button
                          type="button"
                          onClick={addTeamMember}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          <i className="fas fa-plus mr-1"></i> Add Member
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="flex flex-col space-y-3 border border-gray-200 p-3 rounded-md bg-gray-50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm text-gray-700">
                              {index === 0 ? 'Team Lead (You)' : `Member ${index}`}
                            </span>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => removeTeamMember(index)}
                                className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="relative">
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                onFocus={() => {
                                  setActiveSearchIndex(index);
                                  setShowSearchResults(member.name.length >= 3);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Name"
                                disabled={index === 0}  // First member is always the current user
                              />
                            </div>
                            <div>
                              <input
                                type="email"
                                value={member.email}
                                onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                                onFocus={() => {
                                  setActiveSearchIndex(index);
                                  setShowSearchResults(member.email.length >= 3);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Email"
                                disabled={index === 0}  // First member is always the current user
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={member.rollNumber}
                                onChange={(e) => handleTeamMemberChange(index, 'rollNumber', e.target.value)}
                                onFocus={() => {
                                  setActiveSearchIndex(index);
                                  setShowSearchResults(member.rollNumber.length >= 3);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Roll Number"
                                disabled={index === 0}  // First member is always the current user
                              />
                            </div>
                          </div>
                          
                          {/* User search results dropdown - only show for the active field */}
                          {index === activeSearchIndex && showSearchResults && (
                            <div 
                              ref={searchDropdownRef}
                              className="absolute z-10 mt-1 w-full max-w-md bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
                            >
                              {searchingUser ? (
                                <div className="p-3 text-center text-gray-500">
                                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                                  Searching...
                                </div>
                              ) : searchResults.length > 0 ? (
                                <ul>
                                  {searchResults.map((user) => (
                                    <li 
                                      key={user._id}
                                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                      onClick={() => handleUserSelect(user, index)}
                                    >
                                      <div className="font-medium">{user.name}</div>
                                      <div className="text-sm text-gray-600 flex justify-between">
                                        <span>{user.email}</span>
                                        <span className="text-blue-600">{user.studentId || 'No Roll Number'}</span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : searchQuery.length >= 3 ? (
                                <div className="p-3 text-center text-gray-500">
                                  No users found
                                </div>
                              ) : (
                                <div className="p-3 text-center text-gray-500">
                                  Type at least 3 characters to search
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* File Attachment Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachment (Optional)
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md p-1 focus:outline-none focus:border-blue-500"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                    />
                    {fileInfo && (
                      <div className="mt-1 text-sm text-gray-600 flex items-center">
                        <i className="fas fa-file-alt mr-2"></i>
                        {fileInfo}
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentFile(null);
                            setFileInfo('');
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times-circle"></i>
                        </button>
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 10MB. Allowed types: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR, JPG, PNG
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedPresentation(null)}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={bookSlot}
                disabled={bookingInProgress || !selectedSlot}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {bookingInProgress ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Book Slot
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Available Presentation Events</h2>
            <p className="text-gray-600 max-w-2xl">
              Book available time slots for academic presentations, defense sessions, or project demonstrations
            </p>
          </div>
          <Link 
            to="/college/bookings"
            className="mt-4 md:mt-0 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Bookings
          </Link>
        </div>

        {presentations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden text-center p-12">
            <div className="bg-blue-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-calendar-times text-3xl text-blue-500"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Presentation Events Available</h3>
            <p className="text-gray-600 mb-6">
              There are currently no open presentation events for booking. Please check back later 
              or contact your department coordinator.
            </p>
            <Link 
              to="/college/bookings"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors"
            >
              Return to Bookings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map(presentation => (
              <motion.div 
                key={presentation._id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium py-1 px-2 rounded">
                      {presentation.hostDepartment || 'Academic'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(presentation.presentationPeriod.start).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{presentation.title}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <i className="fas fa-user-tie mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Host</p>
                        <p className="text-gray-800">{presentation.hostName}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-calendar-day mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Registration Period</p>
                        <p className="text-gray-800">
                          {new Date(presentation.registrationPeriod.start).toLocaleDateString()} - {new Date(presentation.registrationPeriod.end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-map-marker-alt mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-800">{presentation.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-calendar-day mt-1 mr-3 text-gray-400"></i>
                      <div>
                        <p className="text-sm text-gray-500">Presentation Period</p>
                        <p className="text-gray-800">
                          {formatDate(presentation.presentationPeriod.start)} - {formatDate(presentation.presentationPeriod.end)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePresentationSelect(presentation)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center font-medium transition-colors"
                  >
                    <i className="fas fa-calendar-plus mr-2"></i>
                    View Available Slots
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationSlot;
