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

// Add simplified request logging
api.interceptors.request.use(
  config => {
    // Simplified logging - just show the essential information
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    
    // Add auth token from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    console.error('API Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Simplified response handling
api.interceptors.response.use(
  response => {
    // Only log critical information
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    // Simplified error logging
    if (error.response) {
      console.error(`API Error ${error.response.status}: ${error.config?.url}`);
    } else if (error.code) {
      console.error(`Network error: ${error.code}`);
    } else {
      console.error('API Error:', error.message);
    }
    
    // Special handling for network/connectivity errors - silently log but don't show warnings
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      // Just return a simple error without special properties that might trigger warnings
      return Promise.reject(new Error('Network error'));
    }
    
    // Don't redirect on login/register/auth failures to avoid redirect loops
    if (
      error.response && 
      error.response.status === 401 && 
      !(
        error.config.url.includes('/login') ||
        error.config.url.includes('/register') ||
        error.config.url.includes('/verify-email') ||
        error.config.url.includes('/forgot-password') ||
        error.config.url.includes('/reset-password') ||
        error.config.url.includes('/check-email') ||
        error.config.url.includes('/verify-reset-otp')
      )
    ) {
      console.log('Authentication token expired or invalid. Redirecting to login...');
      
      // Clear user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (!window.location.href.includes('login')) {
        // Use a slight delay to allow for any current operations to finish
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
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
