import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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
    } else if (!(isFaculty || isAdmin)) {
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

  // Update the getStatusColor function with more vibrant colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'approved': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'rejected': return 'bg-rose-100 text-rose-800 border border-rose-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Update the getPriorityColor function with more distinct colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border border-red-300';
      case 'Medium': return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'Low': return 'bg-teal-100 text-teal-800 border border-teal-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
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
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
            <motion.div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Appointment Details
                </h3>
                <button 
                  className="text-white hover:text-indigo-100 transition-colors"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Student Information
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <p className="text-gray-700"><span className="font-medium">Name:</span> {selectedAppointment.student.name}</p>
                        <p className="text-gray-700"><span className="font-medium">Email:</span> {selectedAppointment.student.email}</p>
                        <p className="text-gray-700"><span className="font-medium">Department:</span> {selectedAppointment.student.department}</p>
                        <p className="text-gray-700"><span className="font-medium">Roll Number:</span> {selectedAppointment.student.rollNumber}</p>
                        {selectedAppointment.phone && (
                          <p className="text-gray-700"><span className="font-medium">Phone:</span> {selectedAppointment.phone}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Appointment Details
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 font-medium">Status</span>
                          <p className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedAppointment.status)}`}>
                            {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 font-medium">Priority</span>
                          <p className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedAppointment.priority)}`}>
                            {selectedAppointment.priority}
                          </p>
                        </div>
                        
                        <p className="text-gray-700"><span className="font-medium">Course:</span> {selectedAppointment.course}</p>
                        <p className="text-gray-700"><span className="font-medium">Date:</span> {formatDate(selectedAppointment.appointment_date)}</p>
                        <p className="text-gray-700"><span className="font-medium">Time:</span> {
                          selectedAppointment.appointment_time 
                            ? format(new Date(`2000-01-01T${selectedAppointment.appointment_time}`), 'h:mm a')
                            : 'Not selected'
                        }</p>
                        <p className="text-gray-700"><span className="font-medium">Duration:</span> {
                          selectedAppointment.duration === 'default' 
                            ? '20 minutes (Default)' 
                            : selectedAppointment.duration === 'custom'
                            ? `${selectedAppointment.custom_duration} minutes (Custom)`
                            : `${selectedAppointment.duration} minutes`
                        }</p>
                        <p className="text-gray-700"><span className="font-medium">Meeting Mode:</span> {
                          selectedAppointment.meeting_mode === 'in-person' 
                            ? 'In-Person (Office Hours)' 
                            : 'Virtual (Google Meet)'
                        }</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Reason for Appointment
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm max-h-36 overflow-y-auto">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedAppointment.reason}</p>
                      </div>
                    </div>
                    
                    {selectedAppointment.faculty_notes && (
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Your Notes
                        </h4>
                        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 max-h-28 overflow-y-auto">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedAppointment.faculty_notes}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedAppointment.meeting_mode === 'virtual' && 
                      selectedAppointment.status === 'approved' && 
                      selectedAppointment.meeting_link && (
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Meeting Link
                        </h4>
                        <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100">
                          <a 
                            href={selectedAppointment.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:underline break-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {selectedAppointment.meeting_link}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Alternative Time Slots */}
                    {(selectedAppointment.alt_date_1 && selectedAppointment.alt_time_1) || 
                     (selectedAppointment.alt_date_2 && selectedAppointment.alt_time_2) ? (
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Alternative Time Slots
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                          {selectedAppointment.alt_date_1 && selectedAppointment.alt_time_1 && (
                            <div className="mb-2 flex items-center">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 flex-shrink-0">
                                <span className="text-xs font-bold">1</span>
                              </div>
                              <p className="text-gray-700">
                                {formatDate(selectedAppointment.alt_date_1)} at {
                                  format(new Date(`2000-01-01T${selectedAppointment.alt_time_1}`), 'h:mm a')
                                }
                              </p>
                            </div>
                          )}
                          {selectedAppointment.alt_date_2 && selectedAppointment.alt_time_2 && (
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 flex-shrink-0">
                                <span className="text-xs font-bold">2</span>
                              </div>
                              <p className="text-gray-700">
                                {formatDate(selectedAppointment.alt_date_2)} at {
                                  format(new Date(`2000-01-01T${selectedAppointment.alt_time_2}`), 'h:mm a')
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                {/* Action Form */}
                {selectedAppointment.status === 'pending' && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Take Action
                    </h3>
                    
                    {/* Faculty Notes */}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        rows="3"
                        placeholder="Add notes about the appointment..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                      ></textarea>
                    </div>
                    
                    {/* Meeting Link (only for virtual meetings) */}
                    {selectedAppointment.meeting_mode === 'virtual' && (
                      <div className="mb-4">
                        <label className="flex text-gray-700 text-sm font-semibold mb-2 items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.1-1.1" />
                          </svg>
                          Meeting Link (Required for approval)
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </span>
                          <input
                            type="url"
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
                            placeholder="https://meet.google.com/..."
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
                      <button
                        type="button"
                        onClick={() => handleAppointmentAction(selectedAppointment._id, 'rejected')}
                        className="px-4 py-2 rounded-md bg-gradient-to-r from-rose-600 to-red-600 text-white font-medium hover:from-rose-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md transition-all flex items-center justify-center"
                        disabled={isSubmitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {isSubmitting ? 'Processing...' : 'Decline Appointment'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAppointmentAction(selectedAppointment._id, 'approved')}
                        className="px-4 py-2 rounded-md bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md transition-all flex items-center justify-center"
                        disabled={isSubmitting || (selectedAppointment.meeting_mode === 'virtual' && !meetingLink)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {isSubmitting ? 'Processing...' : 'Approve Appointment'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Mark Complete Button (for approved appointments) */}
                {selectedAppointment.status === 'approved' && (
                  <div className="border-t pt-6 mt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="mb-4 sm:mb-0">
                        <h3 className="text-lg font-semibold text-gray-800">Complete Appointment</h3>
                        <p className="text-sm text-gray-600">Mark this appointment as completed after the meeting.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAppointmentAction(selectedAppointment._id, 'completed')}
                        className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all flex items-center"
                        disabled={isSubmitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
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