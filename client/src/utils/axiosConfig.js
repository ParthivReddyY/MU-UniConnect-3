import axios from 'axios';

// Determine baseURL with better fallback handling
const baseURL = process.env.REACT_APP_API_URL || 
                (window.location.hostname === 'localhost' ? 
                'http://localhost:9000/api' : 
                'https://mu-uniconnect-ob9x.onrender.com/api');

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
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
    return Promise.reject(error);
  }
);

export default api;
