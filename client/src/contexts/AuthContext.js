import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Get token and user from localStorage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Set auth token to axios default headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Try to parse stored user
          try {
            const user = JSON.parse(storedUser);
            
            // Add debug logging
            console.log('Loaded user from localStorage:', {
              id: user._id,
              name: user.name,
              studentId: user.studentId || 'not set'
            });
            
            setCurrentUser(user);
            
            // Refresh user data from server to ensure we have the latest data including studentId
            try {
              const response = await api.get('/api/auth/me');
              if (response.data && response.data.success && response.data.user) {
                console.log('Refreshed user data from server:', {
                  id: response.data.user._id,
                  name: response.data.user.name,
                  studentId: response.data.user.studentId || 'not set'
                });
                
                // Update localStorage with fresh data
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Update state
                setCurrentUser(response.data.user);
              }
            } catch (refreshError) {
              console.error('Error refreshing user data:', refreshError);
            }
          } catch (e) {
            console.error('Error parsing stored user:', e);
            // Clear invalid user data
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setError('Failed to authenticate user');
        // Logout user if token is invalid
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Making login request with:', { 
        email: credentials.email, 
        passwordProvided: !!credentials.password 
      });
      
      // Make a direct API call to test connectivity first
      try {
        await api.get('/health');
        console.log('Server health check passed');
      } catch (healthError) {
        console.error('Server health check failed:', healthError);
        throw new Error('Cannot connect to server. Please check if the server is running.');
      }
      
      // Now proceed with the login
      const response = await api.post('/api/auth/login', credentials);
      
      console.log('Login response received:', {
        status: response.status,
        success: response.data.success,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user
      });
      
      if (response.data.success && response.data.token && response.data.user) {
        // Set auth token to axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Immediately fetch complete user profile data
        try {
          const userResponse = await api.get('/api/auth/me');
          if (userResponse.data && userResponse.data.success && userResponse.data.user) {
            console.log('Fetched complete user data after login:', {
              id: userResponse.data.user._id,
              name: userResponse.data.user.name,
              studentId: userResponse.data.user.studentId || 'not set',
              yearOfJoining: userResponse.data.user.yearOfJoining || 'not set'
            });
            
            // Save the complete user data to localStorage
            localStorage.setItem('user', JSON.stringify(userResponse.data.user));
            
            // Update state with complete user data
            setCurrentUser(userResponse.data.user);
            setIsLoading(false);
            
            return {
              success: true,
              user: userResponse.data.user
            };
          }
        } catch (userDataError) {
          console.error('Error fetching complete user data:', userDataError);
          // Fall back to the original user data if fetching complete data fails
        }
        
        // If fetching complete data fails, use the original response data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setCurrentUser(response.data.user);
        setIsLoading(false);
        
        return {
          success: true,
          user: response.data.user
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Enhanced error handling
      let errorMessage = 'Login failed';
      let errorType = 'UNKNOWN_ERROR';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        errorMessage = err.response.data?.message || 'Server returned an error';
        errorType = err.response.data?.errorType || 'SERVER_ERROR';
        console.error('Server response error:', {
          status: err.response.status,
          data: err.response.data
        });
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
        errorType = 'NETWORK_ERROR';
        console.error('Network error - no response:', err.request);
      } else {
        // Something happened in setting up the request
        errorMessage = err.message || 'Error preparing login request';
        errorType = 'REQUEST_SETUP_ERROR';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      
      return {
        success: false,
        error: errorMessage,
        errorType: errorType
      };
    }
  };
  
  // Logout function
  const handleLogout = () => {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth token from axios default headers
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user from context
    setCurrentUser(null);
  };
  
  // Create alias for handleLogout to maintain backward compatibility
  const logout = handleLogout;
  
  // Register function
  const register = async (userData) => {
    try {
      setError('');
      
      // Log registration attempt with sensitive data removed
      console.log('Registration attempt:', {
        ...userData,
        password: userData.password ? '[REDACTED]' : undefined,
        confirmPassword: '[REDACTED]'
      });
      
      const response = await api.post('/api/auth/register', userData);
      
      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message,
          email: userData.email // Always include the email used for registration
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Registration failed' 
      };
    }
  };
  
  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setError('');
      const response = await api.post('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message,
          email: response.data.email 
        };
      } else {
        throw new Error(response.data.message || 'Failed to send reset code');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send reset code';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };
  
  // Verify reset OTP function
  const verifyResetOTP = async (email, otp) => {
    try {
      setError('');
      const response = await api.post('/api/auth/verify-reset-otp', { email, otp });
      
      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message,
          email: response.data.email 
        };
      } else {
        throw new Error(response.data.message || 'Invalid or expired verification code');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Invalid or expired verification code';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };
  
  // Reset password function
  const resetPassword = async (email, otp, password) => {
    try {
      setError('');
      const response = await api.post('/api/auth/reset-password', { 
        email, 
        otp, 
        password 
      });
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to reset password';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };
  
  // Change password for logged-in users
  const updatePassword = async (newPassword) => {
    try {
      setError('');
      // Request OTP for password change
      const otpResponse = await api.post('/api/auth/request-password-change-otp');
      
      if (!otpResponse.data.success) {
        throw new Error(otpResponse.data.message || 'Failed to send verification code');
      }
      
      // Temporary solution: automatically use the OTP from the response
      // In a real app, you'd prompt the user to enter the OTP they received
      const otp = prompt('Enter the verification code sent to your email:');
      
      if (!otp) {
        throw new Error('Verification code is required');
      }
      
      // Change password with OTP verification
      const changeResponse = await api.post('/api/auth/change-password', {
        otp,
        newPassword
      });
      
      if (changeResponse.data.success) {
        return { success: true, message: changeResponse.data.message };
      } else {
        throw new Error(changeResponse.data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Update password error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update password';
      setError(errorMsg);
      throw err;
    }
  };

  // Verify email with OTP function
  const verifyEmail = async (email, otp) => {
    try {
      setError('');
      console.log(`Verifying email ${email} with provided OTP`);
      
      const response = await api.post('/api/auth/verify-email', { email, otp });
      
      if (response.data.success) {
        console.log('Email verification successful');
        return { 
          success: true, 
          message: response.data.message || 'Email verified successfully. You can now log in.'
        };
      } else {
        throw new Error(response.data.message || 'Failed to verify email');
      }
    } catch (err) {
      console.error('Email verification error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to verify email';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };
  
  // Update user profile function - Optimized
  const updateProfile = async (userData) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Sanitize and validate data before sending
      const sanitizedData = { ...userData };
      
      // Convert empty strings to undefined for optional fields to prevent unintended updates
      ['studentId', 'mobileNumber', 'bio', 'yearOfJoining'].forEach(field => {
        if (sanitizedData[field] === '') {
          sanitizedData[field] = undefined;
        }
      });
      
      // For yearOfJoining, apply simple validation
      if (sanitizedData.yearOfJoining !== undefined) {
        const year = parseInt(sanitizedData.yearOfJoining, 10);
        const currentYear = new Date().getFullYear();
        
        if (isNaN(year) || year < 1990 || year > currentYear) {
          console.warn(`Invalid year ${sanitizedData.yearOfJoining}, not updating`);
          delete sanitizedData.yearOfJoining;
        } else {
          console.log('Updating academic year of joining to:', sanitizedData.yearOfJoining);
        }
      }
      
      const response = await api.put('/api/auth/update-profile', sanitizedData);
      
      if (response.data.success) {
        // Update the user in local storage
        const updatedUser = { ...currentUser, ...response.data.user };
        
        // Log important field changes
        ['studentId', 'yearOfJoining', 'department'].forEach(field => {
          if (currentUser[field] !== updatedUser[field]) {
            console.log(`Updated ${field}: ${currentUser[field] || 'not set'} → ${updatedUser[field] || 'not set'}`);
          }
        });
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update the current user state
        setCurrentUser(updatedUser);
        
        setIsLoading(false);
        return { success: true, message: response.data.message, user: updatedUser };
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
      setIsLoading(false);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to update profile' };
    }
  };

  // Role-based access control functions
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };
  
  const isFaculty = () => {
    return currentUser?.role === 'faculty';
  };
  
  const isStudent = () => {
    return currentUser?.role === 'student';
  };
  
  const isClubHead = () => {
    return currentUser?.role === 'clubHead';
  };
  
  // Add hasRole function to check if user has any of the specified roles
  const hasRole = (roles) => {
    if (!currentUser || !currentUser.role) return false;
    return roles.includes(currentUser.role);
  };
  
  // Context value
  const value = {
    currentUser,
    login,
    handleLogout,
    logout,
    register,
    loading,
    isLoading,
    error,
    setError,
    isAdmin,
    isFaculty,
    isStudent,
    isClubHead,
    hasRole,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    updatePassword,
    verifyEmail,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
