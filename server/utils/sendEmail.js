const axios = require('axios');

// Define Brevo template IDs
const TEMPLATES = {
  // Template for OTP verification - from URL: https://my.brevo.com/template/_ZLk6muEQma83k4dDiO4_jy25Z_cWuOL8D6j2YELPOCeTOu0iMEmGUSm
  OTP_VERIFICATION: 1, 
  
  // Template for welcome message - from URL: https://my.brevo.com/template/1LhcL8z8AAOok7cCzTL7_nHkWFnaEcwTV_0ZqM1j2WW2oXl06rfy3BiD
  WELCOME: 2,
  
  // Template for password reset
  PASSWORD_RESET: 3,
};

/**
 * Send email using Brevo API with templates
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string|number} options.templateId - Template ID or template key from TEMPLATES
 * @param {Object} options.params - Template parameters for dynamic content
 * @param {string} [options.subject] - Email subject (used for fallback if not using template)
 * @param {string} [options.message] - Email message (used for fallback if not using template)
 * @param {string} [options.name] - Recipient name (defaults to email username)
 * @param {Object} [options.headers] - Additional email headers
 * @returns {Promise<Object>} - Response with success status and message ID
 */
const sendEmail = async (options) => {
  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY environment variable is not defined');
    }

    // Required fields validation
    if (!options.email) {
      throw new Error('Recipient email is required');
    }
    
    // If a template key is provided, get the corresponding ID
    let templateId = options.templateId;
    if (typeof templateId === 'string' && TEMPLATES[templateId]) {
      templateId = TEMPLATES[templateId];
    }
    
    let payload;
    
    // Check if we're using a template or sending a regular email
    if (templateId) {
      // Template-based email
      payload = {
        to: [{ 
          email: options.email, 
          name: options.name || options.email.split('@')[0] 
        }],
        templateId: parseInt(templateId, 10),
        params: options.params || {},
      };
    } else {
      // Fallback to regular email if template ID is not provided
      if (!options.subject || !options.message) {
        throw new Error('Subject and message are required when not using a template');
      }
      
      payload = {
        sender: { 
          email: process.env.EMAIL_FROM || 'mu.uniconnect@gmail.com', 
          name: 'MU-UniConnect' 
        },
        to: [{ 
          email: options.email, 
          name: options.name || options.email.split('@')[0] 
        }],
        subject: options.subject,
        htmlContent: options.message
      };
    }

    // Add any custom headers
    if (options.headers) {
      payload.headers = options.headers;
    }

    // Send email via Brevo API
    const response = await axios({
      method: 'post',
      url: 'https://api.brevo.com/v3/smtp/email',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      data: payload
    });

    return { success: true, messageId: response.data?.messageId };
  } catch (error) {
    console.error('Email sending failed:', error.response?.data || error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
  TEMPLATES
};
