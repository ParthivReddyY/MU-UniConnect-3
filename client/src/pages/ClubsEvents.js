import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';  // Import useLocation to access URL parameters
import '../CSS/clubs-events.css'; // Still importing for animations and complex styles
import { toast } from 'react-toastify';  // Assuming you have react-toastify for notifications
import api from '../utils/axiosConfig';  // Add the api import
import { renderFormField } from '../utils/clubFormUtils';

const ClubsEvents = () => {
  // State for clubs data
  const [clubsData, setClubsData] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewLogo, setPreviewLogo] = useState(null);
  const [mentorFields, setMentorFields] = useState([{ name: '', department: '', email: '' }]);
  const { currentUser } = useAuth();
  const [createClubHeadAccount, setCreateClubHeadAccount] = useState(true);
  const [clubHeadPassword, setClubHeadPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [allEvents, setAllEvents] = useState([]); // New state for all events
  const [shouldScrollToClubs, setShouldScrollToClubs] = useState(false);
  // Event modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    caption: '',
    image: '',
    formLink: '',
    galleryLink: '',
    isActive: true,
    isClubEvent: false
  });

  // Create reference for clubs section to scroll to
  const clubsSectionRef = useRef(null);
  
  // Get location to access URL parameters
  const location = useLocation();

  // Helper functions to interact with the API
  const getAllClubs = async () => {
    const response = await api.get('/api/clubs');
    return response.data;
  };

  const getClubsByCategory = async (category) => {
    const response = await api.get(`/api/clubs/category/${category}`);
    return response.data;
  };

  const createClub = async (clubData) => {
    const response = await api.post('/api/clubs', clubData);
    return response.data;
  };

  const deleteClub = async (clubId) => {
    const response = await api.delete(`/api/clubs/${clubId}`);
    return response.data;
  };

  // Fetch clubs data from API
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const response = await getAllClubs();
        setClubsData(response.clubs);
        setFilteredClubs(response.clubs);

        // Extract club events
        const events = response.clubs.reduce((acc, club) => {
          if (club.events && club.events.length > 0) {
            // Add club name and logo to each event for context
            const clubEvents = club.events.map(event => ({
              ...event,
              clubName: club.name,
              clubLogo: club.image,
              clubId: club._id,
              isClubEvent: true // Flag to identify club events
            }));
            return [...acc, ...clubEvents];
          }
          return acc;
        }, []);
        
        // Also fetch main events (not associated with clubs)
        try {
          // Use the correct endpoint for university events
          const mainEventsResponse = await api.get('/api/events/university');
          if (mainEventsResponse.data && Array.isArray(mainEventsResponse.data.events)) {
            // Add flag to identify main events
            const mainEvents = mainEventsResponse.data.events.map(event => ({
              ...event,
              isClubEvent: false
            }));
            
            // Combine club events and main events
            const allCombinedEvents = [...events, ...mainEvents];
            
            // Sort all events
            allCombinedEvents.sort((a, b) => {
              if (a.isActive && !b.isActive) return -1;
              if (!a.isActive && b.isActive) return 1;
              return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
            });
            
            setAllEvents(allCombinedEvents);
          } else {
            setAllEvents(events); // Fallback to just club events if main events fetch fails
          }
        } catch (mainEventsError) {
          console.error("Error fetching main events:", mainEventsError);
          setAllEvents(events); // Fallback to just club events
        }

        setLoading(false);
      } catch (error) {
        setError('Failed to fetch clubs or events. Please try again later.');
        console.error('Error fetching clubs/events:', error);
        setLoading(false);
      }
    };

    fetchClubs();

    // Check URL query parameters and apply filter if needed
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam) {
      // Apply the filter (this will be done once clubs data is loaded)
      filterClubsByCategory(filterParam);
      setShouldScrollToClubs(true); // Set flag to scroll to clubs section
    }
  }, [location.search]); // Add location.search as a dependency to rerun when URL changes

  // Scroll to clubs section if flag is set
  useEffect(() => {
    if (shouldScrollToClubs && clubsSectionRef.current) {
      clubsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToClubs(false); // Reset flag after scrolling
    }
  }, [shouldScrollToClubs]);

  // Filter clubs by category
  const filterClubsByCategory = async (category) => {
    try {
      setLoading(true);
      setActiveCategory(category);
      
      if (category === 'all') {
        setFilteredClubs(clubsData);
      } else {
        const response = await getClubsByCategory(category);
        setFilteredClubs(response.clubs);
      }
      
      setLoading(false);
    } catch (error) {
      setError(`Failed to filter clubs by ${category}. Please try again.`);
      console.error(`Error filtering clubs by ${category}:`, error);
      setLoading(false);
    }
  };

  // Handle logo image upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new mentor field
  const addMentorField = () => {
    setMentorFields([...mentorFields, { name: '', department: '', email: '' }]);
  };

  // Remove a mentor field
  const removeMentorField = (index) => {
    const updatedFields = [...mentorFields];
    updatedFields.splice(index, 1);
    setMentorFields(updatedFields);
  };

  // Handle mentor field changes
  const handleMentorChange = (index, field, value) => {
    const updatedFields = [...mentorFields];
    updatedFields[index][field] = value;
    setMentorFields(updatedFields);
  };

  // Handle adding a new club
  const handleAddClub = async (formData) => {
    try {
      // Create the mentor array with only filled mentor fields
      const mentors = mentorFields
        .filter(mentor => mentor.name.trim() !== '')
        .map(mentor => ({
          name: mentor.name,
          department: mentor.department,
          email: mentor.email
        }));

      // Create club object with all the collected data
      const newClub = {
        name: formData.clubName,
        description: formData.clubDescription,
        category: formData.clubCategory,
        email: formData.clubEmail, // Use provided club email directly instead of generating one
        location: formData.clubLocation || "Main Campus",
        instagram: `mu_${formData.clubName.toLowerCase().replace(/\s+/g, '')}`,
        image: previewLogo || `/api/placeholder/150/150?text=${encodeURIComponent(formData.clubName)}`,
        head: {
          name: formData.headName || '',
          email: formData.headEmail || '',
          phone: formData.headPhone || ''
        },
        viceHead: {
          name: formData.viceHeadName || '',
          email: formData.viceHeadEmail || '',
          phone: formData.viceHeadPhone || ''
        },
        mentors: mentors,
        members: []
      };

      // Create club head account if the option is selected
      let clubUserId = null; // Define the variable to store user ID
      
      if (createClubHeadAccount && formData.clubEmail && clubHeadPassword) {
        try {
          console.log("Creating club account with:", {
            name: formData.clubName,
            email: formData.clubEmail,
            role: 'clubs'
          });
          
          // Create user account for club
          const userResponse = await api.post('/api/auth/create-user', {
            name: formData.clubName,
            email: formData.clubEmail,
            password: clubHeadPassword,
            role: 'clubs'
            // Don't send clubManaging yet - we'll update it after club creation
          });
          
          console.log("Club account creation response:", userResponse.data);
          
          // Save the user ID if available
          if (userResponse.data && userResponse.data.user && userResponse.data.user._id) {
            clubUserId = userResponse.data.user._id;
            console.log('Club account created with ID:', clubUserId);
          }
          
        } catch (userError) {
          console.error('Error creating club account:', userError);
          toast.warning('Club created but could not create club account.');
        }
      }

      const response = await createClub(newClub);
      
      // If we created a club account and got back a user ID, update it with the club ID
      if (clubUserId && response.club && response.club._id) {
        try {
          console.log("Updating club account with club ID:", response.club._id);
          
          await api.put(`/api/auth/update-club-head`, {
            userId: clubUserId, // Use the saved user ID
            clubManaging: response.club._id
          });
          
          console.log('Club account updated with club ID:', response.club._id);
        } catch (updateError) {
          console.error('Error updating club account with club ID:', updateError);
        }
      }
      
      setClubsData([response.club, ...clubsData]);
      
      // Update filtered clubs if the current category matches the new club's category
      if (activeCategory === 'all' || activeCategory === response.club.category) {
        setFilteredClubs(prev => [response.club, ...prev]);
      }
      
      setShowModal(false);
      setPreviewLogo(null);
      setMentorFields([{ name: '', department: '', email: '' }]);
      setClubHeadPassword('');
      setCreateClubHeadAccount(true);
      setPasswordError('');
      toast.success('Club created successfully!');
    } catch (error) {
      toast.error('Failed to create club. Please try again.');
      console.error('Error creating club:', error);
    }
  };

  // Delete a club
  const handleDeleteClub = async (clubId) => {
    if (window.confirm('Are you sure you want to delete this club?')) {
      try {
        await deleteClub(clubId);
        
        // Remove the club from both clubsData and filteredClubs
        const updatedClubs = clubsData.filter(club => club._id !== clubId);
        setClubsData(updatedClubs);
        setFilteredClubs(filteredClubs.filter(club => club._id !== clubId));
        
        setSelectedClub(null);
        toast.success('Club deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete club. Please try again.');
        console.error('Error deleting club:', error);
      }
    }
  };

  // Validate club head password
  const validateClubHeadPassword = (password) => {
    if (createClubHeadAccount && !password) {
      setPasswordError('Password is required for club head account');
      return false;
    } else if (createClubHeadAccount && password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Club form submission
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const form = event.target; // Get the form element

    // --- Retrieve values directly from form elements and trim them ---
    const clubName = form.clubName.value.trim();
    const clubDescription = form.clubDescription.value.trim();
    const clubCategory = form.clubCategory.value;
    const clubEmail = form.clubEmail.value.trim();
    const clubLocation = form.clubLocation.value.trim();
    const headName = form.headName.value.trim();
    const headEmail = form.headEmail.value.trim();
    const headPhone = form.headPhone.value.trim();
    const viceHeadName = form.viceHeadName.value.trim();
    const viceHeadEmail = form.viceHeadEmail.value.trim();
    const viceHeadPhone = form.viceHeadPhone.value.trim();
    // --- End Retrieve values ---

    // Validate required fields
    if (!clubName || !clubDescription || !clubCategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate at least one mentor is entered if fields are shown
    // Ensure mentorFields state is up-to-date if needed, but assuming it is
    if (mentorFields.length > 0 && mentorFields.every(mentor => mentor.name.trim() === '')) {
      toast.warning('Please enter at least one mentor name or remove empty mentor fields');
      return;
    }

    // Validate club head fields if creating account
    if (createClubHeadAccount) {
      // Perform comprehensive check for empty values - check for null, undefined, and empty strings
      if (!headName || headName === null || headName === undefined || headName.trim() === '' ||
          !headEmail || headEmail === null || headEmail === undefined || headEmail.trim() === '') {
        toast.error('Club Head name and email are required to create an account');
        return; // Error occurs here according to user
      }

      // Validate email format
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(headEmail)) {
        toast.error('Please enter a valid email for Club Head');
        return;
      }

      // Validate password (uses state variable clubHeadPassword, which is fine)
      if (!validateClubHeadPassword(clubHeadPassword)) {
        return;
      }
    }

    // --- Create the formData object with already trimmed values ---
    const formData = {
      clubName, clubDescription, clubCategory, clubEmail, clubLocation,
      headName, headEmail, headPhone,
      viceHeadName, viceHeadEmail, viceHeadPhone
    };
    // --- End Create formData ---

    handleAddClub(formData);
  };

  // Render the club grid
  const renderClubs = () => {
    if (loading) {
      return (
        <div className="col-span-full flex justify-center items-center py-12">
          <div className="text-center">
            <div className="spinner-border text-primary-red" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-3 text-gray-600">Loading clubs...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="col-span-full py-12">
          <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg border border-red-200 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              className="mt-4 bg-primary-red text-white px-4 py-2 rounded hover:bg-secondary-red transition-colors"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (filteredClubs.length === 0) {
      return (
        <div className="col-span-full py-12 text-center">
          <p className="text-gray-600 text-lg">No clubs found in this category.</p>
        </div>
      );
    }

    return filteredClubs.map((club) => (
      <div 
        key={club._id}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:-translate-y-2 transition-all duration-300 h-full flex flex-col relative"
      >
        <div 
          className="overflow-hidden bg-gray-100 relative w-full cursor-pointer" 
          style={{paddingTop: '66.67%'}}
          onClick={() => setSelectedClub(club)}
        >
          <img 
            src={club.image || `/api/placeholder/150/150?text=${encodeURIComponent(club.name)}`} // Added fallback
            alt={`${club.name} logo`}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <h3 className="px-5 pt-5 pb-2 text-lg font-semibold text-gray-800 cursor-pointer" onClick={() => setSelectedClub(club)}>
            {club.name}
          </h3>
          <p className="px-5 pb-14 text-gray-600 text-sm line-clamp-2 flex-grow">
            {club.description ? (club.description.length > 60 ? club.description.substring(0, 60) + '...' : club.description) : ''}
          </p>
          <div className="absolute bottom-0 right-0 p-5">
            <button 
              className="text-primary-red hover:text-secondary-red text-sm px-1 py-1 transition-colors flex items-center gap-1.5"
              onClick={() => setSelectedClub(club)}
            >
              <span>View Details</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    ));
  };

  // Handle opening the edit event modal
  const handleEditMainEvents = () => {
    // Using the editingEvent state to store events without club affiliation
    setEditingEvent(allEvents.filter(event => !event.isClubEvent));
    setShowEventModal(true);
  };

  // Handle opening the add new event modal
  const handleAddMainEvent = () => {
    setNewEvent({
      title: '',
      date: '',
      caption: '',
      image: '',
      formLink: '',
      galleryLink: '',
      isActive: true,
      isClubEvent: false
    });
    setShowAddEventModal(true);
  };

  // Handle saving edited events
  const handleSaveEvents = async (updatedEvents) => {
    try {
      // Filter out events that are not club events
      const mainEvents = updatedEvents.filter(event => !event.isClubEvent);
      
      // Use the correct endpoint for university events
      const response = await api.put('/api/events/university', { events: mainEvents });
      
      if (response.status === 200) {
        // Update the events in state
        setAllEvents(prev => {
          // Keep club events and replace main events
          const clubEvents = prev.filter(event => event.isClubEvent);
          return [...clubEvents, ...response.data.events.map(event => ({...event, isClubEvent: false}))];
        });
        
        setShowEventModal(false);
        toast.success('Events updated successfully!');
      }
    } catch (error) {
      console.error('Error updating events:', error);
      toast.error('Failed to update events. Please try again.');
    }
  };

  // Handle saving a new event
  const handleSaveNewEvent = async () => {
    try {
      // Add temporary ID to the new event
      const eventToCreate = {
        ...newEvent,
        _id: `temp-${Date.now()}`
      };
      
      // Use the correct endpoint for adding a university event
      const response = await api.post('/api/events/university', { event: eventToCreate });
      
      if (response.status === 201 || response.status === 200) {
        // Add the new event to the state
        const createdEvent = {
          ...response.data.event,
          isClubEvent: false
        };
        
        setAllEvents(prev => [createdEvent, ...prev]);
        setShowAddEventModal(false);
        toast.success('New event added successfully!');
      }
    } catch (error) {
      console.error('Error adding new event:', error);
      toast.error('Failed to add new event. Please try again.');
    }
  };

  // Update a club in the database - Adding the missing handleUpdateClub function
  const handleUpdateClub = async (clubId, updatedData) => {
    try {
      const response = await api.put(`/api/clubs/${clubId}`, updatedData);
      
      if (response.status === 200) {
        // Update the local state with the updated club
        setClubsData(prev => prev.map(club => 
          club._id === clubId ? response.data : club
        ));
        
        // Update the selected club
        setSelectedClub(response.data);
        
        return { success: true };
      } else {
        return { success: false, error: 'Failed to update club' };
      }
    } catch (error) {
      console.error('Error updating club:', error);
      return { success: false, error: error.response?.data?.message || 'An error occurred while updating the club' };
    }
  };

  // Render the events section
  const renderEvents = () => {
    if (loading) {
      // Optionally show a loading state specific to events or rely on the main loading
      return <p className="text-center text-gray-500 mt-8">Loading events...</p>;
    }
    
    if (error) {
      // Optionally show an error state specific to events or rely on the main error
      return <p className="text-center text-red-500 mt-8">Could not load events.</p>;
    }

    // Only get main events for this page - we'll exclude club events
    const mainEvents = allEvents.filter(event => !event.isClubEvent);
    
    // Split active and past events
    const activeMainEvents = mainEvents.filter(event => event.isActive);
    const pastMainEvents = mainEvents.filter(event => !event.isActive);

    if (mainEvents.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500 text-sm italic">
          No university events found.
        </div>
      );
    }

    return (
      <>
        {/* Main Events Section */}
        {(activeMainEvents.length > 0 || pastMainEvents.length > 0) && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              </h3>
              {/* Edit Events Button removed here as it's redundant with the one in the main section header */}
            </div>
            
            {/* Active Main Events */}
            {activeMainEvents.length > 0 && (
              <div className="space-y-10">
                {activeMainEvents.map((event, index) => (
                  <div key={`main-event-${event._id || index}`} className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                    {/* Event Image */}
                    <div className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0">
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md bg-gray-200">
                        <img
                          src={event.image || `https://source.unsplash.com/random/400x225?sig=univ${index}`}
                          alt={`${event.title}`}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    {/* Event Content */}
                    <div className="flex-grow text-center md:text-left">
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">{event.date}</div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h4>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">{event.caption}</p>
                      {event.formLink && (
                        <a 
                          href={event.formLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-primary-red hover:text-secondary-red font-medium inline-flex items-center gap-1.5 group"
                        >
                          Register Now <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Past Main Events */}
            {pastMainEvents.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-medium text-lg text-gray-700 mb-6">Past University Events</h4>
                <div className="space-y-10">
                  {pastMainEvents.map((event, index) => (
                    <div key={`past-main-event-${event._id || index}`} className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                      {/* Event Image */}
                      <div className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0">
                        <div className="aspect-video rounded-lg overflow-hidden shadow-md bg-gray-200">
                          <img
                            src={event.image || `https://source.unsplash.com/random/400x225?sig=univpast${index}`}
                            alt={`${event.title}`}
                            className="object-cover w-full h-full filter grayscale"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      {/* Event Content */}
                      <div className="flex-grow text-center md:text-left">
                        <div className="text-xs text-gray-500 mb-1.5 font-medium">{event.date}</div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">{event.title}</h4>
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">{event.caption}</p>
                        {event.galleryLink && (
                          <a 
                            href={event.galleryLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1.5 group"
                          >
                            View Gallery <i className="fas fa-images text-xs group-hover:translate-x-1 transition-transform"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Removed Club Events Section from here - it will only appear in club details */}
      </>
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    const typeParam = params.get('type');
    
    // Handle filter parameter - for club categories
    if (filterParam) {
      // Ensure clubsData is loaded before applying the filter
      if (clubsData.length > 0) {
        filterClubsByCategory(filterParam);
        setShouldScrollToClubs(true); // Set flag to scroll to clubs section
      } else {
        // Retry filtering once clubsData is loaded
        const interval = setInterval(() => {
          if (clubsData.length > 0) {
            filterClubsByCategory(filterParam);
            setShouldScrollToClubs(true);
            clearInterval(interval);
          }
        }, 100);
      }
    }
    
    // Handle type parameter - for events navigation
    if (typeParam === 'upcoming' || typeParam === 'featured') {
      // Scroll to university events section after a short delay to ensure it's loaded
      setTimeout(() => {
        const eventsSection = document.getElementById('university-events-section');
        if (eventsSection) {
          eventsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, [location.search, clubsData]); // Add clubsData as a dependency to ensure it triggers when data is loaded

  return (
    <div className="-mt-20 w-full bg-gray-50 min-h-screen pb-8">
      {/* Description Section - Full Width with contained content */}
      <div className="w-full bg-white border-b border-gray-200 py-12 pt-36">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary-red mb-4">Welcome to Our Club Community</h2>
          <p className="text-lg text-gray-700 max-w-3xl mb-8 leading-relaxed">Explore diverse clubs that cater to your interests and passions. Join a community of like-minded individuals, develop new skills, and make lasting connections.</p>
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-12 mb-10">
            <div className="flex items-center gap-3">
              <i className="fas fa-users text-2xl text-primary-red"></i>
              <span className="text-lg text-gray-800">{clubsData.length} Active Clubs</span>
            </div>
            <div 
              className="flex items-center gap-3 cursor-pointer hover:text-primary-red transition-colors" 
              onClick={() => {
                const eventsSection = document.getElementById('university-events-section');
                if (eventsSection) {
                  eventsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <i className="fas fa-calendar-alt text-2xl text-primary-red"></i>
              <span className="text-lg text-gray-800">University Events</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-star text-2xl text-primary-red"></i>
              <span className="text-lg text-gray-800">Diverse Interests</span>
            </div>
          </div>
          
          {/* Add Club Button - Only show for admins */}
          {currentUser && currentUser.role === 'admin' && (
            <button 
              className="bg-primary-red text-white rounded-full px-6 py-3 font-medium flex items-center gap-2 shadow-md hover:bg-secondary-red hover:-translate-y-1 transition-all duration-300"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-plus"></i> Add New Club
            </button>
          )}
        </div>
      </div>

      {/* Club Categories Navigation */}
      <div className="sticky top-16 md:top-20 z-30 w-full bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto gap-4 scrollbar-hide">
          <button 
            className={`whitespace-nowrap rounded-full px-5 py-2 ${activeCategory === 'all' ? 'bg-primary-red text-white' : 'text-gray-700 hover:bg-gray-100'} font-medium transition-colors`}
            onClick={() => filterClubsByCategory('all')}
          >
            All Clubs
          </button>
          <button 
            className={`whitespace-nowrap rounded-full px-5 py-2 ${activeCategory === 'technical' ? 'bg-primary-red text-white' : 'text-gray-700 hover:bg-gray-100'} font-medium transition-colors`}
            onClick={() => filterClubsByCategory('technical')}
          >
            Technical
          </button>
          <button 
            className={`whitespace-nowrap rounded-full px-5 py-2 ${activeCategory === 'non-technical' ? 'bg-primary-red text-white' : 'text-gray-700 hover:bg-gray-100'} font-medium transition-colors`}
            onClick={() => filterClubsByCategory('non-technical')}
          >
            Non-Technical
          </button>
          <button 
            className={`whitespace-nowrap rounded-full px-5 py-2 ${activeCategory === 'arts' ? 'bg-primary-red text-white' : 'text-gray-700 hover:bg-gray-100'} font-medium transition-colors`}
            onClick={() => filterClubsByCategory('arts')}
          >
            Arts & Culture
          </button>
          <button 
            className={`whitespace-nowrap rounded-full px-5 py-2 ${activeCategory === 'sports' ? 'bg-primary-red text-white' : 'text-gray-700 hover:bg-gray-100'} font-medium transition-colors`}
            onClick={() => filterClubsByCategory('sports')}
          >
            Sports
          </button>
        </div>
      </div>

      {/* Clubs Grid - Full Width with contained content */}
      <div ref={clubsSectionRef} className="w-full py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8 flex items-center gap-2">
            <i className="fas fa-users text-primary-red"></i> Explore Our Clubs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {renderClubs()}
          </div>
        </div>
      </div>

      {/* Events Section - Now only shows University Events */}
      <div id="university-events-section" className="w-full py-12 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-2">
              <i className="fas fa-calendar-check text-primary-red"></i> University Events
            </h2>
            {/* Add Events Button - Only show for admins */}
            {currentUser && currentUser.role === 'admin' && (
              <div className="flex gap-3">
                <button
                  onClick={handleEditMainEvents}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-200 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <i className="fas fa-edit text-xs"></i> Edit Events
                </button>
                <button
                  onClick={handleAddMainEvent}
                  className="px-4 py-2 bg-primary-red text-white text-sm font-medium rounded-md hover:bg-secondary-red transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <i className="fas fa-plus text-xs"></i> Add Event
                </button>
              </div>
            )}
          </div>
          {renderEvents()}
        </div>
      </div>

      {/* Edit Events Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-800">Edit University Events</h2>
              <button 
                type="button" 
                className="text-3xl text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => setShowEventModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {allEvents.filter(event => !event.isClubEvent).map((event, index) => (
                  <div key={`edit-main-event-${index}`} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                        <input
                          type="text"
                          value={event.title || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                title: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="text"
                          value={event.date || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                date: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          placeholder="e.g., September 15, 2024"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={event.caption || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                caption: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                          type="url"
                          value={event.image || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                image: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Link</label>
                        <input
                          type="url"
                          value={event.formLink || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                formLink: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="https://forms.gle/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Link</label>
                        <input
                          type="url"
                          value={event.galleryLink || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                galleryLink: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="https://photos.app.goo.gl/..."
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={event.isActive || false}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                isActive: e.target.checked 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          className="h-4 w-4 text-primary-red"
                        />
                        <label className="text-sm text-gray-700">Active Event</label>
                      </div>
                      
                      <div>
                        <button 
                          type="button"
                          onClick={() => {
                            const updatedEvents = allEvents.filter(ev => 
                              !(ev._id === event._id && !ev.isClubEvent)
                            );
                            setAllEvents(updatedEvents);
                          }}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm hover:bg-red-200"
                        >
                          <i className="fas fa-trash-alt mr-1"></i> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEvents(allEvents)}
                className="px-4 py-2 bg-primary-red text-white rounded-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add New Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-800">Add New University Event</h2>
              <button 
                type="button" 
                className="text-3xl text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => setShowAddEventModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title*</label>
                    <input
                      type="text"
                      value={newEvent.title || ''}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
                    <input
                      type="text"
                      value={newEvent.date || ''}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      placeholder="e.g., September 15, 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                    <textarea
                      rows="3"
                      value={newEvent.caption || ''}
                      onChange={(e) => setNewEvent({...newEvent, caption: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={newEvent.image || ''}
                      onChange={(e) => setNewEvent({...newEvent, image: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Link</label>
                    <input
                      type="url"
                      value={newEvent.formLink || ''}
                      onChange={(e) => setNewEvent({...newEvent, formLink: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://forms.gle/..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Link</label>
                    <input
                      type="url"
                      value={newEvent.galleryLink || ''}
                      onChange={(e) => setNewEvent({...newEvent, galleryLink: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://photos.app.goo.gl/..."
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEvent.isActive || false}
                      onChange={(e) => setNewEvent({...newEvent, isActive: e.target.checked})}
                      className="h-4 w-4 text-primary-red"
                    />
                    <label className="text-sm text-gray-700">Active Event</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddEventModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewEvent}
                className="px-4 py-2 bg-primary-red text-white rounded-md"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Editing Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-800">Edit University Events</h2>
              <button 
                type="button" 
                className="text-3xl text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => setShowEventModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {allEvents.filter(event => !event.isClubEvent).map((event, index) => (
                  <div key={`edit-main-event-${index}`} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                        <input
                          type="text"
                          value={event.title || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                title: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="text"
                          value={event.date || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                date: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          placeholder="e.g., September 15, 2024"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={event.caption || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                caption: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                          type="url"
                          value={event.image || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                image: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Link</label>
                        <input
                          type="url"
                          value={event.formLink || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                formLink: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="https://forms.gle/..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Link</label>
                        <input
                          type="url"
                          value={event.galleryLink || ''}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                galleryLink: e.target.value 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="https://photos.app.goo.gl/..."
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={event.isActive || false}
                          onChange={(e) => {
                            const updatedEvents = [...allEvents];
                            const eventIndex = updatedEvents.findIndex(ev => 
                              ev._id === event._id && !ev.isClubEvent
                            );
                            if (eventIndex !== -1) {
                              updatedEvents[eventIndex] = { 
                                ...updatedEvents[eventIndex], 
                                isActive: e.target.checked 
                              };
                              setAllEvents(updatedEvents);
                            }
                          }}
                          className="h-4 w-4 text-primary-red"
                        />
                        <label className="text-sm text-gray-700">Active Event</label>
                      </div>
                      
                      <div>
                        <button 
                          type="button"
                          onClick={() => {
                            const updatedEvents = allEvents.filter(ev => 
                              !(ev._id === event._id && !ev.isClubEvent)
                            );
                            setAllEvents(updatedEvents);
                          }}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm hover:bg-red-200"
                        >
                          <i className="fas fa-trash-alt mr-1"></i> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="bg-primary-red text-white px-4 py-2 rounded-md"
                  onClick={() => {
                    // Add a new main event
                    setAllEvents([...allEvents, {
                      title: '',
                      date: '',
                      caption: '',
                      image: '',
                      isActive: true,
                      isClubEvent: false, // Mark as non-club event
                      _id: `temp-${Date.now()}` // Temporary ID
                    }]);
                  }}
                >
                  <i className="fas fa-plus mr-2"></i> Add New University Event
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEvents(allEvents)}
                className="px-4 py-2 bg-primary-red text-white rounded-md"
              >
                Save Events
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Club Detail Component */}
      {selectedClub && (
        <ClubDetail 
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          onDelete={() => handleDeleteClub(selectedClub._id)}
          onUpdate={handleUpdateClub}
          canDelete={currentUser && currentUser.role === 'admin'} // Only admins can delete clubs
        />
      )}

      {/* Add Club Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          {/* Increased max-width */}
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-800">Add New Club</h2>
              <button 
                type="button" 
                className="text-3xl text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form id="club-form" onSubmit={handleFormSubmit}>
              {/* Added grid layout and gap */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Column 1: Basic Info, Logo, Contact */}
                <div className="space-y-6">
                  {/* Club Logo Upload */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Club Logo</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-300">
                        {previewLogo ? (
                          <img 
                            src={previewLogo} 
                            alt="Club logo preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <i className="fas fa-image text-3xl text-gray-400"></i>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        {/* Logo URL Input */}
                        <div>
                          <input
                            type="url"
                            id="logoUrl"
                            placeholder="Paste logo image URL here"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            onChange={(e) => {
                              if (e.target.value.trim()) {
                                setPreviewLogo(e.target.value.trim());
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter a direct URL to an image</p>
                        </div>
                        
                        {/* Divider with OR */}
                        <div className="flex items-center my-1">
                          <div className="flex-1 h-px bg-gray-200"></div>
                          <div className="px-2 text-xs text-gray-500">OR</div>
                          <div className="flex-1 h-px bg-gray-200"></div>
                        </div>
                        
                        {/* File Upload Option */}
                        <div>
                          <input
                            type="file"
                            id="clubLogo"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <label 
                            htmlFor="clubLogo" 
                            className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md inline-block transition-colors"
                          >
                            <i className="fas fa-upload mr-2"></i> Upload Logo
                          </label>
                          {previewLogo && (
                            <button
                              type="button"
                              onClick={() => setPreviewLogo(null)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <i className="fas fa-times mr-1"></i> Remove
                            </button>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Recommended: Square image, 400x400px or larger</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Basic Club Information */}
                  <div>
                    <label htmlFor="clubName" className="block text-gray-700 font-medium mb-2">Club Name*</label>
                    <input 
                      type="text" 
                      id="clubName" 
                      name="clubName" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="clubDescription" className="block text-gray-700 font-medium mb-2">Club Description*</label>
                    <textarea 
                      id="clubDescription" 
                      name="clubDescription" 
                      rows="4" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="clubCategory" className="block text-gray-700 font-medium mb-2">Club Category*</label>
                    <select 
                      id="clubCategory" 
                      name="clubCategory" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="technical">Technical</option>
                      <option value="non-technical">Non-Technical</option>
                      <option value="arts">Arts & Culture</option>
                      <option value="sports">Sports</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="clubEmail" className="block text-gray-700 font-medium mb-2">
                      Club Email <span className="text-xs text-gray-500 ml-2">(Will be used as official contact)</span>
                    </label>
                    <input 
                      type="email" 
                      id="clubEmail" 
                      name="clubEmail" 
                      placeholder="yourclub@mahindra.edu.in" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">This email will be used for club communications and member management</p>
                  </div>
                  
                  <div>
                    <label htmlFor="clubLocation" className="block text-gray-700 font-medium mb-2">Club Location</label>
                    <input 
                      type="text" 
                      id="clubLocation" 
                      name="clubLocation" 
                      placeholder="Building, Room Number" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                    />
                  </div>
                </div>

                {/* Column 2: Leadership, Account, Mentors */}
                <div className="space-y-6">
                  {/* Club Head Information */}
                  <div className="pt-4 border-t border-gray-200 md:border-t-0 md:pt-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Club Head Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="headName" className="block text-gray-700 font-medium mb-2">
                          Head Name {createClubHeadAccount && <span className="text-red-500">*</span>}
                        </label>
                        <input 
                          type="text" 
                          id="headName" 
                          name="headName" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                          required={createClubHeadAccount}
                        />
                      </div>
                      <div>
                        <label htmlFor="headEmail" className="block text-gray-700 font-medium mb-2">
                          Head Email {createClubHeadAccount && <span className="text-red-500">*</span>}
                        </label>
                        <input 
                          type="email" 
                          id="headEmail" 
                          name="headEmail" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                          required={createClubHeadAccount}
                        />
                      </div>
                      <div>
                        <label htmlFor="headPhone" className="block text-gray-700 font-medium mb-2">Head Phone</label>
                        <input 
                          type="tel" 
                          id="headPhone" 
                          name="headPhone" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vice Head Information */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Vice Head Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="viceHeadName" className="block text-gray-700 font-medium mb-2">Vice Head Name</label>
                        <input 
                          type="text" 
                          id="viceHeadName" 
                          name="viceHeadName" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                        />
                      </div>
                      <div>
                        <label htmlFor="viceHeadEmail" className="block text-gray-700 font-medium mb-2">Vice Head Email</label>
                        <input 
                          type="email" 
                          id="viceHeadEmail" 
                          name="viceHeadEmail" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                        />
                      </div>
                      <div>
                        <label htmlFor="viceHeadPhone" className="block text-gray-700 font-medium mb-2">Vice Head Phone</label>
                        <input 
                          type="tel" 
                          id="viceHeadPhone" 
                          name="viceHeadPhone" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Club Head Account Creation */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Club Account</h3>
                    
                    <div className="flex items-center mb-4">
                      <input 
                        type="checkbox" 
                        id="createClubHeadAccount" 
                        name="createClubHeadAccount" 
                        checked={createClubHeadAccount} 
                        onChange={(e) => {
                          setCreateClubHeadAccount(e.target.checked);
                          // Reset password error when checkbox changes
                          setPasswordError('');
                        }} 
                        className="h-4 w-4 text-primary-red border-gray-300 rounded focus:ring-primary-red" 
                      />
                      <label htmlFor="createClubHeadAccount" className="ml-2 block text-gray-700 font-medium">Create Club Account</label>
                    </div>
                    
                    {createClubHeadAccount && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded border-l-4 border-primary-red">
                          <i className="fas fa-info-circle mr-1"></i> A club head account requires a name, email, and password
                        </p>
                        <div> 
                          <label htmlFor="clubHeadPassword" className="block text-gray-700 font-medium mb-2">
                            Club Password <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="password" 
                            id="clubHeadPassword" 
                            name="clubHeadPassword" 
                            value={clubHeadPassword} 
                            onChange={(e) => setClubHeadPassword(e.target.value)} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                            required={createClubHeadAccount}
                            minLength={6}
                          />
                          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mentors Information */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Mentors</h3>
                    <div className="flex justify-between items-center mb-4">
                      <button 
                        type="button" 
                        onClick={addMentorField} 
                        className="bg-primary-red hover:bg-secondary-red text-white px-3 py-1.5 rounded-md text-sm ml-auto transition-colors flex items-center gap-1" 
                      >
                        <i className="fas fa-plus mr-1"></i> Add Mentor
                      </button>
                    </div>
                    
                    {mentorFields.map((mentor, index) => (
                      <div key={`mentor-${index}`} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Mentor #{index + 1}</h4>
                          {index > 0 && (
                            <button 
                              type="button"
                              onClick={() => removeMentorField(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-gray-700 text-sm mb-1">Name</label>
                            <input 
                              type="text" 
                              value={mentor.name}
                              onChange={(e) => handleMentorChange(index, 'name', e.target.value)}
                              placeholder="Mentor Name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm mb-1">Department</label>
                            <input 
                              type="text" 
                              value={mentor.department}
                              onChange={(e) => handleMentorChange(index, 'department', e.target.value)}
                              placeholder="Department"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                            />
                          </div>
                          <div className="flex items-start">
                            <div className="flex-grow">
                              <label className="block text-gray-700 text-sm mb-1">Email</label>
                              <input 
                                type="email" 
                                value={mentor.email}
                                onChange={(e) => handleMentorChange(index, 'email', e.target.value)}
                                placeholder="Email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red" 
                              />
                            </div>
                            {index > 0 && (
                              <button 
                                type="button"
                                onClick={() => removeMentorField(index)}
                                className="text-red-500 hover:text-red-700 p-1 flex-shrink-0 mt-6 ml-2"
                                aria-label="Remove Mentor"
                              >
                                <i className="fas fa-trash text-sm"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 p-6 flex justify-end">
                <button 
                  type="submit" 
                  className="bg-primary-red text-white px-6 py-3 rounded-md font-medium hover:bg-secondary-red transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-save"></i> Save Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Redesigned Club Detail Component
const ClubDetail = ({ club, onClose, onDelete, canDelete, onUpdate }) => {
  // Replace isEditing with specific edit states
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingEvents, setIsEditingEvents] = useState(false);
  const [formData, setFormData] = useState({ /* ... initial form state ... */ });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewLogo, setPreviewLogo] = useState(null); // For logo preview in edit mode
  const { currentUser } = useAuth();

  // Determine if any edit mode is active
  const isEditingAny = isEditingDetails || isEditingEvents;
  
  // Check if user has permission to edit this club (admin or club owner)
  const hasEditPermission = () => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    // Check if user is a club owner/head and managing this club
    return (
      (currentUser.role === 'clubs' || currentUser.role === 'clubHead') && 
      currentUser.clubManaging === club._id
    );
  };

  // Initialize/Reset form data ONLY when the club prop changes
  useEffect(() => {
    if (club) {
      console.log("Club prop changed, initializing formData:", club); // Debug log
      const initialData = {
        name: club.name || '',
        category: club.category || '',
        description: club.description || '',
        instagram: club.instagram || '',
        linkedin: club.linkedin || '', // Properly set LinkedIn field
        website: club.website || '',   // Properly set website field
        email: club.email || '',
        location: club.location || '',
        image: club.image || '',       // Use image instead of logo
        // Create a deep copy of head and viceHead objects to ensure they're independent objects
        head: { ...(club.head || { name: '', email: '' }) },
        viceHead: { ...(club.viceHead || { name: '', email: '' }) },
        mentors: Array.isArray(club.mentors) ? [...club.mentors] : [],
        committee: (club.members || []).map(member =>
          typeof member === 'object' && member !== null ? { ...member } : { name: String(member), position: '' }
        ), // Ensure committee members are objects
        events: Array.isArray(club.events) ? club.events.map(event => ({ ...event })) : []
      };
      setFormData(initialData);
      setPreviewLogo(club.image || null); // Reset logo preview as well, using 'image' field
      setError(''); // Clear errors when club changes
      setSuccess(''); // Clear success messages when club changes
    }
  }, [club]); // Dependency array ONLY includes club

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Toggle Edit Modes - Simplified: Just toggle state, don't reset form data here
  const handleToggleDetailsEdit = () => {
    setIsEditingDetails(prev => !prev);
    setIsEditingEvents(false);
    setError('');
    setSuccess('');
    // Don't reset formData or logo here, useEffect handles initial load
  };

  const handleToggleEventsEdit = () => {
    setIsEditingEvents(prev => !prev);
    setIsEditingDetails(false);
    setError('');
    setSuccess('');
    // Don't reset formData or logo here
  };

  // Cancel Edit - Explicitly reset form data and logo here
  const handleCancelEdit = () => {
    setIsEditingDetails(false);
    setIsEditingEvents(false);
    setError('');
    setSuccess('');
    if (club) { // Reset form data and logo based on the current club prop
      const initialData = {
        name: club.name || '',
        category: club.category || '',
        description: club.description || '',
        instagram: club.instagram || '',
        email: club.email || '',
        location: club.location || '',
        logo: club.logo || '',
        head: club.head || { name: '', email: '' },
        viceHead: club.viceHead || { name: '', email: '' },
        mentors: club.mentors || [],
        committee: (club.members || []).map(member =>
          typeof member === 'object' && member !== null ? { ...member } : { name: String(member), position: '' }
        ),
        events: club.events || []
      };
      setFormData(initialData);
      setPreviewLogo(club.logo || null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle nested object changes (head, viceHead)
  const handleNestedChange = (object, field, value) => {
    console.log(`Updating ${object}.${field} to:`, value); // Debug log
    setFormData(prev => ({
      ...prev,
      [object]: {
        ...prev[object],
        [field]: value
      }
    }));
  };

  // Handle array changes (mentors)
  const handleArrayChange = (field, index, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: updatedArray
    }));
  };

  // Add new mentor input field
  const addMentor = () => {
    // Check the format of existing mentors to maintain consistency
    const existingMentor = formData.mentors[0];
    const newMentor = typeof existingMentor === 'object' ? 
      { name: '', department: '', email: '' } : '';
    setFormData(prev => ({
      ...prev,
      mentors: [...prev.mentors, newMentor]
    }));
  };

  // Remove mentor input field
  const removeMentor = (index) => {
    const updatedMentors = formData.mentors.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      mentors: updatedMentors
    }));
  };

  // Handle logo file change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result); // Show preview
        // You might want to handle actual upload separately or upon form submission
        // For now, just updating the preview. The actual file needs handling.
        // Consider storing the file object itself if needed for upload:
        // setFormData(prev => ({ ...prev, logoFile: file }));
      };
      reader.readAsDataURL(file);
      // If you are storing the URL directly:
      // For simplicity, let's assume we store the preview URL for now
      // In a real app, you'd upload this and get back a URL
      // setFormData(prev => ({ ...prev, logo: 'TEMPORARY_PREVIEW_URL' }));
    }
  };

  // --- Event Handlers ---
  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...formData.events];
    updatedEvents[index] = {
      ...updatedEvents[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, events: updatedEvents }));
  };

  const addEvent = () => {
    const newEvent = {
      title: '',
      date: '',
      caption: '',
      image: '',
      formLink: '',
      galleryLink: '',
      isActive: true // Default to active
    };
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  };

  const removeEvent = (index) => {
    const updatedEvents = formData.events.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      events: updatedEvents
    }));
  };
  // --- End Event Handlers ---

  // --- Committee Member Handlers ---
  const handleCommitteeChange = (index, field, value) => {
    const updatedCommittee = [...formData.committee];
    // Ensure the item at the index is an object
    if (typeof updatedCommittee[index] !== 'object' || updatedCommittee[index] === null) {
        updatedCommittee[index] = { name: '', position: '' };
    }
    updatedCommittee[index] = {
      ...updatedCommittee[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, committee: updatedCommittee }));
  };

  const addCommitteeMember = () => {
    setFormData(prev => ({
      ...prev,
      committee: [...prev.committee, { name: '', position: '', email: '' }] // Add an object with name, position, and email
    }));
  };

  // Corrected removeCommitteeMember function definition
  const removeCommitteeMember = (index) => {
    const updatedCommittee = formData.committee.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      committee: updatedCommittee
    }));
  };

  // Handle form submission (for updates)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation (can be expanded)
    if (!formData.name || !formData.description || !formData.category) {
      setError('Club Name, Description, and Category are required.');
      return;
    }

    try {
      // Prepare data for update
      const updateData = {
        ...formData,
        linkedin: formData.linkedin || '',
        website: formData.website || '',
        image: previewLogo, // Make sure the image field is explicitly set to previewLogo
        members: formData.committee.filter(member => member.name?.trim() !== '').map(member => ({
          name: member.name,
          position: member.position,
          email: member.email // Explicitly include email in the members array
        })),
      };
      delete updateData.committee;
      console.log('Data being sent to updateClub:', JSON.stringify(updateData, null, 2));

      const response = await onUpdate(club._id, updateData);

      if (response.success) {
        setSuccess('Club updated successfully!');
        setIsEditingDetails(false);
        setIsEditingEvents(false);
      } else {
        setError(response.error || 'Failed to update club');
      }
    } catch (err) {
      console.error('Error updating club:', err);
      setError('An unexpected error occurred during update.');
    }
  };


  if (!club) return null;

  // Helper function to render form fields
  const renderField = (label, name, type = 'text', required = false, placeholder = '', options = null, isNested = false, objectName = '', fieldName = '') => {
    return renderFormField(
      formData,
      handleInputChange,
      handleNestedChange,
      label,
      name,
      type,
      required,
      placeholder,
      options,
      isNested,
      objectName,
      fieldName
    );
  };

  const categoryOptions = [
    { value: 'technical', label: 'Technical' },
    { value: 'non-technical', label: 'Non-Technical' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'sports', label: 'Sports' },
  ];

  // Define category colors for better visual distinction
  const categoryStyles = {
    technical: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    'non-technical': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    arts: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
    sports: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    default: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
  };
  const currentCategoryStyle = categoryStyles[club.category] || categoryStyles.default;

  return (
    <div className="fixed inset-0 z-[60] bg-gray-50 overflow-y-auto pt-20">
      {/* Sticky Header - Show only when editing */}
      {isEditingAny && (
        <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex justify-end items-center">
            <div className="flex items-center gap-2">
              {/* Cancel Button */}
              <button
                onClick={handleCancelEdit} // Generic cancel
                className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors flex items-center gap-1.5"
              >
                <i className="fas fa-times text-xs"></i> Cancel
              </button>
              {/* Save Button */}
              <button
                type="submit"
                form="club-edit-form" // Still links to the single form ID
                className="px-3 py-1.5 bg-primary-red text-white text-sm font-medium rounded-md hover:bg-secondary-red transition-colors flex items-center gap-1.5"
              >
                <i className="fas fa-save text-xs"></i> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Added pt-8 */}
      <div className="max-w-7xl mx-auto pt-8">
        {/* Status Messages */}
        {error && (
          <div className="m-4 md:m-6 lg:m-8 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md shadow-sm">
            <p className="font-medium text-sm">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="m-4 md:m-6 lg:m-8 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-sm">
            <p className="font-medium text-sm">Success</p>
            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Render Edit Form OR View Mode */}
        {isEditingAny ? (
          /* --- Edit Form --- */
          /* The form now conditionally shows sections */
          <form id="club-edit-form" onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Section 1-5: Details (Show only if isEditingDetails) */}
            {isEditingDetails && (
              <>
                {/* Section 1: Basic Info & Logo */}
                <div className="px-4 py-8 md:px-6 lg:px-8 md:py-10">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                    {/* Logo Column */}
                    <div className="md:col-span-1 flex flex-col items-center md:items-start">
                       <label className="block text-sm font-medium text-gray-600 mb-2 w-full text-center md:text-left">Club Logo</label>
                       <div className="relative w-36 h-36 mb-3 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow">
                         {previewLogo ? (
                           <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                         ) : (
                           <i className="fas fa-users text-5xl text-gray-400"></i>
                         )}
                       </div>
                       
                       {/* Logo URL Input */}
                       <div className="mt-2 mb-3 w-full">
                         <input 
                           type="url" 
                           placeholder="Paste logo image URL here" 
                           className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-1"
                           onChange={(e) => {
                             if (e.target.value.trim()) {
                               setPreviewLogo(e.target.value.trim());
                             }
                           }}
                         />
                         <div className="text-xs text-gray-500">Enter a direct URL to an image</div>
                         
                         <div className="flex items-center my-2">
                           <div className="flex-1 h-px bg-gray-200"></div>
                           <div className="px-2 text-xs text-gray-500">OR</div>
                           <div className="flex-1 h-px bg-gray-200"></div>
                         </div>
                       </div>
                       
                       <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
                       <label htmlFor="logo-upload" className="cursor-pointer bg-white py-1.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                         Upload Logo
                       </label>
                       {previewLogo && (
                         <button type="button" onClick={() => setPreviewLogo(null)} className="mt-2 text-xs text-red-600 hover:text-red-800">
                           Remove Logo
                         </button>
                       )}
                    </div>
                    {/* Fields Column */}
                    <div className="md:col-span-2">
                      {renderField('Club Name', 'name', 'text', true, 'Enter club name')}
                      {renderField('Category', 'category', 'select', true, 'Select category', categoryOptions)}
                      {renderField('Description', 'description', 'textarea', true, 'Describe the club and its activities')}
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact & Location */}
                <div className="px-4 py-8 md:px-6 lg:px-8 md:py-10 bg-white"> {/* Alternating background */}
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Contact & Location</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-0"> {/* Reduced gap-y */}
                    {renderField('Instagram Handle', 'instagram', 'text', false, 'e.g., mu_clubname (without @)')}
                    {renderField('LinkedIn Page', 'linkedin', 'text', false, 'e.g., company/club-name')}
                    {renderField('Website URL', 'website', 'url', false, 'e.g., https://clubwebsite.com')}
                    {renderField('Email Address', 'email', 'email', false, 'club.email@example.com')}
                    {renderField('Location / Room', 'location', 'text', false, 'e.g., Tech Park, Room 301')}
                  </div>
                </div>

                {/* Section 3: Leadership */}
                <div className="px-4 py-8 md:px-6 lg:px-8 md:py-10">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Leadership</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0"> {/* Reduced gap-y */}
                    {/* Club Head */}
                    <div className="space-y-0"> {/* Reduced space-y */}
                      <h3 className="text-md font-medium text-gray-600 mb-4">Club Head</h3>
                      {renderField('Head Name', 'head-name', 'text', false, 'Full Name', null, true, 'head', 'name')}
                      {renderField('Head Email', 'head-email', 'email', false, 'Email Address', null, true, 'head', 'email')}
                      {renderField('Head Phone', 'head-phone', 'tel', false, 'Phone Number', null, true, 'head', 'phone')}
                    </div>
                    
                    {/* Vice Head */}
                    <div className="space-y-0"> {/* Reduced space-y */}
                      <h3 className="text-md font-medium text-gray-600 mb-4">Vice Head</h3>
                      {renderField('Vice Head Name', 'vicehead-name', 'text', false, 'Full Name', null, true, 'viceHead', 'name')}
                      {renderField('Vice Head Email', 'vicehead-email', 'email', false, 'Email Address', null, true, 'viceHead', 'email')}
                      {renderField('Vice Head Phone', 'vicehead-phone', 'tel', false, 'Phone Number', null, true, 'viceHead', 'phone')}
                    </div>
                  </div>
                </div>

                {/* Section 4: Mentors */}
                <div className="px-4 py-8 md:px-6 lg:px-8 md:py-10 bg-white"> {/* Alternating background */}
                   <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-semibold text-gray-800">Mentors</h2>
                     <button 
                       type="button" 
                       onClick={addMentor} 
                       className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                     >
                       <i className="fas fa-plus text-xs"></i> Add Mentor
                     </button>
                   </div>
                   <div className="space-y-4">
                     {formData.mentors?.map((mentor, index) => (
                       <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                         <div>
                           <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                           <input 
                             type="text" 
                             value={typeof mentor === 'object' ? mentor.name || '' : mentor}
                             onChange={(e) => {
                               const value = e.target.value;
                               handleArrayChange('mentors', index, typeof mentor === 'object' ? 
                                 { ...mentor, name: value } : { name: value, department: '', email: '' })
                             }}
                             placeholder={`Mentor ${index + 1} Name`}
                             className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm bg-white"
                           />
                         </div>
                         <div>
                           <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                           <input 
                             type="text" 
                             value={typeof mentor === 'object' ? mentor.department || '' : ''}
                             onChange={(e) => {
                               const value = e.target.value;
                               handleArrayChange('mentors', index, typeof mentor === 'object' ? 
                                 { ...mentor, department: value } : { name: '', department: value, email: '' })
                             }}
                             placeholder="Department"
                             className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm bg-white"
                           />
                         </div>
                         <div className="flex items-start">
                           <div className="flex-grow">
                             <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                             <input 
                               type="email" 
                               value={typeof mentor === 'object' ? mentor.email || '' : ''}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 handleArrayChange('mentors', index, typeof mentor === 'object' ? 
                                   { ...mentor, email: value } : { name: '', department: '', email: value })
                               }}
                               placeholder="Email"
                               className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm bg-white"
                             />
                           </div>
                           <button type="button" onClick={() => removeMentor(index)} className="text-red-500 hover:text-red-700 p-1 flex-shrink-0 mt-6 ml-2" aria-label="Remove Mentor">
                             <i className="fas fa-trash text-sm"></i>
                           </button>
                         </div>
                       </div>
                     ))}
                     {formData.mentors?.length === 0 && (
                       <p className="text-sm text-gray-500 italic text-center py-2">No mentors added yet.</p>
                     )}
                   </div>
                </div>

                {/* Section 5: Organizing Committee */}
                <div className="px-4 py-8 md:px-6 lg:px-8 md:py-10">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Organizing Committee</h2>
                    <button
                      type="button"
                      onClick={addCommitteeMember}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <i className="fas fa-plus text-xs"></i> Add Member
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.committee?.map((member, index) => (
                      <div key={`committee-edit-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Name Input */}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                          <input 
                            type="text"
                            value={member?.name || ''} // Access name property
                            onChange={(e) => handleCommitteeChange(index, 'name', e.target.value)}
                            placeholder={`Member ${index + 1} Name`}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm bg-white"
                          />
                        </div>
                        {/* Position Input */}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                          <input 
                            type="text"
                            value={member?.position || ''} // Access position property
                            onChange={(e) => handleCommitteeChange(index, 'position', e.target.value)}
                            placeholder="Position (e.g., Treasurer)"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm bg-white"
                          />
                        </div>
                        {/* Email Input */}
                        <div className="flex items-start">
                          <div className="flex-grow">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                            <input 
                              type="email"
                              value={member?.email || ''}
                              onChange={(e) => handleCommitteeChange(index, 'email', e.target.value)}
                              placeholder="Email Address"
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm bg-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCommitteeMember(index)}
                            className="text-red-500 hover:text-red-700 p-1 flex-shrink-0 mt-6 ml-2"
                            aria-label="Remove Member"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    {formData.committee?.length === 0 && (
                      <p className="text-sm text-gray-500 italic text-center py-2">No committee members added yet.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Section 6: Events (Show only if isEditingEvents) */}
            {isEditingEvents && (
              <div className="px-4 py-8 md:px-6 lg:px-8 md:py-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Events</h2>
                  <button
                    type="button"
                    onClick={addEvent}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <i className="fas fa-plus text-xs"></i> Add Event
                  </button>
                </div>
                <div className="space-y-8">
                  {formData.events?.map((event, index) => (
                    <div key={`event-edit-${index}`} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm relative">
                      <button
                        type="button"
                        onClick={() => removeEvent(index)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"
                        aria-label="Remove Event"
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                      <h4 className="font-medium text-gray-700 mb-4">Event #{index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Column 1 */}
                        <div>
                          <label htmlFor={`event-title-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Title*</label>
                          <input
                            type="text"
                            id={`event-title-${index}`}
                            value={event.title || ''}
                            onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                            placeholder="Event Title"
                            required
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor={`event-date-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                          <input
                            type="text" // Consider using type="datetime-local" for better UX
                            id={`event-date-${index}`}
                            value={event.date || ''}
                            onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                            placeholder="e.g., Oct 26, 2024, 6:00 PM"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor={`event-caption-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Caption</label>
                          <textarea
                            id={`event-caption-${index}`}
                            rows="3"
                            value={event.caption || ''}
                            onChange={(e) => handleEventChange(index, 'caption', e.target.value)}
                            placeholder="Short description of the event"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm"
                          />
                        </div>
                        {/* Column 2 */}
                        <div>
                          <label htmlFor={`event-image-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                          <input
                            type="url"
                            id={`event-image-${index}`}
                            value={event.image || ''}
                            onChange={(e) => handleEventChange(index, 'image', e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm"
                          />
                        </div>
                         <div>
                          <label htmlFor={`event-formLink-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Registration Link</label>
                          <input
                            type="url"
                            id={`event-formLink-${index}`}
                            value={event.formLink || ''}
                            onChange={(e) => handleEventChange(index, 'formLink', e.target.value)}
                            placeholder="https://forms.gle/..."
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm"
                          />
                        </div>
                         <div>
                          <label htmlFor={`event-galleryLink-${index}`} className="block text-xs font-medium text-gray-500 mb-1">Gallery Link (Past)</label>
                          <input
                            type="url"
                            id={`event-galleryLink-${index}`}
                            value={event.galleryLink || ''}
                            onChange={(e) => handleEventChange(index, 'galleryLink', e.target.value)}
                            placeholder="https://photos.app.goo.gl/..."
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-red focus:border-primary-red text-sm"
                          />
                        </div>
                        {/* Is Active Toggle */}
                        <div className="flex items-center mt-2">
                           <input
                             type="checkbox"
                             id={`event-isActive-${index}`}
                             checked={event.isActive || false}
                             onChange={(e) => handleEventChange(index, 'isActive', e.target.checked)}
                             className="h-4 w-4 text-primary-red border-gray-300 rounded focus:ring-primary-red"
                           />
                           <label htmlFor={`event-isActive-${index}`} className="ml-2 block text-sm text-gray-700">
                             Active / Upcoming Event
                           </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.events?.length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-4">No events added yet.</p>
                  )}
                </div>
              </div>
            )}
          </form>
        ) : (
          /* --- View Mode --- */
          /* View mode remains mostly the same, but buttons trigger specific toggles */
          <div>
            {/* Section 1: Header Info - Enhanced */}
            <div className={`relative px-4 py-10 md:px-6 lg:px-8 md:py-16 ${currentCategoryStyle.bg} bg-opacity-50 border-b ${currentCategoryStyle.border}`}>
              {/* Back Button Container */}
              <div className="absolute top-4 left-4">
                <button
                  onClick={onClose}
                  className="flex items-center text-gray-600 hover:text-primary-red transition-colors focus:outline-none"
                  aria-label="Back to clubs"
                  id="back-to-clubs-btn"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  <span className="font-medium text-sm">Back to Clubs</span>
                </button>
              </div>
              {/* Edit/Delete Buttons Container */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {/* Show Edit Details button only if user has edit permission */}
                {hasEditPermission() && (
                  <button
                    onClick={handleToggleDetailsEdit} // Edit Details
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-200 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <i className="fas fa-edit text-xs"></i> Edit Details
                  </button>
                )}
                {/* Only show delete button if canDelete is true */}
                {canDelete && (
                  <button
                    onClick={onDelete}
                    className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 transition-colors flex items-center gap-1.5 shadow-sm"
                    aria-label="Delete club"
                  >
                    <i className="fas fa-trash text-xs"></i> Delete
                  </button>
                )}
              </div>
              {/* Main Header Content */}
              <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10">
                <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {club.image ? (
                    <img 
                      src={club.image} 
                      alt={`${club.name} logo`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log("Image failed to load:", club.image);
                        e.target.onerror = null;
                        e.target.src = `/api/placeholder/150/150?text=${encodeURIComponent(club.name)}`;
                      }}
                    />
                  ) : (
                    <i className="fas fa-users text-6xl text-gray-400"></i>
                  )}
                </div>
                <div className="flex-grow pt-2 text-center md:text-left">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${currentCategoryStyle.bg} ${currentCategoryStyle.text}`}>
                    <i className="fas fa-tag mr-1.5 opacity-70"></i>
                    {club.category?.charAt(0).toUpperCase() + club.category?.slice(1) || 'Uncategorized'}
                  </span>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">{club.name}</h1>
                  <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto md:mx-0">{club.description}</p>
                  {/* Contact Icons */}
                  <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 text-sm">
                    {club.instagram && (
                      <a href={`https://instagram.com/${club.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-pink-600 transition-colors group">
                        <i className="fab fa-instagram text-lg mr-1.5 group-hover:scale-110 transition-transform"></i> @{club.instagram}
                      </a>
                    )}
                    {club.linkedin && (
                      <a href={`https://linkedin.com/in/${club.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-blue-700 transition-colors group">
                        <i className="fab fa-linkedin text-lg mr-1.5 group-hover:scale-110 transition-transform"></i> LinkedIn
                      </a>
                    )}
                    {club.website && (
                      <a href={club.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-green-700 transition-colors group">
                        <i className="fas fa-globe text-lg mr-1.5 group-hover:scale-110 transition-transform"></i> Website
                      </a>
                    )}
                    {club.email && (
                      <a href={`mailto:${club.email}`} className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group">
                        <i className="far fa-envelope text-lg mr-1.5 group-hover:scale-110 transition-transform"></i> {club.email}
                      </a>
                    )}
                    {club.location && (
                      <div className="flex items-center text-gray-600 group">
                        <i className="fas fa-map-marker-alt text-lg mr-1.5 group-hover:scale-110 transition-transform"></i> {club.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Team */}
            <div className="px-4 py-8 md:px-6 lg:px-8 md:py-10 bg-white border-t border-gray-200">
              {/* Updated Main Heading for this section */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center gap-2"><i className="fas fa-users-cog text-primary-red"></i> Team</h2> {/* Changed text and icon */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Left Column: Leadership & Mentors */}
                <div className="lg:col-span-1 space-y-8">
                   <div>
                      {/* Reverted Leadership Heading Style */}
                      <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2"><i className="fas fa-user-tie text-primary-red"></i> Leadership</h2>
                      <ul className="space-y-5">
                        {club.head?.name && (
                          <li className="flex items-start gap-3">
                            <div className={`${currentCategoryStyle.bg} rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <i className={`fas fa-user text-sm ${currentCategoryStyle.text}`}></i>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 text-sm">{club.head.name}</span>
                              <span className="block text-xs text-gray-500">Club Head</span>
                              {club.head.email && <a href={`mailto:${club.head.email}`} className="block text-xs text-blue-600 hover:underline break-all">{club.head.email}</a>}
                            </div>
                          </li>
                        )}
                        {club.viceHead?.name && (
                           <li className="flex items-start gap-3">
                            <div className={`${currentCategoryStyle.bg} rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <i className={`fas fa-user text-sm ${currentCategoryStyle.text}`}></i>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 text-sm">{club.viceHead.name}</span>
                              <span className="block text-xs text-gray-500">Vice Head</span>
                              {club.viceHead.email && <a href={`mailto:${club.viceHead.email}`} className="block text-xs text-blue-600 hover:underline break-all">{club.viceHead.email}</a>}
                            </div>
                          </li>
                        )}
                        {!club.head?.name && !club.viceHead?.name && <p className="text-sm text-gray-500 italic">No leadership listed.</p>}
                      </ul>
                   </div>
                   {club.mentors?.length > 0 && (
                      <div className="pt-6 border-t border-gray-200">
                        {/* Reverted Mentors Heading Style */}
                        <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2"><i className="fas fa-chalkboard-teacher text-primary-red"></i> Mentors</h2>
                        <ul className="space-y-3">
                          {club.mentors.map((mentor, idx) => (
                            <li key={`mentor-${idx}`} className="flex items-center gap-2 text-sm text-gray-700">
                              <i className="fas fa-graduation-cap text-gray-400 text-xs w-4 text-center"></i>
                              {/* Check if mentor is object or string and render accordingly */}
                              {typeof mentor === 'object' ? (
                                <span>{mentor.name} {mentor.department ? `(${mentor.department})` : ''}</span>
                              ) : (
                                <span>{mentor}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
                {/* Right Column: Organizing Committee (Previously Members) */}
                <div className="lg:col-span-2"> {/* Move content inside this div */}
                   <div className="flex justify-between items-center mb-5"> {/* Reverted margin-bottom */}
                      {/* Reverted Committee Heading Style */}
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-users text-primary-red"></i> Organizing Committee</h2>
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {club.members?.length || 0} Members
                      </span>
                   </div>
                   {club.members && club.members.length > 0 ? (
                     <div className="max-h-[300px] overflow-y-auto">
                       <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                         {/* This mapping should now work correctly if backend sends objects */}
                         {club.members.map((member, idx) => {
                           // Check if member is an object (robust check)
                           const isObject = typeof member === 'object' && member !== null;
                           const memberName = isObject ? member.name : member; // Fallback if somehow still a string
                           const memberPosition = isObject ? member.position : '';
                           const memberEmail = isObject ? member.email : '';
                           return (
                             <li key={`committee-${idx}`} className="flex items-start gap-1.5 truncate">
                               <i className="fas fa-user-circle text-gray-400 text-xs mt-1"></i>
                               <div>
                                 <span className="text-gray-700 block truncate font-medium">{memberName}</span>
                                 {memberPosition && <span className="text-gray-500 text-xs block truncate">{memberPosition}</span>}
                                 {memberEmail && <a href={`mailto:${memberEmail}`} className="text-blue-600 hover:underline text-xs block truncate">{memberEmail}</a>}
                               </div>
                             </li>
                           );
                         })}
                       </ul>
                     </div>
                   ) : (
                     <div className="text-center py-10 text-gray-500 text-sm italic">No committee members listed yet.</div>
                   )}
                </div> {/* End of lg:col-span-2 */}
              </div>
            </div>

            {/* Section 3: Events - Alternating Layout */}
            <div className="relative px-4 py-8 md:px-6 lg:px-8 md:py-10 bg-white border-t border-gray-200"> {/* Added relative positioning */}
              <div className="flex justify-between items-center mb-8"> {/* Flex container for heading and button */}
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-calendar-alt text-primary-red"></i> Events</h2>
                {/* Add Edit Events Button - Conditionally Rendered */}
                {hasEditPermission() && (
                  <button
                    onClick={handleToggleEventsEdit} // Toggles the main edit mode
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-200 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <i className="fas fa-edit text-xs"></i> Edit Events
                  </button>
                )}
              </div>

              {/* Current / Upcoming Events */}
              <div className="mb-12">
                <h3 className="font-medium text-lg text-gray-700 mb-6 flex items-center gap-2">
                   Current / Upcoming
                </h3>
                <div className="space-y-10">
                  {club.events?.filter(e => e.isActive).length > 0 ? (
                    club.events.filter(e => e.isActive).map((event, idx) => (
                      <div key={`current-${idx}`} className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                        {/* Event Image - Increased width */}
                        <div className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0">
                          <div className="aspect-video rounded-lg overflow-hidden shadow-md bg-gray-200">
                            {/* Placeholder/Actual Image */}
                            <img
                              src={event.image || `https://source.unsplash.com/random/400x225?sig=${club._id}event${idx}`} // Use event image or placeholder
                              alt={`${event.title} image`}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                          </div>
                        </div>
                        {/* Event Content */}
                        <div className="flex-grow text-center md:text-left">
                          <div className="text-xs text-gray-500 mb-1.5 font-medium">{event.date}</div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h4>
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{event.caption}</p>
                          {event.formLink && (
                            <a href={event.formLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-red hover:text-secondary-red font-medium inline-flex items-center gap-1.5 group">
                              Register Now <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic py-4 text-center">No active events scheduled.</p>
                  )}
                </div>
              </div>

              {/* Past Events - Simple List */}
              <div>
                <h3 className="font-medium text-lg text-gray-700 mb-6 flex items-center gap-2 border-t border-gray-200 pt-8">
                   Past Events
                </h3>
                <div className="space-y-10">
                  {club.events?.filter(e => !e.isActive).length > 0 ? (
                    club.events.filter(e => !e.isActive).map((event, idx) => (
                      <div key={`past-${idx}`} className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                        {/* Event Image - Increased width */}
                        <div className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0">
                          <div className="aspect-video rounded-lg overflow-hidden shadow-md bg-gray-200">
                            {/* Placeholder/Actual Image */}
                            <img
                              src={event.image || `https://source.unsplash.com/random/400x225?sig=${club._id}past${idx}`}
                              alt={`${event.title}`}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                          </div>
                        </div>
                        {/* Event Content */}
                        <div className="flex-grow text-center md:text-left">
                          <div className="text-xs text-gray-500 mb-1.5 font-medium">{event.date}</div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h4>
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{event.caption}</p>
                          {event.galleryLink && (
                            <a href={event.galleryLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1.5 group">
                              View Gallery <i className="fas fa-images text-xs group-hover:translate-x-1 transition-transform"></i>
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic py-4 text-center">No past events recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
       {/* Footer Padding */}
       <div className="h-16"></div>
    </div>
  );
};

export default ClubsEvents;