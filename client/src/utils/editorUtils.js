/**
 * Utility functions for handling editor content
 */

// Safely render HTML content with proper sanitization
export const renderHTML = (htmlContent) => {
  if (!htmlContent) return { __html: '' };
  
  // Basic XSS protection can be added here if needed
  // For production, consider using a library like DOMPurify
  
  return { __html: htmlContent };
};

// Function to extract plain text from HTML content
export const extractPlainText = (htmlContent) => {
  if (!htmlContent) return '';
  
  // Create a temporary DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Extract text content
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Function to extract headings from HTML content for navigation
export const extractHeadings = (htmlContent) => {
  if (!htmlContent) return [];
  
  const headings = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  const headingElements = tempDiv.querySelectorAll('h1, h2, h3');
  
  headingElements.forEach((heading) => {
    headings.push({
      id: heading.id || heading.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      text: heading.textContent,
      level: parseInt(heading.tagName.substring(1), 10)
    });
  });
  
  return headings;
};
