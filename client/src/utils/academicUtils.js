/**
 * Academic utility functions for calculating and formatting academic information
 */

/**
 * Calculate academic progress based on year of joining
 * @param {string} yearOfJoining - The year when the student joined the university
 * @returns {object} - Academic progress information
 */
export const calculateAcademicProgress = (yearOfJoining) => {
  // Basic validation
  const validation = validateYearOfJoining(yearOfJoining);
  if (!validation.isValid) {
    return { isValidCalculation: false };
  }
  
  // Convert yearOfJoining to number if it's a string
  const joinYear = parseInt(yearOfJoining, 10);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  // Calculate the number of completed academic years since joining
  let academicYear;
  
  // If current month is January-June (0-5), we're in the academic year that started in the previous calendar year
  // If current month is July-December (6-11), we're in the academic year that started in the current calendar year
  
  // For someone who joined in 2022:
  // - If it's July-Dec 2022: 1st year, 1st semester
  // - If it's Jan-June 2023: 1st year, 2nd semester
  // - If it's July-Dec 2023: 2nd year, 1st semester
  // - If it's Jan-June 2024: 2nd year, 2nd semester
  // - If it's July-Dec 2024: 3rd year, 1st semester
  
  const yearDifference = currentYear - joinYear;
  
  if (currentMonth <= 5) {
    // For January to June (2nd semester of the academic year)
    academicYear = yearDifference;
  } else {
    // For July to December (1st semester of the academic year)
    academicYear = yearDifference + 1;
  }
  
  // Determine which semester
  // First semester: July-Dec (months 6-11)
  // Second semester: Jan-June (months 0-5)
  const currentSemester = (currentMonth <= 5) ? 2 : 1;
  
  // Ensure academicYear is at least 1
  academicYear = Math.max(academicYear, 1);
  // Cap at 5th year for UI purposes
  academicYear = Math.min(academicYear, 5);
  
  // Year suffix
  let yearSuffix = 'th';
  if (academicYear === 1) yearSuffix = 'st';
  else if (academicYear === 2) yearSuffix = 'nd';
  else if (academicYear === 3) yearSuffix = 'rd';
  
  // Semester suffix
  let semesterSuffix = 'st';
  if (currentSemester === 2) semesterSuffix = 'nd';
  
  // Calculate progress percentage (assuming 8 semesters total for a 4-year program)
  const completedSemesters = (academicYear - 1) * 2 + (currentSemester - 1);
  const totalSemesters = 8; // Typical 4-year undergraduate program
  const progressPercentage = Math.min(100, Math.round((completedSemesters / totalSemesters) * 100));
  
  return {
    isValidCalculation: true,
    year: academicYear,
    yearSuffix,
    currentSemester,
    semesterSuffix,
    progressPercentage,
    completedSemesters,
    totalSemesters
  };
};

/**
 * Format academic year for display
 * @param {string} yearStr - Year as string
 * @returns {string} - Formatted year string
 */
export const formatAcademicYear = (yearStr) => {
  if (!yearStr) return 'Not available';
  
  const year = parseInt(yearStr, 10);
  if (isNaN(year)) return 'Invalid year';
  
  return `${year}-${year + 1}`;
};

/**
 * Get current semester dates
 * @param {string} yearOfJoining - Year of joining
 * @returns {object} - Current semester information
 */
export const getCurrentSemesterDates = (yearOfJoining) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
  const currentYear = currentDate.getFullYear();
  
  // Determine current semester
  // First semester: July - December
  // Second semester: January - June
  let semesterStart, semesterEnd;
  
  if (currentMonth >= 6) { // July - December: First semester
    semesterStart = new Date(currentYear, 6, 1); // July 1st
    semesterEnd = new Date(currentYear, 11, 31); // December 31st
    return { semesterName: 'First Semester', start: semesterStart, end: semesterEnd };
  } else { // January - June: Second semester
    semesterStart = new Date(currentYear, 0, 1); // January 1st
    semesterEnd = new Date(currentYear, 5, 30); // June 30th
    return { semesterName: 'Second Semester', start: semesterStart, end: semesterEnd };
  }
};

/**
 * Validate year of joining
 * @param {string|number} year - Year to validate
 * @returns {object} - Validation result with isValid flag and message
 */
export const validateYearOfJoining = (year) => {
  if (!year) return { isValid: false, message: 'Year is required' };
  
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
  
  if (isNaN(yearNum)) {
    return { isValid: false, message: 'Not a valid number' };
  }
  
  const currentYear = new Date().getFullYear();
  
  if (yearNum < 1990 || yearNum > currentYear) {
    return { 
      isValid: false, 
      message: `Year should be between 1990 and ${currentYear}` 
    };
  }
  
  return { isValid: true, message: 'Valid year' };
};
