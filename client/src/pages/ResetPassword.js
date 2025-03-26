import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await resetPassword(token, formData.password);
      
      if (result.success) {
        setMessage(result.message || 'Password reset successful! You can now log in with your new password.');
        setMessageType('success');
        
        // Clear form data
        setFormData({
          password: '',
          confirmPassword: ''
        });
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage(result.message || 'Failed to reset password. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common label class for consistent styling
  const labelClass = "block mb-2 text-sm font-medium text-gray-300 h-5";

  // Input class matching the login/signup styling
  const inputClass = (fieldName) => `w-full pl-12 pr-10 py-3 h-[50px] border ${
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
      <div className="w-full max-w-xl bg-black bg-opacity-80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 my-12 backdrop-blur-sm">
        <div className="px-10 pt-10 pb-6 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-white mb-3">Reset Password</h1>
          <p className="text-gray-400">Create a new password for your account</p>
        </div>
        
        {message && (
          <div 
            className={`mx-10 mb-6 p-4 rounded-md text-sm border ${
              messageType === 'success'
                ? 'bg-green-900 bg-opacity-30 text-green-400 border-green-800 animate-pulse'
                : 'bg-red-900 bg-opacity-30 text-red-400 border-red-800 animate-pulse'
            }`}
          >
            <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
            {message}
          </div>
        )}
        
        <form className="px-10 pb-10" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="password" className={labelClass}>New Password</label>
            <div className="relative group">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={inputClass('password')}
                placeholder="Minimum 6 characters"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                <i className="fas fa-lock"></i>
              </div>
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && (
              <div className="mt-1 text-xs text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.password}
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label>
            <div className="relative group">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClass('confirmPassword')}
                placeholder="Confirm your password"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                <i className="fas fa-lock"></i>
              </div>
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="mt-1 text-xs text-red-500 flex items-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <div className="mb-6">
            <button
              type="submit"
              disabled={isSubmitting || messageType === 'success'}
              className="w-full flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-4 rounded-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Resetting...
                </>
              ) : (
                <>
                  <i className="fas fa-key mr-2"></i>
                  Reset Password
                </>
              )}
            </button>
          </div>
          
          <div className="text-center mt-8">
            <p className="mb-3 text-gray-400">Remember your password?</p>
            <Link to="/login" className="w-full inline-block border border-gray-600 text-gray-300 font-medium py-4 px-4 rounded-md hover:bg-gray-700 transition-all duration-200 text-center text-lg bg-gray-900 hover:text-white">
              <i className="fas fa-sign-in-alt mr-2"></i>
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
