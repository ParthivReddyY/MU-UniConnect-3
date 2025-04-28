import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Only fetch bookings if we have a logged in user
    if (currentUser && currentUser._id) {
      console.log('Fetching bookings for user:', currentUser._id);
      fetchBookings();
    } else {
      console.log('No user logged in, not fetching bookings');
      setLoading(false);
    }
  }, [currentUser]); // Added currentUser as dependency so it refetches when user changes

  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log('Making API call to fetch bookings...');
      
      // Ensure the authorization header is set
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set with token');
      } else {
        console.warn('No token found in localStorage');
      }
      
      const response = await api.get('/api/events/bookings/user');
      console.log('Bookings API response:', response.data);
      
      if (response.data.bookings && response.data.bookings.length > 0) {
        console.log(`Found ${response.data.bookings.length} bookings`);
        setBookings(response.data.bookings);
      } else {
        console.log('No bookings found in response');
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
        console.error('Status code:', err.response.status);
      }
      setError('Failed to load your bookings. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.patch(`/api/events/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      
      // Update local state to reflect cancellation
      setBookings(bookings.map(booking => {
        if (booking._id === bookingId) {
          return { ...booking, status: 'cancelled' };
        }
        return booking;
      }));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Failed to cancel booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-gray-500 mb-4">
            <i className="fas fa-ticket-alt text-4xl"></i>
          </div>
          <h2 className="text-xl font-semibold mb-2">No bookings found</h2>
          <p className="text-gray-600">You haven't booked any events yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <motion.div
              key={booking._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`h-2 ${
                booking.status === 'confirmed' ? 'bg-green-500' :
                booking.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex-grow truncate">
                    {booking.event?.title}
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center text-gray-600 mb-1">
                    <i className="far fa-calendar-alt mr-2"></i>
                    <span>{booking.event?.date ? new Date(booking.event.date).toLocaleDateString() : 'Date not available'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <i className="far fa-clock mr-2"></i>
                    <span>{booking.event?.time || 'Time not available'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    <span>{booking.event?.venue || 'Venue not available'}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Seats</span>
                    <span className="font-medium">{booking.seats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Price</span>
                    <span className="font-bold">₹{booking.totalPrice}</span>
                  </div>
                  
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="w-full mt-4 py-2 px-4 border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;