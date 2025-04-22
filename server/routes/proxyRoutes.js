const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const imageHandler = require('../utils/imageHandler');

/**
 * @route   GET /api/proxy/image
 * @desc    Proxy for external images to avoid CORS issues
 * @access  Public
 */
router.get('/image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ message: 'URL parameter is required' });
    }
    
    // Optional: Cache the image on the server
    const cachedImage = await imageHandler.fetchAndSaveExternalImage(url);
    if (cachedImage) {
      return res.redirect(cachedImage);
    }
    
    // If caching fails, try direct proxy
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        message: `Failed to fetch image: ${response.statusText}` 
      });
    }
    
    // Forward the appropriate headers
    res.set({
      'Content-Type': response.headers.get('content-type'),
      'Cache-Control': 'public, max-age=86400' // Cache for 1 day
    });
    
    // Stream the image data directly to the client
    response.body.pipe(res);
    
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({ message: 'Failed to proxy image' });
  }
});

module.exports = router;
