import api from '../utils/axiosConfig';

// Define base endpoint for feedback-related API calls
const FEEDBACK_ENDPOINT = '/api/feedback';

/**
 * Submit new feedback
 */
export const submitFeedback = async (feedbackData) => {
  try {
    // Debug log (be careful with FormData logging)
    console.log('Submitting feedback to:', FEEDBACK_ENDPOINT);
    
    // Check if the data is FormData (for file uploads)
    const isFormData = feedbackData instanceof FormData;
    
    // Configure proper headers based on data type
    const config = {};
    if (isFormData) {
      // For FormData, let the browser set the correct Content-Type with boundary parameter
      config.headers = {
        'Accept': 'application/json'
      };
    } else {
      // For JSON data
      config.headers = {
        'Content-Type': 'application/json',
      };
    }
    
    // Send request using the api utility that already handles auth
    const response = await api.post(FEEDBACK_ENDPOINT, feedbackData, config);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error.response?.data || error.message);
    // Rethrow with better error message
    if (error.response?.status === 404) {
      throw new Error('The feedback service is currently unavailable. Please try again later.');
    }
    throw error;
  }
};

/**
 * Get all feedbacks (admin only)
 */
export const getAllFeedback = async () => {
  try {
    const response = await api.get(FEEDBACK_ENDPOINT);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's own feedbacks
 */
export const getUserFeedback = async () => {
  try {
    const response = await api.get(`${FEEDBACK_ENDPOINT}/my-feedback`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update feedback status (admin only)
 */
export const updateFeedbackStatus = async (id, status) => {
  try {
    const response = await api.patch(`${FEEDBACK_ENDPOINT}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  submitFeedback,
  getAllFeedback,
  getUserFeedback,
  updateFeedbackStatus
};
