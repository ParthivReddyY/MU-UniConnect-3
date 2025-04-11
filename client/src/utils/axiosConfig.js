import axios from 'axios';

// Create an axios instance with debug logging
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request logging
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(`Request with authorization to ${config.url}`);
    } else {
      console.log(`Request without authorization to ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response logging
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  (error) => {
    console.error('Response error:', error.message);
    if (error.response) {
      console.error(`Error status: ${error.response.status}`);
      console.error('Error data:', error.response.data);
    }
    
    // Only redirect on 401 errors that are not from auth endpoints or appointment endpoints
    if (error.response && error.response.status === 401) {
      // Don't redirect on login/register/auth failures to avoid redirect loops
      const isAuthEndpoint = 
        error.config.url.includes('/login') ||
        error.config.url.includes('/register') ||
        error.config.url.includes('/auth');
      
      // Don't redirect on appointment endpoints - let the components handle these errors
      const isAppointmentEndpoint = 
        error.config.url.includes('/appointments') ||
        error.config.url.includes('/faculty-appointments') ||
        error.config.url.includes('/faculty-stats');
      
      // Skip the localStorage clear and redirect if it's an auth endpoint or appointment endpoint
      if (!isAuthEndpoint && !isAppointmentEndpoint) {
        console.log('Authentication token expired or invalid. Redirecting to login...');
        
        // Clear local storage
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
    }
    
    return Promise.reject(error);
  }
);

export default api;
