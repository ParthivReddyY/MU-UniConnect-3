import axios from 'axios';

// Get the correct API URL based on the environment
const getBaseURL = () => {
  // For local development
  if (process.env.NODE_ENV !== 'production') {
    // Try to use the environment variable if available
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // Default local development URL
    return 'http://localhost:5000';
  }
  
  // For production, use relative URL (empty string)
  return '';
};

// Create axios instance with environment-specific configuration
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // Longer timeout (30 seconds) for slower connections
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor that adds the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log authentication details for debugging (remove in production)
      console.debug('Adding auth token to request:', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error codes
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        url: error.config.url,
        message: error.response.data.message || 'Unknown error'
      });
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.error('Authentication error - You may need to log in again');
        
        // Optionally, redirect to login page or clear token
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
      
      // Handle 403 Forbidden errors
      if (error.response.status === 403) {
        console.error('Authorization error - You do not have permission for this action');
      }
    }
    
    return Promise.reject(error);
  }
);

// Simplified connection test with minimal logging
api.testConnection = async () => {
  try {
    await api.get('/health');
    console.log('Server health: OK');
    return { success: true };
  } catch (error) {
    console.log('Server health: Failed');
    return { success: false };
  }
};

// Export getBaseURL function so it can be used elsewhere
export { getBaseURL };
export default api;
