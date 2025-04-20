import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { submitFeedback } from '../services/feedbackService';

const Feedback = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    message: '',
    rating: 0,
    isAnonymous: false,
    contactEmail: '',
    contactPhone: ''
  });
  const [errors, setErrors] = useState({});

  // Initialize with user data if available
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        contactEmail: currentUser.email || '',
        contactPhone: currentUser.mobileNumber || ''
      }));
    }
  }, [currentUser]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) newErrors.message = 'Message is required';
    if (formData.message && formData.message.length < 10) newErrors.message = 'Message must be at least 10 characters';
    if (formData.rating === 0) newErrors.rating = 'Please provide a rating';
    
    // Only validate contact info if not anonymous
    if (!formData.isAnonymous) {
      if (!formData.contactEmail && !formData.contactPhone) {
        newErrors.contact = 'Please provide at least one contact method';
      } else if (formData.contactEmail && !/^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Please enter a valid email address';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear related error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleRatingChange = (newRating) => {
    setFormData({
      ...formData,
      rating: newRating
    });
    if (errors.rating) {
      setErrors({
        ...errors,
        rating: ''
      });
    }
  };

  const handleFileUpload = (e) => {
    const MAX_FILES = 3;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'image/gif'];
    
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (files.length + attachments.length > MAX_FILES) {
      toast.warning(`You can only upload a maximum of ${MAX_FILES} files`);
      return;
    }
    
    // Validate each file
    const invalidFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds the maximum size (5MB)`);
        return true;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`File ${file.name} is not an accepted file type`);
        return true;
      }
      return false;
    });
    
    // Add valid files to state
    if (invalidFiles.length < files.length) {
      const validFiles = files.filter(file => !invalidFiles.includes(file));
      setAttachments([...attachments, ...validFiles]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Starting feedback submission...");
      
      // Create FormData object for mixed content (files + text)
      const formDataToSubmit = new FormData();
      
      // Add text fields
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('subject', formData.subject);
      formDataToSubmit.append('description', formData.message);
      formDataToSubmit.append('rating', formData.rating.toString());
      // Explicitly convert boolean to string 'true' or 'false' for proper server handling
      formDataToSubmit.append('isAnonymous', formData.isAnonymous.toString());
      
      // Only add contact info if not anonymous
      if (!formData.isAnonymous) {
        if (formData.contactEmail) formDataToSubmit.append('contactEmail', formData.contactEmail);
        if (formData.contactPhone) formDataToSubmit.append('contactPhone', formData.contactPhone);
      }
      
      // Add attachments if any
      attachments.forEach((file) => {
        formDataToSubmit.append('attachments', file);
      });
      
      // Debug logging
      console.log('Form data to be sent:');
      for (let [key, value] of formDataToSubmit.entries()) {
        if (key !== 'attachments') { // Don't log file data - too verbose
          console.log(`${key}: ${value}`);
        } else {
          console.log(`${key}: [File object]`);
        }
      }
      
      // Submit feedback using the service
      await submitFeedback(formDataToSubmit);
      
      console.log('Feedback submission successful!');
      
      // Show success state
      setShowSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          category: '',
          subject: '',
          message: '',
          rating: 0,
          isAnonymous: false,
          contactEmail: currentUser?.email || '',
          contactPhone: currentUser?.mobileNumber || ''
        });
        setAttachments([]);
        setShowSuccess(false);
        navigate('/dashboard');
      }, 5000);
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      
      let errorMessage = error.message || "Failed to submit feedback. Please try again.";
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (showSuccess) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 py-20 px-4"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-8">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank You for Your Feedback!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Your feedback has been submitted successfully and will help us improve our services.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-10 md:py-20 px-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-8 px-8 md:px-12">
            <h1 className="text-3xl font-bold text-white">Feedback & Suggestions</h1>
            <p className="text-indigo-100 mt-2">
              We value your input to help us improve our university services
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            {/* Category */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
                Feedback Category*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                <option value="app">App Functionality</option>
                <option value="academic">Academic Services</option>
                <option value="hostel">Hostel & Accommodation</option>
                <option value="faculty">Faculty & Staff</option>
                <option value="events">Events & Activities</option>
                <option value="facilities">Campus Facilities</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>
            
            {/* Subject */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="subject">
                Subject*
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief title for your feedback"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
              )}
            </div>
            
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Rate Your Experience*
              </label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="text-3xl focus:outline-none focus:text-indigo-500 transition-colors mr-1"
                  >
                    <span className={star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  </button>
                ))}
                <span className="ml-3 text-gray-600">
                  {formData.rating > 0 ? (
                    <span>
                      {formData.rating}/5 - {' '}
                      {formData.rating === 1 ? 'Poor' : 
                       formData.rating === 2 ? 'Fair' : 
                       formData.rating === 3 ? 'Good' : 
                       formData.rating === 4 ? 'Very Good' : 'Excellent'}
                    </span>
                  ) : 'Select a rating'}
                </span>
              </div>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
              )}
            </div>
            
            {/* Message */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="message">
                Your Feedback*
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please share your experience, suggestions, or concerns in detail..."
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.message.length} characters (min. 10)
              </div>
            </div>
            
            {/* Anonymous option */}
            <div className="mb-6 flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isAnonymous"
                  name="isAnonymous"
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isAnonymous" className="font-medium text-gray-700">
                  Submit Anonymously
                </label>
                <p className="text-gray-500">
                  Your identity won't be attached to this feedback (no follow-up possible)
                </p>
              </div>
            </div>
            
            {/* Contact Information */}
            {!formData.isAnonymous && (
              <div className="mb-6 bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">Contact Information for Follow-up</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="contactEmail">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="yourname@email.com"
                    />
                    {errors.contactEmail && (
                      <p className="mt-1 text-sm text-red-500">{errors.contactEmail}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="contactPhone">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>
                </div>
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-500">{errors.contact}</p>
                )}
              </div>
            )}
            
            {/* Attachments */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Attachments (Optional, Max 3 files)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/png,image/jpeg,image/gif,application/pdf"
                        multiple
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 5MB</p>
                </div>
              </div>
              
              {/* File list */}
              {attachments.length > 0 && (
                <ul className="mt-3 divide-y divide-gray-100 rounded-md border border-gray-200">
                  {attachments.map((file, index) => (
                    <li key={index} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                      <div className="flex items-center flex-1 w-0">
                        <svg
                          className="h-5 w-5 flex-shrink-0 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Tips section */}
            <div className="mb-8">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Tips for effective feedback:</strong> Be specific about your experience, suggest
                      improvements, and provide context that can help us address your concerns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium rounded-lg transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Feedback;
