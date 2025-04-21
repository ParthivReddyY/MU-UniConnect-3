import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';
import ImageUploader from '../components/ImageUploader';
import { calculateAcademicProgress, formatAcademicYear } from '../utils/academicUtils';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, isFaculty, isClubHead } = useAuth();
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    clubManaging: '',
    bio: '',
    mobileNumber: '',
    yearOfJoining: '', // Added yearOfJoining to formData
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: ''
    }
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [imageData, setImageData] = useState(null);
  const [editMode, setEditMode] = useState({
    name: false,
    bio: false,
    mobileNumber: false,
    socialLinks: false,
    studentId: false,
    yearOfJoining: false  // Add edit mode for yearOfJoining
  });
  
  const bioRef = useRef(null);
  
  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format semester information
  const formatSemesterInfo = (academicInfo) => {
    if (!academicInfo || !academicInfo.isValidCalculation) return 'Not available';
    
    return `${academicInfo.year}${academicInfo.yearSuffix} Year, ${academicInfo.currentSemester}${academicInfo.semesterSuffix} Semester`;
  };

  // Add state for academic information
  const [academicInfo, setAcademicInfo] = useState(null);
  
  // Load user data
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Populate form with current user data
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      studentId: currentUser.studentId || '',
      department: currentUser.department || '',
      clubManaging: currentUser.clubManaging || '',
      bio: currentUser.bio || '',
      mobileNumber: currentUser.mobileNumber || '',
      yearOfJoining: currentUser.yearOfJoining || '',
      socialLinks: {
        linkedin: currentUser.socialLinks?.linkedin || '',
        twitter: currentUser.socialLinks?.twitter || '',
        github: currentUser.socialLinks?.github || ''
      }
    });
    
    // Calculate academic progress if yearOfJoining exists
    if (currentUser.yearOfJoining) {
      const academicProgress = calculateAcademicProgress(currentUser.yearOfJoining);
      setAcademicInfo(academicProgress);
    }
    
    setIsLoading(false);
  }, [currentUser, navigate]);
  
  // Toggle edit mode for student ID specifically for students
  const toggleStudentIdEdit = () => {
    if (currentUser.role === 'student') {
      setEditMode(prev => ({
        ...prev,
        studentId: !prev.studentId
      }));
    }
  };

  // Toggle edit mode for year of joining specifically for students
  const toggleYearOfJoiningEdit = () => {
    if (currentUser.role === 'student') {
      setEditMode(prev => ({
        ...prev,
        yearOfJoining: !prev.yearOfJoining
      }));
    }
  };

  // Auto-focus on editing fields
  useEffect(() => {
    if (editMode.bio && bioRef.current) {
      bioRef.current.focus();
    }
  }, [editMode.bio]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle image change
  const handleImageChange = (data) => {
    setImageData(data);
    handleSave(); // Auto-save when image changes
  };
  
  // Toggle edit mode for a field
  const toggleEditMode = (field) => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Save a specific field
  const saveField = async (field) => {
    toggleEditMode(field);
    await handleSave();
  };
  
  // Handle form submission / save changes
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Prepare data for submission
      const dataToSubmit = { ...formData };
      
      // Handle image upload if changed
      if (imageData) {
        if (imageData.type === 'url' && imageData.url) {
          dataToSubmit.profileImage = imageData.url;
        } else if (imageData.type === 'file' && imageData.dataUrl) {
          dataToSubmit.profileImage = imageData.dataUrl;
        }
      }
      
      // Make API request to update profile
      const response = await api.put('/api/auth/update-profile', dataToSubmit);
      
      if (response.data.success) {
        showNotification('success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('error', error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Show notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };
  
  // Generate profile completion percentage
  const getProfileCompletion = () => {
    let completed = 0;
    let total = 3; // Base fields: name, email, bio
    
    if (formData.name) completed++;
    if (formData.bio) completed++;
    completed++; // Email is always provided
    
    // Role-specific fields
    if (formData.studentId !== undefined) {
      total++;
      if (formData.studentId) completed++;
    }
    
    if (formData.department !== undefined) {
      total++;
      if (formData.department) completed++;
    }
    
    if (formData.yearOfJoining !== undefined) {
      total++;
      if (formData.yearOfJoining) completed++;
    }
    
    if (formData.clubManaging !== undefined) {
      total++;
      if (formData.clubManaging) completed++;
    }
    
    // Mobile number
    total++;
    if (formData.mobileNumber) completed++;
    
    // Social links
    Object.keys(formData.socialLinks).forEach(platform => {
      total++;
      if (formData.socialLinks[platform]) completed++;
    });
    
    // Profile image
    total++;
    if (currentUser.profileImage || imageData) completed++;
    
    return Math.round((completed / total) * 100);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  const completionPercentage = getProfileCompletion();
  
  return (
    <div className="bg-gray-50 min-h-screen w-full">
      {/* Large banner header with cover photo */}
      <div className="h-48 md:h-64 lg:h-80 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Improved Back button */}
        <div className="absolute top-0 left-0 p-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-white/30"
            aria-label="Back to dashboard"
          >
            <i className="fas fa-arrow-left transition-transform group-hover:-translate-x-1"></i>
            <span className="font-medium">Dashboard</span>
          </button>
        </div>
        
        {/* Profile header content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-4 text-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:items-end justify-between">
            <div className="flex flex-col sm:flex-row items-center">
              {/* Profile image */}
              <div className="relative mb-3 sm:mb-0 sm:mr-6">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                  <div className="relative h-full w-full group">
                    {currentUser.profileImage || imageData ? (
                      <img 
                        src={imageData?.dataUrl || currentUser.profileImage} 
                        alt={formData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300 bg-gray-100">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                      <ImageUploader 
                        initialImage={currentUser.profileImage} 
                        onImageChange={handleImageChange}
                        defaultImage="/img/default-profile.png"
                        buttonStyle="bg-transparent text-white hover:bg-transparent"
                      >
                        <i className="fas fa-camera text-2xl"></i>
                      </ImageUploader>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Name and role */}
              <div className="text-center sm:text-left">
                <div className="group relative inline-flex items-center">
                  {editMode.name ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="text-3xl font-bold text-center sm:text-left border-b-2 border-white bg-transparent outline-none px-2 py-1 text-white"
                        autoFocus
                      />
                      <button 
                        onClick={() => saveField('name')} 
                        className="ml-2 text-green-400 hover:text-green-300"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    </div>
                  ) : (
                    <h1 className="text-3xl md:text-4xl font-bold">
                      {formData.name}
                      <button 
                        onClick={() => toggleEditMode('name')} 
                        className="ml-2 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                    </h1>
                  )}
                </div>
                <div className="flex flex-wrap items-center mt-1 justify-center sm:justify-start">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                    {isAdmin() ? "Administrator" : 
                     isFaculty() ? "Faculty Member" : 
                     isClubHead() ? `Club Head${formData.clubManaging ? ` of ${formData.clubManaging}` : ''}` : "Student"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => navigate('/change-password')}
                className="bg-white/20 hover:bg-white/30 text-white py-2.5 px-4 rounded-lg text-sm backdrop-blur-sm transition-colors flex items-center"
              >
                <i className="fas fa-key mr-2"></i>
                Change Password
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white/20 hover:bg-white/30 text-white py-2.5 px-4 rounded-lg text-sm backdrop-blur-sm transition-colors flex items-center"
              >
                <i className="fas fa-tachometer-alt mr-2"></i>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Profile Completion Indicator */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-700">Profile Completion</h3>
                <span className="text-sm font-medium text-indigo-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completionPercentage < 100 
                  ? "Complete your profile to help others know you better."
                  : "Your profile is complete! Thanks for providing all your information."}
              </p>
            </div>
          </div>
          
          {/* Notification */}
          {notification.show && (
            <div className={`mb-6 p-4 rounded-lg flex items-start ${
              notification.type === 'success' 
                ? 'bg-green-50 border border-green-100' 
                : 'bg-red-50 border border-red-100'
            }`}>
              <div className={`flex-shrink-0 w-5 h-5 ${
                notification.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button 
                onClick={() => setNotification({ ...notification, show: false })}
                className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          
          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar */}
            <div className="lg:col-span-1">
              {/* Contact Info Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-address-card text-indigo-500 mr-2"></i>
                    Contact Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {/* Email */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Email Address</label>
                    <div className="flex items-center">
                      <i className="fas fa-envelope text-gray-400 mr-2"></i>
                      <span className="text-gray-800">{formData.email}</span>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Phone Number</label>
                    <div className="flex items-center group">
                      <i className="fas fa-phone text-gray-400 mr-2"></i>
                      {editMode.mobileNumber ? (
                        <div className="flex items-center flex-1">
                          <input
                            type="tel"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            className="text-sm border-b border-indigo-500 bg-transparent outline-none px-1 py-1 flex-1"
                            placeholder="Enter phone number"
                            autoFocus
                          />
                          <button 
                            onClick={() => saveField('mobileNumber')} 
                            className="ml-2 text-green-600 hover:text-green-700"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-gray-800">
                            {formData.mobileNumber || <span className="text-gray-400 italic">Not provided</span>}
                          </span>
                          <button 
                            onClick={() => toggleEditMode('mobileNumber')} 
                            className="ml-2 text-gray-400 hover:text-indigo-600"
                          >
                            <i className="fas fa-pencil-alt text-xs"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Social Links */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs text-gray-500">Social Profiles</label>
                      <button 
                        onClick={() => toggleEditMode('socialLinks')} 
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {editMode.socialLinks ? "Save" : "Edit"}
                      </button>
                    </div>
                    
                    {editMode.socialLinks ? (
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center text-sm text-gray-700 mb-1">
                            <i className="fab fa-linkedin text-blue-600 mr-2"></i>
                            <span>LinkedIn</span>
                          </div>
                          <input
                            type="url"
                            name="socialLinks.linkedin"
                            value={formData.socialLinks.linkedin}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://www.linkedin.com/school/mahindra-unversity"
                          />
                        </div>
                        <div>
                          <div className="flex items-center text-sm text-gray-700 mb-1">
                            <i className="fab fa-twitter text-blue-400 mr-2"></i>
                            <span>Twitter</span>
                          </div>
                          <input
                            type="url"
                            name="socialLinks.twitter"
                            value={formData.socialLinks.twitter}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://x.com/MahindraUni"
                          />
                        </div>
                        <div>
                          <div className="flex items-center text-sm text-gray-700 mb-1">
                            <i className="fab fa-github text-gray-800 mr-2"></i>
                            <span>GitHub</span>
                          </div>
                          <input
                            type="url"
                            name="socialLinks.github"
                            value={formData.socialLinks.github}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://github.com/username"
                          />
                        </div>
                        <button
                          onClick={() => saveField('socialLinks')}
                          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-md text-sm font-medium transition-colors"
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Social Links'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center space-x-3">
                        {/* LinkedIn */}
                        <a 
                          href={formData.socialLinks.linkedin || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => !formData.socialLinks.linkedin && e.preventDefault()}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                            ${formData.socialLinks.linkedin 
                              ? "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white" 
                              : "bg-gray-100 text-gray-400 cursor-default"}`}
                          title={formData.socialLinks.linkedin ? "LinkedIn Profile" : "LinkedIn not linked"}
                        >
                          <i className="fab fa-linkedin-in"></i>
                        </a>
                        
                        {/* Twitter */}
                        <a 
                          href={formData.socialLinks.twitter || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => !formData.socialLinks.twitter && e.preventDefault()}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                            ${formData.socialLinks.twitter 
                              ? "bg-cyan-50 text-cyan-500 hover:bg-cyan-500 hover:text-white" 
                              : "bg-gray-100 text-gray-400 cursor-default"}`}
                          title={formData.socialLinks.twitter ? "Twitter Profile" : "Twitter not linked"}
                        >
                          <i className="fab fa-twitter"></i>
                        </a>
                        
                        {/* GitHub */}
                        <a 
                          href={formData.socialLinks.github || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => !formData.socialLinks.github && e.preventDefault()}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                            ${formData.socialLinks.github 
                              ? "bg-gray-800 text-white hover:bg-black hover:text-white" 
                              : "bg-gray-100 text-gray-400 cursor-default"}`}
                          title={formData.socialLinks.github ? "GitHub Profile" : "GitHub not linked"}
                        >
                          <i className="fab fa-github"></i>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                
              {/* Member Information Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                  <i className="fas fa-id-card text-indigo-500 mr-2"></i>
                  <h3 className="font-semibold text-gray-800">Member Information</h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Member Since</span>
                    <span className="text-gray-800 font-medium text-sm">{formatDate(currentUser.createdAt)}</span>
                  </div>
                  
                  {formData.studentId ? (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Student ID</span>
                      {editMode.studentId ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleInputChange}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                            autoFocus
                          />
                          <button 
                            onClick={() => saveField('studentId')}
                            className="ml-2 text-green-600 hover:text-green-700"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-gray-800 font-medium text-sm">{formData.studentId}</span>
                          {currentUser.role === 'student' && (
                            <button 
                              onClick={toggleStudentIdEdit}
                              className="ml-2 text-gray-400 hover:text-indigo-600 text-xs"
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : currentUser.role === 'student' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Student ID</span>
                      {editMode.studentId ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleInputChange}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                            autoFocus
                            placeholder="Enter ID"
                          />
                          <button 
                            onClick={() => saveField('studentId')}
                            className="ml-2 text-green-600 hover:text-green-700"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-red-500 text-xs italic">Not set</span>
                          <button 
                            onClick={toggleStudentIdEdit}
                            className="ml-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded text-xs"
                          >
                            Add ID
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Academic Year information with edit option */}
                  {currentUser.role === 'student' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Joining Year</span>
                      {editMode.yearOfJoining ? (
                        <div className="flex items-center">
                          <select
                            name="yearOfJoining"
                            value={formData.yearOfJoining}
                            onChange={handleInputChange}
                            className="w-28 px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="">Select Year</option>
                            {/* Generate options for the last 10 years */}
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = new Date().getFullYear() - i;
                              return (
                                <option key={year} value={year.toString()}>
                                  {year}
                                </option>
                              );
                            })}
                          </select>
                          <button 
                            onClick={() => saveField('yearOfJoining')}
                            className="ml-2 text-green-600 hover:text-green-700"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {formData.yearOfJoining ? (
                            <span className="text-gray-800 font-medium text-sm">
                              {formatAcademicYear(formData.yearOfJoining)}
                            </span>
                          ) : (
                            <span className="text-red-500 text-xs italic">Not set</span>
                          )}
                          <button 
                            onClick={toggleYearOfJoiningEdit}
                            className="ml-2 text-gray-400 hover:text-indigo-600 text-xs"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Academic Status with more detailed information */}
                  {academicInfo && academicInfo.isValidCalculation && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Academic Status</span>
                        <span className="text-gray-800 font-medium text-sm">
                          {formatSemesterInfo(academicInfo)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Program Progress</span>
                        <span className="text-gray-800 font-medium text-sm">
                          {academicInfo.progressPercentage}% Complete
                        </span>
                      </div>
                    </>
                  )}
                  
                  {formData.department && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Department</span>
                      <span className="text-gray-800 font-medium text-sm">{formData.department}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Last Login</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'First login'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Bio and Other Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Bio Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-user mr-2 text-indigo-500"></i>
                    About Me
                  </h3>
                  {!editMode.bio && (
                    <button 
                      onClick={() => toggleEditMode('bio')} 
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit Bio
                    </button>
                  )}
                </div>
                <div className="p-6">
                  {editMode.bio ? (
                    <div className="space-y-3">
                      <textarea
                        ref={bioRef}
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px]"
                        placeholder="Tell us about yourself..."
                      ></textarea>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => toggleEditMode('bio')}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm transition-colors"
                        >
                          Cancel
                        <button
                          onClick={() => saveField('bio')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none text-gray-800">
                      {formData.bio ? (
                        <p className="whitespace-pre-line">{formData.bio}</p>
                      ) : (
                        <p className="text-gray-400 italic">No bio provided. Add information about yourself to help others know you better.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Role Specific Information */}
              {formData.clubManaging && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <i className="fas fa-users mr-2 text-indigo-500"></i>
                      Club Management
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                        <i className="fas fa-people-group text-xl"></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-800">{formData.clubManaging}</h4>
                        <p className="text-gray-500 mt-1">Club head privileges include creating events and managing members.</p>
                        <div className="mt-4">
                          <Link to="/club/profile" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
                            Go to Club Management <i className="fas fa-arrow-right ml-2"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isFaculty() && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <i className="fas fa-chalkboard-teacher mr-2 text-indigo-500"></i>
                      Faculty Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                        <i className="fas fa-building text-xl"></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-800">{formData.department}</h4>
                        <p className="text-gray-500 mt-1">Faculty members can manage courses, office hours, and student appointments.</p>
                        <div className="mt-4">
                          <Link to="/faculty/office-hours" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
                            Manage Office Hours <i className="fas fa-arrow-right ml-2"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Security Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-shield-alt mr-2 text-indigo-500"></i>
                    Account Security
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">Password</h4>
                      <p className="text-sm text-gray-500 mt-1">Last changed: {currentUser.lastPasswordChange ? formatDate(currentUser.lastPasswordChange) : 'Never'}</p>
                    </div>
                    <button
                      onClick={() => navigate('/change-password')}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center"
                    >
                      <i className="fas fa-key mr-2"></i>
                      Change Password
                    </button>
                  </div>
                  
                  <div className="mt-4 bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <div className="flex items-start">
                      <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5 mr-3"></i>
                      <div>
                        <h5 className="text-amber-800 font-medium">Security Reminder</h5>
                        <p className="text-sm text-amber-700 mt-1">
                          For your account's security, we recommend changing your password regularly and using a strong password with a mix of letters, numbers, and symbols.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;