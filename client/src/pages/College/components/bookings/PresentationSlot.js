import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PresentationService from '../../../../services/PresentationService';
import api from '../../../../utils/axiosConfig';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PresentationSlot = () => {
  // Get current user data from auth context
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State variables
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

  // Add new state variables for the booking form
  const [teamName, setTeamName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamCount, setTeamCount] = useState(1);
  const [attachments, setAttachments] = useState([]);
  
  // Max file settings
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_FILES = 3;

  // Add the missing state variable for all events
  const [events, setEvents] = useState([]);

  // Add cleanup effect to ensure navbar is restored when component unmounts
  useEffect(() => {
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);

  // Define fetchEventData using useCallback before using it in useEffect
  const fetchEventData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch available presentation events
      console.log('Fetching available presentation events...');
      const availableEvents = await PresentationService.getAvailableEvents();
      console.log('Received events:', availableEvents);
      
      // Debug host data
      if (availableEvents && availableEvents.length > 0) {
        console.log('First event host data:', availableEvents[0].host);
      }
      
      // Store all events first
      setEvents(availableEvents);
      
      // Filter events based on user's department and year - simplified to show more events
      const filteredByTargetAudience = availableEvents.filter(event => {
        // Always show events targeted at "All"
        if (event.targetDepartment === 'All Departments' || 
            event.targetYear === 'All Years') {
          return true;
        }
        
        // Check for department match (more permissive)
        const departmentMatch = event.targetDepartment === 'All Departments' || 
          !currentUser?.department || // Show all if user doesn't have department set
          currentUser?.department === event.targetDepartment || 
          (event.targetDepartment && event.targetDepartment.includes(currentUser?.department));
        
        // Check for year match (more permissive)
        const userYear = currentUser?.year || '';
        let yearMatch = event.targetYear === 'All Years' || !userYear; // Show all if user has no year set
        
        // Match explicit year names with potential user year formats
        if (event.targetYear === 'First Year' && (userYear === '1' || userYear === '1st Year' || userYear.toLowerCase().includes('first'))) {
          yearMatch = true;
        } else if (event.targetYear === 'Second Year' && (userYear === '2' || userYear === '2nd Year' || userYear.toLowerCase().includes('second'))) {
          yearMatch = true;
        } else if (event.targetYear === 'Third Year' && (userYear === '3' || userYear === '3rd Year' || userYear.toLowerCase().includes('third'))) {
          yearMatch = true;
        } else if (event.targetYear === 'Fourth Year' && (userYear === '4' || userYear === '4th Year' || userYear.toLowerCase().includes('fourth'))) {
          yearMatch = true;
        }
        
        return departmentMatch && yearMatch;
      });
      
      console.log('Filtered events for user:', filteredByTargetAudience.length, 'out of', availableEvents.length);
      
      // Set filtered events
      setFilteredEvents(filteredByTargetAudience);
      
      // Fetch user's bookings
      const userBookings = await PresentationService.getUserBookings();
      setMyBookings(userBookings);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load presentation events');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Load presentation events and user's bookings on mount
  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  // Enhanced useEffect for debugging and reliable team member initialization
  useEffect(() => {
    // This empty useEffect was likely intended for team member initialization
    // but we already handle that in initializeBooking
    
    // The duplicate fetchEventData function has been removed 
    // since it's already defined as a useCallback earlier
  }, []);
  
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
        return a.startTime.localeCompare(b.startTime);
      });
    });
    
    return groupedSlots;
  };

  // View event details and its slots - corrected function
  const viewEventDetails = async (event) => {
    setIsLoading(true);
    setSelectedEvent(event);
    setShowEventList(false);
    
    try {
      console.log('Fetching slots for event:', event.title);
      // Check if the event already has slots attached
      if (event.slots && Array.isArray(event.slots) && event.slots.length > 0) {
        console.log('Using slots from event object:', event.slots.length);
        setSlots(event.slots.filter(slot => slot.status === 'available'));
      } else {
        // Fetch slots using the event title
        console.log('Fetching slots by event title');
        const eventSlots = await PresentationService.getSlotsByEventId(event.title);
        console.log('Fetched slots:', eventSlots);
        setSlots(eventSlots.filter(slot => slot.status === 'available'));
      }
    } catch (error) {
      console.error('Error fetching event slots:', error);
      toast.error('Failed to load event slots');
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Back to events list with improved design
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
    
    // Reset form fields
    setTeamName('');
    setProjectDescription('');
    setTeamCount(slot.minTeamMembers || 1);
    setAttachments([]);
    
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
    setTeamName('');
    setProjectDescription('');
    setTeamCount(1);
    setAttachments([]);
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

  // This function is now used by searchFromInputField
  // so we're keeping it as a utility function
  const searchStudents = useCallback(async (query, index) => {
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
  }, []);
  // Improved search function - search when typing in any team member field
  const searchFromInputField = async (query, index, field) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setActiveSearchField({index, field}); // Track both index and field
    
    // Use the searchStudents function with the field-specific parameters
    try {
      console.log(`Searching students with query: ${query} for field: ${field}`);
      
      // Delegate the actual search to our reusable function
      await searchStudents(query, {index, field});
      
    } catch (error) {
      console.error('Error searching students:', error);
      setSearchResults([]);
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
    setActiveSearchField(null);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file count
    if (files.length + attachments.length > MAX_FILES) {
      toast.warning(`You can only upload a maximum of ${MAX_FILES} files`);
      return;
    }
    
    // Check individual file sizes
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.warning(`Some files exceed the ${MAX_FILE_SIZE/1024/1024}MB limit`);
      return;
    }
    
    // Store files
    setAttachments(prev => [...prev, ...files]);
  };
  
  // Remove an attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Improved bookSlot function with better ID handling
  const bookSlot = async () => {
    if (!selectedSlot) return;
    
    // Validate team name
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }
    
    // Validate team members if applicable
    if (selectedSlot.presentationType === 'team') {
      // Validate that team count matches actual team members
      if (teamMembers.length !== teamCount) {
        toast.error(`Please add exactly ${teamCount} team members`);
        return;
      }
      
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
        teamName,
        projectDescription,
        teamCount: selectedSlot.presentationType === 'team' ? teamCount : 1,
        teamMembers: formattedTeamMembers
      };
      
      // Handle file uploads if any
      if (attachments.length > 0) {
        const formData = new FormData();
        
        // Add the booking data as JSON
        formData.append('bookingData', JSON.stringify(bookingData));
        
        // Add the files
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        // Book the slot with attachments
        const response = await PresentationService.bookSlotWithAttachments(selectedSlot._id, formData);
        
        // Update UI after successful booking
        setSlots(slots.filter(slot => slot._id !== selectedSlot._id));
        setMyBookings([...myBookings, response]);
      } else {
        // Book the slot without attachments (using the existing method)
        const response = await PresentationService.bookSlot(bookingData);
        
        // Update UI after successful booking
        setSlots(slots.filter(slot => slot._id !== selectedSlot._id));
        setMyBookings([...myBookings, response]);
      }
      
      // Reset form
      setSelectedSlot(null);
      setTeamName('');
      setProjectDescription('');
      setTeamCount(1);
      setAttachments([]);
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

  // Improved department abbreviation function - focusing on shorter forms only
  const getDepartmentAbbreviation = (departmentString) => {
    if (!departmentString) return '';
    
    // If it contains parentheses with an abbreviation, extract it
    if (departmentString.includes('(') && departmentString.includes(')')) {
      const match = departmentString.match(/\(([^)]+)\)/);
      return match ? match[1] : '';
    }
    
    // For All Departments case
    if (departmentString === 'All Departments') return 'All';
    
    // For departments without parentheses, return first letters of main words
    return departmentString
      .split(' ')
      .map(word => {
        // Skip common words like "of", "and", etc.
        if (['of', 'and', 'the'].includes(word.toLowerCase())) return '';
        return word[0];
      })
      .join('');
  };

  // Convert year string to a more readable format
  const formatYearDisplay = (yearString) => {
    if (!yearString) return '';
    
    if (yearString.includes('First')) return '1st Year';
    if (yearString.includes('Second')) return '2nd Year';
    if (yearString.includes('Third')) return '3rd Year';
    if (yearString.includes('Fourth')) return '4th Year';
    
    return yearString;
  };

  // Improve the host name extraction function to handle more cases
  const getHostName = (host) => {
    // Debug the host object structure
    console.log('Host data in getHostName:', host);
    
    if (!host) return "Faculty";
    
    // Direct name property - common case for non-populated hosts
    if (host.name) {
      console.log('Using host.name:', host.name);
      return host.name;
    }
    
    // If host is a string ID instead of an object
    if (typeof host === 'string') {
      console.log('Host is a string ID');
      return "Faculty";
    }
    
    // Name in the user object (if user is populated)
    if (host.user) {
      // If user object is populated
      if (typeof host.user === 'object' && host.user.name) {
        console.log('Using host.user.name:', host.user.name);
        return host.user.name;
      }
    }
    
    // If email exists, extract username
    if (host.email) {
      const emailUsername = host.email.split('@')[0];
      const formattedName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      console.log('Using formatted email username:', formattedName);
      return formattedName;
    }
    
    console.log('No name found in host object, returning "Faculty"');
    return "Faculty";
  };

  // Filter events based on search and filters
  const filterEvents = useCallback(() => {
    if (!events.length) return;
    
    console.log('Filtering events with criteria:', filters);
    console.log('Events before filtering:', events.length);
    
    let results = [...events];
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.venue?.toLowerCase().includes(searchTerm) ||
        (event.host?.name && event.host.name.toLowerCase().includes(searchTerm))
      );
      console.log('After search filter:', results.length);
    }
    
    // Filter by school
    if (filters.school) {
      results = results.filter(event => 
        event.targetSchool === filters.school || 
        event.targetSchool === 'All Schools'
      );
      console.log('After school filter:', results.length);
    }
    
    // Filter by department
    if (filters.department) {
      results = results.filter(event => 
        event.targetDepartment === filters.department || 
        event.targetDepartment === 'All Departments'
      );
      console.log('After department filter:', results.length);
    }
    
    console.log('Final filtered events:', results.length);
    setFilteredEvents(results);
  }, [filters, events]);

  // Run filtering when filter criteria or events change
  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  // If there are no events available for the user's department/year, show a message
  const renderEmptyState = () => (
    <div className="text-center py-12 border-2 border-dashed border-amber-300 rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 className="text-xl font-medium text-gray-800 mb-2">No Presentations Available</h3>
      <p className="text-gray-600 mb-6">There are no presentation events currently available for your year or department.</p>
      <button
        onClick={() => navigate('/college/bookings')}
        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-md"
      >
        Back to Bookings
      </button>
    </div>
  );

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
                        className="w-full p-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-amber-900 bg-white"
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
                        className="w-full p-2 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-amber-900 bg-white"
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

                {/* Events List - Expand to use full width */}
                {/* Events List - Redesigned with improved layout */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <div className="grid grid-cols-1 gap-6 mb-8 w-full">
                    {currentEvents.map(event => (
                      <div 
                        key={event._id}
                        className="bg-white rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden w-full"
                      >
                        <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-3.5">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-white truncate pr-4">{event.title}</h3>
                            <div className="text-white/80 text-sm whitespace-nowrap">
                              <span className="bg-white/20 px-2 py-1 rounded font-medium">
                                Hosted by {getHostName(event.host)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <div className="mb-4">
                            <p className="text-gray-700">{event.description}</p>
                          </div>
                          
                          {/* Improved layout for event details with better alignment */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                            <div className="flex items-center gap-2.5 text-gray-700">
                              <div className="bg-amber-100 p-2 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500 font-medium">Venue</span>
                                <span className="font-medium">{event.venue}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 text-gray-700">
                              <div className="bg-amber-100 p-2 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500 font-medium">Duration</span>
                                <span className="font-medium">{event.duration} min</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 text-gray-700">
                              <div className="bg-amber-100 p-2 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500 font-medium">Type</span>
                                <span className="font-medium">
                                  {event.presentationType === 'single' ? 'Individual' : `Team (${event.minTeamMembers}-${event.maxTeamMembers})`}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 text-gray-700">
                              <div className="bg-amber-100 p-2 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500 font-medium">For</span>
                                <span className="font-medium">{formatYearDisplay(event.targetYear)}, {getDepartmentAbbreviation(event.targetDepartment)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center">
                              <span className="bg-amber-100 text-amber-800 text-sm font-medium px-2.5 py-1 rounded-full mr-2">
                                {event.slots ? event.slots.length : 0} slots
                              </span>
                              <span className="text-sm text-gray-500">
                                {event.slots && event.slots.length > 0 && new Date(event.slots[0].date) > new Date() 
                                  ? `Next: ${formatDate(event.slots[0].date)}` 
                                  : ''}
                              </span>
                            </div>
                            
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
                )}

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
            ) : selectedEvent ? (
              /* Selected Event's Slots View */
              <>
                {/* Update the selected event details page header */}
                <div className="mb-6">
                  <button
                    onClick={goBackToEvents}
                    className="flex items-center px-5 py-2.5 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors font-medium shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Events
                  </button>
                  
                  <div className="flex items-center justify-between mt-4">
                    <h2 className="text-xl font-semibold text-gray-800">{selectedEvent.title}</h2>
                    <div className="text-gray-600 text-sm">
                      Hosted by <span className="font-medium">{getHostName(selectedEvent.host)}</span>
                    </div>
                  </div>
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
                    {/* Update target audience display in event details page */}
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <span className="text-amber-800 block text-sm font-medium">Target Audience</span>
                      <span className="text-gray-700">
                        <span className="font-medium">{formatYearDisplay(selectedEvent.targetYear)}</span>
                        {selectedEvent.targetDepartment !== 'All Departments' && (
                          <>, {getDepartmentAbbreviation(selectedEvent.targetDepartment)}</>
                        )}
                      </span>
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
                        
                        {/* Group slots by date - Keep the original 3-column layout */}
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
                                
                                {/* Update target audience display in slot cards */}
                                <div className="mb-3 text-sm text-gray-600">
                                  <span className="font-medium">For: </span>
                                  <span className="inline-block bg-amber-50 px-2 py-1 rounded">
                                    {formatYearDisplay(selectedEvent.targetYear)}, {getDepartmentAbbreviation(selectedEvent.targetDepartment)}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                              <p className="text-sm text-gray-500">{booking.slot.venue} • Hosted by {getHostName(booking.slot.host)}</p>
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
                              <dd className="mt-1 text-sm text-gray-900">{getHostName(booking.slot.host)}</dd>
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
                <div>
                  <h2 className="text-xl font-bold text-white">Book Presentation Slot</h2>
                  <p className="text-sm text-white/80">Hosted by {getHostName(selectedSlot.host)}</p>
                </div>
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

                {/* New Fields - Team Name, Project Description, Team Count */}
                <div className="mb-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team/Project Name*
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Enter your team or project name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Description (Optional)
                    </label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Briefly describe your project or presentation"
                    />
                  </div>
                  
                  {selectedSlot.presentationType === 'team' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Team Members*
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={teamCount}
                          onChange={(e) => setTeamCount(Math.min(
                            Math.max(parseInt(e.target.value) || selectedSlot.minTeamMembers, selectedSlot.minTeamMembers), 
                            selectedSlot.maxTeamMembers
                          ))}
                          min={selectedSlot.minTeamMembers}
                          max={selectedSlot.maxTeamMembers}
                          className="w-24 p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                        />
                        <span className="ml-3 text-sm text-gray-600">
                          (Min: {selectedSlot.minTeamMembers}, Max: {selectedSlot.maxTeamMembers})
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* File Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachments (Optional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none">
                            <span>Upload files</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only" 
                              multiple
                              onChange={handleFileUpload}
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, PPT, or ZIP up to {MAX_FILE_SIZE/1024/1024}MB (max {MAX_FILES} files)
                        </p>
                      </div>
                    </div>
                    
                    {/* File list */}
                    {attachments.length > 0 && (
                      <ul className="mt-3 divide-y divide-gray-100 rounded-md border border-gray-200">
                        {attachments.map((file, index) => (
                          <li key={index} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                            <div className="flex items-center flex-1 min-w-0">
                              <svg className="h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a1 1 0 11-2 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                              </svg>
                              <span className="ml-2 flex-1 min-w-0 truncate">{file.name}</span>
                              <span className="ml-2 flex-shrink-0 text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button 
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
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
                          
                          {/* Remove dedicated search field and add search to input fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name*
                                {index > 0 && <span className="ml-1 text-xs text-amber-600">✨ Type to search</span>}
                              </label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => {
                                  handleTeamMemberChange(index, 'name', e.target.value);
                                  if (index > 0) searchFromInputField(e.target.value, index, 'name');
                                }}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Enter or search full name"
                                disabled={index === 0} // First member (you) is auto-filled
                              />
                              
                              {/* Search results for name field */}
                              {activeSearchField?.index === index && 
                               activeSearchField?.field === 'name' && 
                               searchResults.length > 0 && (
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
                            
                            <div className="relative">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email*
                                {index > 0 && <span className="ml-1 text-xs text-amber-600">✨ Type to search</span>}
                              </label>
                              <input
                                type="email"
                                value={member.email}
                                onChange={(e) => {
                                  handleTeamMemberChange(index, 'email', e.target.value);
                                  if (index > 0) searchFromInputField(e.target.value, index, 'email');
                                }}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Enter or search email"
                                disabled={index === 0}
                              />
                              
                              {/* Search results for email field */}
                              {activeSearchField?.index === index && 
                               activeSearchField?.field === 'email' && 
                               searchResults.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                                  {/* Same content as name search results */}
                                  {/* ... */}
                                </div>
                              )}
                            </div>
                            
                            <div className="relative">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Roll Number*
                                {index > 0 && <span className="ml-1 text-xs text-amber-600">✨ Type to search</span>}
                              </label>
                              <input
                                type="text"
                                value={member.rollNumber || ''}
                                onChange={(e) => {
                                  handleTeamMemberChange(index, 'rollNumber', e.target.value);
                                  if (index > 0) searchFromInputField(e.target.value, index, 'rollNumber');
                                }}
                                required
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Enter or search student ID"
                                disabled={index === 0}
                              />
                              
                              {/* Search results for roll number field */}
                              {/* ... */}
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
                                disabled={index === 0}
                              />
                            </div>
                          </div>
                          
                          {/* Add a tip explaining the search functionality */}
                          {index > 0 && (
                            <div className="mt-3 p-2 bg-amber-50 rounded-md text-sm text-amber-800">
                              <span role="img" aria-label="tip">💡</span> Tip: Search for students by typing in the name, email or roll number fields
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {teamMembers.length < teamCount && (
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
