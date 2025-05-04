/**
 * Date utility functions for the application
 */

/**
 * Formats a date for display
 * @param {string|Date} dateString - The date to format
 * @param {Object} options - Format options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return new Date(dateString).toLocaleDateString(undefined, mergedOptions);
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
};

/**
 * Formats a time for display
 * @param {string|Date} dateString - The date/time to format
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting time:', e);
    return '';
  }
};

/**
 * Formats a date for datetime-local input field
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string in YYYY-MM-DDThh:mm format
 */
export const formatDateTimeForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    console.error('Error formatting date for input:', e);
    return '';
  }
};

/**
 * Formats a date for date input field
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error('Error formatting date for input:', e);
    return '';
  }
};

/**
 * Converts a date string or object to ISO format for API
 * @param {string|Date} dateInput - The date to convert
 * @returns {string|null} ISO date string or null if invalid
 */
export const toISOString = (dateInput) => {
  if (!dateInput) return null;
  
  try {
    const date = new Date(dateInput);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date for ISO conversion:', dateInput);
      return null;
    }
    
    return date.toISOString();
  } catch (e) {
    console.error('Error converting to ISO string:', e);
    return null;
  }
};

/**
 * Calculates and formats time left until a target date
 * @param {string|Date} targetDate - The target date
 * @returns {Object} Object with text and className properties
 */
export const getTimeLeft = (targetDate) => {
  if (!targetDate) return { text: 'N/A', className: 'text-gray-500' };
  
  try {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;
    
    // If date is in the past
    if (diff < 0) return { text: 'Closed', className: 'text-red-600' };
    
    // Calculate remaining time
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let text = '';
    
    if (days > 0) {
      text = `${days}d ${hours}h left`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m left`;
    } else {
      text = `${minutes}m left`;
    }
    
    // Change color based on urgency
    let className = 'text-green-600';
    if (days === 0 && hours < 12) {
      className = 'text-orange-600';
    }
    if (days === 0 && hours < 3) {
      className = 'text-red-600 font-semibold';
    }
    
    return { text, className };
  } catch (e) {
    console.error('Error calculating time left:', e);
    return { text: 'Error', className: 'text-red-600' };
  }
};

/**
 * Returns the registration status text and class
 * @param {Object} presentation - The presentation object
 * @returns {Object} Object with status text and className
 */
export const getRegistrationStatus = (presentation) => {
  if (!presentation?.registrationPeriod) {
    return { text: 'Unknown', className: 'text-gray-500' };
  }
  
  const now = new Date();
  const startDate = new Date(presentation.registrationPeriod.start);
  const endDate = new Date(presentation.registrationPeriod.end);
  
  if (now < startDate) {
    // Registration not started yet
    return {
      text: `Opens ${formatDate(startDate, { month: 'short', day: 'numeric' })}`,
      className: 'text-blue-600'
    };
  } else if (now <= endDate) {
    // Registration is open - show time left
    return getTimeLeft(endDate);
  } else {
    // Registration is closed
    return { text: 'Registration Closed', className: 'text-red-600' };
  }
};
