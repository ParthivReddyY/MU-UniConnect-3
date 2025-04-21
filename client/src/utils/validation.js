/**
 * Validation utilities for forms
 */

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
 * @returns {boolean} - True if valid
 */
export const isValidYear = (year) => {
  if (!year) return false;
  const numYear = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  return !isNaN(numYear) && numYear >= 1990 && numYear <= currentYear;
};

/**
 * Calculate profile completion percentage
 * @param {Object} userData - User data to evaluate
 * @returns {number} - Percentage complete (0-100)
 */
export const calculateProfileCompletion = (userData) => {
  if (!userData) return 0;
  
  let completed = 0;
  let total = 3; // Base fields: name, email, bio
  
  if (userData.name) completed++;
  if (userData.bio) completed++;
  completed++; // Email is always provided
  
  // Role-specific fields
  if (userData.role === 'student') {
    total += 2; // studentId and yearOfJoining
    if (userData.studentId) completed++;
    if (userData.yearOfJoining) completed++;
  } else if (userData.role === 'faculty') {
    total++; // department
    if (userData.department) completed++;
  } else if (userData.role === 'clubHead') {
    total++; // clubManaging
    if (userData.clubManaging) completed++;
  }
  
  // Mobile number
  total++;
  if (userData.mobileNumber) completed++;
  
  // Social links
  if (userData.socialLinks) {
    Object.keys(userData.socialLinks).forEach(platform => {
      total++;
      if (userData.socialLinks[platform]) completed++;
    });
  }
  
  // Profile image
  total++;
  if (userData.profileImage) completed++;
  
  return Math.round((completed / total) * 100);
};
