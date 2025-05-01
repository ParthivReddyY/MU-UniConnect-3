import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUserDataRefreshing, setIsUserDataRefreshing] = useState(false);

  // Enhanced fetchUserData with better error handling and refresh state
  const fetchUserData = async () => {
    try {
      setIsUserDataRefreshing(true);
      const response = await api.get('/api/auth/me');
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        console.log('User data refreshed:', userData);
        
        // Ensure studentId and yearOfJoining are correctly handled
        setCurrentUser(userData);
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(userData));
        
        return userData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error?.response?.data || error.message);
      
      // Only clear auth data if the error is auth-related (401/403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      throw error;
    } finally {
      setIsUserDataRefreshing(false);
      setLoading(false);
    }
  };

  // Function to force refresh user data - can be called from any component
  const refreshUserData = async () => {
    try {
      const userData = await fetchUserData();
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error };
    }
  };

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('user');
    
    if (token) {
      // Set the cached user first for immediate display
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setCurrentUser(parsedUser);
        } catch (e) {
          console.error('Error parsing cached user:', e);
        }
      }
      
      // Then fetch fresh data
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  // Fix login function to handle both object and separate parameters
  const login = async (emailOrData, passwordParam) => {
    try {
      // Clear any previous errors
      setError('');
      
      let email, password;
      
      // Check if first parameter is an object (formData) or a string (email)
      if (typeof emailOrData === 'object' && emailOrData !== null) {
        // Extract email and password from the formData object
        email = emailOrData.email;
        password = emailOrData.password;
        console.log('Login with formData object', { email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' });
      } else {
        // Use parameters directly
        email = emailOrData;
        password = passwordParam;
        console.log('Login with direct parameters', { email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' });
      }
      
      // Validate email and password
      if (!email || !password) {
        const errorMessage = 'Email and password are required';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
      
      // Make the login request with properly extracted data
      const response = await api.post('/api/auth/login', { email, password });
      
      // If login successful, store the token and user data
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      return { success: true, user };
    } catch (error) {
      // Handle specific error types
      if (error.response) {
        const { data } = error.response;
        const errorMessage = data.message || 'Login failed';
        setError(errorMessage);
        return { success: false, message: errorMessage, errorType: data.errorType };
      } else {
        const errorMessage = 'Network or server error. Please try again.';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    // Instead of navigating here, return a flag that the component can use
    return { success: true, shouldRedirect: true };
  };

  // Check if the current user has a specific role
  const hasRole = (roles) => {
    // Return false if not logged in
    if (!currentUser) return false;
    
    // If roles is a string, convert to array
    const rolesToCheck = typeof roles === 'string' ? [roles] : roles;
    
    // Check if current user's role is in the list
    return rolesToCheck.includes(currentUser.role);
  };

  // Convenience functions for common role checks
  const isAdmin = () => hasRole(['admin']);
  const isStudent = () => hasRole(['student']);
  const isFaculty = () => hasRole(['faculty']);
  const isClubHead = () => hasRole(['clubHead', 'clubs']);

  // Update user profile data 
  const updateUserProfile = async (updatedData) => {
    try {
      setError('');
      
      const response = await api.put('/api/auth/update-profile', updatedData);
      
      if (response.data.success) {
        // Update the current user state with the updated data
        setCurrentUser(prevUser => ({
          ...prevUser,
          ...response.data.user
        }));
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    isUserDataRefreshing,
    login,
    logout,
    hasRole,
    isAdmin,
    isStudent,
    isFaculty,
    isClubHead,
    refreshUserData,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
