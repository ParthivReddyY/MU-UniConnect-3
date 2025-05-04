import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../../utils/axiosConfig';
import { useAuth } from '../../../../../contexts/AuthContext';
import MyBookings from './MyBookings';

const PresentationSlot = () => {
  // Add active tab state
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'bookings'
  
  // Core state variables
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [existingBooking, setExistingBooking] = useState(null);
  
  // Form data
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [fileInfo, setFileInfo] = useState('');
  
  // User search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchingUser, setSearchingUser] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);
  const searchDropdownRef = useRef(null);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Add countdown timer state
  const [countdownTime, setCountdownTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isRegOpen, setIsRegOpen] = useState(true);
  const countdownTimerRef = useRef(null);

  // Fetch available presentations
  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/presentations/available');
        
        if (Array.isArray(response.data)) {
          const processedPresentations = response.data.map(presentation => ({
            ...presentation,
            presentationPeriod: {
              start: presentation.presentationPeriod?.start ? new Date(presentation.presentationPeriod.start) : null,
              end: presentation.presentationPeriod?.end ? new Date(presentation.presentationPeriod.end) : null
            },
            registrationPeriod: {
              start: presentation.registrationPeriod?.start ? new Date(presentation.registrationPeriod.start) : null,
              end: presentation.registrationPeriod?.end ? new Date(presentation.registrationPeriod.end) : null
            },
            slots: (presentation.slots || [])
              .filter(slot => !slot.booked)
              .map(slot => ({
                ...slot,
                id: slot.id || (slot._id ? slot._id.toString() : null),
                time: slot.time ? new Date(slot.time) : null
              }))
          }));
          
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

    if (activeTab === 'book') {
      fetchPresentations();
    }
  }, [activeTab]);

  // Close search dropdown when clicking outside
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
      setShowSearchResults(false);
      return;
    }
    setSearchingUser(true);
    setShowSearchResults(true);
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
    setDescription('');
    setAttachmentFile(null);
    setFileInfo('');
    // Start countdown timer for registration end
    startCountdownTimer(presentation.registrationPeriod.end);
  };

  // Function to start countdown timer
  const startCountdownTimer = (endDate) => {
    // Clear any existing timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    // Update timer immediately
    updateCountdown(endDate);
    // Set interval to update every second
    countdownTimerRef.current = setInterval(() => {
      updateCountdown(endDate);
    }, 1000);
  };

  // Function to update countdown values
  const updateCountdown = (endDate) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const timeLeft = end - now;
    if (timeLeft <= 0) {
      // Registration period has ended
      setIsRegOpen(false);
      setCountdownTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      clearInterval(countdownTimerRef.current);
      return;
    }
    setIsRegOpen(true);
    // Calculate time components
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    setCountdownTime({ days, hours, minutes, seconds });
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const addTeamMember = () => {
    if (!selectedPresentation) return;
    
    if (teamMembers.length >= selectedPresentation.teamSizeMax) {
      toast.warning(`Maximum team size is ${selectedPresentation.teamSizeMax}`);
      return;
    }
    setTeamMembers([...teamMembers, { id: '', name: '', email: '', rollNumber: '' }]);
    setActiveSearchIndex(teamMembers.length);
    setSearchQuery('');
  };

  const removeTeamMember = (index) => {
    const updatedMembers = [...teamMembers];
    updatedMembers.splice(index, 1);
    setTeamMembers(updatedMembers);
  };

  const handleTeamMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setTeamMembers(updatedMembers);
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

  // New function to make a team member the team lead
  const makeTeamLead = (index) => {
    if (index === 0) return; // Already team lead
    
    const updatedMembers = [...teamMembers];
    const currentLead = updatedMembers[0];
    const newLead = updatedMembers[index];
    
    // Swap positions
    updatedMembers[0] = newLead;
    updatedMembers[index] = currentLead;
    
    setTeamMembers(updatedMembers);
    toast.info(`${newLead.name} is now the team lead`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAttachmentFile(null);
      setFileInfo('');
      return;
    }
    // Check file size (limit to 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB limit');
      e.target.value = '';
      return;
    }
    setAttachmentFile(file);
    setFileInfo(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  };

  const removeFile = () => {
    setAttachmentFile(null);
    setFileInfo('');
  };

  // Format date for display with time
  const formatDateWithTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user has already booked a slot
  useEffect(() => {
    // Check if current user already has a booking
    const checkExistingBooking = async () => {
      if (!currentUser) return;
      try {
        const response = await api.get('/api/presentations/my-bookings');
        if (response.data && response.data.length > 0) {
          setExistingBooking(response.data[0]);
        }
      } catch (err) {
        console.error('Error checking existing bookings:', err);
      }
    };
    checkExistingBooking();
  }, [currentUser]);

  // Validate team members to check if any of them have already booked
  const validateTeamMembers = async () => {
    if (teamMembers.length <= 1) return true; // Only the current user, which will be checked separately
    
    try {
      // Get emails of team members excluding the current user
      const teamEmails = teamMembers
        .filter(member => member.email !== currentUser.email)
        .map(member => member.email);
      if (teamEmails.length === 0) return true;
      const response = await api.post('/api/presentations/check-team-bookings', {
        emails: teamEmails,
        presentationId: selectedPresentation._id
      });
      if (response.data.hasBookings) {
        toast.error(`One or more team members already have a booking: ${response.data.bookedMembers.join(', ')}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error validating team members:', err);
      toast.error('Error checking team members booking status. Please try again.');
      return false;
    }
  };

  // Update the validateBookingData function to check for existing bookings
  const validateBookingData = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/college/bookings/presentation-slot' } });
      return false;
    }
    if (existingBooking) {
      // If user already has a booking, let them know
      toast.error('You already have a booking for a presentation. Please check your bookings.');
      return false;
    }
    if (!selectedPresentation) {
      toast.error('Please select a presentation event');
      return false;
    }
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return false;
    }
    // Check if any team member already has a booking
    const teamMembersValid = await validateTeamMembers();
    if (!teamMembersValid) {
      return false;
    }
    // Validate team size
    if (selectedPresentation.participationType === 'team') {
      if (teamMembers.length < selectedPresentation.teamSizeMin) {
        toast.error(`Minimum team size is ${selectedPresentation.teamSizeMin}`);
        return false;
      }
      // Validate team name for team presentations
      if (!teamName.trim()) {
        toast.error('Please enter a team name');
        return false;
      }
      // Validate team members have names, emails and roll numbers
      const emptyNameIndex = teamMembers.findIndex((m, idx) => idx > 0 && !m.name.trim());
      if (emptyNameIndex !== -1) {
        toast.error(`Please enter a name for team member ${emptyNameIndex + 1}`);
        return false;
      }
      const emptyEmailIndex = teamMembers.findIndex((m, idx) => idx > 0 && !m.email.trim());
      if (emptyEmailIndex !== -1) {
        toast.error(`Please enter an email for team member ${emptyEmailIndex + 1}`);
        return false;
      }
      const emptyRollNumberIndex = teamMembers.findIndex((m, idx) => idx > 0 && !m.rollNumber.trim());
      if (emptyRollNumberIndex !== -1) {
        toast.error(`Please enter a roll number for team member ${emptyRollNumberIndex + 1}`);
        return false;
      }
    }
    // Validate topic
    if (!topic.trim()) {
      toast.error('Please enter a presentation topic');
      return false;
    }
    return true;
  };

  // Update the bookSlot function to switch tabs instead of navigating away
  const bookSlot = async () => {
    const isValid = await validateBookingData();
    if (!isValid) return;

    try {
      setBookingInProgress(true);
      
      // Create booking data
      let bookingData = {
        presentationId: selectedPresentation._id,
        slotId: selectedSlot.id,
        topic,
        description,
        teamMembers: teamMembers.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          rollNumber: member.rollNumber  // Make sure rollNumber is explicitly included
        })),
        teamName: selectedPresentation.participationType === 'team' ? teamName : undefined
      };

      let response;
      
      if (attachmentFile) {
        const formData = new FormData();
        formData.append('file', attachmentFile);
        
        // Convert booking data to JSON string and append to form
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
        
        // Instead of navigating away, reset selection and switch to bookings tab
        setSelectedPresentation(null);
        setActiveTab('bookings');
      } else {
        toast.error(response.data.message || 'Failed to book presentation slot');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book presentation slot');
    } finally {
      setBookingInProgress(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Add compact time left display function
  const getTimeLeft = (targetDate) => {
    if (!targetDate) return { text: 'N/A', className: 'text-gray-500', values: { days: 0, hours: 0, minutes: 0, seconds: 0 } };
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;
    // If date is in the past
    if (diff < 0) return { 
      text: 'Closed', 
      className: 'text-red-600', 
      values: { days: 0, hours: 0, minutes: 0, seconds: 0 } 
    };
    // Calculate remaining time
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    let text = '';
    if (days > 0) {
      text = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      text = `${minutes}m ${seconds}s`;
    }
    // Change color based on urgency
    let className = 'text-green-600';
    if (days === 0 && hours < 12) {
      className = 'text-orange-600';
    }
    if (days === 0 && hours < 3) {
      className = 'text-red-600 font-semibold';
    }
    return { 
      text, 
      className, 
      values: { days, hours, minutes, seconds }
    };
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading presentation events...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md">
          <div className="flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Container with tabs
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="w-full bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Presentation Management</h1>
          <p className="text-blue-100 mt-2">Book or view your presentation slots</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'book' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('book')}
          >
            <i className="fas fa-calendar-plus mr-2"></i>
            Book Presentation
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'bookings' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fas fa-list-ul mr-2"></i>
            My Bookings
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 pb-8">
        {activeTab === 'bookings' ? (
          /* Embed the MyBookings component directly */
          <MyBookings />
        ) : selectedPresentation ? (
          /* Render booking form for selected presentation */
          <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="w-full bg-blue-600 text-white py-8">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <button 
                      onClick={() => setSelectedPresentation(null)}
                      className="mb-4 md:mb-0 inline-flex items-center px-4 py-2 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Events
                    </button>
                  </div>
                  <div className="text-center md:text-right">
                    <h1 className="text-2xl md:text-3xl font-bold">{selectedPresentation.title}</h1>
                    <p className="text-blue-100 mt-1">Book your presentation slot</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
              <div className="max-w-full mx-auto">
                {/* Event Information - Full Width Horizontal Section */}
                <div className="w-full bg-white rounded-xl shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Event Information
                  </h2>

                  {/* Countdown Timer - New Component */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                      <div className="mb-3 md:mb-0">
                        <h3 className="text-lg font-semibold text-blue-800">Registration Closing In:</h3>
                        <p className={`text-sm ${isRegOpen ? "text-blue-600" : "text-red-600"}`}>
                          {isRegOpen ? "Don't miss out! Register now." : "Registration period has ended."}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <div className="flex flex-col items-center">
                          <div className="bg-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-blue-600 shadow-sm">
                            {countdownTime.days}
                          </div>
                          <span className="text-xs text-gray-600 mt-1">Days</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="bg-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-blue-600 shadow-sm">
                            {countdownTime.hours}
                          </div>
                          <span className="text-xs text-gray-600 mt-1">Hours</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="bg-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-blue-600 shadow-sm">
                            {countdownTime.minutes}
                          </div>
                          <span className="text-xs text-gray-600 mt-1">Minutes</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="bg-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-blue-600 shadow-sm">
                            {countdownTime.seconds}
                          </div>
                          <span className="text-xs text-gray-600 mt-1">Seconds</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Venue */}
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Venue</p>
                        <p className="font-medium text-gray-800">{selectedPresentation.venue}</p>
                      </div>
                    </div>

                    {/* Presentation Period */}
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Presentation Period</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(selectedPresentation.presentationPeriod.start)} - 
                          {formatDate(selectedPresentation.presentationPeriod.end)}
                        </p>
                      </div>
                    </div>

                    {/* Participation Type */}
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Participation</p>
                        <div className="font-medium text-gray-800 flex items-center">
                          {selectedPresentation.participationType === 'individual' ? 'Individual' : 
                            <span className="flex items-center">
                              Team
                              <span className="ml-2 text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {selectedPresentation.teamSizeMin}-{selectedPresentation.teamSizeMax} members
                              </span>
                            </span>
                          }
                        </div>
                      </div>
                    </div>

                    {/* Slot Duration */}
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Slot Duration</p>
                        <p className="font-medium text-gray-800">
                          {selectedPresentation.slotConfig.duration} minutes
                          <span className="text-sm text-gray-500 ml-2">
                            (with {selectedPresentation.slotConfig.buffer} min buffer)
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Event Description - Spans full width */}
                    {selectedPresentation.description && (
                      <div className="md:col-span-4 pt-4 mt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-gray-700">{selectedPresentation.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Slot Selection - Full Width Section */}
                <div className="w-full bg-white rounded-xl shadow-md overflow-hidden mb-6">
                  <div className="px-6 py-4 bg-blue-600 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Select a Time Slot
                    </h3>
                  </div>
                  <div className="p-6">
                    {selectedPresentation.slots && selectedPresentation.slots.length > 0 ? (
                      <div className="mb-6">
                        <div className="overflow-x-auto pb-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                            {selectedPresentation.slots.map(slot => (
                              <button
                                key={slot.id}
                                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all
                                  ${selectedSlot?.id === slot.id 
                                    ? 'border-blue-600 bg-blue-50' 
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}`
                                }
                                onClick={() => handleSlotSelect(slot)}
                              >
                                <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 
                                  ${selectedSlot?.id === slot.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`
                                }>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div className="font-semibold text-gray-800">
                                  {new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {new Date(slot.time).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                {selectedSlot?.id === slot.id && (
                                  <div className="mt-2 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        {selectedSlot && (
                          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">Selected Time Slot</h4>
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-3 rounded-md mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800 text-lg">
                                  {new Date(selectedSlot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-gray-600">
                                  {new Date(selectedSlot.time).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="text-gray-500">No slots available for booking</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Presentation Information Form - Full Width */}
                <div className="w-full bg-white rounded-xl shadow-md overflow-hidden mb-6">
                  <div className="px-6 py-4 bg-blue-600 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Presentation Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Topic and Team Name */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Presentation Topic<span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter the topic of your presentation"
                          />
                        </div>
                        {selectedPresentation.participationType === 'team' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Team Name<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={teamName}
                              onChange={(e) => setTeamName(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter your team name"
                            />
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Briefly describe your presentation..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members Section - Full Width */}
                <div className="w-full bg-white rounded-xl shadow-md overflow-hidden mb-6">
                  <div className="px-6 py-4 bg-blue-600 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {selectedPresentation.participationType === 'team' ? 'Team Members' : 'Presenter Information'}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            {selectedPresentation.participationType === 'team' ? 'Team Members' : 'Presenter Information'}
                            <span className="text-red-500">*</span>
                          </span>
                          {/* Note about searching */}
                          <div className="mt-1 text-sm text-blue-600 bg-blue-50 p-2 rounded-md inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Type to search for team members by name or email
                          </div>
                        </div>
                        {selectedPresentation.participationType === 'team' && (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-4">
                              {teamMembers.length} of {selectedPresentation.teamSizeMax} members
                            </span>
                            
                            {teamMembers.length < selectedPresentation.teamSizeMax && (
                              <button
                                type="button"
                                onClick={addTeamMember}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Member
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Team size indicator */}
                      {selectedPresentation.participationType === 'team' && (
                        <div className="mb-4">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${(teamMembers.length / selectedPresentation.teamSizeMax) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Min: {selectedPresentation.teamSizeMin}</span>
                            <span>Max: {selectedPresentation.teamSizeMax}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Team members list with team lead indicator */}
                    <div className="space-y-3">
                      {teamMembers.map((member, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                          {/* Team lead indicator */}
                          {index === 0 && (
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-sm font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Team Lead
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Enter name"
                                disabled={index === 0}
                                onFocus={() => {
                                  if (index > 0) {
                                    setActiveSearchIndex(index);
                                    setShowSearchResults(true);
                                  }
                                }}
                              />
                              {/* Search Results Dropdown */}
                              {showSearchResults && activeSearchIndex === index && (
                                <div ref={searchDropdownRef} className="absolute z-10 mt-1 w-64 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto">
                                  {searchingUser ? (
                                    <div className="px-4 py-3 text-center text-gray-500">
                                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                                      Searching...
                                    </div>
                                  ) : searchResults.length > 0 ? (
                                    searchResults.map((user) => (
                                      <div
                                        key={user._id}
                                        className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                                        onClick={() => handleUserSelect(user, index)}
                                      >
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-4 py-2 text-gray-500 text-center">No users found</div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                              <input
                                type="email"
                                value={member.email}
                                onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Enter email"
                                disabled={index === 0}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Roll Number</label>
                              <div className="flex">
                                <input
                                  type="text"
                                  value={member.rollNumber}
                                  onChange={(e) => handleTeamMemberChange(index, 'rollNumber', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  placeholder="Enter roll number"
                                  disabled={index === 0}
                                />
                                <div className="flex ml-2">
                                  {index > 0 && (
                                    <>
                                      {/* Make team lead button */}
                                      <button
                                        type="button"
                                        onClick={() => makeTeamLead(index)}
                                        title="Make team lead"
                                        className="text-blue-600 hover:text-blue-800 mr-1"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                      </button>
                                      {/* Remove member button */}
                                      <button
                                        type="button"
                                        onClick={() => removeTeamMember(index)}
                                        title="Remove member"
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* File Attachment Section - Full Width */}
                <div className="w-full bg-white rounded-xl shadow-md overflow-hidden mb-6">
                  <div className="px-6 py-4 bg-blue-600 text-white">
                    <h3 className="text-lg font-semibold flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Attachment (Optional)
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, PPTX, JPG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                    
                    {fileInfo && (
                      <div className="mt-3 flex items-center p-2 bg-blue-50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700 flex-1">{fileInfo}</span>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with action buttons */}
                <div className="w-full bg-white rounded-xl shadow-md mt-6 px-6 py-4 flex justify-end">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedPresentation(null)}
                      className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={bookSlot}
                      disabled={bookingInProgress || !selectedSlot}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center"
                    >
                      {bookingInProgress ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Booking...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Book Slot
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        ) : (
          /* Render presentation list */
          <div className="space-y-4">
            {existingBooking && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You already have a booked presentation. 
                      <button 
                        onClick={() => setActiveTab('bookings')} 
                        className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1"
                      >
                        View your bookings
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {presentations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No Available Presentations</h2>
                  <p className="text-gray-600">There are currently no presentation events available for booking.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {presentations.map(presentation => (
                  <div key={presentation._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
                    <div className="flex flex-col md:flex-row">
                      {/* Left color indicator */}
                      <div className="w-full md:w-2 h-2 md:h-auto bg-blue-600"></div>
                      
                      {/* Content */}
                      <div className="flex-grow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">{presentation.title}</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* Venue */}
                          <div className="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-700">{presentation.venue}</span>
                          </div>
                          
                          {/* Date */}
                          <div className="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700">
                              {formatDate(presentation.presentationPeriod.start)} - 
                              {formatDate(presentation.presentationPeriod.end)}
                            </span>
                          </div>
                          
                          {/* Type */}
                          <div className="flex">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-gray-700">
                              {presentation.participationType === 'individual' ? 'Individual' : 
                                `Team (${presentation.teamSizeMin}-${presentation.teamSizeMax} members)`
                              }
                            </span>
                          </div>
                        </div>

                        {/* Available slots with progress bar */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Available Slots</span>
                            <span className="text-sm font-medium text-blue-600">{presentation.slots.length} slots</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Button Column */}
                      <div className="p-6 bg-gray-50 flex items-center justify-center">
                        <button   
                          onClick={() => handlePresentationSelect(presentation)}
                          className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Book a Slot
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
                      <div className="flex flex-wrap items-center text-sm">
                        <span className="text-gray-600 mr-2">Registration Period:</span>
                        <span className="font-medium text-gray-800">
                          {formatDateWithTime(presentation.registrationPeriod.start)} - 
                          {formatDateWithTime(presentation.registrationPeriod.end)}
                        </span>

                        {/* Revised compact countdown timer */}
                        {new Date() < new Date(presentation.registrationPeriod.end) ? (
                          <div className="ml-2 bg-blue-50 rounded-md p-2 inline-block">
                            <span className="text-blue-700 font-medium text-xs block mb-1">Registration closes in:</span>
                            <div className="flex space-x-1">
                              {(() => {
                                const timeLeft = getTimeLeft(presentation.registrationPeriod.end);
                                return (
                                  <>
                                    <div className="flex flex-col items-center">
                                      <div className="bg-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-blue-600 shadow-sm">
                                        {timeLeft.values.days}
                                      </div>
                                      <span className="text-[10px] text-gray-600 mt-0.5">D</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <div className="bg-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-blue-600 shadow-sm">
                                        {timeLeft.values.hours}
                                      </div>
                                      <span className="text-[10px] text-gray-600 mt-0.5">H</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <div className="bg-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-blue-600 shadow-sm">
                                        {timeLeft.values.minutes}
                                      </div>
                                      <span className="text-[10px] text-gray-600 mt-0.5">M</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <div className="bg-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-blue-600 shadow-sm">
                                        {timeLeft.values.seconds}
                                      </div>
                                      <span className="text-[10px] text-gray-600 mt-0.5">S</span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        ) : (
                          <span className="ml-2 px-3 py-1 bg-red-50 rounded-md text-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-600">Registration Closed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PresentationSlot;
