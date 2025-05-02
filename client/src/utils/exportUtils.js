/**
 * Utility functions for exporting data to various formats
 */

/**
 * Format date for export
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateForExport = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

/**
 * Format time for export
 * @param {Date|string} date - The date with time to format
 * @returns {string} Formatted time string
 */
export const formatTimeForExport = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Calculate grade letter based on score
 * @param {number} score - Numeric score (0-100)
 * @returns {string} Letter grade
 */
export const calculateGradeLetter = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

/**
 * Generate a friendly filename based on title and time
 * @param {string} prefix - Prefix for the filename
 * @param {string} format - File extension
 * @returns {string} Formatted filename
 */
export const generateFilename = (prefix, format = 'csv') => {
  const date = new Date().toISOString().substring(0, 10);
  const sanitizedPrefix = prefix.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${sanitizedPrefix}_${date}.${format}`;
};

/**
 * Converts data to a CSV string
 * @param {Array} data - Array of objects to convert
 * @returns {string} CSV formatted string
 */
export const convertToCSVString = (data) => {
  if (!data || !data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap with quotes if contains comma
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

/**
 * Trigger a CSV download
 * @param {Array} data - Data to convert to CSV
 * @param {string} filename - Filename for the download
 */
export const downloadCSV = (data, filename) => {
  const csvString = convertToCSVString(data);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportUtils = {
  formatDateForExport,
  formatTimeForExport,
  calculateGradeLetter,
  generateFilename,
  convertToCSVString,
  downloadCSV
};

export default exportUtils;
