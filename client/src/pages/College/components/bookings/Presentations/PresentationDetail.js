import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../../utils/axiosConfig';
import { useAuth } from '../../../../../contexts/AuthContext';
import PresentationCreationForm from './PresentationCreationForm';
import PresentationGrading from './PresentationGrading';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

const PresentationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showGrading, setShowGrading] = useState(false);
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
    completedSlots: 0,
    inProgressSlots: 0
  });

  useEffect(() => {
    const fetchPresentationDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/presentations/${id}`);
        
        // Log response data for debugging
        console.log("Fetched presentation:", response.data);
        
        setPresentation(response.data);
        
        // Calculate statistics
        const totalSlots = response.data.slots ? response.data.slots.length : 0;
        
        if (response.data && response.data.slots) {
          const bookedSlots = response.data.slots.filter(slot => slot.booked).length || 0;
          const completedSlots = response.data.slots.filter(slot => slot.status === 'completed').length || 0;
          const inProgressSlots = response.data.slots.filter(slot => slot.status === 'in-progress').length || 0;
          
          setStats({ 
            totalSlots, 
            bookedSlots, 
            completedSlots, 
            inProgressSlots,
            availableSlots: totalSlots - bookedSlots 
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching presentation details:', err);
        
        // Specific error handling for permission issues
        if (err.response?.status === 403) {
          setError('You don\'t have permission to view this presentation details.');
          toast.error('Access denied: You don\'t have permission to view this presentation');
        } else {
          const errorMessage = err.response?.data?.message || 
                              'Failed to load presentation details. Please try again.';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPresentationDetails();
  }, [id]);

  // Format date for input fields (datetime-local and date)
  const formatDateForInput = (dateString, dateOnly = false) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (dateOnly) {
      // Format for date input: YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } else {
      // Format for datetime-local input: YYYY-MM-DDThh:mm
      return date.toISOString().slice(0, 16);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdatePresentation = async (updatedPresentation) => {
    try {
      setLoading(true);
      await api.put(`/api/presentations/${id}`, updatedPresentation);
      
      // Fetch the updated presentation
      const response = await api.get(`/api/presentations/${id}`);
      
      // Process dates to ensure they're in the correct format for editing
      if (response.data) {
        const processed = {
          ...response.data,
          registrationPeriod: {
            start: formatDateForInput(response.data.registrationPeriod?.start),
            end: formatDateForInput(response.data.registrationPeriod?.end)
          },
          presentationPeriod: {
            start: formatDateForInput(response.data.presentationPeriod?.start, true),
            end: formatDateForInput(response.data.presentationPeriod?.end, true)
          }
        };
        setPresentation(processed);
      }
      
      toast.success('Presentation details updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating presentation:', err);
      toast.error(err.response?.data?.message || 'Failed to update presentation details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleStartPresentation = async () => {
    if (!selectedSlot) {
      toast.error('Please select a slot first');
      return;
    }
    
    // Show confirmation dialog
    setShowStartConfirmation(true);
  };

  const confirmStartPresentation = async () => {
    try {
      console.log("Starting presentation slot:", selectedSlot);
      
      // Use the correct ID field - prefer _id but fall back to id if _id doesn't exist
      const slotIdToUse = selectedSlot._id || selectedSlot.id;
      
      // Log user info for debugging
      console.log("Current user information:", currentUser);
      console.log("Using slot ID:", slotIdToUse);
      
      const response = await api.put(`/api/presentations/slots/${slotIdToUse}/start`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log("Presentation start response:", response.data);
      toast.success('Presentation started successfully');
      
      // Refresh data
      const updatedPresentation = await api.get(`/api/presentations/${id}`);
      setPresentation(updatedPresentation.data);
      
      // Switch to grading view
      setSelectedSlot(selectedSlot);
      setShowGrading(true);
      setShowStartConfirmation(false);
    } catch (error) {
      console.error('Error starting presentation:', error);
      const errorMessage = error.response?.data?.message || 'Failed to start presentation';
      
      // Show more specific error message
      toast.error(errorMessage);
      setShowStartConfirmation(false);
    }
  };

  const handleGradingComplete = async () => {
    // Refresh data after grading is complete
    try {
      const response = await api.get(`/api/presentations/${id}`);
      setPresentation(response.data);
      setShowGrading(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error refreshing presentation data:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get appropriate status badge for slot
  const getStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Available</span>;
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

  // New function to open comprehensive slot view
  const openSlotDetailView = (slot) => {
    setSelectedSlot(slot);
    document.body.classList.add('overflow-hidden'); // Prevent scrolling
  }

  // Close comprehensive slot view
  const closeSlotDetailView = () => {
    setSelectedSlot(null);
    document.body.classList.remove('overflow-hidden'); // Restore scrolling
  }

  // Calculate average score for a team member based on their grades
  const calculateMemberScore = (member, individualGrades) => {
    if (!individualGrades || !individualGrades[member.email]) return 0;
    
    const criteria = presentation.customGradingCriteria ? presentation.gradingCriteria : [
      { name: 'Content', weight: 30 },
      { name: 'Delivery', weight: 30 },
      { name: 'Visual Aids', weight: 20 },
      { name: 'Q&A', weight: 20 }
    ];
    
    let totalScore = 0;
    let totalWeight = 0;
    
    criteria.forEach(criterion => {
      const score = individualGrades[member.email][criterion.name] || 0;
      totalScore += (score * criterion.weight);
      totalWeight += criterion.weight;
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">
          <i className="fas fa-exclamation-circle text-4xl"></i>
        </div>
        <h2 className="text-xl font-bold mb-2 text-center">{error}</h2>
        <button 
          className="mt-4 bg-primary-red text-white px-4 py-2 rounded hover:bg-secondary-red transition-colors"
          onClick={() => navigate('/college/bookings/host-presentation')}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!presentation) return <div>No presentation found</div>;

  if (isEditing) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">Edit Presentation</h2>
        <PresentationCreationForm 
          initialData={presentation}
          onPresentationCreated={handleUpdatePresentation}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  if (showGrading && selectedSlot) {
    return (
      <PresentationGrading 
        presentation={presentation} 
        activeSlotId={selectedSlot._id || selectedSlot.id}
        onClose={handleGradingComplete}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{presentation.title}</h1>
        <button 
          onClick={handleEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <i className="fas fa-edit mr-2"></i>
          Edit
        </button>
      </div>

      {/* Quick Stats Section */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Stats</h3>
        <div className="flex justify-between mb-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSlots}</div>
            <div className="text-sm text-gray-500">Total Slots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.availableSlots}</div>
            <div className="text-sm text-gray-500">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.bookedSlots}</div>
            <div className="text-sm text-gray-500">Booked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completedSlots}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
        <div className="mt-2">
          <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div className="bg-green-500 h-full" style={{ width: `${(stats.availableSlots / stats.totalSlots) * 100}%` }}></div>
              <div className="bg-yellow-500 h-full" style={{ width: `${(stats.bookedSlots / stats.totalSlots) * 100}%` }}></div>
              <div className="bg-purple-500 h-full" style={{ width: `${(stats.completedSlots / stats.totalSlots) * 100}%` }}></div>
            </div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-blue-600">
              {stats.bookedSlots} booked
            </span>
            <span className="text-orange-500">
              {stats.inProgressSlots} in progress
            </span>
            <span className="text-purple-600">
              {stats.completedSlots} completed
            </span>
            <span className="text-green-600">
              {stats.availableSlots} available
            </span>
          </div>
        </div>
      </div>

      {/* Presentation Information Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Presentation Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium">{presentation.description || 'No description provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Venue</p>
            <p className="font-medium">{presentation.venue}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created By</p>
            <p className="font-medium">{presentation.facultyName || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{presentation.hostDepartment || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Participation Type</p>
            <p className="font-medium capitalize">{presentation.participationType}</p>
          </div>
          {presentation.participationType === 'team' && (
            <div>
              <p className="text-sm text-gray-500">Team Size</p>
              <p className="font-medium">{presentation.teamSizeMin} - {presentation.teamSizeMax} members</p>
            </div>
          )}
        </div>
      </div>

      {/* Time Information Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Time Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Registration Period</p>
            <p className="font-medium">
              {formatDate(presentation.registrationPeriod?.start)} - {formatDate(presentation.registrationPeriod?.end)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Presentation Period</p>
            <p className="font-medium">
              {formatDate(presentation.presentationPeriod?.start)} - {formatDate(presentation.presentationPeriod?.end)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Slot Duration</p>
            <p className="font-medium">{presentation.slotConfig?.duration} minutes</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Buffer Time</p>
            <p className="font-medium">{presentation.slotConfig?.buffer} minutes</p>
          </div>
        </div>
      </div>

      {/* Target Audience Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Target Audience</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presentation.targetAudience?.year?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Academic Years</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {presentation.targetAudience.year.map((year, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded">
                    {year === '1' ? '1st' : year === '2' ? '2nd' : year === '3' ? '3rd' : `${year}th`} Year
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {presentation.targetAudience?.school?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Schools</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {presentation.targetAudience.school.map((school, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded">
                    {school.replace(/\([^()]*\)/g, '').trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {presentation.targetAudience?.department?.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Departments</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {presentation.targetAudience.department.map((dept, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-800 text-xs py-1 px-2 rounded">
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slots Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Slot Management</h3>
        
        {presentation.slots && presentation.slots.length > 0 ? (
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {presentation.slots.map(slot => (
                <div
                  key={slot.id || slot._id}
                  className={`
                    rounded-lg overflow-hidden border shadow-sm transition-all hover:shadow-md
                    ${slot.status === 'completed' ? 'border-green-200 bg-green-50' : 
                      slot.status === 'in-progress' ? 'border-orange-200 bg-orange-50' : 
                      slot.booked ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }
                  `}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-medium text-gray-600">
                          {new Date(slot.time).toLocaleDateString()}
                        </div>
                        <div className="text-base font-bold text-gray-800">
                          {formatTime(slot.time)}
                        </div>
                      </div>
                      {getStatusBadge(slot.status)}
                    </div>
                    
                    <div className="mt-3">
                      {slot.booked ? (
                        <div>
                          <div className="text-sm mb-1">
                            {slot.teamMembers && slot.teamMembers.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {slot.teamMembers.map((participant, i) => (
                                  <span 
                                    key={i} 
                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                                  >
                                    {participant.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-600">{slot.studentName || 'Student'}</span>
                            )}
                          </div>
                          {slot.teamName && (
                            <div className="text-xs text-gray-500 mt-1">
                              Team: {slot.teamName}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Available</div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm text-gray-600 truncate max-w-[150px]">
                        {slot.topic || '-'}
                      </div>
                      <div>
                        {slot.status === 'completed' ? (
                          <span className="text-green-600 font-medium text-sm">{(slot.totalScore || 0).toFixed(1)}/100</span>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => openSlotDetailView(slot)}
                        className="w-full py-1.5 px-3 text-center rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                    
                    {slot.status === 'booked' && (
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowStartConfirmation(true);
                          }}
                          className="w-full py-1.5 px-3 text-center rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                        >
                          Start Presentation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No slots available for this presentation
          </div>
        )}
      </div>

      {/* Comprehensive Slot Detail Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <i className="fas fa-calendar-day mr-2"></i>
                Presentation Slot Details
              </h3>
              <button
                onClick={closeSlotDetailView}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6">
              {/* Slot Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-200 mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <i className="fas fa-clock text-blue-600"></i>
                    </div>
                    <h4 className="ml-3 text-xl font-bold text-gray-800">
                      {formatTime(selectedSlot.time)}
                    </h4>
                  </div>
                  <p className="text-gray-600">
                    {new Date(selectedSlot.time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <span className={`h-2 w-2 rounded-full mr-2 ${
                      selectedSlot.status === 'completed' ? 'bg-green-500' :
                      selectedSlot.status === 'in-progress' ? 'bg-orange-500' :
                      selectedSlot.status === 'booked' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></span>
                    {selectedSlot.status === 'booked' ? 'Booked' :
                     selectedSlot.status === 'in-progress' ? 'In Progress' :
                     selectedSlot.status === 'completed' ? 'Completed' : 'Available'}
                  </div>
                </div>
              </div>
              
              {/* Slot Content */}
              {selectedSlot.booked ? (
                <div className="space-y-6">
                  {/* Presentation Info */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Presentation Information</h4>
                    <div className="bg-gray-50 rounded-md p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Topic</p>
                          <p className="font-medium text-gray-800">{selectedSlot.topic || 'Not specified'}</p>
                        </div>
                        {selectedSlot.teamName && (
                          <div>
                            <p className="text-sm text-gray-500">Team Name</p>
                            <p className="font-medium text-gray-800">{selectedSlot.teamName}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Booking Time</p>
                          <p className="font-medium text-gray-800">
                            {selectedSlot.bookedAt ? new Date(selectedSlot.bookedAt).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                        {selectedSlot.status === 'completed' && (
                          <div>
                            <p className="text-sm text-gray-500">Total Score</p>
                            <p className="font-medium text-green-600">
                              {selectedSlot.totalScore || 0}/100
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  {selectedSlot.teamMembers && selectedSlot.teamMembers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        {selectedSlot.teamMembers.length > 1 ? 'Team Members' : 'Presenter'}
                      </h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <ul className="divide-y divide-gray-200">
                          {selectedSlot.teamMembers.map((member, idx) => (
                            <li key={idx} className="py-3 first:pt-0 last:pb-0">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                  <span className="text-indigo-600 font-medium">{member.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{member.name}</p>
                                  <p className="text-gray-500 text-sm">{member.email}</p>
                                </div>
                                
                                {/* Show individual score if completed and has individual grades */}
                                {selectedSlot.status === 'completed' && selectedSlot.individualGrades && selectedSlot.individualGrades[member.email] && (
                                  <div className="ml-auto">
                                    <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-medium">
                                      Score: {calculateMemberScore(member, selectedSlot.individualGrades)}/100
                                    </div>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* Grades Section (if completed) */}
                  {selectedSlot.status === 'completed' && selectedSlot.grades && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Grade Breakdown</h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <div className="space-y-3">
                          {Object.entries(selectedSlot.grades).map(([criterion, score]) => (
                            <div key={criterion} className="flex justify-between">
                              <span className="text-gray-700">{criterion}</span>
                              <span className="font-medium">{score}/100</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Individual Grades (if any) */}
                  {selectedSlot.status === 'completed' && selectedSlot.individualGrades && Object.keys(selectedSlot.individualGrades).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Individual Grades</h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <div className="space-y-4">
                          {selectedSlot.teamMembers && selectedSlot.teamMembers.map((member, idx) => (
                            <div key={idx} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                              <p className="font-medium text-gray-800 mb-2">{member.name}</p>
                              {selectedSlot.individualGrades[member.email] ? (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {Object.entries(selectedSlot.individualGrades[member.email]).map(([criterion, score]) => (
                                    <div key={criterion} className="flex justify-between">
                                      <span className="text-gray-600">{criterion}</span>
                                      <span>{score}/100</span>
                                    </div>
                                  ))}
                                  <div className="col-span-2 pt-2 mt-1 border-t border-gray-200 flex justify-between">
                                    <span className="font-medium">Total Score</span>
                                    <span className="font-medium text-green-600">
                                      {calculateMemberScore(member, selectedSlot.individualGrades)}/100
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">No individual grades recorded</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Feedback Section (if completed) */}
                  {selectedSlot.status === 'completed' && selectedSlot.feedback && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Feedback</h4>
                      <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedSlot.feedback}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={closeSlotDetailView}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    
                    {selectedSlot.status === 'booked' && (
                      <button
                        onClick={() => {
                          closeSlotDetailView();
                          handleStartPresentation();
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                      >
                        <i className="fas fa-play-circle mr-2"></i>
                        Start Presentation
                      </button>
                    )}
                    
                    {selectedSlot.status === 'in-progress' && (
                      <button
                        onClick={() => {
                          closeSlotDetailView();
                          setShowGrading(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <i className="fas fa-clipboard-check mr-2"></i>
                        Go to Grading
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-calendar-times text-gray-400 text-xl"></i>
                  </div>
                  <h5 className="text-lg font-medium text-gray-800 mb-2">Slot Not Booked</h5>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    This time slot is still available for booking. Students can book this slot through the presentation booking interface.
                  </p>
                  <button
                    onClick={closeSlotDetailView}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Start Presentation Confirmation Modal */}
      {showStartConfirmation && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-play text-blue-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Presentation</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to start this presentation? This will mark the slot as in-progress and allow grading.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowStartConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartPresentation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationDetail;
