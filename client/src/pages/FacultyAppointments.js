import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getFacultyAppointments, 
  getFacultyAppointmentStats, 
  updateAppointmentStatus 
} from '../services/AppointmentService';

const FacultyAppointments = () => {
  // Auth context for user information and navigation
  const { currentUser, isFaculty, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    cancelled: 0
  });
  const [, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated on component mount
  useEffect(() => {
    if (!currentUser) {
      setAuthError(true);
      setError('You must be logged in to view this page.');
    } else if (!isFaculty() && !isAdmin()) {
      setAuthError(true);
      setError('You must be a faculty member or admin to view this page.');
    } else {
      fetchData();
    }
  }, [currentUser, isFaculty, isAdmin]);
  
  // Fetch appointment data from API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch appointments
      const appointmentsResult = await getFacultyAppointments();
      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.data.appointments);
      } else {
        if (appointmentsResult.unauthorized) {
          setAuthError(true);
          setError('Your session has expired. Please log in again.');
        } else {
          setError(appointmentsResult.message || 'Failed to fetch appointments');
        }
      }
      
      // Fetch stats and upcoming appointments
      const statsResult = await getFacultyAppointmentStats();
      if (statsResult.success) {
        setStats(statsResult.data.stats);
        setUpcomingAppointments(statsResult.data.upcoming);
      } else {
        if (statsResult.unauthorized) {
          setAuthError(true);
          setError('Your session has expired. Please log in again.');
        } else {
          setError(statsResult.message || 'Failed to fetch appointment statistics');
        }
      }
    } catch (error) {
      setError('Failed to fetch appointment data. Please try again later.');
      console.error('Error fetching faculty appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment action (approve, reject, complete)
  const handleAppointmentAction = async (appointmentId, status) => {
    setIsSubmitting(true);
    try {
      const data = { 
        status,
        faculty_notes: actionNotes
      };
      
      // Add meeting link for approved virtual meetings
      if (status === 'approved' && selectedAppointment?.meeting_mode === 'virtual') {
        data.meeting_link = meetingLink;
      }
      
      const result = await updateAppointmentStatus(appointmentId, data);
      
      if (result.success) {
        // Update local state
        const updatedAppointments = appointments.map(appointment => 
          appointment._id === appointmentId
            ? { ...appointment, status, faculty_notes: actionNotes, meeting_link: meetingLink }
            : appointment
        );
        
        setAppointments(updatedAppointments);
        
        // Update stats
        const newStats = { ...stats };
        newStats[activeTab]--;
        newStats[status]++;
        setStats(newStats);
        
        // Show success notification
        setNotification({
          show: true,
          type: 'success',
          message: `Appointment ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'marked as completed'} successfully`
        });
        
        // Close modal and reset form
        setShowDetailsModal(false);
        setActionNotes('');
        setMeetingLink('');
      } else {
        if (result.unauthorized) {
          setAuthError(true);
          setError('Your session has expired. Please log in again.');
          setShowDetailsModal(false);
        } else {
          setNotification({
            show: true,
            type: 'error',
            message: result.message || 'Failed to update appointment'
          });
        }
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'An error occurred while updating the appointment'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle login button click
  const handleLoginClick = () => {
    navigate('/login', { state: { from: '/faculty-appointments' } });
  };

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(
    appointment => appointment.status === activeTab
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle appointment detail view
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  // Close notification
  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }
  };

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0 }
  };

  // If there's an auth error, show a login prompt
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={handleLoginClick}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen p-6 bg-gray-50"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Appointments</h1>
          <p className="text-gray-600 mt-2">Manage appointment requests from students</p>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div 
              className={`p-4 rounded-lg mb-6 ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' : 
                notification.type === 'error' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center">
                <span>{notification.message}</span>
                <button 
                  onClick={closeNotification}
                  className="text-sm hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error && !authError ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-4 rounded text-sm"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <button 
                className={`p-4 rounded-lg shadow-sm border ${
                  activeTab === 'pending' 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-white border-gray-200 hover:bg-yellow-50'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </button>
              
              <button 
                className={`p-4 rounded-lg shadow-sm border ${
                  activeTab === 'approved' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:bg-green-50'
                }`}
                onClick={() => setActiveTab('approved')}
              >
                <h3 className="text-lg font-semibold text-gray-700">Approved</h3>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </button>
              
              <button 
                className={`p-4 rounded-lg shadow-sm border ${
                  activeTab === 'rejected' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-white border-gray-200 hover:bg-red-50'
                }`}
                onClick={() => setActiveTab('rejected')}
              >
                <h3 className="text-lg font-semibold text-gray-700">Rejected</h3>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </button>
              
              <button 
                className={`p-4 rounded-lg shadow-sm border ${
                  activeTab === 'completed' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:bg-blue-50'
                }`}
                onClick={() => setActiveTab('completed')}
              >
                <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </button>
              
              <button 
                className={`p-4 rounded-lg shadow-sm border ${
                  activeTab === 'cancelled' 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('cancelled')}
              >
                <h3 className="text-lg font-semibold text-gray-700">Cancelled</h3>
                <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
              </button>
            </div>

            {/* Appointment List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold capitalize">
                  {activeTab} Appointments
                </h2>
              </div>
              
              {filteredAppointments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg 
                    className="w-16 h-16 mx-auto mb-4 text-gray-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <h3 className="text-lg font-medium">No {activeTab} appointments found</h3>
                  <p className="mt-2">
                    {activeTab === 'pending' 
                      ? 'You have no pending appointment requests to review.'
                      : activeTab === 'approved'
                      ? 'You have no approved appointments scheduled.'
                      : activeTab === 'rejected'
                      ? 'You have not rejected any appointment requests.'
                      : activeTab === 'completed'
                      ? 'You have no completed appointments.'
                      : 'You have no cancelled appointments.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mode
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.student.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {appointment.student.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appointment.course}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(appointment.appointment_date)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(appointment.appointment_time)} • {appointment.duration === 'default' 
                                ? '20 minutes' 
                                : appointment.duration === 'custom'
                                ? `${appointment.custom_duration} minutes`
                                : `${appointment.duration} minutes`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(appointment.priority)}`}>
                              {appointment.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.meeting_mode === 'in-person' ? 'In-Person' : 'Virtual'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                              onClick={() => handleViewDetails(appointment)}
                            >
                              View Details
                            </button>
                            
                            {activeTab === 'pending' && (
                              <>
                                <button
                                  className="text-green-600 hover:text-green-900 mr-4"
                                  onClick={() => handleViewDetails(appointment)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleViewDetails(appointment)}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {activeTab === 'approved' && (
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => handleViewDetails(appointment)}
                              >
                                Mark Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                  <button 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Student Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Name</span>
                      <p className="font-medium">{selectedAppointment.student.name}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Email</span>
                      <p className="font-medium">{selectedAppointment.student.email}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Department</span>
                      <p className="font-medium">{selectedAppointment.student.department}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Roll Number</span>
                      <p className="font-medium">{selectedAppointment.student.rollNumber}</p>
                    </div>
                    {selectedAppointment.phone && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-500 text-sm">Phone</span>
                        <p className="font-medium">{selectedAppointment.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Appointment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Course/Subject</span>
                      <p className="font-medium">{selectedAppointment.course}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Status</span>
                      <p className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Date</span>
                      <p className="font-medium">{formatDate(selectedAppointment.appointment_date)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Time</span>
                      <p className="font-medium">{formatTime(selectedAppointment.appointment_time)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Duration</span>
                      <p className="font-medium">
                        {selectedAppointment.duration === 'default' 
                          ? '20 minutes (Default)' 
                          : selectedAppointment.duration === 'custom'
                          ? `${selectedAppointment.custom_duration} minutes (Custom)`
                          : `${selectedAppointment.duration} minutes`}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Meeting Mode</span>
                      <p className="font-medium">
                        {selectedAppointment.meeting_mode === 'in-person' 
                          ? 'In-Person (Office Hours)' 
                          : 'Virtual (Google Meet)'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Priority</span>
                      <p className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedAppointment.priority)}`}>
                        {selectedAppointment.priority}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">Requested On</span>
                      <p className="font-medium">{formatDate(selectedAppointment.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Reason for Appointment */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Reason for Appointment</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-gray-700">{selectedAppointment.reason}</p>
                  </div>
                </div>

                {/* Faculty Notes (if any) */}
                {selectedAppointment.faculty_notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Your Notes</h3>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="whitespace-pre-wrap text-gray-700">{selectedAppointment.faculty_notes}</p>
                    </div>
                  </div>
                )}

                {/* Meeting Link (if virtual and approved) */}
                {selectedAppointment.meeting_mode === 'virtual' && 
                  selectedAppointment.status === 'approved' && 
                  selectedAppointment.meeting_link && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Meeting Link</h3>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <a 
                        href={selectedAppointment.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {selectedAppointment.meeting_link}
                      </a>
                    </div>
                  </div>
                )}

                {/* Action Form */}
                {selectedAppointment.status === 'pending' && (
                  <div className="mb-6 border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Take Action</h3>
                    
                    {/* Faculty Notes */}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="3"
                        placeholder="Add notes about the appointment..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                      ></textarea>
                    </div>
                    
                    {/* Meeting Link (only for virtual meetings) */}
                    {selectedAppointment.meeting_mode === 'virtual' && (
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                          Meeting Link (Required for approval)
                        </label>
                        <input
                          type="url"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="https://meet.google.com/..."
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                        />
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => handleAppointmentAction(selectedAppointment._id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAppointmentAction(selectedAppointment._id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        disabled={isSubmitting || (selectedAppointment.meeting_mode === 'virtual' && !meetingLink)}
                      >
                        {isSubmitting ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Mark Complete Button (for approved appointments) */}
                {selectedAppointment.status === 'approved' && (
                  <div className="border-t pt-6 mt-6">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAppointmentAction(selectedAppointment._id, 'completed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FacultyAppointments;