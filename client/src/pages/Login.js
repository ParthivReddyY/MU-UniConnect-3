import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Replace direct axios import with the configured api client
import api from '../utils/axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Add states for 2-step login
  const [currentStep, setCurrentStep] = useState(1);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  const { login, error, setError, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const adminEmails = [
    'parthivreddy7769@gmail.com',
    'vlakshmireddy1812@gmail.com',
    'anchuriharshith323@gmail.com',
    'thangellajugalkishore@gmail.com',
    'charanreddyguru@gmail.com',
    'bayyaadi2@gmail.com',
    'adityabhonagiri04@gmail.com',
    'jaithrasathwiks@gmail.com'
  ];
  
  useEffect(() => {
    if (currentUser) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
    
    setError('');
  }, [currentUser, navigate, location.state?.from?.pathname, setError]);
  
  // Validate only email in step 1
  const validateEmail = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!adminEmails.includes(formData.email.toLowerCase()) && 
               !/^[\w.%+-]+@mahindrauniversity\.edu\.in$/i.test(formData.email)) {
      newErrors.email = 'Please use your Mahindra University email (@mahindrauniversity.edu.in)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle first step (email verification)
  const handleContinue = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsCheckingEmail(true);
    setLoginError('');
    
    try {
      console.log('Checking email with API:', formData.email);
      // Use the configured api client instead of direct axios
      const response = await api.post('/api/auth/check-email', {
        email: formData.email
      });
      
      console.log('Email check response:', response.data);
      
      if (response.data.exists) {
        // Email exists, proceed to step 2
        setCurrentStep(2);
        // Focus on password field after transition
        setTimeout(() => {
          const passwordField = document.getElementById('password');
          if (passwordField) passwordField.focus();
        }, 100);
      } else {
        // Email doesn't exist
        setErrors({
          email: 'No account found with this email address'
        });
      }
    } catch (err) {
      // Improved error handling with more specific messages
      console.error("Error checking email:", err);
      
      if (err.code === 'ECONNABORTED') {
        setErrors({
          email: 'Request timed out. Please try again.'
        });
      } else if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setErrors({
          email: err.response.data.message || 'Server error. Please try again.'
        });
      } else if (err.request) {
        // The request was made but no response was received
        setErrors({
          email: `No response from server. Please check your connection. Server URL: ${api.defaults.baseURL}`
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        setErrors({
          email: `An error occurred while checking your email. ${err.message}`
        });
      }
    } finally {
      setIsCheckingEmail(false);
    }
  };
  
  // Validate complete form (used in step 2)
  const validateForm = () => {
    const newErrors = {};
    
    // No need to validate email again in step 2
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle final login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleContinue(e);
      return;
    }
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      console.log('Attempting login with:', formData.email);
      const result = await login(formData);
      setIsSubmitting(false);
      
      if (result.success) {
        // Removed forcePasswordChange check and redirect
        // Always redirect to dashboard or home on successful login
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      } else {
        // Format error message based on the type of error
        if (result.errorType === 'INVALID_PASSWORD') {
          setLoginError('Incorrect password. Please try again.');
          // Focus on password field and clear it for re-entry
          setFormData({...formData, password: ''});
          setTimeout(() => {
            const passwordField = document.getElementById('password');
            if (passwordField) {
              passwordField.focus();
            }
          }, 100);
        } else if (result.errorType === 'EMAIL_NOT_FOUND') {
          // If email not found, go back to step 1
          setLoginError('No account found with this email. Please check the email address.');
          setCurrentStep(1);
        } else if (result.errorType === 'EMAIL_NOT_VERIFIED') {
          setLoginError('Please verify your email address before logging in.');
        } else {
          setLoginError(result.message || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message && err.message.includes('Network Error')) {
        setLoginError(`Network error connecting to server. Please check your connection or try again later. (Server: ${api.defaults.baseURL})`);
      } else {
        setLoginError(`An unexpected error occurred: ${err.message}. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to go back to email step
  const handleBackToEmail = () => {
    setCurrentStep(1);
    setLoginError('');
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Common label class for consistent styling
  const labelClass = "block mb-2 text-sm font-medium text-gray-300 h-5";

  // Updated input class with proper focus handling
  const inputClass = (fieldName) => `w-full pl-12 pr-${fieldName === 'password' ? '12' : '4'} py-4 h-[50px] border ${
    errors[fieldName] ? 'border-red-500' : 'border-gray-700'
  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-100 bg-gray-800 bg-opacity-70 transition-all duration-200 shadow-sm`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-20 bg-gradient-to-r from-red-500 to-indigo-500 relative">
      {/* Background gradient overlay */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.15),transparent_70%)] mix-blend-multiply"></div>
      
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 bg-black bg-opacity-70 text-white font-medium py-2 px-4 rounded-md hover:bg-opacity-90 transition-all duration-200 flex items-center group"
      >
        <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
        Back to Home
      </Link>
      
      {/* Main container with increased width */}
      <div className="w-full max-w-2xl bg-black bg-opacity-80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 mt-15 backdrop-blur-sm">
        <div className="px-10 pt-10 pb-6 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-white mb-3">Sign In</h1>
          <p className="text-gray-400">Access your MU-UniConnect account</p>
        </div>
        
        {(loginError || error) && (
          <div className="mx-10 mb-6 bg-red-900 bg-opacity-30 text-red-400 p-4 rounded-md text-sm border border-red-800 animate-pulse">
            {loginError || error}
          </div>
        )}
        
        <form className="px-10 pb-10" onSubmit={handleSubmit}>
          {/* Email field (shown in both steps) */}
          <div className="mb-6">
            <label htmlFor="email" className={labelClass}>Email Address</label>
            <div className="relative group">
              <input
                id="email"
                name="email"
                type="email"
                className={inputClass('email')}
                placeholder="yourname@mahindrauniversity.edu.in"
                value={formData.email}
                onChange={handleChange}
                disabled={currentStep === 2}
                autoFocus={currentStep === 1}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                <i className="fas fa-envelope"></i>
              </div>
            </div>
            {errors.email && (
              <div className="mt-2 text-sm text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {errors.email}
              </div>
            )}
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleBackToEmail}
                className="mt-2 text-sm text-red-500 hover:text-red-400 flex items-center group"
              >
                <i className="fas fa-edit mr-1 group-hover:animate-pulse"></i> Change email
              </button>
            )}
          </div>
          
          {/* Step 1: Continue button */}
          {currentStep === 1 && (
            <div className="mb-6 fade-in">
              <button
                type="button"
                onClick={handleContinue}
                disabled={isCheckingEmail}
                className="w-full flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-4 rounded-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                {isCheckingEmail ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                    Checking...
                  </>
                ) : (
                  <>
                    Continue
                    <i className="fas fa-arrow-right ml-2"></i>
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Step 2: Password field and login button */}
          {currentStep === 2 && (
            <div className="fade-in">
              <div className="mb-6">
                <label htmlFor="password" className={labelClass}>Password</label>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={inputClass('password')}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoFocus
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                    <i className="fas fa-lock"></i>
                  </div>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 w-5 h-5 flex items-center justify-center"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <div className="mt-2 text-sm text-red-500 flex items-center">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {errors.password}
                  </div>
                )}
              </div>
            
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-gray-700 rounded text-red-600 focus:ring-red-500 bg-gray-800"
                    id="remember-me"
                  />
                  <label className="ml-2 text-sm text-gray-400" htmlFor="remember-me">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-gray-200 hover:underline transition-all">
                  Forgot password?
                </Link>
              </div>
            
              <div className="mb-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-4 rounded-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Sign In
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          <div className="text-center mt-8">
            <p className="mb-3 text-gray-400">New to MU-UniConnect?</p>
            <Link to="/signup" className="w-full inline-block border border-gray-600 text-gray-300 font-medium py-4 px-4 rounded-md hover:bg-gray-700 transition-all duration-200 text-center text-lg bg-gray-900 hover:text-white">
              <i className="fas fa-user-plus mr-2"></i>
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
