import React, { useState } from 'react';
import { submitFeedback } from '../api/feedbackApi';

const FeedbackForm = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    feedbackType: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      feedbackType: '',
      description: '',
    });
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.feedbackType || !formData.description) {
        throw new Error('Please fill out all required fields');
      }
      
      // Submit feedback
      const response = await submitFeedback(formData);
      setLoading(false);
      setSuccess(true);
      resetForm();
      
      // Show success message
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setLoading(false);
      // Extract error message
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Server error (404): Please try again or contact support.';
      
      setError(errorMessage);
      console.error('Error submitting feedback:', err);
      
      if (onError) {
        onError(err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="feedbackType">Feedback Type</label>
        <input
          type="text"
          id="feedbackType"
          name="feedbackType"
          value={formData.feedbackType}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Feedback submitted successfully!</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default FeedbackForm;