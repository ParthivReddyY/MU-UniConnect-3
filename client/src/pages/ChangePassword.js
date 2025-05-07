import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';

const ChangePassword = () => {
  useAuth(); 
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validation
    if (!oldPassword) {
      return setError("Current password is required");
    }
    
    if (newPassword !== confirmPassword) {
      return setError("New passwords don't match");
    }
    
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    
    try {
      setLoading(true);
      
      // First verify the old password
      const verifyResponse = await api.post('/api/auth/verify-password', {
        password: oldPassword
      });
      
      // If old password verification fails, show error
      if (!verifyResponse.data.success) {
        setError("Current password is incorrect");
        setLoading(false);
        return;
      }
      
      // If verification successful, proceed with password change
      const response = await api.post('/api/auth/change-password', {
        oldPassword,
        newPassword
      });
      
      if (response.data.success) {
        setSuccess('Password has been updated successfully');
        
        // Clear form
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Redirect after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.response?.data?.message || 'Failed to update password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (hasLowercase) strength += 1;
    if (hasUppercase) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecial) strength += 1;
    
    const strengthMap = {
      0: { label: 'Very Weak', color: 'bg-red-500' },
      1: { label: 'Very Weak', color: 'bg-red-500' },
      2: { label: 'Weak', color: 'bg-orange-500' },
      3: { label: 'Medium', color: 'bg-yellow-500' },
      4: { label: 'Strong', color: 'bg-green-500' },
      5: { label: 'Very Strong', color: 'bg-green-600' },
      6: { label: 'Excellent', color: 'bg-indigo-600' }
    };
    
    return {
      strength: strength,
      label: strengthMap[strength].label,
      color: strengthMap[strength].color
    };
  };
  
  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Back Button */}
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="group flex items-center justify-center w-10 h-10 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all duration-200"
            aria-label="Back to dashboard"
          >
            <i className="fas fa-arrow-left transition-transform group-hover:-translate-x-0.5"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
            <p className="text-gray-500 mt-1">Update your account password</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <i className="fas fa-key mr-2 text-indigo-500"></i>
                Password Security
              </h3>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    <p className="text-green-700">{success}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Password Tips */}
                  <div className="bg-indigo-50 p-4 rounded-lg text-sm">
                    <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
                      <i className="fas fa-shield-alt mr-2"></i>
                      Password Security Tips
                    </h4>
                    <ul className="text-indigo-700 space-y-1 ml-6 list-disc">
                      <li>Use at least 8 characters</li>
                      <li>Include uppercase and lowercase letters</li>
                      <li>Add numbers and special characters</li>
                      <li>Avoid using personal information</li>
                    </ul>
                  </div>
                
                  {/* Current Password */}
                  <div>
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        id="oldPassword"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your current password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <i className={`fas ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                
                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter new password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    
                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${passwordStrength.color}`} 
                            style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-xs font-medium`}>
                            Strength: {passwordStrength.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {newPassword.length} characters
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                
                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                          confirmPassword && newPassword !== confirmPassword
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:border-indigo-500'
                        }`}
                        placeholder="Confirm your new password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        Passwords don't match
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className={`w-full py-3 px-4 flex justify-center items-center rounded-lg text-white font-medium transition-all duration-200 ${
                        loading 
                          ? 'bg-indigo-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-lock mr-2"></i>
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => navigate('/dashboard')}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Cancel and return to Dashboard
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
