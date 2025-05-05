const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Serve the static sitemap.xml file instead of generating it dynamically
router.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  
  // Set correct content type for XML
  res.header('Content-Type', 'application/xml');
  
  // Check if the file exists
  fs.access(sitemapPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Sitemap file not found:', err);
      return res.status(404).send('Sitemap not found');
    }
    
    // Stream the file to the response
    const sitemapStream = fs.createReadStream(sitemapPath);
    sitemapStream.pipe(res);
    
    // Handle stream errors
    sitemapStream.on('error', (err) => {
      console.error('Error streaming sitemap:', err);
      if (!res.headersSent) {
        res.status(500).send('Error serving sitemap');
      }
    });
  });
});

// Optional: Add a route to refresh the sitemap if needed
router.post('/sitemap/refresh', (req, res) => {
  // Here you could implement logic to regenerate your sitemap.xml file
  // This would require proper authentication/authorization
  res.send({ message: 'Sitemap refresh endpoint (implement as needed)' });
});

module.exports = router;