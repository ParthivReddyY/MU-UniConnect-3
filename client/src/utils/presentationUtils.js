/**
 * Utilities for handling presentation data
 */

/**
 * Ensures year values are converted to numbers in target audience
 * @param {Object} targetAudience - The target audience object to process
 * @returns {Object} Processed target audience object with year as numbers
 */
export const processTargetAudience = (targetAudience) => {
  if (!targetAudience) return { year: [], school: [], department: [] };
  
  return {
    year: Array.isArray(targetAudience.year)
      ? targetAudience.year.map(y => Number(y)).filter(y => !isNaN(y))
      : [],
    school: Array.isArray(targetAudience.school) ? targetAudience.school : [],
    department: Array.isArray(targetAudience.department) ? targetAudience.department : []
  };
};

/**
 * Formats presentation data for display
 * @param {Object} presentation - Raw presentation data from API
 * @returns {Object} Formatted presentation data
 */
export const formatPresentationData = (presentation) => {
  if (!presentation) return null;
  
  return {
    ...presentation,
    targetAudience: processTargetAudience(presentation.targetAudience),
    registrationPeriod: {
      start: presentation.registrationPeriod?.start ? new Date(presentation.registrationPeriod.start) : null,
      end: presentation.registrationPeriod?.end ? new Date(presentation.registrationPeriod.end) : null
    },
    presentationPeriod: {
      start: presentation.presentationPeriod?.start ? new Date(presentation.presentationPeriod.start) : null,
      end: presentation.presentationPeriod?.end ? new Date(presentation.presentationPeriod.end) : null
    }
  };
};

/**
 * Checks if a year value is included in the target audience
 * Handles both string and number comparisons
 * 
 * @param {Array} yearArray - Array of year values
 * @param {number|string} yearValue - Year value to check
 * @returns {boolean} True if year is included
 */
export const isYearIncluded = (yearArray, yearValue) => {
  if (!Array.isArray(yearArray)) return false;
  
  const numValue = Number(yearValue);
  return yearArray.some(y => Number(y) === numValue);
};
