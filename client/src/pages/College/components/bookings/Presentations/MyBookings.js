import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../../../utils/axiosConfig';
import { useAuth } from '../../../../../contexts/AuthContext';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/presentations/my-bookings');
        
        if (Array.isArray(response.data)) {
          setBookings(response.data);
        } else {
          console.warn('API did not return an array of bookings:', response.data);
          setBookings([]);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your presentation bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, []);

  // Format date with time
  const formatDateTime = (dateString) => {
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

  // Get status badge for a slot
  const getStatusBadge = (status) => {
    switch(status) {
      case 'booked':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Booked</span>;
      case 'in-progress':
        return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">In Progress</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Unknown</span>;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-red-500 mb-4">
          <i className="fas fa-exclamation-circle text-4xl"></i>
        </div>
        <h2 className="text-xl font-bold mb-4">{error}</h2>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="w-full bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">My Presentation Bookings</h1>
          <p className="text-blue-100 mt-2">View and manage your presentation bookings</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Found</h2>
              <p className="text-gray-600 mb-6">You haven't booked any presentation slots yet.</p>
              <Link
                to="/college/bookings/book-presentation"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Book a Presentation
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Color indicator based on status */}
                  <div className={`w-full md:w-2 h-2 md:h-auto 
                    ${booking.slot.status === 'completed' ? 'bg-green-500' : 
                      booking.slot.status === 'in-progress' ? 'bg-orange-500' : 'bg-blue-500'}`}
                  ></div>
                  
                  {/* Main content */}
                  <div className="flex-grow p-6">
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 mr-3">{booking.presentationTitle}</h2>
                      {getStatusBadge(booking.slot.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Time */}
                      <div className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium text-gray-800">
                            {formatDateTime(booking.slot.time)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Venue */}
                      <div className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Venue</p>
                          <p className="font-medium text-gray-800">{booking.venue}</p>
                        </div>
                      </div>
                      
                      {/* Faculty */}
                      <div className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Faculty</p>
                          <p className="font-medium text-gray-800">
                            {booking.faculty ? booking.faculty.name : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Topic and Team Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {booking.slot.topic && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-1">Topic</p>
                          <p className="text-gray-800 font-medium">{booking.slot.topic}</p>
                        </div>
                      )}
                      
                      {booking.slot.teamName && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-1">Team</p>
                          <p className="text-gray-800 font-medium">{booking.slot.teamName}</p>
                        </div>
                      )}
                      
                      {/* Team Members */}
                      {booking.slot.teamMembers && booking.slot.teamMembers.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Team Members</p>
                          <div className="flex flex-wrap gap-2">
                            {booking.slot.teamMembers.map((member, idx) => (
                              <div key={idx} className="bg-gray-100 rounded-md px-3 py-1 text-sm">
                                <span className="font-medium">{member.name}</span>
                                {member.email === currentUser?.email && (
                                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">You</span>
                                )}
                                {booking.isTeamMember && idx === 0 && (
                                  <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Lead</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions section */}
                  <div className="p-6 bg-gray-50 flex flex-col justify-center items-center md:w-56 space-y-3">
                    <Link
                      to={`/college/bookings/presentation/${booking.presentationId}/slot/${booking.slot.id}`}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <i className="fas fa-info-circle mr-2"></i>
                      View Details
                    </Link>
                    
                    {booking.slot.status === 'completed' && booking.slot.totalScore !== undefined && (
                      <div className="w-full text-center">
                        <div className="text-sm text-gray-500">Your Score</div>
                        <div className="text-2xl font-bold text-green-600">
                          {booking.slot.totalScore}/100
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
