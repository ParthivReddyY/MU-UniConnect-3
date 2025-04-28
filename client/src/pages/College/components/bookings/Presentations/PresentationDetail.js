import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../../utils/axiosConfig';
import PresentationCreationForm from './PresentationCreationForm';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

const PresentationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ totalSlots: 0, bookedSlots: 0 });

  useEffect(() => {
    const fetchPresentationDetails = async () => {
      try {
        setLoading(true);
        console.log("Fetching presentation with ID:", id);
        
        // Add authorization header explicitly
        const response = await api.get(`/api/presentations/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log("Presentation data received:", response.data);
        setPresentation(response.data);
        
        // Calculate more comprehensive stats
        const totalSlots = response.data.slots?.length || 0;
        const bookedSlots = response.data.slots?.filter(slot => slot.booked).length || 0;
        const completedSlots = response.data.slots?.filter(slot => slot.status === 'completed').length || 0;
        const inProgressSlots = response.data.slots?.filter(slot => slot.status === 'in-progress').length || 0;
        
        setStats({ 
          totalSlots, 
          bookedSlots, 
          completedSlots, 
          inProgressSlots,
          availableSlots: totalSlots - bookedSlots 
        });
        
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdatePresentation = async (updatedPresentation) => {
    try {
      setLoading(true);
      await api.put(`/api/presentations/${id}`, updatedPresentation);
      
      // Fetch the updated presentation
      const response = await api.get(`/api/presentations/${id}`);
      setPresentation(response.data);
      
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{presentation.title}</h1>
        <div className="flex space-x-2">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={handleEdit}
          >
            <i className="fas fa-edit mr-2"></i>Edit
          </button>
          <button 
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            onClick={() => navigate('/college/bookings/host-presentation')}
          >
            <i className="fas fa-arrow-left mr-2"></i>Back
          </button>
        </div>
      </div>

      {/* Dashboard Stats - new horizontal stats bar */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3">Dashboard Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Total Slots</div>
            <div className="text-xl font-bold text-gray-800">{stats.totalSlots}</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Booked</div>
            <div className="text-xl font-bold text-blue-600">{stats.bookedSlots}</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Available</div>
            <div className="text-xl font-bold text-green-600">{stats.availableSlots}</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">In Progress</div>
            <div className="text-xl font-bold text-orange-500">{stats.inProgressSlots}</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-xl font-bold text-purple-600">{stats.completedSlots}</div>
          </div>
        </div>
        {/* Progress bar showing booking status */}
        <div className="mt-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div 
                className="h-2 bg-blue-500" 
                style={{ width: `${stats.totalSlots ? (stats.bookedSlots / stats.totalSlots) * 100 : 0}%` }}
              ></div>
              <div 
                className="h-2 bg-orange-500" 
                style={{ width: `${stats.totalSlots ? (stats.inProgressSlots / stats.totalSlots) * 100 : 0}%` }}
              ></div>
              <div 
                className="h-2 bg-purple-500" 
                style={{ width: `${stats.totalSlots ? (stats.completedSlots / stats.totalSlots) * 100 : 0}%` }}
              ></div>
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

      {/* Presentation Information Section - now vertical */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Presentation Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Venue</p>
              <p className="font-medium text-gray-800">{presentation.venue}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium text-gray-800">{presentation.department || 'Not specified'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium text-gray-800">{presentation.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Participation Type</p>
              <p className="font-medium text-gray-800">
                {presentation.participationType === 'individual' ? 'Individual' : `Team (${presentation.teamSizeMin}-${presentation.teamSizeMax} members)`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Host</p>
              <p className="font-medium text-gray-800">{presentation.hostName || presentation.facultyName || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Information Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Time Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Registration Period</p>
            <div className="flex items-center">
              <i className="fas fa-calendar-alt text-blue-500 mr-2"></i>
              <p className="font-medium text-gray-800">
                {formatDate(presentation.registrationPeriod.start)} - {formatDate(presentation.registrationPeriod.end)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Presentation Period</p>
            <div className="flex items-center">
              <i className="fas fa-calendar-check text-green-500 mr-2"></i>
              <p className="font-medium text-gray-800">
                {formatDate(presentation.presentationPeriod.start)} - {formatDate(presentation.presentationPeriod.end)}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Slot Duration</p>
            <div className="flex items-center">
              <i className="fas fa-clock text-purple-500 mr-2"></i>
              <p className="font-medium text-gray-800">
                {presentation.slotConfig?.duration || 0} minutes 
                (Buffer: {presentation.slotConfig?.buffer || 0} minutes)
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Time Slots</p>
            <div className="flex items-center">
              <i className="fas fa-hourglass-half text-orange-500 mr-2"></i>
              <p className="font-medium text-gray-800">
                {presentation.slotConfig?.startTime || '9:00'} to {presentation.slotConfig?.endTime || '17:00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Audience Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Target Audience</h3>
        <div className="space-y-4">
          {presentation.targetAudience?.year?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Years</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {presentation.targetAudience.year.map(year => (
                  <span key={year} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {year === '1' ? '1st' : year === '2' ? '2nd' : year === '3' ? '3rd' : `${year}th`} Year
                  </span>
                ))}
              </div>
            </div>
          )}

          {presentation.targetAudience?.school?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Schools</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {presentation.targetAudience.school.map(school => (
                  <span key={school} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {school.split('(')[0].trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {presentation.targetAudience?.department?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Departments</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {presentation.targetAudience.department.map(dept => (
                  <span key={dept} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(!presentation.targetAudience || 
            ((!presentation.targetAudience.year || presentation.targetAudience.year.length === 0) &&
             (!presentation.targetAudience.school || presentation.targetAudience.school.length === 0) &&
             (!presentation.targetAudience.department || presentation.targetAudience.department.length === 0))
          ) && (
            <p className="italic text-gray-500">Open to all students</p>
          )}
        </div>
      </div>

      {/* Slots Management Section - NEW */}
      <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Slot Management</h3>
        
        {presentation.slots && presentation.slots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked By</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {presentation.slots.map(slot => (
                  <tr key={slot.id} className={slot.booked ? "bg-blue-50" : ""}>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {new Date(slot.time).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {formatTime(slot.time)}
                    </td>
                    <td className="py-2 px-4">
                      {slot.status === 'completed' ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>
                      ) : slot.status === 'in-progress' ? (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">In Progress</span>
                      ) : slot.booked ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Booked</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Available</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {slot.bookedBy ? (
                        <div>
                          {slot.participants && slot.participants.length > 0 ? (
                            <div className="flex flex-col">
                              {slot.participants.map((participant, i) => (
                                <span key={i} className="text-xs">
                                  {participant.name || 'Unnamed'}
                                </span>
                              ))}
                            </div>
                          ) : (
                            slot.studentName || 'Student'
                          )}
                          {slot.teamName && (
                            <span className="text-xs text-gray-500 block">
                              Team: {slot.teamName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not booked</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {slot.topic || '-'}
                    </td>
                    <td className="py-2 px-4 text-sm font-medium">
                      {slot.status === 'completed' ? (
                        <span className="text-green-600">{slot.totalScore || 0}/100</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No slots available for this presentation
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationDetail;
