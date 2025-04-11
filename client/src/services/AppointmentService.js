import api from '../utils/axiosConfig';

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    console.log('Sending appointment data:', appointmentData);
    
    // Format date fields properly if they're not already in ISO format
    if (appointmentData.appointment_date && !appointmentData.appointment_date.includes('T')) {
      appointmentData.appointment_date = new Date(appointmentData.appointment_date).toISOString().split('T')[0];
    }
    
    if (appointmentData.alt_date_1 && !appointmentData.alt_date_1.includes('T')) {
      appointmentData.alt_date_1 = new Date(appointmentData.alt_date_1).toISOString().split('T')[0];
    }
    
    if (appointmentData.alt_date_2 && !appointmentData.alt_date_2.includes('T')) {
      appointmentData.alt_date_2 = new Date(appointmentData.alt_date_2).toISOString().split('T')[0];
    }
    
    // Ensure facultyInfo has proper format
    if (appointmentData.facultyInfo) {
      if (!appointmentData.facultyInfo.userId && (appointmentData.facultyInfo._id || appointmentData.facultyInfo.id)) {
        appointmentData.facultyInfo.userId = appointmentData.facultyInfo._id || appointmentData.facultyInfo.id;
      }
    }
    
    // Handle custom duration correctly
    if (appointmentData.duration === 'custom' && appointmentData.custom_duration) {
      appointmentData.custom_duration = parseInt(appointmentData.custom_duration, 10);
    }
    
    // Ensure reason field is a string
    if (appointmentData.reason) {
      appointmentData.reason = String(appointmentData.reason);
    }
    
    // Debug log before sending
    console.log('Formatted data for sending:', JSON.stringify(appointmentData, null, 2));
    
    const response = await api.post('/api/appointments', appointmentData);
    console.log('Appointment creation response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    // Don't automatically logout or redirect - just return the error
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        unauthorized: true,
        message: 'Authentication required. Please log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create appointment',
      error: error.response?.data || error.message
    };
  }
};

// Get appointments for the current student
export const getStudentAppointments = async () => {
  try {
    const response = await api.get('/api/appointments/my-appointments');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching student appointments:', error);
    // Don't automatically logout or redirect - just return the error
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        unauthorized: true,
        message: 'Authentication required. Please log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch appointments'
    };
  }
};

// Get appointments for the current faculty member
export const getFacultyAppointments = async () => {
  try {
    const response = await api.get('/api/appointments/faculty-appointments');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching faculty appointments:', error);
    
    // Check for unauthorized error
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        unauthorized: true,
        message: 'Authentication required. Please log in again.'
      };
    }
    
    // Handle other errors
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch appointments',
      error: error.response?.data || error.message
    };
  }
};

// Get faculty appointment statistics
export const getFacultyAppointmentStats = async () => {
  try {
    const response = await api.get('/api/appointments/faculty-stats');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    
    // Check for unauthorized error
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        unauthorized: true,
        message: 'Authentication required. Please log in again.'
      };
    }
    
    // Handle other errors
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch statistics',
      error: error.response?.data || error.message
    };
  }
};

// Get a specific appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await api.get(`/api/appointments/${appointmentId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    // Don't automatically logout or redirect - just return the error
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        unauthorized: true,
        message: 'Authentication required. Please log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch appointment details'
    };
  }
};

// Update appointment status (approve, reject, cancel, complete)
export const updateAppointmentStatus = async (appointmentId, statusData) => {
  try {
    const response = await api.patch(`/api/appointments/${appointmentId}/status`, statusData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error updating appointment status:', error);
    // Don't automatically logout or redirect - just return the error
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        unauthorized: true,
        message: 'Authentication required. Please log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update appointment status'
    };
  }
};

// Delete an appointment (admin only)
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await api.delete(`/api/appointments/${appointmentId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    // Don't automatically logout or redirect - just return the error
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        unauthorized: true,
        message: 'Authentication required. Please log in again.'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete appointment'
    };
  }
};