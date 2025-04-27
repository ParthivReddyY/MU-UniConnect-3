/**
 * Validation utilities for forms
 */
import { getAcademicYears } from './academicDataUtils';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate that input is a Mahindra University email
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid MU email
 */
export const isMahindraEmail = (email) => {
  return String(email).toLowerCase().endsWith('@mahindrauniversity.edu.in');
};

/**
 * Validate student ID format
 * @param {string} id - Student ID to validate
 * @returns {boolean} - True if valid
 */
export const isValidStudentId = (id) => {
  // Typical format is like SE22UCSE000
  // Let's validate for something like this pattern
  const re = /^[A-Z]{2}\d{2}[A-Z]{2,4}\d{3}$/;
  return id && re.test(String(id));
};

/**
 * Validate year is in reasonable range
 * @param {string|number} year - Year to validate
 * @returns {object} - Result with isValid flag and message
 */
export const validateYear = (year) => {
  if (!year) return { isValid: false, message: 'Year is required' };
  
  const numYear = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  
  if (isNaN(numYear)) {
    return { isValid: false, message: 'Not a valid number' };
  }
  
  if (numYear < 1990 || numYear > currentYear) {
    return { 
      isValid: false, 
      message: `Year should be between 1990 and ${currentYear}` 
    };
  }
  
  return { isValid: true, message: 'Valid year' };
};

/**
 * Simple check if year is valid (for backward compatibility)
 * @param {string|number} year - Year to validate
 * @returns {boolean} - True if valid
 */
export const isValidYear = (year) => {
  return validateYear(year).isValid;
};

/**
 * Generate year options for selection dropdowns
 * @param {number} count - Number of years to generate (default 10)
 * @returns {string[]} - Array of year strings
 * @deprecated Use getAcademicYears from academicDataUtils instead
 */
export const generateYearOptions = (count = 10) => {
  console.warn('generateYearOptions is deprecated, use getAcademicYears from academicDataUtils instead');
  return getAcademicYears(count);
};

/**
 * Calculate profile completion percentage
 * @param {Object} userData - User data to evaluate
 * @returns {number} - Percentage complete (0-100)
 */
export const calculateProfileCompletion = (userData) => {
  if (!userData) return 0;
  
  // Define fields to check by user role
  const fields = {
    base: ['name', 'email', 'bio'],
    student: ['studentId', 'yearOfJoining'],
    faculty: ['department'],
    clubHead: ['clubManaging']
  };
  
  // Track completed fields and total fields
  let completed = 0;
  let total = fields.base.length;
  
  // Check base fields
  fields.base.forEach(field => {
    if (field === 'email' || userData[field]) completed++;
  });
  
  // Check role-specific fields
  if (userData.role === 'student') {
    fields.student.forEach(field => {
      total++;
      if (userData[field]) completed++;
    });
  } else if (userData.role === 'faculty') {
    fields.faculty.forEach(field => {
      total++;
      if (userData[field]) completed++;
    });
  } else if (userData.role === 'clubHead' || userData.role === 'clubs') {
    fields.clubHead.forEach(field => {
      total++;
      if (userData[field]) completed++;
    });
  }
  
  // Check mobile number
  total++;
  if (userData.mobileNumber) completed++;
  
  // Check social links
  if (userData.socialLinks) {
    Object.entries(userData.socialLinks).forEach(([platform, url]) => {
      total++;
      if (url) completed++;
    });
  }
  
  // Calculate percentage
  return Math.round((completed / Math.max(total, 1)) * 100);
};

/**
 * Validate user form data
 * @param {Object} formData - User form data to validate
 * @returns {Object} - Object with errors by field
 */
export const validateUserForm = (formData) => {
  const errors = {};
  
  // Required fields
  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Email format is invalid';
  }
  
  // Role-specific validations
  if (formData.role === 'student') {
    if (!formData.studentId?.trim()) {
      errors.studentId = 'Student ID is required';
    } else if (!isValidStudentId(formData.studentId)) {
      errors.studentId = 'Student ID format is invalid';
    }
    
    if (formData.yearOfJoining) {
      const yearValidation = validateYear(formData.yearOfJoining);
      if (!yearValidation.isValid) {
        errors.yearOfJoining = yearValidation.message;
      }
    }
  } else if (formData.role === 'faculty') {
    if (!formData.department?.trim()) {
      errors.department = 'Department is required';
    }
  } else if (formData.role === 'clubHead' || formData.role === 'clubs') {
    if (!formData.clubManaging?.trim()) {
      errors.clubManaging = 'Club name is required';
    }
  }
  
  // Validate mobile number if provided
  if (formData.mobileNumber && !/^[0-9]{10}$/.test(formData.mobileNumber)) {
    errors.mobileNumber = 'Mobile number must be 10 digits';
  }
  
  return errors;
};
