import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../utils/axiosConfig';
import { toast } from 'react-hot-toast';

// Main Event Booking Component
const EventBooking = () => {
  const [activeView, setActiveView] = useState('listing'); // 'listing', 'details', 'seats', 'checkout', 'confirmation'
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { eventId } = useParams();

  // Generate a default seating map if none is provided
  const generateDefaultSeatingMap = () => {
    // Create a simple 10x10 grid
    const rows = 10;
    const seatsPerRow = 10;
    const map = [];
    
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < seatsPerRow; j++) {
        row.push({
          id: `${String.fromCharCode(65 + i)}${j + 1}`,
          status: 'available'  // 'available', 'reserved', 'booked'
        });
      }
      map.push(row);
    }
    
    return map;
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/events/university');
      if (response.status === 200) {
        // Add additional fields needed for the booking system
        const enhancedEvents = response.data.events.map(event => ({
          ...event,
          venue: event.venue || 'Main Auditorium',
          availableSeats: event.availableSeats || 100,
          ticketPrice: event.ticketPrice || 0, // Free by default
          seatingMap: event.seatingMap || generateDefaultSeatingMap(),
          categories: event.categories || ['General']
        }));
        setEvents(enhancedEvents);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch events on component mount - removed fetchEvents from dependency array
  useEffect(() => {
    fetchEvents();
  }, []);

  // If eventId is provided, show event details
  useEffect(() => {
    if (eventId) {
      const event = events.find(e => e._id === eventId);
      if (event) {
        setSelectedEvent(event);
        setActiveView('details');
      }
    }
  }, [eventId, events]);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setActiveView('details');
  };

  const handleBookNowClick = () => {
    if (!currentUser) {
      toast.error('Please login to book tickets');
      navigate('/login', { state: { from: `/college/bookings/events/${selectedEvent._id}` } });
      return;
    }
    setActiveView('seats');
  };

  const handleSeatSelect = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    setActiveView('checkout');
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      console.log('Current user data:', {
        id: currentUser?._id,
        name: currentUser?.name,
        email: currentUser?.email
      });
      
      // Set authorization header to ensure user is authenticated
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Create contact details from form inputs
      const contactDetails = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
        // Remove userId from contactDetails - it will be determined by the auth token
      };
      
      // Prepare booking data
      const bookingData = {
        eventId: selectedEvent._id,
        seats: selectedSeats,
        contactDetails
      };
      
      console.log('Sending booking request with data:', {
        eventId: bookingData.eventId,
        seatCount: bookingData.seats.length,
        contactName: bookingData.contactDetails.name
      });
      
      // Send request to book the seats
      const response = await api.post('/api/events/bookings', bookingData);
      
      console.log('Booking response:', {
        status: response.status,
        success: response.data.success,
        bookingId: response.data.booking?._id
      });
      
      if (response.status === 200) {
        // Update local state
        setEvents(events.map(event => {
          if (event._id === selectedEvent._id) {
            const updatedSeatingMap = event.seatingMap.map(row => {
              return row.map(seat => {
                if (selectedSeats.includes(seat.id)) {
                  return { ...seat, status: 'booked' };
                }
                return seat;
              });
            });
            
            return { 
              ...event, 
              seatingMap: updatedSeatingMap,
              availableSeats: event.availableSeats - selectedSeats.length
            };
          }
          return event;
        }));
        
        // Show confirmation
        setActiveView('confirmation');
        toast.success('Booking confirmed!');
      } else {
        throw new Error('Failed to book tickets');
      }
    } catch (err) {
      console.error('Error booking tickets:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
      }
      toast.error(err.response?.data?.message || 'Failed to book tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesQuery = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || 
      (event.categories && event.categories.includes(filterCategory));
    
    return matchesQuery && matchesCategory;
  });

  // Memoize event handlers to prevent focus loss
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryFilter = useCallback((category) => {
    setFilterCategory(category);
  }, []);

  const EventListingView = () => (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">University Events</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Book tickets for upcoming university events, concerts, performances and more
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <i className="fas fa-search text-gray-400"></i>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleCategoryFilter('all')}
              className={`px-4 py-2 rounded-md ${filterCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
            >
              All
            </button>
            <button
              onClick={() => handleCategoryFilter('Cultural')}
              className={`px-4 py-2 rounded-md ${filterCategory === 'Cultural' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
            >
              Cultural
            </button>
            <button
              onClick={() => handleCategoryFilter('Technical')}
              className={`px-4 py-2 rounded-md ${filterCategory === 'Technical' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
            >
              Technical
            </button>
            <button
              onClick={() => handleCategoryFilter('Sports')}
              className={`px-4 py-2 rounded-md ${filterCategory === 'Sports' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
            >
              Sports
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchEvents}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.length > 0 ? filteredEvents.map((event) => (
              <motion.div 
                key={event._id}
                className="bg-white overflow-hidden shadow-lg rounded-lg cursor-pointer"
                whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                onClick={() => handleEventSelect(event)}
              >
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={event.image || 'https://picsum.photos/seed/' + event._id + '/800/400'} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${event.availableSeats > 20 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {event.availableSeats} seats left
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">{event.title}</h3>
                  <p className="mt-2 text-gray-500 line-clamp-2">{event.caption || 'Join us for this amazing event!'}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-900">
                      {event.ticketPrice > 0 ? `₹${event.ticketPrice}` : 'Free Entry'}
                    </p>
                    <button
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        handleBookNowClick();
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
                <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const EventDetailsView = () => (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button 
            onClick={() => setActiveView('listing')}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Events
          </button>
        </div>
        
        {selectedEvent && (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src={selectedEvent.image || 'https://picsum.photos/seed/' + selectedEvent._id + '/800/600'} 
                  alt={selectedEvent.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="p-8 md:w-1/2">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  {selectedEvent.categories && selectedEvent.categories.map(category => (
                    <span key={category} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900">{selectedEvent.title}</h1>
                
                <div className="mt-6 flex items-center">
                  <i className="fas fa-map-marker-alt text-gray-500 mr-2"></i>
                  <span className="text-gray-700">{selectedEvent.venue || 'Main Auditorium'}</span>
                </div>
                
                <div className="mt-2 flex items-center">
                  <i className="fas fa-clock text-gray-500 mr-2"></i>
                  <span className="text-gray-700">
                    {selectedEvent.time || '7:00 PM'}
                  </span>
                </div>
                
                <p className="mt-6 text-gray-600">
                  {selectedEvent.description || selectedEvent.caption || 'Join us for this amazing event at the university!'}
                </p>
                
                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Price per ticket</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedEvent.ticketPrice > 0 ? `₹${selectedEvent.ticketPrice}` : 'Free Entry'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available seats</p>
                      <p className={`text-2xl font-bold ${selectedEvent.availableSeats > 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedEvent.availableSeats}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBookNowClick}
                    disabled={selectedEvent.availableSeats === 0}
                    className={`w-full mt-4 py-3 px-6 text-white rounded-md flex items-center justify-center text-lg
                      ${selectedEvent.availableSeats > 0 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-400 cursor-not-allowed'}`
                    }
                  >
                    {selectedEvent.availableSeats > 0 ? (
                      <>
                        <i className="fas fa-ticket-alt mr-2"></i>
                        Book Now
                      </>
                    ) : 'Sold Out'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const SeatSelectionView = () => {
    if (!selectedEvent) {
      return (
        <div className="py-8 text-center">
          <p>Loading event details...</p>
          <button 
            onClick={() => setActiveView('listing')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Events
          </button>
        </div>
      );
    }
    
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button 
              onClick={() => setActiveView('details')}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Event Details
            </button>
          </div>
          
          <div className="bg-white shadow-xl rounded-lg overflow-hidden p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Your Seats</h1>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-full max-w-3xl bg-gray-800 py-2 text-center text-white text-sm rounded-t-lg">
                STAGE
              </div>
              
              <div className="w-full max-w-3xl mt-10 mb-6">
                {selectedEvent.seatingMap.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center mb-2">
                    <div className="w-6 text-center text-gray-500 mr-2">
                      {String.fromCharCode(65 + rowIndex)}
                    </div>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {row.map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => seat.status === 'available' && handleSeatSelect(seat.id)}
                          disabled={seat.status !== 'available'}
                          className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs transition-colors
                            ${seat.status === 'booked' ? 'bg-gray-300 cursor-not-allowed' : 
                              seat.status === 'reserved' ? 'bg-yellow-200 cursor-not-allowed' :
                                selectedSeats.includes(seat.id) ? 'bg-green-500 text-white' : 
                                  'bg-gray-100 hover:bg-gray-200'
                            }`}
                          title={`Seat ${seat.id}`}
                        >
                          {seat.id.substring(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="w-full max-w-3xl flex justify-center gap-6 mb-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 rounded-sm mr-2"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                  <span className="text-sm text-gray-600">Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-sm mr-2"></div>
                  <span className="text-sm text-gray-600">Booked</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Selected Seats</p>
                  <p className="text-lg font-medium text-gray-900">
                    {selectedSeats.length > 0 
                      ? selectedSeats.join(', ') 
                      : 'None selected'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedEvent.ticketPrice > 0 
                      ? `₹${selectedSeats.length * selectedEvent.ticketPrice}` 
                      : 'Free Entry'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={selectedSeats.length === 0}
                  className={`py-2 px-6 rounded-md 
                    ${selectedSeats.length > 0 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CheckoutView = () => {
    if (!selectedEvent) {
      return (
        <div className="py-8 text-center">
          <p>Loading event details...</p>
          <button 
            onClick={() => setActiveView('listing')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Events
          </button>
        </div>
      );
    }
    
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button 
              onClick={() => setActiveView('seats')}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Seat Selection
            </button>
          </div>
          
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h2>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-medium text-gray-900">{selectedEvent.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} • {selectedEvent.time || '7:00 PM'}
                    </p>
                    <p className="text-sm text-gray-600">{selectedEvent.venue || 'Main Auditorium'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Selected Seats</span>
                      <span className="font-medium">{selectedSeats.join(', ')}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Ticket Price</span>
                      <span>
                        {selectedEvent.ticketPrice > 0 
                          ? `₹${selectedEvent.ticketPrice} × ${selectedSeats.length}` 
                          : 'Free Entry'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Booking Fee</span>
                      <span>₹0</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold">
                        {selectedEvent.ticketPrice > 0 
                          ? `₹${selectedSeats.length * selectedEvent.ticketPrice}` 
                          : 'Free'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Details</h2>
                  
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        defaultValue={currentUser?.name || ''}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        defaultValue={currentUser?.email || ''}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </form>
                  
                  <div className="mt-6">
                    <button
                      onClick={handleConfirmBooking}
                      disabled={loading}
                      className="w-full py-3 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : 'Confirm Booking'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmationView = () => {
    if (!selectedEvent) {
      return (
        <div className="py-8 text-center">
          <p>Loading event details...</p>
          <button 
            onClick={() => setActiveView('listing')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Events
          </button>
        </div>
      );
    }
    
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-2xl text-green-600"></i>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-8">Your tickets have been booked successfully.</p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8 max-w-md mx-auto">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Event</span>
                <span className="font-medium">{selectedEvent.title}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-medium">
                  {new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.time || '7:00 PM'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Venue</span>
                <span className="font-medium">{selectedEvent.venue || 'Main Auditorium'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Seats</span>
                <span className="font-medium">{selectedSeats.join(', ')}</span>
              </div>
              <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                <span className="font-semibold">Total</span>
                <span className="font-bold">
                  {selectedEvent.ticketPrice > 0 
                    ? `₹${selectedSeats.length * selectedEvent.ticketPrice}` 
                    : 'Free'
                  }
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-4">
                A confirmation email has been sent to your registered email address.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setActiveView('listing')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Browse More Events
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                >
                  Go to My Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'listing' && <EventListingView />}
          {activeView === 'details' && <EventDetailsView />}
          {activeView === 'seats' && <SeatSelectionView />}
          {activeView === 'checkout' && <CheckoutView />}
          {activeView === 'confirmation' && <ConfirmationView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EventBooking;
