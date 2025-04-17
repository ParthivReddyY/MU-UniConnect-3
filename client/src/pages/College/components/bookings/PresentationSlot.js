import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PresentationService from '../../../../services/PresentationService';
import api from '../../../../utils/axiosConfig';
import { useAuth } from '../../../../contexts/AuthContext';

const PresentationSlot = () => {
  // Get current user data from auth context
  const { currentUser } = useAuth();
  
  // State variables
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventList, setShowEventList] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Team members for team presentations - initialize with current user data
  const [teamMembers, setTeamMembers] = useState([
    { 
      name: currentUser?.name || '', 
      email: currentUser?.email || '', 
      id: currentUser?._id || '',
      rollNumber: currentUser?.studentId || '',
      department: currentUser?.department || ''
    }
  ]);
  
  // Search state for finding students
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState(null); // Track which team member field is being searched

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    school: '',
    department: ''
  });

  // Add cleanup effect to ensure navbar is restored when component unmounts
  useEffect(() => {
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);

  // Load presentation events and user's bookings on mount
  useEffect(() => {
    fetchEventData();
  }, []);

  // Enhanced useEffect for debugging and reliable team member initialization
  useEffect(() => {
    console.log("Current user data in team member setup:", currentUser);
    console.log("Current user ID: ", currentUser?._id);
    console.log("Current user studentId: ", currentUser?.studentId);
    
    if (currentUser) {
      const userId = currentUser._id || '';
      console.log("Using user ID for team member:", userId);
      
      setTeamMembers([
        { 
          name: currentUser.name || '', 
          email: currentUser.email || '', 
          id: userId, // Ensure we use _id as the ID
          rollNumber: currentUser.studentId || '',
          department: currentUser.department || ''
        }
      ]);
    }
  }, [currentUser]);

  // Filter events based on search and filters
  const filterEvents = useCallback(() => {
    if (!events.length) return;
    let results = [...events];
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.venue.toLowerCase().includes(searchTerm) ||
        event.hostName?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by school
    if (filters.school) {
      results = results.filter(event => 
        event.targetSchool === filters.school || 
        event.targetSchool === 'All Schools'
      );
    }
    
    // Filter by department
    if (filters.department) {
      results = results.filter(event => 
        event.targetDepartment === filters.department || 
        event.targetDepartment === 'All Departments'
      );
    }
    
    setFilteredEvents(results);
  }, [filters, events]);

  // Filter events when filters change
  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  // Fetch presentation events and user's bookings
  const fetchEventData = async () => {
    setIsLoading(true);
    try {
      // Fetch available presentation events
      const availableEvents = await PresentationService.getAvailableEvents();
      setEvents(availableEvents);
      setFilteredEvents(availableEvents);
      
      // Fetch user's bookings
      const userBookings = await PresentationService.getUserBookings();
      setMyBookings(userBookings);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load presentation events');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'EEE, MMM d, yyyy');
  };

  // Check if a date is in the past
  const isPastDate = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Group slots by date
  const groupSlotsByDate = (slots) => {
    const groupedSlots = {};
    
    slots.forEach(slot => {
      const date = format(new Date(slot.date), 'yyyy-MM-dd');
      if (!groupedSlots[date]) {
        groupedSlots[date] = [];
      }
      groupedSlots[date].push(slot);
    });
    
    // Sort slots within each date
    Object.keys(groupedSlots).forEach(date => {
      groupedSlots[date].sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
    });
    
    return groupedSlots;
  };

  // View event details and its slots
  const viewEventDetails = async (event) => {
    setIsLoading(true);
    try {
      // Fetch all slots for this event
      const eventSlots = event.slots || await PresentationService.getSlotsByEventId(event.title);
      
      // Set selected event and its slots
      setSelectedEvent(event);
      setSlots(eventSlots);
      setShowEventList(false);
    } catch (error) {
      console.error('Error fetching event slots:', error);
      toast.error('Failed to load event slots');
    } finally {
      setIsLoading(false);
    }
  };

  // Back to events list
  const goBackToEvents = () => {
    setSelectedEvent(null);
    setSelectedSlot(null);
    setShowEventList(true);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      date: '',
      school: '',
      department: ''
    });
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Improve the initializeBooking function to better handle user ID
  const initializeBooking = (slot) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
    
    // Hide navbar when booking form is shown
    document.body.classList.add('hide-navbar');
    
    // If it's a team presentation, initialize team members with current user data
    if (slot.presentationType === 'team' && currentUser) {
      console.log("Initializing booking with current user:", currentUser);
      console.log("Current user ID being used:", currentUser._id);
      console.log("Current user studentId:", currentUser.studentId);
      
      // Try to get studentId from multiple possible sources
      const studentIdValue = currentUser.studentId || currentUser.rollNumber || '';
      console.log("Student ID being used:", studentIdValue);
      
      setTeamMembers([
        { 
          name: currentUser.name || '', 
          email: currentUser.email || '', 
          id: currentUser._id, // Explicitly use _id without fallback to ensure we have it
          rollNumber: studentIdValue,
          department: currentUser.department || ''
        }
      ]);
      
      // If student ID is missing, show alert
      if (!studentIdValue && slot.presentationType === 'team') {
        toast.warning("Please update your profile with your student ID before booking", {
          autoClose: 5000
        });
      }
    }
  };

  // Close booking form
  const closeBookingForm = () => {
    setSelectedSlot(null);
    setShowBookingForm(false);
    setTeamMembers([
      { name: '', email: '', id: '', rollNumber: '', department: '' }
    ]);
    
    // Show navbar again 
    document.body.classList.remove('hide-navbar');
  };

  // Add team member field
  const addTeamMember = () => {
    if (teamMembers.length < (selectedSlot?.maxTeamMembers || 5)) {
      setTeamMembers([...teamMembers, { name: '', email: '', id: '', rollNumber: '', department: '' }]);
    } else {
      toast.warning(`Maximum team size is ${selectedSlot.maxTeamMembers} members`);
    }
  };

  // Remove team member field
  const removeTeamMember = (index) => {
    if (teamMembers.length > (selectedSlot?.minTeamMembers || 1)) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    } else {
      toast.warning(`Minimum team size is ${selectedSlot.minTeamMembers} members`);
    }
  };

  // Handle team member input change
  const handleTeamMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    setTeamMembers(updatedMembers);
  };

  // Improved search students function with better ID mapping
  const searchStudents = async (query, index) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setActiveSearchField(index);
    
    try {
      console.log('Searching students with query:', query);
      
      // Real API call to search for students
      const response = await api.get('/api/users/search', {
        params: { query, limit: 10 }
      });
      
      console.log('Search API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Map API response fields to our state fields with explicit ID handling
        const mappedResults = response.data.map(user => {
          console.log('Mapping user data for search results:', user);
          console.log('User _id:', user._id);
          console.log('User studentId:', user.studentId);
          
          return {
            id: user._id, // This should be the MongoDB _id
            name: user.name,
            email: user.email,
            rollNumber: user.studentId || '',
            department: user.department || ''
          };
        });
        
        console.log('Mapped search results with IDs:', mappedResults);
        setSearchResults(mappedResults);
      } else {
        console.warn('Invalid search results format:', response.data);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Failed to search for students');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Enhanced selectStudent function with better ID handling
  const selectStudent = (student, index) => {
    console.log('Selected student for team member:', student);
    console.log('Student ID:', student.id);
    console.log('Student rollNumber:', student.rollNumber);
    console.log('Applying to team member at index:', index);
    
    // Create a complete updated member object to avoid partial updates
    const updatedMember = {
      name: student.name || '',
      email: student.email || '',
      id: student.id || '', // Ensure ID is set
      rollNumber: student.rollNumber || '',
      department: student.department || ''
    };
    
    console.log('Updated team member data:', updatedMember);
    
    // Replace the entire team member object at the specified index
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = updatedMember;
    setTeamMembers(updatedMembers);
    
    // Clear search UI state
    setSearchResults([]);
    setStudentSearch('');
    setActiveSearchField(null);
  };

  // Improved bookSlot function with better ID handling
  const bookSlot = async () => {
    if (!selectedSlot) return;
    
    // Validate team members if applicable
    if (selectedSlot.presentationType === 'team') {
      // Log team members for debugging
      console.log("Team members being submitted:", JSON.stringify(teamMembers, null, 2));
      
      // Validate that all required fields are present
      const isTeamValid = teamMembers.every(member => {
        console.log(`Validating team member: ${member.name}, id: ${member.id}, rollNumber: ${member.rollNumber}`);
        return member.name && member.email && member.rollNumber && member.department && member.id;
      });
      
      if (!isTeamValid) {
        toast.error('Please fill in all team member details');
        return;
      }
      
      if (teamMembers.length < (selectedSlot.minTeamMembers || 1)) {
        toast.error(`A minimum of ${selectedSlot.minTeamMembers} team members is required`);
        return;
      }
    }
    
    try {
      // Prepare booking data with explicitly formatted team members
      const formattedTeamMembers = selectedSlot.presentationType === 'team' 
        ? teamMembers.map(member => ({
            name: member.name,
            email: member.email,
            id: member.id,
            rollNumber: member.rollNumber,
            department: member.department
          }))
        : undefined;
      
      console.log("Formatted team members for submission:", formattedTeamMembers);
      
      const bookingData = {
        slotId: selectedSlot._id,
        teamMembers: formattedTeamMembers
      };
      
      // Book the slot
      const response = await PresentationService.bookSlot(bookingData);
      
      // Remove the booked slot from available slots
      setSlots(slots.filter(slot => slot._id !== selectedSlot._id));
      
      // Add to my bookings
      setMyBookings([...myBookings, response]);
      
      // Reset form
      setSelectedSlot(null);
      setTeamMembers([{ name: '', email: '', id: '', rollNumber: '', department: '' }]);
      setShowBookingForm(false);
          
      // Show navbar again
      document.body.classList.remove('hide-navbar');
      
      toast.success('Presentation slot booked successfully!');
    } catch (error) {
      console.error('Error booking slot:', error);
      toast.error(error.response?.data?.message || 'Failed to book presentation slot');
    }
  };

  // Show confirmation for canceling booking
  const confirmCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowCancelConfirmation(true);
  };

  // Cancel a booked presentation slot
  const cancelBooking = async () => {
    try {
      await PresentationService.cancelBooking(bookingToCancel._id);
      
      // Remove from my bookings
      setMyBookings(myBookings.filter(booking => booking._id !== bookingToCancel._id));
      
      // If the slot is still in the future, add it back to available slots
      const slotDate = new Date(bookingToCancel.slot.date);
      const now = new Date();
      
      if (slotDate > now) {
        const updatedSlot = {
          ...bookingToCancel.slot,
          status: 'available'
        };
        setSlots([updatedSlot, ...slots]);
      }
      
      toast.success('Booking canceled successfully');
      setShowCancelConfirmation(false);
      setBookingToCancel(null);
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  // Pagination for events list
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl shadow-lg p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Presentation Slots</h1>
          <p className="text-amber-50 mt-2">Book presentation slots for your projects and assignments</p>
        </div>

        {/* Main content area */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs for Available Events and My Bookings */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                showEventList ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setShowEventList(true);
                setSelectedEvent(null);
                setSelectedSlot(null);
              }}
            >
              Available Presentations
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                !showEventList && !selectedEvent ? 'text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setShowEventList(false);
                setSelectedEvent(null);
              }}
            >
              My Bookings
            </button>
          </div>

          {/* Content area */}
          <div className="p-6">
            {showEventList ? (
              /* Available Events List View */
              <>
                {/* Filters */}
                <div className="mb-8 bg-amber-50 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <h2 className="text-lg font-medium text-amber-900 mb-2 md:mb-0">Filter Presentations</h2>
                    <button
                      className="text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center"
                      onClick={resetFilters}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Reset Filters
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="search" className="block text-sm font-medium text-amber-800 mb-1">Search</label>
                      <input
                        type="text"
                        id="search"
                        name="search"
                        className="w-full p-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-amber-900"
                        placeholder="Search by title, description..."
                        value={filters.search}
                        onChange={handleFilterChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="school" className="block text-sm font-medium text-amber-800 mb-1">School</label>
                      <select
                        id="school"
                        name="school"
                        className="w-full p-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-amber-900"
                        value={filters.school}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Schools</option>
                        <option value="École Centrale School of Engineering(ECSE)">ECSE</option>
                        <option value="School of Management(SOM)">SOM</option>
                        <option value="School Of Law(SOL)">SOL</option>
                        <option value="All Schools">All Schools</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-amber-800 mb-1">Department</label>
                      <select
                        id="department"
                        name="department"
                        className="w-full p-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-amber-900"
                        value={filters.department}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Departments</option>
                        <option value="CSE (Computer Science and Engineering)">Computer Science</option>
                        <option value="ECE (Electronics and Communication Engineering)">Electronics</option>
                        <option value="Mechanical Engineering (ME)">Mechanical</option>
                        <option value="All Departments">All Departments</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Events List */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-amber-300 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">No Presentation Events Found</h3>
                    <p className="text-gray-600 mb-6">No available events match your criteria. Try adjusting your filters.</p>
                    <button
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-md"
                      onClick={resetFilters}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-6 text-gray-800">Available Presentation Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {currentEvents.map(event => (
                        <div 
                          key={event._id}
                          className="bg-white rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3">
                            <h3 className="text-lg font-medium text-white truncate">{event.title}</h3>
                          </div>
                          <div className="p-4">
                            <p className="text-gray-600 mb-4 line-clamp-2 min-h-[48px]">{event.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <div className="bg-amber-50 p-2 rounded text-sm">
                                <span className="text-amber-800 block font-medium">Venue:</span>
                                <span className="text-gray-700">{event.venue}</span>
                              </div>
                              <div className="bg-amber-50 p-2 rounded text-sm">
                                <span className="text-amber-800 block font-medium">Duration:</span>
                                <span className="text-gray-700">{event.duration} min</span>
                              </div>
                              <div className="bg-amber-50 p-2 rounded text-sm">
                                <span className="text-amber-800 block font-medium">Type:</span>
                                <span className="text-gray-700">
                                  {event.presentationType === 'single' ? 'Individual' : 'Team'}
                                  {event.presentationType === 'team' && ` (${event.minTeamMembers}-${event.maxTeamMembers})`}
                                </span>
                              </div>
                              <div className="bg-amber-50 p-2 rounded text-sm">
                                <span className="text-amber-800 block font-medium">For:</span>
                                <span className="text-gray-700">{event.targetYear}</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                {event.slots ? event.slots.length : 0} available slots
                              </span>
                              <button
                                onClick={() => viewEventDetails(event)}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                              >
                                View Slots
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {filteredEvents.length > eventsPerPage && (
                      <div className="flex justify-center mt-8">
                        <nav className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-md ${
                              currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                          >
                            Previous
                          </button>
                          
                          <span className="text-sm text-gray-600">
                            Page {currentPage} of {Math.ceil(filteredEvents.length / eventsPerPage)}
                          </span>
                          
                          <button
                            onClick={() => setCurrentPage(currentPage < Math.ceil(filteredEvents.length / eventsPerPage) ? currentPage + 1 : currentPage)}
                            disabled={currentPage === Math.ceil(filteredEvents.length / eventsPerPage)}
                            className={`px-3 py-1 rounded-md ${
                              currentPage === Math.ceil(filteredEvents.length / eventsPerPage)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : selectedEvent ? (
              /* Selected Event's Slots View */
              <>
                <div className="mb-6 flex items-center">
                  <button
                    onClick={goBackToEvents}
                    className="mr-4 text-amber-600 hover:text-amber-800 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Events
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">{selectedEvent.title}</h2>
                </div>
                
                <div className="bg-amber-50 p-6 rounded-lg mb-6 border border-amber-200">
                  <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <span className="text-amber-800 block text-sm font-medium">Venue</span>
                      <span className="text-gray-700">{selectedEvent.venue}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <span className="text-amber-800 block text-sm font-medium">Duration</span>
                      <span className="text-gray-700">{selectedEvent.duration} minutes</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <span className="text-amber-800 block text-sm font-medium">Type</span>
                      <span className="text-gray-700">
                        {selectedEvent.presentationType === 'single' ? 'Individual' : 'Team'}
                        {selectedEvent.presentationType === 'team' && 
                          ` (${selectedEvent.minTeamMembers}-${selectedEvent.maxTeamMembers} members)`
                        }
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <span className="text-amber-800 block text-sm font-medium">Target Audience</span>
                      <span className="text-gray-700">{selectedEvent.targetYear}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Available Slots</h3>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-amber-200 rounded-lg">
                    <p className="text-gray-600">No available slots for this presentation.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Group slots by date */}
                    {Object.entries(groupSlotsByDate(slots)).map(([dateStr, dateSlots]) => (
                      <div key={dateStr} className="border border-amber-100 rounded-lg overflow-hidden">
                        <div className="bg-amber-100 px-4 py-3">
                          <h4 className="font-medium text-amber-800">
                            {formatDate(dateStr)}
                          </h4>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dateSlots.map(slot => (
                              <div 
                                key={slot._id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-amber-50 transition-colors"
                              >
                                <div className="mb-3 flex justify-between items-center">
                                  <span className="text-lg font-medium text-amber-700">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                    Available
                                  </span>
                                </div>
                                <button
                                  onClick={() => initializeBooking(slot)}
                                  className="w-full mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                                >
                                  Book This Slot
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* My Bookings View */
              <>
                <h2 className="text-xl font-semibold mb-6 text-gray-800">My Presentation Bookings</h2>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : myBookings.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-amber-300 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't booked any presentation slots yet.</p>
                    <button
                      onClick={() => setShowEventList(true)}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-md"
                    >
                      Browse Available Slots
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myBookings.map((booking) => (
                      <div 
                        key={booking._id} 
                        className={`bg-white rounded-xl border ${
                          isPastDate(booking.slot.date) 
                          ? 'border-gray-200' 
                          : 'border-amber-200 shadow-md'
                        } overflow-hidden`}
                      >
                        <div className={`px-6 py-4 ${isPastDate(booking.slot.date) ? 'bg-gray-50' : 'bg-amber-50'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{booking.slot.title}</h3>
                              <p className="text-sm text-gray-500">{booking.slot.venue}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isPastDate(booking.slot.date)
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-green-100 text-green-800'
                            }`}>
                              {isPastDate(booking.slot.date) ? 'Past' : 'Upcoming'}
                            </span>
                          </div>
                        </div>
                        <div className="px-6 py-4">
                          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Date</dt>
                              <dd className="mt-1 text-sm text-gray-900">{formatDate(booking.slot.date)}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Time</dt>
                              <dd className="mt-1 text-sm text-gray-900">{booking.slot.startTime} - {booking.slot.endTime}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Host</dt>
                              <dd className="mt-1 text-sm text-gray-900">{booking.slot.hostName || 'Faculty'}</dd>
                            </div>
                          </dl>
                          
                          {booking.teamMembers && booking.teamMembers.length > 0 && (
                            <div className="mt-4">
                              <dt className="text-sm font-medium text-gray-500">Team Members</dt>
                              <dd className="mt-2">
                                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                                  {booking.teamMembers.map((member, idx) => (
                                    <li key={idx} className="px-4 py-3 text-sm">
                                      <p className="font-medium text-gray-800">{member.name}</p>
                                      <p className="text-gray-600">{member.email}</p>
                                      {member.rollNumber && <p className="text-gray-500">ID: {member.rollNumber}</p>}
                                    </li>
                                  ))}
                                </ul>
                              </dd>
                            </div>
                          )}
                          
                          {!isPastDate(booking.slot.date) && (
                            <div className="mt-6 flex justify-end">
                              <button
                                onClick={() => confirmCancelBooking(booking)}
                                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                              >
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form Modal - Full Screen */}
      {showBookingForm && selectedSlot && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-[9999] overflow-y-auto presentation-booking-modal">
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 py-4 px-6 shadow-md">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Book Presentation Slot</h2>
                <button
                  onClick={closeBookingForm}
                  className="text-white hover:text-amber-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-grow p-6 md:p-8 max-w-6xl mx-auto w-full">
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <div className="mb-8">
                  <h3 className="text-xl font-medium text-amber-800 mb-4">{selectedSlot.title}</h3>
                  <p className="text-gray-600 mb-6">{selectedSlot.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <span className="text-amber-800 block font-medium">Date</span>
                      <span className="text-gray-800 text-lg">{formatDate(selectedSlot.date)}</span>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <span className="text-amber-800 block font-medium">Time</span>
                      <span className="text-gray-800 text-lg">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <span className="text-amber-800 block font-medium">Venue</span>
                      <span className="text-gray-800 text-lg">{selectedSlot.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Team Members Form (for team presentations) */}
                {selectedSlot.presentationType === 'team' ? (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Team Members</h3>
                    <p className="text-gray-600 mb-4">
                      Please enter the details of all team members who will be presenting.
                      {selectedSlot.minTeamMembers && selectedSlot.maxTeamMembers && (
                        <span> Required: {selectedSlot.minTeamMembers} to {selectedSlot.maxTeamMembers} members.</span>
                      )}
                    </p>
                    
                    <div className="space-y-6">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200 relative">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-800">
                              {index === 0 ? 'Team Lead (You)' : `Team Member ${index + 1}`}
                            </h4>
                            
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => removeTeamMember(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          {/* Student search */}
                          {index > 0 && (
                            <div className="mb-4 relative">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search for Student
                              </label>
                              <input
                                type="text"
                                value={index === activeSearchField ? studentSearch : ''}
                                onChange={(e) => {
                                  setStudentSearch(e.target.value);
                                  searchStudents(e.target.value, index);
                                }}
                                onFocus={() => setActiveSearchField(index)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Search by name, email, or ID..."
                              />
                              
                              {/* Search results dropdown */}
                              {activeSearchField === index && searchResults.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                                  {isSearching ? (
                                    <div className="p-3 text-center text-gray-500">
                                      <span className="inline-block animate-spin mr-2">⟳</span> Searching...
                                    </div>
                                  ) : (
                                    <ul>
                                      {searchResults.map((student) => (
                                        <li 
                                          key={student.id}
                                          className="cursor-pointer hover:bg-amber-50 p-3 border-b border-gray-100 last:border-0 transition-colors"
                                          onClick={() => selectStudent(student, index)}
                                        >
                                          <div className="font-medium text-gray-800">{student.name || 'No Name'}</div>
                                          <div className="text-sm text-gray-500">{student.email || 'No Email'}</div>
                                          <div className="text-xs flex justify-between">
                                            <span className="text-gray-500">ID: {student.rollNumber || 'Not Set'}</span>
                                            <span className="text-gray-500">{student.department || 'No Department'}</span>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name*
                              </label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Enter full name"
                                disabled={index === 0} // First member (you) is auto-filled
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email*
                              </label>
                              <input
                                type="email"
                                value={member.email}
                                onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Enter email address"
                                disabled={index === 0} // First member (you) is auto-filled
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Roll Number*
                              </label>
                              <input
                                type="text"
                                value={member.rollNumber || ''}
                                onChange={(e) => handleTeamMemberChange(index, 'rollNumber', e.target.value)}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Enter student ID"
                                disabled={index === 0} // First member (you) is auto-filled
                              />
                              {index === 0 && !member.rollNumber && (
                                <p className="mt-1 text-xs text-red-500">Your student ID is missing from your profile</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department*
                              </label>
                              <input
                                type="text"
                                value={member.department}
                                onChange={(e) => handleTeamMemberChange(index, 'department', e.target.value)}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Enter department"
                                disabled={index === 0} // First member (you) is auto-filled
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {teamMembers.length < (selectedSlot.maxTeamMembers || 5) && (
                      <button
                        type="button"
                        onClick={addTeamMember}
                        className="mt-4 px-5 py-2.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors flex items-center font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Team Member
                      </button>
                    )}
                  </div>
                ) : (
                  // Individual presentation - just a message
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Individual Presentation</h3>
                    <p className="text-gray-600">
                      You'll be presenting individually. Your details will be automatically added to the booking.
                    </p>
                  </div>
                )}
                
                <div className="bg-amber-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-700">
                    <strong>Note:</strong> By booking this slot, you confirm that you will attend the presentation 
                    as scheduled. Late cancellations or no-shows may affect your academic record.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeBookingForm}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={bookSlot}
                    className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-md"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your booking for the presentation on <strong>{bookingToCancel?.slot?.date && formatDate(bookingToCancel.slot.date)}</strong> at <strong>{bookingToCancel?.slot?.startTime}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Keep Booking
              </button>
              <button
                onClick={cancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-md"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PresentationSlot;
