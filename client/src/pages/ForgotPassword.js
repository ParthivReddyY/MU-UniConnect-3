import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  
  // For OTP verification
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // For password reset after OTP verification
  const [isResetting, setIsResetting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    label: '',
    color: '',
    hasMinLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  const { forgotPassword, verifyResetOTP, resetPassword } = useAuth();
  
  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return {
      strength: 0,
      label: '',
      color: '',
      hasMinLength: false,
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecial: false
    };
    
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const hasMinLength = password.length >= 8;
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (hasMinLength) strength += 1;
    if (hasLowercase) strength += 1;
    if (hasUppercase) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecial) strength += 1;
    
    const strengthMap = {
      0: { label: 'Very Weak', color: 'bg-red-700' },
      1: { label: 'Very Weak', color: 'bg-red-600' },
      2: { label: 'Weak', color: 'bg-orange-500' },
      3: { label: 'Medium', color: 'bg-yellow-500' },
      4: { label: 'Strong', color: 'bg-green-500' },
      5: { label: 'Very Strong', color: 'bg-green-600' },
      6: { label: 'Excellent', color: 'bg-indigo-600' }
    };
    
    return {
      strength,
      label: strengthMap[strength].label,
      color: strengthMap[strength].color,
      hasMinLength,
      hasLowercase,
      hasUppercase,
      hasNumber,
      hasSpecial
    };
  };
  
  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(password));
  }, [password]);
  

  // Function to request password reset OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setVerificationEmail(result.email);
        setIsVerifying(true);
        setMessage(result.message || 'Verification code sent to your email. Please check your inbox.');
        setMessageType('success');
      } else {
        setMessage(result.message || 'Failed to process request. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otpCode.trim()) {
      setOtpError('Please enter the verification code');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await verifyResetOTP(verificationEmail, otpCode);
      
      if (result.success) {
        setIsResetting(true);
        setIsVerifying(false);
        setMessage(result.message || 'Code verified successfully. Please set a new password.');
        setMessageType('success');
      } else {
        setOtpError(result.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setOtpError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
    // Function to reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    if (passwordStrength.strength < 3) {
      setPasswordError('Password is too weak. Please use a stronger password with a mix of characters.');
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await resetPassword(verificationEmail, otpCode, password);
      
      if (result.success) {
        setMessage(result.message || 'Password reset successful! You can now log in with your new password.');
        setMessageType('success');
        setPassword('');
        setConfirmPassword('');
        
        // Reset the flow
        setIsResetting(false);
        setIsVerifying(false);
        setEmail('');
        setOtpCode('');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setPasswordError(result.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common label class for consistent styling
  const labelClass = "block mb-2 text-sm font-medium text-gray-300 h-5";

  // Input class matching the login/signup styling
  const inputClass = "w-full pl-12 pr-4 py-3 h-[50px] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-100 bg-gray-800 bg-opacity-70 transition-all duration-200 shadow-sm";
  
  // Password input class
  const passwordInputClass = (error) => `w-full pl-12 pr-10 py-3 h-[50px] border ${
    error ? 'border-red-500' : 'border-gray-700'
  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-100 bg-gray-800 bg-opacity-70 transition-all duration-200 shadow-sm`;

  // Render password reset form
  if (isResetting) {
    return (
      <div className="h-screen flex items-center justify-center px-4 relative overflow-hidden"
           style={{
             backgroundImage: 'url("/img/login and signup background.jpg")',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat',
             backgroundAttachment: 'fixed'
           }}>
        <div className="absolute top-0 right-0 w-full h-full bg-black bg-opacity-50"></div>
        
        <Link 
          to="/" 
          className="absolute top-6 left-6 bg-black bg-opacity-70 text-white font-medium py-2 px-4 rounded-md hover:bg-opacity-90 transition-all duration-200 flex items-center group z-10"
        >
          <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
          Back to Home
        </Link>
        
        <div className="w-full max-w-xl bg-black bg-opacity-80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 mx-auto backdrop-blur-sm">
          <div className="px-10 pt-10 pb-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-3">Reset Your Password</h1>
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
          
          {passwordError && (
            <div className="mx-10 mb-6 bg-red-900 bg-opacity-30 text-red-400 p-4 rounded-md text-sm border border-red-800 animate-pulse">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {passwordError}
            </div>
          )}
          
          <form className="px-10 pb-10 pt-2" onSubmit={handleResetPassword}>
            <div className="mb-6">              <label htmlFor="password" className={labelClass}>New Password</label>
              <div className="relative group">                
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={passwordInputClass(passwordError)}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors">
                  <i className="fas fa-lock"></i>
                </div>                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              
              {/* Password Rules */}
              <p className="text-xs text-gray-400 mt-1 mb-2">
                <i className="fas fa-info-circle mr-1"></i>
                Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.
              </p>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-300">Password Strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength < 3 
                        ? 'text-red-400' 
                        : passwordStrength.strength < 5 
                          ? 'text-yellow-400' 
                          : 'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  
                  {/* Strength bar */}
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color}`} 
                      style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Requirements checklist */}
                  <div className="mt-3 grid grid-cols-1 gap-1.5">
                    <div className={`flex items-center text-xs ${passwordStrength.hasMinLength ? 'text-green-400' : 'text-gray-400'}`}>
                      <i className={`fas fa-${passwordStrength.hasMinLength ? 'check-circle' : 'circle'} mr-2`}></i>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center text-xs ${passwordStrength.hasLowercase ? 'text-green-400' : 'text-gray-400'}`}>
                      <i className={`fas fa-${passwordStrength.hasLowercase ? 'check-circle' : 'circle'} mr-2`}></i>
                      Lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center text-xs ${passwordStrength.hasUppercase ? 'text-green-400' : 'text-gray-400'}`}>
                      <i className={`fas fa-${passwordStrength.hasUppercase ? 'check-circle' : 'circle'} mr-2`}></i>
                      Uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center text-xs ${passwordStrength.hasNumber ? 'text-green-400' : 'text-gray-400'}`}>
                      <i className={`fas fa-${passwordStrength.hasNumber ? 'check-circle' : 'circle'} mr-2`}></i>
                      Number (0-9)
                    </div>
                    <div className={`flex items-center text-xs ${passwordStrength.hasSpecial ? 'text-green-400' : 'text-gray-400'}`}>
                      <i className={`fas fa-${passwordStrength.hasSpecial ? 'check-circle' : 'circle'} mr-2`}></i>
                      Special character (!@#$%)
                    </div>
                  </div>
                </div>
              )}
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
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <i className="fas fa-key mr-2"></i>
                    Reset Password
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsResetting(false);
                  setIsVerifying(true);
                  setPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-arrow-left mr-1"></i>
                Back to Verification
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  // Render OTP verification form
  if (isVerifying) {
    return (
      <div className="h-screen flex items-center justify-center px-4 relative overflow-hidden"
           style={{
             backgroundImage: 'url("/img/login and signup background.jpg")',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat',
             backgroundAttachment: 'fixed'
           }}>
        <div className="absolute top-0 right-0 w-full h-full bg-black bg-opacity-50"></div>
        
        <Link 
          to="/" 
          className="absolute top-6 left-6 bg-black bg-opacity-70 text-white font-medium py-2 px-4 rounded-md hover:bg-opacity-90 transition-all duration-200 flex items-center group z-10"
        >
          <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
          Back to Home
        </Link>
        
        <div className="w-full max-w-md bg-black bg-opacity-80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 mx-auto backdrop-blur-sm">
          <div className="px-10 pt-10 pb-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-3">Verify Your Email</h1>
            <p className="text-gray-400">Enter the verification code sent to {verificationEmail}</p>
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
          
          {otpError && (
            <div className="mx-10 mb-6 bg-red-900 bg-opacity-30 text-red-400 p-4 rounded-md text-sm border border-red-800 animate-pulse">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {otpError}
            </div>
          )}
          
          <form className="px-10 pb-10 pt-2" onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <label htmlFor="otpCode" className={labelClass}>Verification Code</label>
              <div className="relative group">
                <input
                  id="otpCode"
                  type="text"
                  className={inputClass}
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
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Verify Code
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsVerifying(false);
                  setOtpCode('');
                  setOtpError('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-arrow-left mr-1"></i>
                Back to Email Form
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render email form (initial state)
  return (
    <div className="h-screen flex items-center justify-center px-4 relative overflow-hidden"
         style={{
           backgroundImage: 'url("/img/login and signup background.jpg")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat',
           backgroundAttachment: 'fixed'
         }}>
      <div className="absolute top-0 right-0 w-full h-full bg-black bg-opacity-50"></div>
      
      <Link 
        to="/" 
        className="absolute top-6 left-6 bg-black bg-opacity-70 text-white font-medium py-2 px-4 rounded-md hover:bg-opacity-90 transition-all duration-200 flex items-center group z-10"
      >
        <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
        Back to Home
      </Link>
      
      <div className="w-full max-w-xl bg-black bg-opacity-80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 mx-auto backdrop-blur-sm">
        <div className="px-10 pt-10 pb-6 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-white mb-3">Forgot Password</h1>
          <p className="text-gray-400">Enter your email to receive a verification code</p>
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
            <label htmlFor="email" className={labelClass}>Email Address</label>
            <div className="relative group">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
                placeholder="yourname@mahindrauniversity.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors w-5 h-5 flex items-center justify-center">
                <i className="fas fa-envelope"></i>
              </div>
            </div>
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

export default ForgotPassword;
