import DOMPurify from 'dompurify';

export const renderHTML = (htmlContent) => {
  if (!htmlContent) return { __html: '' };
  
  // Add preservation for Quill specific classes
  DOMPurify.addHook('beforeSanitizeAttributes', function(node) {
    // Check if the node is an Element node before trying to access attributes
    if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('class')) {
      const classAttr = node.getAttribute('class');
      if (classAttr && (classAttr.includes('ql-') || classAttr.includes('quill'))) {
        node.setAttribute('data-keep-class', classAttr);
      }
    }
  });
  
  DOMPurify.addHook('afterSanitizeAttributes', function(node) {
    // Check if the node is an Element node before trying to access attributes
    if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('data-keep-class')) {
      node.setAttribute('class', node.getAttribute('data-keep-class'));
      node.removeAttribute('data-keep-class');
    }
  });
  
  // Use DOMPurify to sanitize HTML content and prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(htmlContent, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 
      'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'name', 'target', 'src', 'alt', 'class', 'id', 'style', 'rel',
      'data-keep-class'
    ],
    ADD_ATTR: ['target'],  // Allow target="_blank" for links
  });
  
  return { __html: sanitizedContent };
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
