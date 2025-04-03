import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { currentUser, requestPasswordChangeOTP, changePasswordWithOTP } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  
  // Step states
  const [isRequestingOTP, setIsRequestingOTP] = useState(true);
  
  // Form states
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Error states
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Function to request password change OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const result = await requestPasswordChangeOTP();
      
      if (result.success) {
        setIsRequestingOTP(false);
        setMessage(result.message || 'Verification code sent to your email. Please check your inbox.');
        setMessageType('success');
      } else {
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to submit password change with OTP
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!otpCode.trim()) {
      setOtpError('Verification code is required');
      return;
    }
    
    if (!newPassword.trim()) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await changePasswordWithOTP(otpCode, newPassword);
      
      if (result.success) {
        setMessage(result.message || 'Password changed successfully!');
        setMessageType('success');
        
        // Reset form values
        setOtpCode('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        if (result.message.toLowerCase().includes('verification') || result.message.toLowerCase().includes('code')) {
          setOtpError(result.message || 'Invalid verification code');
        } else {
          setPasswordError(result.message || 'Failed to change password');
        }
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common label class for consistent styling
  const labelClass = "block mb-2 text-sm font-medium text-gray-300 h-5";

  // Input class with error state
  const inputClass = (error) => `w-full pl-12 pr-4 py-3 h-[50px] border ${
    error ? 'border-red-500' : 'border-gray-700'
  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-100 bg-gray-800 bg-opacity-70 transition-all duration-200 shadow-sm`;
  
  // Password input class with error state and right padding for eye icon
  const passwordInputClass = (error) => `w-full pl-12 pr-10 py-3 h-[50px] border ${
    error ? 'border-red-500' : 'border-gray-700'
  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-100 bg-gray-800 bg-opacity-70 transition-all duration-200 shadow-sm`;

  // If not logged in, show error message
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-r from-red-500 to-indigo-500 relative">
        <div className="w-full max-w-md bg-black bg-opacity-80 rounded-xl shadow-2xl p-8 text-center">
          <p className="text-red-400 text-xl mb-4">
            <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <br />
            You must be logged in to change your password
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md mt-4"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // OTP Verification Form
  if (!isRequestingOTP) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-20 bg-gradient-to-r from-red-500 to-indigo-500 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.15),transparent_70%)] mix-blend-multiply"></div>
        
        <div className="w-full max-w-xl bg-black bg-opacity-80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 my-12 backdrop-blur-sm">
          <div className="px-10 pt-10 pb-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-3">Change Password</h1>
            <p className="text-gray-400">Enter the verification code and your new password</p>
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
          
          <form className="px-10 pb-10 pt-2" onSubmit={handleChangePassword}>
            <div className="mb-6">
              <label htmlFor="otpCode" className={labelClass}>Verification Code</label>
              <div className="relative group">
                <input
                  id="otpCode"
                  type="text"
                  className={inputClass(otpError)}
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    setOtpError('');
                  }}
                  maxLength={6}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors">
                  <i className="fas fa-key"></i>
                </div>
              </div>
              {otpError && (
                <div className="mt-1 text-xs text-red-500 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {otpError}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="newPassword" className={labelClass}>New Password</label>
              <div className="relative group">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  className={passwordInputClass(passwordError)}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors">
                  <i className="fas fa-lock"></i>
                </div>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className={passwordInputClass(passwordError)}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors">
                  <i className="fas fa-lock"></i>
                </div>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {passwordError && (
                <div className="mt-1 text-xs text-red-500 flex items-center">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {passwordError}
                </div>
              )}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-key mr-2"></i>
                    Change Password
                  </>
                )}
              </button>
            </div>
            
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRequestingOTP(true);
                    setOtpCode('');
                    setOtpError('');
                    setPasswordError('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fas fa-arrow-left mr-1"></i>
                  Back to Request Code
                </button>
              </div>
            </form>
        </div>
      </div>
    );
  }

  // Request OTP Form (initial state)
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-20 bg-gradient-to-r from-red-500 to-indigo-500 relative">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.15),transparent_70%)] mix-blend-multiply"></div>
      
      <div className="w-full max-w-xl bg-black bg-opacity-80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 my-12 backdrop-blur-sm">
        <div className="px-10 pt-10 pb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Change Password</h1>
          <p className="text-gray-400">Please request a verification code to change your password</p>
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
        
        <form className="px-10 pb-10 space-y-6" onSubmit={handleRequestOTP}>
          <div>
            <p className="text-gray-300 mb-4">
              For security reasons, we'll send a verification code to your email address ({currentUser.email}).
              You'll need this code to change your password.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-4 rounded-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send Verification Code
                </>
              )}
            </button>
          </div>
          
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
