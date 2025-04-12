import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import PresentationService from '../../../../services/PresentationService';
import { toast } from 'react-toastify';

const PresentationSlot = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    school: '',
    department: ''
  });

  // Team members for team presentations
  const [teamMembers, setTeamMembers] = useState([
    { name: '', email: '', id: '' }
  ]);
  
  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [slotsPerPage] = useState(5);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('available');
  
  // Load presentation slots and user's bookings on mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Filter slots when filters change
  useEffect(() => {
    filterSlots();
  }, [filters, slots]);
  
  // Fetch all necessary data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch available presentation slots
      const availableSlots = await PresentationService.getAvailableSlots();
      setSlots(availableSlots);
      
      // Fetch user's bookings
      const userBookings = await PresentationService.getUserBookings();
      setMyBookings(userBookings);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load presentation slots');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter slots based on search and filters
  const filterSlots = () => {
    let results = [...slots];
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(slot => 
        slot.title.toLowerCase().includes(searchTerm) ||
        slot.description.toLowerCase().includes(searchTerm) ||
        slot.venue.toLowerCase().includes(searchTerm) ||
        slot.hostName?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by date
    if (filters.date) {
      const selectedDate = new Date(filters.date).setHours(0, 0, 0, 0);
      results = results.filter(slot => {
        const slotDate = new Date(slot.date).setHours(0, 0, 0, 0);
        return slotDate === selectedDate;
      });
    }
    
    // Filter by school
    if (filters.school) {
      results = results.filter(slot => 
        slot.targetSchool === filters.school || 
        slot.targetSchool === 'All Schools'
      );
    }
    
    // Filter by department
    if (filters.department) {
      results = results.filter(slot => 
        slot.targetDepartment === filters.department || 
        slot.targetDepartment === 'All Departments'
      );
    }
    
    setFilteredSlots(results);
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

  // Initialize booking process for a slot
  const initializeBooking = (slot) => {
    setSelectedSlot(slot);
    
    // If it's a team presentation, initialize team members
    if (slot.presentationType === 'team') {
      setTeamMembers([
        { name: currentUser.name, email: currentUser.email, id: currentUser._id }
      ]);
    }
    
    setShowBookingForm(true);
  };

  // Add team member field
  const addTeamMember = () => {
    if (teamMembers.length < (selectedSlot?.maxTeamMembers || 5)) {
      setTeamMembers([...teamMembers, { name: '', email: '', id: '' }]);
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

  // Submit booking request
  const submitBooking = async () => {
    if (!selectedSlot) return;
    
    // Validate team members if applicable
    if (selectedSlot.presentationType === 'team') {
      const isTeamValid = teamMembers.every(member => 
        member.name.trim() !== '' && member.email.trim() !== ''
      );
      
      if (!isTeamValid) {
        toast.error('Please fill in all team member details');
        return;
      }
      
      if (teamMembers.length < (selectedSlot.minTeamMembers || 1)) {
        toast.error(`A minimum of ${selectedSlot.minTeamMembers} team members is required`);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const bookingData = {
        slotId: selectedSlot._id,
        teamMembers: selectedSlot.presentationType === 'team' ? teamMembers : undefined
      };
      
      const response = await PresentationService.bookSlot(bookingData);
      
      // Update UI
      // Remove the booked slot from available slots
      setSlots(slots.filter(slot => slot._id !== selectedSlot._id));
      
      // Add to my bookings
      setMyBookings([response, ...myBookings]);
      
      // Reset form
      setShowBookingForm(false);
      setSelectedSlot(null);
      setTeamMembers([{ name: '', email: '', id: '' }]);
      
      toast.success('Presentation slot booked successfully!');
      
      // Switch to My Bookings tab
      setActiveTab('bookings');
    } catch (error) {
      console.error('Error booking slot:', error);
      toast.error(error.response?.data?.message || 'Failed to book presentation slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize cancel booking process
  const initiateCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowConfirmation(true);
  };

  // Execute booking cancellation
  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    setIsSubmitting(true);
    
    try {
      await PresentationService.cancelBooking(bookingToCancel._id);
      
      // Update UI
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
      
      toast.success('Booking cancelled successfully');
      setShowConfirmation(false);
      setBookingToCancel(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if a date is in the past
  const isPastDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Handle pagination
  const indexOfLastSlot = currentPage * slotsPerPage;
  const indexOfFirstSlot = indexOfLastSlot - slotsPerPage;
  const currentSlots = filteredSlots.slice(indexOfFirstSlot, indexOfLastSlot);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-8 w-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-amber-100">
          <div className="p-8 bg-gradient-to-r from-amber-500 to-yellow-400">
            <h1 className="text-3xl font-bold text-white">Presentation Slots</h1>
            <p className="text-amber-50 mt-2">Book presentation slots for your projects and assignments</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-6">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('available')}
              >
                Available Slots
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('bookings')}
              >
                My Bookings
              </button>
            </nav>
          </div>
          
          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'available' ? (
              <>
                {/* Filters */}
                <div className="mb-6 bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <h2 className="text-lg font-medium text-amber-900 mb-2 md:mb-0">Filter Presentation Slots</h2>
                    <button
                      onClick={resetFilters}
                      className="text-amber-600 hover:text-amber-800 text-sm"
                    >
                      Reset Filters
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                      <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by title, venue, host..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                      <select
                        name="school"
                        value={filters.school}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">All Schools</option>
                        <option value="École Centrale School of Engineering(ECSE)">ECSE</option>
                        <option value="School of Management(SOM)">SOM</option>
                        <option value="School Of Law(SOL)">SOL</option>
                        <option value="Indira Mahindra School of Education(IMSOE)">IMSOE</option>
                        <option value="School of Digital Media and Communication(SDMC)">SDMC</option>
                        <option value="School of Design Innovation(SODI)">SODI</option>
                        <option value="School of Hospitality Management(SOHM)">SOHM</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={filters.department}
                        onChange={handleFilterChange}
                        placeholder="Department name..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Available Slots */}
                {isLoading ? (
                  <div className="w-full flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : filteredSlots.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">No Presentation Slots Found</h3>
                    <p className="text-gray-600 mb-6">No available slots match your criteria. Try adjusting your filters.</p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-4">Available Presentation Slots</h2>
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date & Time</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Title & Venue</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Host</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {currentSlots.map(slot => (
                            <tr key={slot._id} className="hover:bg-amber-50">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                <div>{formatDate(slot.date)}</div>
                                <div className="font-normal text-gray-500">{slot.startTime} - {slot.endTime}</div>
                                <div className="mt-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                    {slot.duration} min
                                  </span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <div className="font-medium text-gray-900">{slot.title}</div>
                                <div>{slot.venue}</div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <div>{slot.hostName || 'Faculty'}</div>
                                <div className="text-xs text-gray-400">{slot.hostId}</div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <div>
                                  {slot.targetYear && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                      {slot.targetYear}
                                    </span>
                                  )}
                                  {slot.targetDepartment && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-1">
                                      {slot.targetDepartment}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    {slot.presentationType === 'single' ? 'Individual' : 'Team'}
                                  </span>
                                  {slot.presentationType === 'team' && (
                                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      {slot.minTeamMembers}-{slot.maxTeamMembers} members
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <button
                                  onClick={() => initializeBooking(slot)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                >
                                  Book Slot
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    {filteredSlots.length > slotsPerPage && (
                      <div className="flex justify-center mt-6">
                        <nav className="flex items-center justify-between">
                          <div className="flex-1 flex justify-between sm:justify-end">
                            <button
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              Previous
                            </button>
                            <div className="mx-2 flex items-center">
                              <span className="text-gray-700 mx-2">
                                Page {currentPage} of {Math.ceil(filteredSlots.length / slotsPerPage)}
                              </span>
                            </div>
                            <button
                              onClick={() => paginate(currentPage + 1)}
                              disabled={currentPage === Math.ceil(filteredSlots.length / slotsPerPage)}
                              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                                currentPage === Math.ceil(filteredSlots.length / slotsPerPage)
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              Next
                            </button>
                          </div>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {/* My Bookings */}
                <h2 className="text-xl font-semibold mb-4">My Presentation Bookings</h2>
                
                {isLoading ? (
                  <div className="w-full flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : myBookings.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't booked any presentation slots yet.</p>
                    <button
                      onClick={() => setActiveTab('available')}
                      className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                    >
                      Browse Available Slots
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myBookings.map(booking => (
                      <div key={booking._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                        <div className={`p-4 ${
                          isPastDate(booking.slot.date) 
                            ? 'bg-gray-100' 
                            : 'bg-gradient-to-r from-amber-50 to-yellow-50'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{booking.slot.title}</h3>
                              <p className="text-sm text-gray-500">{booking.slot.venue}</p>
                            </div>
                            <div className="mt-2 sm:mt-0">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isPastDate(booking.slot.date)
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {isPastDate(booking.slot.date) ? 'Past' : 'Upcoming'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 p-4">
                          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
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
                            
                            {booking.teamMembers && booking.teamMembers.length > 0 && (
                              <div className="sm:col-span-2 lg:col-span-3">
                                <dt className="text-sm font-medium text-gray-500">Team Members</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  <ul className="list-disc pl-5 space-y-1">
                                    {booking.teamMembers.map((member, idx) => (
                                      <li key={idx}>
                                        {member.name} {member.email ? `(${member.email})` : ''}
                                      </li>
                                    ))}
                                  </ul>
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                        
                        <div className="border-t border-gray-200 p-4">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              Booked on {new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                            
                            {!isPastDate(booking.slot.date) && (
                              <button
                                onClick={() => initiateCancelBooking(booking)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-red-500 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Booking Form Modal */}
        {showBookingForm && selectedSlot && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Book Presentation Slot
                  </h3>
                  
                  <div className="bg-amber-50 p-4 rounded-md mb-6">
                    <h4 className="font-medium text-amber-800">{selectedSlot.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedSlot.description}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Date:</span> {formatDate(selectedSlot.date)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Time:</span> {selectedSlot.startTime} - {selectedSlot.endTime}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Venue:</span> {selectedSlot.venue}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Type:</span> {selectedSlot.presentationType === 'single' ? 'Individual' : 'Team'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Members Form (only for team presentations) */}
                  {selectedSlot.presentationType === 'team' && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-2">Team Members</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Please enter the details of all team members who will be presenting.
                        {selectedSlot.minTeamMembers && selectedSlot.maxTeamMembers && (
                          <span> Required: {selectedSlot.minTeamMembers} to {selectedSlot.maxTeamMembers} members.</span>
                        )}
                      </p>
                      
                      {teamMembers.map((member, index) => (
                        <div key={index} className="mb-4 p-3 border border-gray-200 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-sm font-medium text-gray-700">
                              {index === 0 ? 'Team Lead (You)' : `Member ${index + 1}`}
                            </h5>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => removeTeamMember(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                disabled={index === 0} // First member is the current user
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={member.email}
                                onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                                disabled={index === 0} // First member is the current user
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {teamMembers.length < (selectedSlot.maxTeamMembers || 5) && (
                        <button
                          type="button"
                          onClick={addTeamMember}
                          className="mt-2 inline-flex items-center px-3 py-2 border border-amber-300 text-sm leading-4 font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Team Member
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-700 mb-4">
                    <p>
                      <strong>Note:</strong> By booking this slot, you confirm that you will attend the presentation
                      at the scheduled time. Please arrive 10 minutes early to set up.
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={submitBooking}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowBookingForm(false);
                      setSelectedSlot(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Confirmation Modal for cancellation */}
        {showConfirmation && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Cancel Booking
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to cancel this booking? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={confirmCancelBooking}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Canceling...' : 'Confirm Cancel'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowConfirmation(false);
                      setBookingToCancel(null);
                    }}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PresentationSlot;
