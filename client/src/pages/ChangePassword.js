import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { currentUser, requestPasswordChangeOTP, changePasswordWithOTP } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Enter OTP + New Password
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (otpTimer > 0 && otpSent) {
      interval = setInterval(() => {
        setOtpTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer, otpSent]);

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }

    // Check length
    const lengthScore = Math.min(password.length / 12, 1) * 25;
    
    // Check complexity
    let complexityScore = 0;
    if (/[a-z]/.test(password)) complexityScore += 10;
    if (/[A-Z]/.test(password)) complexityScore += 15;
    if (/[0-9]/.test(password)) complexityScore += 10;
    if (/[^a-zA-Z0-9]/.test(password)) complexityScore += 15;
    
    // Unique character ratio
    const uniqueChars = new Set(password).size;
    const uniqueRatio = uniqueChars / password.length;
    const uniqueScore = uniqueRatio * 25;
    
    // Calculate final strength
    const totalScore = Math.min(Math.round(lengthScore + complexityScore + uniqueScore), 100);
    setPasswordStrength(totalScore);
    
    // Set feedback based on score
    if (totalScore < 40) {
      setPasswordFeedback('Weak password');
    } else if (totalScore < 70) {
      setPasswordFeedback('Moderate password');
    } else {
      setPasswordFeedback('Strong password');
    }
  };

  // Handle request OTP for password change
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', content: '' });
    
    try {
      const result = await requestPasswordChangeOTP();
      
      if (result.success) {
        setOtpSent(true);
        setOtpTimer(120); // 2 minutes timer for OTP resend
        setStep(2); // Move to next step
        setMessage({
          type: 'success',
          content: 'Verification code sent to your email. Please check your inbox.'
        });
      } else {
        setMessage({
          type: 'error',
          content: result.message || 'Failed to send verification code. Please try again.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification and password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!otpCode.trim()) {
      setMessage({
        type: 'error',
        content: 'Please enter the verification code'
      });
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    if (passwordStrength < 40) {
      setPasswordError('Please use a stronger password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: '', content: '' });
    
    try {
      const result = await changePasswordWithOTP(otpCode, newPassword);
      
      if (result.success) {
        setMessage({
          type: 'success',
          content: 'Password changed successfully!'
        });
        
        // Reset form fields
        setOtpCode('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength(0);
        setPasswordFeedback('');
        
        // Redirect to dashboard after successful password change with a delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          content: result.message || 'Failed to change password. Please try again.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Change Password</h1>
            <p className="text-gray-500 mt-1">Update your password to keep your account secure</p>
          </div>
          <div>
            <button 
              onClick={() => navigate('/profile')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm flex items-center transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Profile
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-indigo-600 h-2"></div>
          
          <div className="p-6">
            {/* Message Display */}
            {message.content && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {message.type === 'success' ? (
                      <i className="fas fa-check-circle text-green-500"></i>
                    ) : (
                      <i className="fas fa-exclamation-circle text-red-500"></i>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{message.content}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      type="button"
                      className="inline-flex text-gray-400 hover:text-gray-500"
                      onClick={() => setMessage({ type: '', content: '' })}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step Progress */}
            <div className="flex items-center mb-8">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === 1 ? 'border-red-500 bg-red-100 text-red-600' : 'border-green-500 bg-green-500 text-white'
              }`}>
                {step > 1 ? (
                  <i className="fas fa-check text-sm"></i>
                ) : (
                  <span className="text-sm font-medium">1</span>
                )}
              </div>
              <div className={`flex-grow h-0.5 mx-2 ${step > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === 2 ? 'border-red-500 bg-red-100 text-red-600' : 'bg-gray-200 border-gray-300 text-gray-500'
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
            </div>

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP}>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Step 1: Request Verification Code</h2>
                  <p className="text-gray-600 mb-4">
                    We'll send a verification code to your registered email address ({currentUser?.email}).
                  </p>
                  
                  <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-blue-500">
                        <i className="fas fa-info-circle text-lg"></i>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-blue-800 font-medium">Security Notice</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          For security reasons, you'll need to verify your identity before changing your password. 
                          This helps protect your account from unauthorized changes.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || otpSent}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin mr-2"></i>
                        Sending Code...
                      </>
                    ) : otpSent ? (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        Code Sent
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Send Verification Code
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Enter OTP and New Password */}
            {step === 2 && (
              <form onSubmit={handleChangePassword}>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Step 2: Change Your Password</h2>
                  <p className="text-gray-600 mb-6">
                    Enter the verification code sent to your email and choose a new secure password.
                  </p>
                  
                  <div className="space-y-5">
                    {/* OTP Field */}
                    <div>
                      <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-key text-gray-400"></i>
                        </div>
                        <input
                          id="otpCode"
                          name="otpCode"
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          maxLength={6}
                          required
                        />
                      </div>
                      
                      {otpTimer > 0 ? (
                        <p className="mt-2 text-sm text-gray-500">
                          Resend code in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRequestOTP}
                          disabled={isSubmitting}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                    
                    {/* New Password Field */}
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-lock text-gray-400"></i>
                        </div>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            checkPasswordStrength(e.target.value);
                            setPasswordError('');
                          }}
                          placeholder="Create a strong password"
                          className={`pl-10 pr-10 py-2 w-full border rounded-md focus:outline-none focus:ring-2 ${
                            passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                          }`}
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400 hover:text-gray-600`}></i>
                        </button>
                      </div>
                      
                      {/* Password strength indicator */}
                      {newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  passwordStrength < 40
                                    ? 'bg-red-500'
                                    : passwordStrength < 70
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${passwordStrength}%` }}
                              ></div>
                            </div>
                            <span className="ml-3 text-sm text-gray-600">{passwordFeedback}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Confirm Password Field */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-lock text-gray-400"></i>
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordError('');
                          }}
                          placeholder="Re-enter your new password"
                          className={`pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 ${
                            passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                          }`}
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Password Error */}
                    {passwordError && (
                      <p className="text-red-600 text-sm">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {passwordError}
                      </p>
                    )}
                    
                    {/* Password hints */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Password Requirements:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className={`flex items-center ${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                          <i className={`fas ${newPassword.length >= 8 ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-400'} mr-2`}></i>
                          At least 8 characters long
                        </li>
                        <li className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                          <i className={`fas ${/[A-Z]/.test(newPassword) ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-400'} mr-2`}></i>
                          Contains uppercase letters
                        </li>
                        <li className={`flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                          <i className={`fas ${/[0-9]/.test(newPassword) ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-400'} mr-2`}></i>
                          Contains numbers
                        </li>
                        <li className={`flex items-center ${/[^a-zA-Z0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                          <i className={`fas ${/[^a-zA-Z0-9]/.test(newPassword) ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-400'} mr-2`}></i>
                          Contains special characters
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors"
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-circle-notch fa-spin mr-2"></i>
                            Changing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-key mr-2"></i>
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-yellow-500">
              <i className="fas fa-shield-alt text-lg"></i>
            </div>
            <div className="ml-3">
              <h4 className="text-yellow-800 font-medium">Security Tips</h4>
              <ul className="list-disc pl-5 mt-2">
                <li className="text-sm text-yellow-700">Use a unique password that you don't use for other accounts</li>
                <li className="text-sm text-yellow-700">Don't share your password with anyone, including university staff</li>
                <li className="text-sm text-yellow-700">Enable two-factor authentication for added security</li>
                <li className="text-sm text-yellow-700">Change your password regularly (at least every 3 months)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
