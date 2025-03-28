import axios from 'axios';

console.log('Environment API URL:', process.env.REACT_APP_API_URL);

// Determine baseURL with better fallback handling
const baseURL = process.env.REACT_APP_API_URL || 
                (window.location.hostname === 'localhost' ? 
                'http://localhost:9000/api' : 
                'https://mu-uniconnect-ob9x.onrender.com/api');

console.log('Using API baseURL:', baseURL);

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 seconds timeout
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    
    if (!error.response) {
      console.error('Network error - no response received');
    }
    
    return Promise.reject(error);
  }
);

export default api;
