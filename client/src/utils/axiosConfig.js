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
    return 'http://localhost:9000';
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
        
        // Instead of immediately removing token, we'll check if this is a token validation issue
        // and only clear token on specific errors to prevent unnecessary logouts
        if (error.response.data?.message?.includes('expired') || 
            error.response.data?.message?.includes('invalid') ||
            error.response.data?.message?.includes('not found')) {
          console.warn('Token invalid or expired, clearing authentication data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          
        }
      }
      
      if (error.response.status === 403) {
        console.error('Authorization error - You do not have permission for this action');
      }
    }
    
    return Promise.reject(error);
  }
);

export { getBaseURL };
export default api;
