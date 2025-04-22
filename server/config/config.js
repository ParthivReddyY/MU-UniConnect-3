/**
 * Application configuration
 */
const config = {
  // Base URL for the application (used for generating image URLs)
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  
  // Upload limits and settings
  uploads: {
    maxImageSize: 5 * 1024 * 1024, // 5MB in bytes
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    imageDimensions: {
      thumbnail: { width: 200, height: 200 },
      profile: { width: 800, height: 800 },
      cover: { width: 1200, height: 400 }
    }
  },
  
  // Faculty profile settings
  faculty: {
    defaultImage: '/img/default-faculty.png'
  }
};

module.exports = config;
