import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only redirect on 401 errors that are not from auth endpoints
    if (error.response && error.response.status === 401) {
      // Don't redirect on login/register/auth failures to avoid redirect loops
      const isAuthEndpoint = 
        error.config.url.includes('/login') ||
        error.config.url.includes('/register') ||
        error.config.url.includes('/auth');
      
      // Skip the localStorage clear and redirect if it's an auth endpoint
      if (!isAuthEndpoint) {
        console.log('Authentication token expired or invalid. Redirecting to login...');
        
        // Clear local storage
        localStorage.removeItem('authToken');
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
