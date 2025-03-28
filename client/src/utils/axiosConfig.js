import axios from 'axios';

// Set the base URL for API requests - more robust handling for production
let baseURL;

// In production, use the same domain (no need for explicit URL)
if (process.env.NODE_ENV === 'production') {
  baseURL = ''; // Empty string means use the same domain as the client
} else {
  // In development, use localhost or the environment variable
  baseURL = process.env.REACT_APP_API_URL || 'http://localhost:9000';
}

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies if you use them
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

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log details about the error in production for debugging
    if (process.env.NODE_ENV === 'production') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        details: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

export default api;
