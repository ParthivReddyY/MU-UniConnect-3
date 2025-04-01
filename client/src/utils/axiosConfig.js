import axios from 'axios';

// Determine the base URL for the API based on environment
const getBaseURL = () => {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }
  
  // In production, use the deployed URL or relative path
  return process.env.REACT_APP_API_URL || '';
};

// Create an axios instance with custom configuration
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle session expirations
    if (error.response && error.response.status === 401) {
      // If on a protected route, logout user by clearing token
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/register' &&
          !window.location.pathname.startsWith('/reset-password') &&
          window.location.pathname !== '/forgot-password') {
        localStorage.removeItem('token');
        
        // Optionally redirect to login page with a message
        window.location.replace('/login?message=session_expired');
      }
    }
    
    // Network errors handling
    if (error.message === 'Network Error') {
      console.error('API Network Error: Unable to connect to server');
    }
    
    // Log API errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response || error.message || error);
    }
    
    return Promise.reject(error);
  }
);

export default api;
