import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../../utils/axiosConfig';
import { useAuth } from '../../../../../contexts/AuthContext';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  // State for the selected booking and detail view
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/presentations/my-bookings');
        setBookings(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching my bookings:', err);
        setError(err.response?.data?.message || 'Failed to load your bookings');
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

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate individual score for a team member
  const calculateMemberScore = useCallback((member, individualGrades) => {
    if (!individualGrades || !member?.email || !individualGrades[member.email]) return 0;
    
    // Get criteria from presentation or use default
    const criteria = [
      { name: 'Content', weight: 30 },
      { name: 'Delivery', weight: 30 },
      { name: 'Visual Aids', weight: 20 },
      { name: 'Q&A', weight: 20 }
    ];
    
    let totalScore = 0;
    let totalWeight = 0;
    
    criteria.forEach(criterion => {
      const rawScore = individualGrades[member.email][criterion.name] || 0;
      totalScore += (rawScore * criterion.weight / 100);
      totalWeight += criterion.weight;
    });
    
    if (totalWeight === 0) return 0;
    return Math.round(totalScore * 10) / 10;
  }, []);

  // Handle viewing booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailView(true);
    // Scroll to top when showing details
    window.scrollTo(0, 0);
  };

  // Close details view
  const handleCloseDetails = () => {
    setShowDetailView(false);
    setSelectedBooking(null);
    // Scroll to top when returning to list
    window.scrollTo(0, 0);
  };

  // Render booking details component as a full page
  const BookingDetailView = () => {
    if (!selectedBooking) return null;
    
    const slot = selectedBooking.slot;
    
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-6 px-6">
          <div className="container mx-auto">
            <button 
              onClick={handleCloseDetails}
              className="flex items-center text-white hover:text-blue-200 mb-4 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Bookings
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{selectedBooking.presentationTitle}</h1>
                <p className="text-blue-200 mt-1">
                  {slot?.time ? new Date(slot.time).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'short',
                    day: 'numeric'
                  }) : ''}
                  <span className="mx-2">•</span>
                  <span className="font-medium">
                    {slot?.time ? formatTime(slot.time) : ''}
                  </span>
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                {getStatusBadge(slot.status)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Basic information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Presentation Details</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-gray-600 w-24 flex-shrink-0">Venue:</span>
                  <span className="font-medium text-gray-800">{selectedBooking.venue}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-600 w-24 flex-shrink-0">Faculty:</span>
                  <span className="font-medium text-gray-800">
                    {selectedBooking.faculty ? selectedBooking.faculty.name : 'Not specified'}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-600 w-24 flex-shrink-0">Topic:</span>
                  <span className="font-medium text-gray-800">{slot.topic || 'Not specified'}</span>
                </div>
                {slot.teamName && (
                  <div className="flex items-start">
                    <span className="text-gray-600 w-24 flex-shrink-0">Team:</span>
                    <span className="font-medium text-gray-800">{slot.teamName}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status information */}
            <div className={`
              p-5 rounded-lg text-white shadow-sm
              ${slot.status === 'completed' ? 'bg-gradient-to-br from-green-600 to-emerald-700' :
                slot.status === 'in-progress' ? 'bg-gradient-to-br from-orange-500 to-amber-700' :
                'bg-gradient-to-br from-blue-600 to-indigo-700'
              }
            `}>
              <h3 className="font-semibold mb-4">Status Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="text-white/80 text-sm mb-1">Current Status</h4>
                  <p className="font-medium">
                    {slot.status === 'booked' ? 'Booked & Ready' :
                     slot.status === 'in-progress' ? 'In Progress' :
                     slot.status === 'completed' ? 'Completed' : 'Available'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-white/80 text-sm mb-1">Booking Time</h4>
                  <p className="font-medium">
                    {slot.bookedAt ? new Date(slot.bookedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                
                {slot.startedAt && (
                  <div>
                    <h4 className="text-white/80 text-sm mb-1">Started At</h4>
                    <p className="font-medium">
                      {new Date(slot.startedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {slot.completedAt && (
                  <div>
                    <h4 className="text-white/80 text-sm mb-1">Completed At</h4>
                    <p className="font-medium">
                      {new Date(slot.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {slot.status === 'completed' && slot.totalScore !== undefined && (
                  <div className="pt-4 border-t border-white/20">
                    <h4 className="text-white/80 text-sm mb-1">Overall Score</h4>
                    <div className="flex items-end">
                      <span className="text-4xl font-bold">{slot.totalScore || 0}</span>
                      <span className="text-xl text-white/80 mb-1">/100</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description if available */}
          {slot.description && (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700">{slot.description}</p>
            </div>
          )}
          
          {/* Team Members Section */}
          {slot.teamMembers && slot.teamMembers.length > 0 && (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                {slot.teamMembers.length > 1 ? 'Team Members' : 'Presenter'} Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slot.teamMembers.map((member, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg border ${idx === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xl mr-3">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        {member.rollNumber && (
                          <p className="text-xs text-gray-500 mt-1">Roll Number: {member.rollNumber}</p>
                        )}
                        
                        {idx === 0 && slot.teamMembers.length > 1 && (
                          <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                            Team Lead
                          </span>
                        )}
                        
                        {/* Individual score if completed */}
                        {slot.status === 'completed' && slot.individualGrades && slot.individualGrades[member.email] && (
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-sm">Individual Score:</span>
                              <span className="text-lg font-bold text-green-600">
                                {calculateMemberScore(member, slot.individualGrades)}/100
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Grades Section (if completed) */}
          {slot.status === 'completed' && slot.grades && (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Grading Details</h3>
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Circle Progress */}
                <div className="md:w-1/3 flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                      />
                      {/* Progress circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeDasharray={`${slot.totalScore || 0}, 100`}
                        strokeLinecap="round"
                      />
                      {/* Main score number */}
                      <text 
                        x="18" 
                        y="17" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#10B981"
                        fontSize="10px"
                        fontWeight="bold"
                      >
                        {slot.totalScore || 0}
                      </text>
                      {/* /100 label */}
                      <text 
                        x="18" 
                        y="24" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fill="#6B7280"
                        fontSize="3.5px"
                      >
                        /100
                      </text>
                    </svg>
                  </div>
                </div>
                
                {/* Criteria Breakdown */}
                <div className="md:w-2/3">
                  <h4 className="font-medium text-gray-700 mb-3">Criteria Breakdown</h4>
                  {Object.entries(slot.grades).map(([criterion, score]) => (
                    <div key={criterion} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{criterion}</span>
                        <span className="text-sm text-gray-600">{score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Feedback Section (if available) */}
          {slot.feedback && (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Feedback</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap">
                {slot.feedback}
              </div>
            </div>
          )}
          
          {/* Bottom action button */}
          <div className="flex justify-center mt-8 mb-4">
            <button
              onClick={handleCloseDetails}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
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

  // Conditionally render the detail view or the bookings list
  if (showDetailView && selectedBooking) {
    return <BookingDetailView />;
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
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Bookings Found</h2>
              <p className="text-gray-600 mb-6">You haven't booked any presentation slots yet.</p>
              <button
                onClick={() => window.location.href = '/college/bookings/book-presentation'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Book a Presentation
              </button>
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
                          <path d="M12 14l9-5-9-5-9 5-9-5 9-5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5-9-5 9-5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
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
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <i className="fas fa-info-circle mr-2"></i>
                      View Details
                    </button>
                    
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
