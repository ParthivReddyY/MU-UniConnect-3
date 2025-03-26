import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
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
        setMessage(result.message || 'Password reset email sent. Please check your inbox.');
        setMessageType('success');
        setEmail('');
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

  // Common label class for consistent styling
  const labelClass = "block mb-2 text-sm font-medium text-gray-300 h-5";

  // Input class matching the login/signup styling
  const inputClass = "w-full pl-12 pr-4 py-3 h-[50px] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-100 bg-gray-800 bg-opacity-70 transition-all duration-200 shadow-sm";

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
      
      {/* Main container with consistent styling */}
      <div className="w-full max-w-xl bg-black bg-opacity-80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-gray-800 relative z-10 my-12 backdrop-blur-sm">
        <div className="px-10 pt-10 pb-6 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-white mb-3">Forgot Password</h1>
          <p className="text-gray-400">Enter your email to receive a password reset link</p>
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
        
        <form className="px-10 pb-10 space-y-6" onSubmit={handleSubmit}>
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
                  Send Reset Link
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
